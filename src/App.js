import React, { useState, useEffect } from 'react';
import './App.css';

// Initial data
const initialEmployees = [
  { id: 1, name: 'Bob', skills: ['bartender'], availability: true, performance: 4.5 },
  { id: 2, name: 'Linda', skills: ['bartender'], availability: true, performance: 4.2 },
  { id: 3, name: 'Cathy', skills: ['runner'], availability: true, performance: 4.8 },
  { id: 4, name: 'Alice', skills: ['runner', 'server'], availability: true, performance: 4.6 },
  { id: 5, name: 'Elissa', skills: ['runner'], availability: true, performance: 4.3 },
  { id: 6, name: 'Carol', skills: ['runner'], availability: true, performance: 4.7 },
  { id: 7, name: 'Mike', skills: ['server'], availability: true, performance: 4.4 },
  { id: 8, name: 'Sam', skills: ['dishwasher'], availability: true, performance: 4.1 },
];

const initialTasks = [
  { id: 1, title: 'Prep bar area', assignedTo: 'Bob', status: 'in-progress', section: 'Bar', timestamp: '18:30', photo: null },
  { id: 2, title: 'Check table 12 cleanup', assignedTo: 'Cathy', status: 'pending', section: 'Dining', timestamp: '18:45', photo: null },
  { id: 3, title: 'Restock utensils', assignedTo: 'Alice', status: 'completed', section: 'Kitchen', timestamp: '18:15', photo: null },
  { id: 4, title: 'Clean espresso machine', assignedTo: null, status: 'pending', section: 'Bar', timestamp: '19:00', photo: null },
  { id: 5, title: 'Set up outdoor seating', assignedTo: 'Carol', status: 'in-progress', section: 'Outdoor', timestamp: '18:20', photo: null },
];

// Initial role capacities
const initialRoleCapacity = {
  bartender: 2,
  runner: 4,
  server: 3,
  dishwasher: 1
};

