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
  const [filterSection, setFilterSection] = useState('all');

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
      // Default capacity for new roles is 1
      setRoleCapacity(prev => ({
        ...prev,
        [newRoleName.toLowerCase()]: 1
      }));
      setNewRoleName('');
      setShowAddRole(false);
    }
  };

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
              onClick={() => setShowAddRole(!showAddRole)}
            >
              + Add Role
            </button>

            {showAddRole && (
              <div className="add-role-form">
                <input 
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Role name (e.g., Host)"
                  className="role-input"
                />
                <input 
                  type="number"
                  min="1"
                  defaultValue="1"
                  placeholder="Required"
                  className="capacity-input-inline"
                  id="newRoleCapacity"
                />
                <button 
                  onClick={() => {
                    const capacityInput = document.getElementById('newRoleCapacity');
                    const capacity = parseInt(capacityInput.value) || 1;
                    if (newRoleName.trim() && !roles[newRoleName.toLowerCase()]) {
                      setRoles(prev => ({
                        ...prev,
                        [newRoleName.toLowerCase()]: []
                      }));
                      setRoleCapacity(prev => ({
                        ...prev,
                        [newRoleName.toLowerCase()]: capacity
                      }));
                      setNewRoleName('');
                      capacityInput.value = '1';
                      setShowAddRole(false);
                    }
                  }} 
                  className="confirm-btn"
                >
                  Add
                </button>
              </div>
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
                        ⚠️ Need {required - current} more
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
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="available-section">
              <h3 className="section-title">Available Staff</h3>
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
                    <span className="employee-name">{employee.name}</span>
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
          </div>
        )}

        {currentView === 'tasks' && (
          <div className="tasks-view">
            <div className="content-header">
              <h2 className="content-title">Task Monitor</h2>
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

            <button className="add-task-btn">+ Add New Task</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;