function App() {
  const [currentView, setCurrentView] = useState('scheduling');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Helper function to get date key
  const getDateKey = (date) => {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };
  
  // Store schedules by date
  const [schedulesByDate, setSchedulesByDate] = useState({});
  
  // Current schedule state
  const [roles, setRoles] = useState({
    bartender: [],
    runner: [],
    server: [],
    dishwasher: []
  });
  const [roleCapacity, setRoleCapacity] = useState(initialRoleCapacity);
  const [editingCapacity, setEditingCapacity] = useState(null);
  const [availableStaff, setAvailableStaff] = useState(initialEmployees);
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedEmployee, setDraggedEmployee] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCapacity, setNewRoleCapacity] = useState(1);
  const [filterSection, setFilterSection] = useState('all');
  const [taskViewMode, setTaskViewMode] = useState('section'); // 'section' or 'status'
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    skills: [],
    performance: 4.0
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showRoleEmployeeModal, setShowRoleEmployeeModal] = useState(null); // stores roleName when adding to specific role
  const [selectedEmployeeForRole, setSelectedEmployeeForRole] = useState(''); // stores selected employee name before adding
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [taskToVerify, setTaskToVerify] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    section: 'Bar',
    timestamp: '',
    assignedTo: ''
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [managerFeedback, setManagerFeedback] = useState('');

  // Save current schedule whenever roles or availableStaff changes
  useEffect(() => {
    const dateKey = getDateKey(selectedDate);
    setSchedulesByDate(prev => ({
      ...prev,
      [dateKey]: {
        roles: roles,
        availableStaff: availableStaff
      }
    }));
  }, [roles, availableStaff, selectedDate]);

  // Load schedule when date changes
  useEffect(() => {
    const dateKey = getDateKey(selectedDate);
    const savedSchedule = schedulesByDate[dateKey];
    
    if (savedSchedule) {
      // Load saved schedule for this date
      setRoles(savedSchedule.roles);
      setAvailableStaff(savedSchedule.availableStaff);
    } else {
      // Reset to initial state for new date
      setRoles({
        bartender: [],
        runner: [],
        server: [],
        dishwasher: []
      });
      setAvailableStaff(initialEmployees);
    }
  }, [selectedDate]);

  const handleDragStart = (e, employee) => {
    setDraggedEmployee(employee);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropToRole = (e, roleName) => {
    e.preventDefault();
    if (!draggedEmployee) return;

    // Check if employee has the skill for this role
    const hasSkill = draggedEmployee.skills.includes(roleName);
    
    // Add to role
    setRoles(prev => ({
      ...prev,
      [roleName]: [...prev[roleName], draggedEmployee]
    }));

    // Remove from available staff
    setAvailableStaff(prev => prev.filter(emp => emp.id !== draggedEmployee.id));
    
    setDraggedEmployee(null);

    // Show feedback if no skill match
    if (!hasSkill) {
      alert(`Note: ${draggedEmployee.name} doesn't have ${roleName} in their skill tags. Assignment made anyway.`);
    }
  };

  const handleDropToAvailable = (e) => {
    e.preventDefault();
    if (!draggedEmployee) return;

    // Add back to available staff
    setAvailableStaff(prev => [...prev, draggedEmployee]);

    // Remove from all roles
    setRoles(prev => {
      const newRoles = {};
      Object.keys(prev).forEach(role => {
        newRoles[role] = prev[role].filter(emp => emp.id !== draggedEmployee.id);
      });
      return newRoles;
    });

    setDraggedEmployee(null);
  };

  const addNewRole = () => {
    if (newRoleName.trim() && !roles[newRoleName.toLowerCase()]) {
      setRoles(prev => ({
        ...prev,
        [newRoleName.toLowerCase()]: []
      }));
      setRoleCapacity(prev => ({
        ...prev,
        [newRoleName.toLowerCase()]: newRoleCapacity
      }));
      setNewRoleName('');
      setNewRoleCapacity(1);
      setShowAddRole(false);
    }
  };

  const openAddEmployeeModal = () => {
    setEditingEmployee(null);
    setEmployeeFormData({
      name: '',
      skills: [],
      performance: 4.0
    });
    setSelectedSkills([]);
    setShowEmployeeModal(true);
  };

  const openAddEmployeeToRoleModal = (roleName) => {
    setShowRoleEmployeeModal(roleName);
    setSelectedEmployeeForRole('');
  };

  const addEmployeeToRole = () => {
    if (!selectedEmployeeForRole || !showRoleEmployeeModal) return;
    
    const employee = availableStaff.find(emp => emp.name === selectedEmployeeForRole);
    if (!employee) return;

    // Add to role
    setRoles(prev => ({
      ...prev,
      [showRoleEmployeeModal]: [...prev[showRoleEmployeeModal], employee]
    }));

    // Remove from available staff
    setAvailableStaff(prev => prev.filter(emp => emp.id !== employee.id));
    
    // Close modal and reset
    setShowRoleEmployeeModal(null);
    setSelectedEmployeeForRole('');
  };

  // Task drag and drop handlers
  const handleTaskDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTaskDrop = (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    // If moving to completed, require verification
    if (newStatus === 'completed' && draggedTask.status !== 'completed') {
      setTaskToVerify(draggedTask);
      setShowVerificationModal(true);
    } else {
      updateTaskStatus(draggedTask.id, newStatus);
    }
    
    setDraggedTask(null);
  };

  // Handle image upload for task verification
  const handleImageUpload = (e, taskId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, photo: reader.result } : task
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open verification modal
  const openVerificationModal = (task) => {
    setTaskToVerify(task);
    setShowVerificationModal(true);
  };

  // Approve task verification
  const approveTaskVerification = () => {
    if (taskToVerify) {
      setTasks(prev => prev.map(task => 
        task.id === taskToVerify.id ? { ...task, status: 'completed', verified: true } : task
      ));
      setShowVerificationModal(false);
      setTaskToVerify(null);
    }
  };

  // Reject task verification
  const rejectTaskVerification = () => {
    // Open feedback modal instead of immediately rejecting
    setShowVerificationModal(false);
    setShowFeedbackModal(true);
  };

  // Submit rejection with feedback
  const submitRejectionWithFeedback = () => {
    if (taskToVerify) {
      setTasks(prev => prev.map(task => 
        task.id === taskToVerify.id ? { 
          ...task, 
          status: 'pending', 
          photo: null,
          feedback: managerFeedback,
          feedbackTimestamp: new Date().toLocaleString()
        } : task
      ));
      setShowFeedbackModal(false);
      setTaskToVerify(null);
      setManagerFeedback('');
    }
  };

  // Add new task
  const addNewTask = () => {
    if (!newTaskData.title.trim() || !newTaskData.timestamp) return;

    const newTask = {
      id: Date.now(),
      title: newTaskData.title,
      assignedTo: newTaskData.assignedTo || null,
      status: 'pending',
      section: newTaskData.section,
      timestamp: newTaskData.timestamp,
      photo: null,
      verified: false
    };

    setTasks(prev => [...prev, newTask]);
    setShowAddTaskModal(false);
    setNewTaskData({
      title: '',
      section: 'Bar',
      timestamp: '',
      assignedTo: ''
    });
  };

  const openEditEmployeeModal = (employee) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      name: employee.name,
      skills: employee.skills,
      performance: employee.performance
    });
    setSelectedSkills(employee.skills);
    setShowEmployeeModal(true);
  };

  const saveEmployee = () => {
    if (!employeeFormData.name.trim()) return;

    if (editingEmployee) {
      // Update existing employee
      const updatedEmployee = {
        ...editingEmployee,
        name: employeeFormData.name,
        skills: selectedSkills,
        performance: employeeFormData.performance
      };

      // Update in available staff
      setAvailableStaff(prev => 
        prev.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp)
      );

      // Update in roles if assigned
      setRoles(prev => {
        const newRoles = {};
        Object.keys(prev).forEach(role => {
          newRoles[role] = prev[role].map(emp => 
            emp.id === editingEmployee.id ? updatedEmployee : emp
          );
        });
        return newRoles;
      });
    } else {
      // Add new employee
      const newEmployee = {
        id: Date.now(),
        name: employeeFormData.name,
        skills: selectedSkills,
        availability: true,
        performance: employeeFormData.performance
      };
      setAvailableStaff(prev => [...prev, newEmployee]);
    }

    setShowEmployeeModal(false);
    setEditingEmployee(null);
    setEmployeeFormData({ name: '', skills: [], performance: 4.0 });
    setSelectedSkills([]);
  };

  const deleteEmployee = (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      // Remove from available staff
      setAvailableStaff(prev => prev.filter(emp => emp.id !== employee.id));

      // Remove from all roles
      setRoles(prev => {
        const newRoles = {};
        Object.keys(prev).forEach(role => {
          newRoles[role] = prev[role].filter(emp => emp.id !== employee.id);
        });
        return newRoles;
      });
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const availableSkills = ['bartender', 'runner', 'server', 'dishwasher', 'host', 'chef', 'busser'];

  const updateRoleCapacity = (roleName, newCapacity) => {
    const capacity = parseInt(newCapacity);
    if (!isNaN(capacity) && capacity >= 0) {
      setRoleCapacity(prev => ({
        ...prev,
        [roleName]: capacity
      }));
    }
    setEditingCapacity(null);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  const isUnderstaffed = (roleName) => {
    const current = roles[roleName]?.length || 0;
    const required = roleCapacity[roleName] || 0;
    return current < required;
  };

  const generateCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const selectDate = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const changeMonth = (delta) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta, 1));
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const assignTaskToStaff = (taskId, staffName) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, assignedTo: staffName } : task
    ));
  };

  const getTaskStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#4ade80';
      case 'in-progress': return '#fbbf24';
      case 'pending': return '#f87171';
      default: return '#94a3b8';
    }
  };

  const filteredTasks = filterSection === 'all' 
    ? tasks 
    : tasks.filter(task => task.section.toLowerCase() === filterSection.toLowerCase());

  // Group tasks by status
  const tasksByStatus = {
    'pending': tasks.filter(task => task.status === 'pending'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    'completed': tasks.filter(task => task.status === 'completed')
  };

  const getSuggestedAssignments = (roleName) => {
    // Suggest based on skills and performance
    const suggested = availableStaff
      .filter(emp => emp.skills.includes(roleName))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 2);
    return suggested;
  };

  return (
    <div className="App">
      <div className="sidebar">
        <h1 className="app-title">Operations Dashboard</h1>
        <nav className="nav-menu">
          <button 
            className={`nav-item ${currentView === 'scheduling' ? 'active' : ''}`}
            onClick={() => setCurrentView('scheduling')}
          >
            <span className="nav-icon">📅</span>
            Scheduling
          </button>
          <button 
            className={`nav-item ${currentView === 'tasks' ? 'active' : ''}`}
            onClick={() => setCurrentView('tasks')}
          >
            <span className="nav-icon">✓</span>
            Tasks
          </button>
          <button className="nav-item">
            <span className="nav-icon">📊</span>
            Reports
          </button>
          <button className="nav-item">
            <span className="nav-icon">⭐</span>
            Performance Notes
          </button>
        </nav>
      </div>

      <div className="main-content">
        {currentView === 'scheduling' && (
          <div className="scheduling-view">
            <div className="content-header">
              <h2 className="content-title">Schedule Upcoming Shift</h2>
              <div className="date-controls">
                <button 
                  className="date-badge calendar-trigger"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <span className="calendar-icon">📅</span>
                  {formatDate(selectedDate)}
                </button>
                {showCalendar && (
                  <div className="calendar-dropdown">
                    <div className="calendar-header">
                      <button onClick={() => changeMonth(-1)} className="calendar-nav">‹</button>
                      <span className="calendar-month">
                        {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={() => changeMonth(1)} className="calendar-nav">›</button>
                    </div>
                    <div className="calendar-grid">
                      <div className="calendar-day-header">Sun</div>
                      <div className="calendar-day-header">Mon</div>
                      <div className="calendar-day-header">Tue</div>
                      <div className="calendar-day-header">Wed</div>
                      <div className="calendar-day-header">Thu</div>
                      <div className="calendar-day-header">Fri</div>
                      <div className="calendar-day-header">Sat</div>
                      {generateCalendar().map((date, index) => (
                        <button
                          key={index}
                          className={`calendar-day ${!date ? 'empty' : ''} ${
                            date && date.toDateString() === selectedDate.toDateString() ? 'selected' : ''
                          } ${date && date.toDateString() === new Date().toDateString() ? 'today' : ''}`}
                          onClick={() => date && selectDate(date)}
                          disabled={!date}
                        >
                          {date ? date.getDate() : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              className="add-role-btn"
              onClick={() => setShowAddRole(true)}
            >
              + Add Role
            </button>

            {showAddRole && (
              <>
                <div className="modal-overlay" onClick={() => setShowAddRole(false)}></div>
                <div className="modal">
                  <div className="modal-header">
                    <h3>Add New Role</h3>
                  </div>
                  <div className="modal-body">
                    <label className="input-label">Role Name</label>
                    <input 
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="e.g., Host, Busser, Chef"
                      className="modal-input"
                      autoFocus
                    />
                    
                    <label className="input-label">Required Employees</label>
                    <div className="capacity-adjuster">
                      <button 
                        className="capacity-btn"
                        onClick={() => setNewRoleCapacity(Math.max(1, newRoleCapacity - 1))}
                      >
                        −
                      </button>
                      <span className="capacity-display">{newRoleCapacity}</span>
                      <button 
                        className="capacity-btn"
                        onClick={() => setNewRoleCapacity(newRoleCapacity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      className="modal-cancel-btn"
                      onClick={() => {
                        setShowAddRole(false);
                        setNewRoleName('');
                        setNewRoleCapacity(1);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="modal-confirm-btn"
                      onClick={addNewRole}
                    >
                      Add Role
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="roles-grid">
              {Object.entries(roles).map(([roleName, employees]) => {
                const suggested = getSuggestedAssignments(roleName);
                const required = roleCapacity[roleName] || 0;
                const current = employees.length;
                const understaffed = isUnderstaffed(roleName);
                
                return (
                  <div 
                    key={roleName}
                    className={`role-column ${understaffed ? 'understaffed' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropToRole(e, roleName)}
                  >
                    <div className="role-header">
                      <h3>{roleName.charAt(0).toUpperCase() + roleName.slice(1)}</h3>
                      <div className="capacity-controls">
                        {editingCapacity === roleName ? (
                          <input
                            type="number"
                            min="0"
                            defaultValue={required}
                            onBlur={(e) => updateRoleCapacity(roleName, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                updateRoleCapacity(roleName, e.target.value);
                              }
                            }}
                            className="capacity-input"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className={`capacity-badge ${understaffed ? 'understaffed' : 'staffed'}`}
                            onClick={() => setEditingCapacity(roleName)}
                            title="Click to edit required staff"
                          >
                            <span className="capacity-current">{current}</span>
                            <span className="capacity-separator">/</span>
                            <span className="capacity-required">{required}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {understaffed && (
                      <div className="understaffed-warning">
                        <span className="warning-icon">⚠️</span>
                        <span>Need {required - current} more</span>
                      </div>
                    )}
                    
                    {suggested.length > 0 && employees.length === 0 && (
                      <div className="suggestions">
                        <small className="suggestion-label">Suggested:</small>
                        {suggested.map(emp => (
                          <div key={emp.id} className="suggestion-item">
                            {emp.name} ({emp.performance}★)
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="employees-list">
                      {employees.map(employee => (
                        <div 
                          key={employee.id}
                          className="employee-card assigned"
                          draggable
                          onDragStart={(e) => handleDragStart(e, employee)}
                        >
                          <span className="employee-name">{employee.name}</span>
                          <div className="employee-meta">
                            <span className="performance-badge">{employee.performance}★</span>
                            <button 
                              className="remove-btn"
                              onClick={() => {
                                setAvailableStaff(prev => [...prev, employee]);
                                setRoles(prev => ({
                                  ...prev,
                                  [roleName]: prev[roleName].filter(emp => emp.id !== employee.id)
                                }));
                              }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add employee button for this role */}
                      <button 
                        className="add-employee-to-role-btn"
                        onClick={() => openAddEmployeeToRoleModal(roleName)}
                      >
                        + Add employee
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="available-section">
              <div className="section-header-with-button">
                <h3 className="section-title">Available Staff</h3>
                <button 
                  className="add-employee-btn"
                  onClick={openAddEmployeeModal}
                >
                  + Add New Employee
                </button>
              </div>
              <div 
                className="available-staff-grid"
                onDragOver={handleDragOver}
                onDrop={handleDropToAvailable}
              >
                {availableStaff.map(employee => (
                  <div 
                    key={employee.id}
                    className="employee-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, employee)}
                  >
                    <div className="employee-card-header">
                      <span className="employee-name">{employee.name}</span>
                      <div className="employee-actions">
                        <button 
                          className="edit-employee-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEmployeeModal(employee);
                          }}
                          title="Edit employee"
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-employee-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEmployee(employee);
                          }}
                          title="Delete employee"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="employee-skills">
                      {employee.skills.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                    <span className="performance-badge">{employee.performance}★</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Management Modal */}
            {showEmployeeModal && (
              <>
                <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}></div>
                <div className="modal employee-modal">
                  <div className="modal-header">
                    <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
                  </div>
                  <div className="modal-body">
                    <label className="input-label">Employee Name</label>
                    <input 
                      type="text"
                      value={employeeFormData.name}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, name: e.target.value})}
                      placeholder="Enter employee name"
                      className="modal-input"
                      autoFocus
                    />
                    
                    <label className="input-label">Skills</label>
                    <div className="skills-selector">
                      {availableSkills.map(skill => (
                        <button
                          key={skill}
                          className={`skill-selector-btn ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>

                    <label className="input-label">Performance Rating</label>
                    <div className="performance-slider-container">
                      <input 
                        type="range"
                        min="1"
                        max="5"
                        step="0.1"
                        value={employeeFormData.performance}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, performance: parseFloat(e.target.value)})}
                        className="performance-slider"
                      />
                      <span className="performance-value">{employeeFormData.performance.toFixed(1)}★</span>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      className="modal-cancel-btn"
                      onClick={() => {
                        setShowEmployeeModal(false);
                        setEditingEmployee(null);
                        setEmployeeFormData({ name: '', skills: [], performance: 4.0 });
                        setSelectedSkills([]);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="modal-confirm-btn"
                      onClick={saveEmployee}
                    >
                      {editingEmployee ? 'Save Changes' : 'Add Employee'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Add Employee to Role Modal */}
            {showRoleEmployeeModal && (
              <>
                <div className="modal-overlay" onClick={() => {
                  setShowRoleEmployeeModal(null);
                  setSelectedEmployeeForRole('');
                }}></div>
                <div className="modal employee-to-role-modal">
                  <div className="modal-header">
                    <h3>Add New Employee</h3>
                  </div>
                  <div className="modal-body">
                    <label className="input-label">Employee List</label>
                    <select 
                      className="employee-select"
                      value={selectedEmployeeForRole}
                      onChange={(e) => setSelectedEmployeeForRole(e.target.value)}
                    >
                      <option value=""></option>
                      {availableStaff.map(emp => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name} {emp.skills.includes(showRoleEmployeeModal) ? '✓' : ''} ({emp.performance}★)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button 
                      className="modal-cancel-btn"
                      onClick={() => {
                        setShowRoleEmployeeModal(null);
                        setSelectedEmployeeForRole('');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="modal-confirm-btn"
                      onClick={addEmployeeToRole}
                      disabled={!selectedEmployeeForRole}
                    >
                      Add Employee
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {currentView === 'tasks' && (
          <div className="tasks-view">
            <div className="content-header">
              <h2 className="content-title">Task Monitor</h2>
              <div className="view-mode-toggle">
                <button 
                  className={`mode-btn ${taskViewMode === 'section' ? 'active' : ''}`}
                  onClick={() => setTaskViewMode('section')}
                >
                  By Section
                </button>
                <button 
                  className={`mode-btn ${taskViewMode === 'status' ? 'active' : ''}`}
                  onClick={() => setTaskViewMode('status')}
                >
                  By Status
                </button>
              </div>
            </div>

            {taskViewMode === 'section' ? (
              <>
                <div className="task-filters">
                  <button 
                    className={`filter-btn ${filterSection === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterSection('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-btn ${filterSection === 'bar' ? 'active' : ''}`}
                    onClick={() => setFilterSection('bar')}
                  >
                    Bar
                  </button>
                  <button 
                    className={`filter-btn ${filterSection === 'dining' ? 'active' : ''}`}
                    onClick={() => setFilterSection('dining')}
                  >
                    Dining
                  </button>
                  <button 
                    className={`filter-btn ${filterSection === 'kitchen' ? 'active' : ''}`}
                    onClick={() => setFilterSection('kitchen')}
                  >
                    Kitchen
                  </button>
                  <button 
                    className={`filter-btn ${filterSection === 'outdoor' ? 'active' : ''}`}
                    onClick={() => setFilterSection('outdoor')}
                  >
                    Outdoor
                  </button>
                </div>

                <div className="tasks-grid">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="task-card" style={{ borderLeftColor: getTaskStatusColor(task.status) }}>
                      <div className="task-header">
                        <h4 className="task-title">{task.title}</h4>
                        <span className="task-section">{task.section}</span>
                      </div>
                      
                      <div className="task-meta">
                        <span className="task-time">⏰ {task.timestamp}</span>
                        {task.assignedTo && (
                          <span className="task-assigned">👤 {task.assignedTo}</span>
                        )}
                      </div>

                      <div className="task-status-controls">
                        <select 
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          className="status-select"
                          style={{ borderColor: getTaskStatusColor(task.status) }}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>

                        {task.status === 'completed' && (
                          <button className="verify-btn">
                            ✓ Verify
                          </button>
                        )}
                      </div>

                      {!task.assignedTo && (
                        <select 
                          className="assign-select"
                          onChange={(e) => assignTaskToStaff(task.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Assign to staff...</option>
                          {initialEmployees.map(emp => (
                            <option key={emp.id} value={emp.name}>{emp.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="task-status-board">
                {/* Pending Column */}
                <div 
                  className="status-column pending-column"
                  onDragOver={handleTaskDragOver}
                  onDrop={(e) => handleTaskDrop(e, 'pending')}
                >
                  <div className="status-column-header">
                    <h3 className="status-column-title">
                      <span className="status-icon">⏳</span>
                      Pending
                    </h3>
                    <span className="task-count">{tasksByStatus['pending'].length}</span>
                  </div>
                  <div className="status-column-tasks">
                    {tasksByStatus['pending'].map(task => (
                      <div 
                        key={task.id} 
                        className="task-card-mini"
                        draggable
                        onDragStart={(e) => handleTaskDragStart(e, task)}
                      >
                        <div className="task-card-header">
                          <h4 className="task-title-mini">{task.title}</h4>
                          <span className="task-section-badge">{task.section}</span>
                        </div>
                        <div className="task-meta-mini">
                          <span className="task-time-mini">⏰ {task.timestamp}</span>
                          {task.assignedTo && (
                            <span className="task-assigned-mini">👤 {task.assignedTo}</span>
                          )}
                        </div>
                        
                        {/* Display manager feedback if task was rejected */}
                        {task.feedback && (
                          <div className="task-feedback-display">
                            <div className="feedback-header">
                              <span className="feedback-icon">💬</span>
                              <span className="feedback-label">Manager Feedback</span>
                            </div>
                            <p className="feedback-text">{task.feedback}</p>
                            {task.feedbackTimestamp && (
                              <span className="feedback-timestamp">{task.feedbackTimestamp}</span>
                            )}
                          </div>
                        )}

                        <button 
                          className="task-action-btn progress-btn"
                          onClick={() => updateTaskStatus(task.id, 'in-progress')}
                        >
                          Start Task →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress Column */}
                <div 
                  className="status-column progress-column"
                  onDragOver={handleTaskDragOver}
                  onDrop={(e) => handleTaskDrop(e, 'in-progress')}
                >
                  <div className="status-column-header">
                    <h3 className="status-column-title">
                      <span className="status-icon">⚙️</span>
                      In Progress
                    </h3>
                    <span className="task-count">{tasksByStatus['in-progress'].length}</span>
                  </div>
                  <div className="status-column-tasks">
                    {tasksByStatus['in-progress'].map(task => (
                      <div 
                        key={task.id} 
                        className="task-card-mini"
                        draggable
                        onDragStart={(e) => handleTaskDragStart(e, task)}
                      >
                        <div className="task-card-header">
                          <h4 className="task-title-mini">{task.title}</h4>
                          <span className="task-section-badge">{task.section}</span>
                        </div>
                        <div className="task-meta-mini">
                          <span className="task-time-mini">⏰ {task.timestamp}</span>
                          {task.assignedTo && (
                            <span className="task-assigned-mini">👤 {task.assignedTo}</span>
                          )}
                        </div>
                        
                        {/* Image upload section */}
                        <div className="image-upload-section">
                          <label className="upload-label">
                            {task.photo ? (
                              <div className="photo-preview">
                                <img src={task.photo} alt="Task verification" className="task-photo" />
                                <span className="photo-uploaded">✓ Photo Uploaded</span>
                              </div>
                            ) : (
                              <>
                                <span className="upload-icon">📷</span>
                                <span>Upload Photo</span>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, task.id)}
                                  className="file-input"
                                />
                              </>
                            )}
                          </label>
                        </div>

                        <button 
                          className="task-action-btn complete-btn"
                          onClick={() => openVerificationModal(task)}
                          disabled={!task.photo}
                        >
                          Submit for Approval →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completed Column */}
                <div 
                  className="status-column completed-column"
                  onDragOver={handleTaskDragOver}
                  onDrop={(e) => handleTaskDrop(e, 'completed')}
                >
                  <div className="status-column-header">
                    <h3 className="status-column-title">
                      <span className="status-icon">✅</span>
                      Completed
                    </h3>
                    <span className="task-count">{tasksByStatus['completed'].length}</span>
                  </div>
                  <div className="status-column-tasks">
                    {tasksByStatus['completed'].map(task => (
                      <div key={task.id} className="task-card-mini completed">
                        <div className="task-card-header">
                          <h4 className="task-title-mini">{task.title}</h4>
                          <span className="task-section-badge">{task.section}</span>
                        </div>
                        <div className="task-meta-mini">
                          <span className="task-time-mini">⏰ {task.timestamp}</span>
                          {task.assignedTo && (
                            <span className="task-assigned-mini">👤 {task.assignedTo}</span>
                          )}
                        </div>
                        {task.photo && (
                          <div className="completed-photo-preview">
                            <img src={task.photo} alt="Completed task" className="completed-task-photo" />
                          </div>
                        )}
                        <div className="task-action-btn verify-btn-mini">
                          ✓ Verified
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button className="add-task-btn" onClick={() => setShowAddTaskModal(true)}>+ Add New Task</button>

            {/* Verification Modal */}
            {showVerificationModal && taskToVerify && (
              <>
                <div className="modal-overlay" onClick={() => {
                  setShowVerificationModal(false);
                  setTaskToVerify(null);
                }}></div>
                <div className="modal verification-modal">
                  <div className="modal-header">
                    <h3>Verify Task Completion</h3>
                  </div>
                  <div className="modal-body">
                    <div className="verification-task-info">
                      <h4 className="verification-task-title">{taskToVerify.title}</h4>
                      <p className="verification-task-meta">
                        <span>📍 {taskToVerify.section}</span>
                        <span>⏰ {taskToVerify.timestamp}</span>
                        {taskToVerify.assignedTo && <span>👤 {taskToVerify.assignedTo}</span>}
                      </p>
                    </div>
                    
                    {taskToVerify.photo && (
                      <div className="verification-photo-container">
                        <label className="input-label">Submitted Photo:</label>
                        <img src={taskToVerify.photo} alt="Task verification" className="verification-photo" />
                      </div>
                    )}
                    
                    <p className="verification-prompt">
                      {taskToVerify.photo 
                        ? "Review the submitted photo and approve or reject the task completion."
                        : "This task needs a photo to be submitted before it can be verified."}
                    </p>
                  </div>
                  <div className="modal-footer verification-footer">
                    <button 
                      className="modal-cancel-btn"
                      onClick={() => {
                        setShowVerificationModal(false);
                        setTaskToVerify(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="modal-reject-btn"
                      onClick={rejectTaskVerification}
                      disabled={!taskToVerify.photo}
                    >
                      ✗ Reject
                    </button>
                    <button 
                      className="modal-confirm-btn"
                      onClick={approveTaskVerification}
                      disabled={!taskToVerify.photo}
                    >
                      ✓ Approve
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Manager Feedback Modal */}
            {showFeedbackModal && taskToVerify && (
              <>
                <div className="modal-overlay" onClick={() => {
                  setShowFeedbackModal(false);
                  setTaskToVerify(null);
                  setManagerFeedback('');
                }}></div>
                <div className="modal feedback-modal">
                  <div className="modal-header">
                    <h3>Manager Feedback</h3>
                  </div>
                  <div className="modal-body">
                    <div className="feedback-task-info">
                      <p className="feedback-context">You are rejecting:</p>
                      <h4 className="feedback-task-title">{taskToVerify.title}</h4>
                      <p className="feedback-task-details">
                        <span>📍 {taskToVerify.section}</span>
                        {taskToVerify.assignedTo && <span> • 👤 {taskToVerify.assignedTo}</span>}
                      </p>
                    </div>
                    
                    <label className="input-label">Feedback / Reason for Rejection</label>
                    <textarea 
                      value={managerFeedback}
                      onChange={(e) => setManagerFeedback(e.target.value)}
                      placeholder="Provide feedback on what needs to be corrected or redone..."
                      className="feedback-textarea"
                      rows="6"
                      autoFocus
                    />
                    
                    <p className="feedback-note">
                      💡 This feedback will be visible to the staff member so they know what to improve.
                    </p>
                  </div>
                  <div className="modal-footer">
                    <button 
                      className="modal-cancel-btn"
                      onClick={() => {
                        setShowFeedbackModal(false);
                        setTaskToVerify(null);
                        setManagerFeedback('');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="modal-confirm-btn modal-reject-confirm"
                      onClick={submitRejectionWithFeedback}
                      disabled={!managerFeedback.trim()}
                    >
                      Submit & Reject Task
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Add Task Modal */}
            {showAddTaskModal && (
              <>
                <div className="modal-overlay" onClick={() => setShowAddTaskModal(false)}></div>
                <div className="modal add-task-modal">
                  <div className="modal-header">
                    <h3>Add New Task</h3>
                  </div>
                  <div className="modal-body">
                    <label className="input-label">Task Title</label>
                    <input 
                      type="text"
                      value={newTaskData.title}
                      onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                      placeholder="Enter task title"
                      className="modal-input"
                      autoFocus
                    />
                    
                    <label className="input-label">Section</label>
                    <select 
                      value={newTaskData.section}
                      onChange={(e) => setNewTaskData({...newTaskData, section: e.target.value})}
                      className="modal-select"
                    >
                      <option value="Bar">Bar</option>
                      <option value="Dining">Dining</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Outdoor">Outdoor</option>
                    </select>

                    <label className="input-label">Time</label>
                    <input 
                      type="time"
                      value={newTaskData.timestamp}
                      onChange={(e) => setNewTaskData({...newTaskData, timestamp: e.target.value})}
                      className="modal-input"
                    />

                    <label className="input-label">Assign To (Optional)</label>
                    <select 
                      value={newTaskData.assignedTo}
                      onChange={(e) => setNewTaskData({...newTaskData, assignedTo: e.target.value})}
                      className="modal-select"
                    >
                      <option value="">Unassigned</option>
                      {initialEmployees.map(emp => (
                        <option key={emp.id} value={emp.name}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button 
                      className="modal-cancel-btn"
                      onClick={() => {
                        setShowAddTaskModal(false);
                        setNewTaskData({
                          title: '',
                          section: 'Bar',
                          timestamp: '',
                          assignedTo: ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="modal-confirm-btn"
                      onClick={addNewTask}
                      disabled={!newTaskData.title.trim() || !newTaskData.timestamp}
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;