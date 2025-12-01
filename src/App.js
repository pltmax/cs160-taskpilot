import React, { useEffect, useState } from "react";
import "./App.css";

// Initial data
const initialEmployees = [
  {
    id: 1,
    name: "Bob",
    skills: ["bartender"],
    availability: true,
    performance: 4.8,
    notes:
      "Anchors the Friday/Saturday bar rush. Keeps wells organized, tickets moving quickly, and remembers regulars by name. Occasionally needs a reminder to log 86’d items in the POS, but guest experience scores stay consistently high.",
  },
  {
    id: 2,
    name: "Linda",
    skills: ["bartender"],
    availability: true,
    performance: 4.3,
    notes:
      "Reliable opener who keeps bar prep ahead of the curve. Strong wine and spirits knowledge and double-checks orders before sending. Can be a bit cautious during peak cocktail volume, but accuracy is excellent and guest complaints are rare.",
  },
  {
    id: 3,
    name: "Cathy",
    skills: ["runner"],
    availability: true,
    performance: 4.9,
    notes:
      "Fastest food runner on the team. Tickets almost never sit in the window and hot food goes out at the right temp. Frequently jumps in to help bussers without being asked. Needs mild coaching on pacing breaks to avoid burnout during double turns.",
  },
  {
    id: 4,
    name: "Alice",
    skills: ["runner", "server"],
    availability: true,
    performance: 4.6,
    notes:
      "Strong hybrid runner/server who calmly handles high-pressure sections. Great at teaching newer staff expo and ticket reading. Double-checks modifiers, which can slow her down slightly, but dramatically reduces comps and remakes.",
  },
  {
    id: 5,
    name: "Elissa",
    skills: ["runner"],
    availability: true,
    performance: 4.2,
    notes:
      "Dependable mid-shift runner who keeps side stations stocked and communicates clearly with servers. Occasionally misses a garnish or extra side when the board is packed, but corrects quickly after feedback and shows steady improvement each week.",
  },
  {
    id: 6,
    name: "Carol",
    skills: ["runner"],
    availability: true,
    performance: 4.7,
    notes:
      "High-energy runner who is especially strong on busy patio nights. Reads the room well and prioritizes kids’ food and hot plates. Sometimes takes on too many tables at once, so gentle reminders to delegate bussing tasks help maintain pace.",
  },
  {
    id: 7,
    name: "Mike",
    skills: ["server"],
    availability: true,
    performance: 4.4,
    notes:
      "Guest-facing server with great table-side presence and strong upsell instincts on appetizers and desserts. Ticket times are usually on target. Needs occasional coaching on using pre-shifts to review specials before service to avoid last-minute questions.",
  },
  {
    id: 8,
    name: "Sam",
    skills: ["dishwasher"],
    availability: true,
    performance: 4.1,
    notes:
      "Steady dishwasher who keeps the dish pit under control even when the dining room is full. Rack organization is improving and glassware breakage is low. Can fall slightly behind when large parties turn over at once, but recovers quickly with clear priorities.",
  },
  {
    id: 9,
    name: "Ethan",
    skills: ["server"],
    availability: true,
    performance: 4.3,
    notes:
      "Calm, detail-oriented server who rarely misrings orders. Guests appreciate his clear explanations of menu changes. Could project more confidence when handling comps or difficult guests, but always escalates appropriately to the manager when needed.",
  },
  {
    id: 10,
    name: "Vivian",
    skills: ["server"],
    availability: true,
    performance: 4.7,
    notes:
      "Consistently one of the top tip earners. Manages large sections without sacrificing hospitality and maintains strong sales on specials and add-ons. Occasionally stretches herself thin by taking extra tables, but still keeps ticket error rate extremely low.",
  },
];

const initialTasks = [
  {
    id: 1,
    title: "Prep bar area",
    assignedTo: "Bob",
    status: "in-progress",
    section: "Bar",
    timestamp: "18:30",
    photo: "bar.jpg",
  },
  {
    id: 2,
    title: "Check table 12 cleanup",
    assignedTo: "Cathy",
    status: "pending",
    section: "Dining",
    timestamp: "18:45",
    photo: null,
  },
  {
    id: 3,
    title: "Restock utensils",
    assignedTo: "Alice",
    status: "completed",
    section: "Kitchen",
    timestamp: "18:15",
    photo: "utensils.jpg",
    verified: true,
  },
  {
    id: 4,
    title: "Clean espresso machine",
    assignedTo: null,
    status: "pending",
    section: "Bar",
    timestamp: "19:00",
    photo: null,
  },
  {
    id: 5,
    title: "Set up outdoor seating",
    assignedTo: "Carol",
    status: "in-progress",
    section: "Outdoor",
    timestamp: "18:20",
    photo: "outdoor.jpg",
  },
  {
    id: 6,
    title: "Take out trash",
    assignedTo: "Sam",
    status: "completed",
    section: "Kitchen",
    timestamp: "18:50",
    photo: "trash.jpg",
    verified: true,
  },
];

// Initial role capacities
const initialRoleCapacity = {
  bartender: 2,
  runner: 4,
  server: 3,
  dishwasher: 1,
};

function App() {
  const [currentView, setCurrentView] = useState("scheduling");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Helper function to get date key
  const getDateKey = (date) => {
    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };

  // Store schedules by date
  const [schedulesByDate, setSchedulesByDate] = useState({});

  // Current schedule state
  const [roles, setRoles] = useState({
    bartender: [],
    runner: [],
    server: [],
    dishwasher: [],
  });
  const [roleCapacity, setRoleCapacity] = useState(initialRoleCapacity);
  const [editingCapacity, setEditingCapacity] = useState(null);
  const [availableStaff, setAvailableStaff] = useState(initialEmployees);
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedEmployee, setDraggedEmployee] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleCapacity, setNewRoleCapacity] = useState(1);
  const [filterSection, setFilterSection] = useState("all");
  const [taskViewMode, setTaskViewMode] = useState("section"); // 'section' or 'status'
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: "",
    skills: [],
    performance: 4.0,
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showRoleEmployeeModal, setShowRoleEmployeeModal] = useState(null); // stores roleName when adding to specific role
  const [selectedEmployeeForRole, setSelectedEmployeeForRole] = useState(""); // stores selected employee name before adding
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [taskToVerify, setTaskToVerify] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    section: "Bar",
    timestamp: "",
    assignedTo: "",
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [managerFeedback, setManagerFeedback] = useState("");
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [taskToRepeat, setTaskToRepeat] = useState(null);
  const [scheduleStatus, setScheduleStatus] = useState("draft"); // 'draft' | 'confirmed'
  const [changeSuggestions, setChangeSuggestions] = useState([]); // AI options for reallocation

  // Keep performance + notes in sync across available staff and all roles
  const updateEmployeePerformanceFields = (employeeId, changes) => {
    // Update in available staff
    setAvailableStaff((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, ...changes } : emp))
    );

    // Update in any roles where the employee is scheduled
    setRoles((prev) => {
      const newRoles = {};
      Object.keys(prev).forEach((role) => {
        newRoles[role] = prev[role].map((emp) =>
          emp.id === employeeId ? { ...emp, ...changes } : emp
        );
      });
      return newRoles;
    });
  };

  // Save current schedule whenever schedule-related state changes
  useEffect(() => {
    const dateKey = getDateKey(selectedDate);
    setSchedulesByDate((prev) => ({
      ...prev,
      [dateKey]: {
        roles,
        availableStaff,
        roleCapacity,
        status: scheduleStatus,
      },
    }));
  }, [roles, availableStaff, roleCapacity, scheduleStatus, selectedDate]);

  // Load schedule when date changes
  useEffect(() => {
    const dateKey = getDateKey(selectedDate);
    const savedSchedule = schedulesByDate[dateKey];

    if (savedSchedule) {
      setRoles(
        savedSchedule.roles || {
          bartender: [],
          runner: [],
          server: [],
          dishwasher: [],
        }
      );
      setAvailableStaff(savedSchedule.availableStaff || initialEmployees);
      setRoleCapacity(savedSchedule.roleCapacity || initialRoleCapacity);
      setScheduleStatus(savedSchedule.status || "draft");
    } else {
      setRoles({
        bartender: [],
        runner: [],
        server: [],
        dishwasher: [],
      });
      setAvailableStaff(initialEmployees);
      setRoleCapacity(initialRoleCapacity);
      setScheduleStatus("draft");
    }

    // Clear any “what-if” options when switching dates
    setChangeSuggestions([]);
  }, [selectedDate]);

  useEffect(() => {
    if (scheduleStatus !== "confirmed") {
      setChangeSuggestions([]);
      return;
    }

    const newSuggestions = [];

    Object.entries(roles).forEach(([roleName, employees]) => {
      const required = roleCapacity[roleName] || 0;
      const current = employees.length;
      const deficit = required - current;

      if (deficit <= 0) return;

      // OPTION 1 – move best match from an overstaffed role (generic)
      let bestReassign = null;

      Object.entries(roles).forEach(([otherRole, otherEmployees]) => {
        if (otherRole === roleName) return;

        const otherRequired = roleCapacity[otherRole] || 0;
        const surplus = otherEmployees.length - otherRequired;

        if (surplus > 0) {
          const candidates = otherEmployees
            .filter((emp) => emp.skills.includes(roleName))
            .sort((a, b) => b.performance - a.performance);

          if (candidates.length > 0) {
            const candidate = candidates[0];
            const suggestion = {
              id: `reassign-${candidate.id}-${otherRole}-to-${roleName}`,
              type: "reassign",
              employeeId: candidate.id,
              employeeName: candidate.name,
              fromRole: otherRole,
              toRole: roleName,
              description: `Move ${candidate.name} from ${otherRole} to ${roleName}.`,
              tradeoff: `Service in ${otherRole} may slow down (e.g., +2 min on average per order).`,
              createUrgentTask: true,
            };

            if (
              !bestReassign ||
              candidate.performance > bestReassign.performance
            ) {
              bestReassign = suggestion;
            }
          }
        }
      });

      if (bestReassign) {
        newSuggestions.push(bestReassign);
      }

      // OPTION 2 – role-specific "split time" capacity reassignments

      // Runner shortage: dishwasher helps as runner (your existing demo)
      if (roleName === "runner" && (roles.dishwasher?.length || 0) > 0) {
        const dishwasherCandidates = roles.dishwasher
          .slice()
          .sort((a, b) => b.performance - a.performance);
        const helper = dishwasherCandidates[0];

        newSuggestions.push({
          id: `dw-helper-runner-${helper.id}`,
          type: "capacityReassign",
          employeeId: helper.id,
          employeeName: helper.name,
          fromRole: "dishwasher",
          toRole: roleName,
          description: `Let ${helper.name} split time between dishwashing and ${roleName}.`,
          tradeoff:
            "Dishwashing capacity is limited (e.g., only ~50 sets of flatware can be turned over this service), so table resets may lag.",
          createUrgentTask: true,
          capacityImpactRole: "dishwasher",
          capacityDelta: -1,
        });
      }

      // Bartender shortage: server helps bar
      if (roleName === "bartender" && (roles.server?.length || 0) > 0) {
        const serverCandidates = roles.server
          .slice()
          .sort((a, b) => b.performance - a.performance);
        const helper = serverCandidates[0];

        newSuggestions.push({
          id: `srv-helper-bartender-${helper.id}`,
          type: "capacityReassign",
          employeeId: helper.id,
          employeeName: helper.name,
          fromRole: "server",
          toRole: roleName,
          description: `Let ${helper.name} split time between serving tables and bartending.`,
          tradeoff:
            "Table service may slow slightly as one server is also helping on the bar.",
          createUrgentTask: true,
          capacityImpactRole: "server",
          capacityDelta: -1,
        });
      }

      // Server shortage: runner helps serve
      if (roleName === "server" && (roles.runner?.length || 0) > 0) {
        const runnerCandidates = roles.runner
          .slice()
          .sort((a, b) => b.performance - a.performance);
        const helper = runnerCandidates[0];

        newSuggestions.push({
          id: `run-helper-server-${helper.id}`,
          type: "capacityReassign",
          employeeId: helper.id,
          employeeName: helper.name,
          fromRole: "runner",
          toRole: roleName,
          description: `Let ${helper.name} split time between running food and serving tables.`,
          tradeoff:
            "Food running to tables may lag slightly as one runner is also acting as a server.",
          createUrgentTask: true,
          capacityImpactRole: "runner",
          capacityDelta: -1,
        });
      }

      // Dishwasher shortage: runner helps dishwashing
      if (roleName === "dishwasher" && (roles.runner?.length || 0) > 0) {
        const runnerCandidates = roles.runner
          .slice()
          .sort((a, b) => b.performance - a.performance);
        const helper = runnerCandidates[0];

        newSuggestions.push({
          id: `run-helper-dishwasher-${helper.id}`,
          type: "capacityReassign",
          employeeId: helper.id,
          employeeName: helper.name,
          fromRole: "runner",
          toRole: roleName,
          description: `Let ${helper.name} split time between running and dishwashing.`,
          tradeoff:
            "Table turns and resets may be slower because one runner is helping in the dish area.",
          createUrgentTask: true,
          capacityImpactRole: "runner",
          capacityDelta: -1,
        });
      }

      // OPTION 3 – pull someone from the available pool (generic)
      const availableCandidates = availableStaff
        .filter((emp) => emp.skills.includes(roleName))
        .sort((a, b) => b.performance - a.performance);

      if (availableCandidates.length > 0) {
        const candidate = availableCandidates[0];

        newSuggestions.push({
          id: `assign-${candidate.id}-to-${roleName}`,
          type: "fromAvailable",
          employeeId: candidate.id,
          employeeName: candidate.name,
          toRole: roleName,
          description: `Call in ${candidate.name} from the standby list to cover ${roleName}.`,
          tradeoff:
            "No impact on other roles, but labor cost increases for this shift.",
          createUrgentTask: true,
        });
      }
    });

    setChangeSuggestions(newSuggestions);
  }, [roles, roleCapacity, availableStaff, scheduleStatus]);

  const handleDragStart = (e, employee) => {
    setDraggedEmployee(employee);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const edgeSize = 160;
    const scrollSpeed = 80;

    const { clientY } = e;
    const height = window.innerHeight;

    if (clientY < edgeSize) {
      window.scrollBy(0, -scrollSpeed);
    } else if (clientY > height - edgeSize) {
      window.scrollBy(0, scrollSpeed);
    }
  };

  const handleDropToRole = (e, roleName) => {
    e.preventDefault();
    if (!draggedEmployee) return;

    // Check if employee has the skill for this role
    const hasSkill = draggedEmployee.skills.includes(roleName);

    // Add to role
    setRoles((prev) => ({
      ...prev,
      [roleName]: [...prev[roleName], draggedEmployee],
    }));

    // Remove from available staff
    setAvailableStaff((prev) =>
      prev.filter((emp) => emp.id !== draggedEmployee.id)
    );

    setDraggedEmployee(null);

    // Show feedback if no skill match
    if (!hasSkill) {
      alert(
        `Note: ${draggedEmployee.name} doesn't have ${roleName} in their skill tags. Assignment made anyway.`
      );
    }
  };

  const handleDropToAvailable = (e) => {
    e.preventDefault();
    if (!draggedEmployee) return;

    // Add back to available staff
    setAvailableStaff((prev) => [...prev, draggedEmployee]);

    // Remove from all roles
    setRoles((prev) => {
      const newRoles = {};
      Object.keys(prev).forEach((role) => {
        newRoles[role] = prev[role].filter(
          (emp) => emp.id !== draggedEmployee.id
        );
      });
      return newRoles;
    });

    setDraggedEmployee(null);
  };

  const addNewRole = () => {
    if (newRoleName.trim() && !roles[newRoleName.toLowerCase()]) {
      setRoles((prev) => ({
        ...prev,
        [newRoleName.toLowerCase()]: [],
      }));
      setRoleCapacity((prev) => ({
        ...prev,
        [newRoleName.toLowerCase()]: newRoleCapacity,
      }));
      setNewRoleName("");
      setNewRoleCapacity(1);
      setShowAddRole(false);
    }
  };

  const openAddEmployeeModal = () => {
    setEditingEmployee(null);
    setEmployeeFormData({
      name: "",
      skills: [],
      performance: 4.0,
    });
    setSelectedSkills([]);
    setShowEmployeeModal(true);
  };

  const openAddEmployeeToRoleModal = (roleName) => {
    setShowRoleEmployeeModal(roleName);
    setSelectedEmployeeForRole("");
  };

  const addEmployeeToRole = () => {
    if (!selectedEmployeeForRole || !showRoleEmployeeModal) return;

    const employee = availableStaff.find(
      (emp) => emp.name === selectedEmployeeForRole
    );
    if (!employee) return;

    // Add to role
    setRoles((prev) => ({
      ...prev,
      [showRoleEmployeeModal]: [...prev[showRoleEmployeeModal], employee],
    }));

    // Remove from available staff
    setAvailableStaff((prev) => prev.filter((emp) => emp.id !== employee.id));

    // Close modal and reset
    setShowRoleEmployeeModal(null);
    setSelectedEmployeeForRole("");
  };

  // Task drag and drop handlers
  const handleTaskDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTaskDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleTaskDrop = (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    const fromStatus = draggedTask.status;

    // Case 3: Completed → Tasks => ask to repeat task (duplicate)
    if (fromStatus === "completed" && newStatus === "pending") {
      setTaskToRepeat(draggedTask);
      setShowRepeatModal(true);
    }
    // Case 1: Anything → Completed => require verification
    else if (newStatus === "completed" && fromStatus !== "completed") {
      setTaskToVerify(draggedTask);
      setShowVerificationModal(true);
    }
    // All other moves: just update status directly
    else {
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
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, photo: reader.result } : task
          )
        );
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
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskToVerify.id
            ? { ...task, status: "completed", verified: true }
            : task
        )
      );
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
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskToVerify.id
            ? {
                ...task,
                status: "pending",
                photo: null,
                feedback: managerFeedback,
                feedbackTimestamp: new Date().toLocaleString(),
              }
            : task
        )
      );
      setShowFeedbackModal(false);
      setTaskToVerify(null);
      setManagerFeedback("");
    }
  };

  // Add new task
  const addNewTask = () => {
    if (!newTaskData.title.trim() || !newTaskData.timestamp) return;

    const newTask = {
      id: Date.now(),
      title: newTaskData.title,
      assignedTo: newTaskData.assignedTo || null,
      status: "pending",
      section: newTaskData.section,
      timestamp: newTaskData.timestamp,
      photo: null,
      verified: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setShowAddTaskModal(false);
    setNewTaskData({
      title: "",
      section: "Bar",
      timestamp: "",
      assignedTo: "",
    });
  };

  const openEditEmployeeModal = (employee) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      name: employee.name,
      skills: employee.skills,
      performance: employee.performance,
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
        performance: employeeFormData.performance,
      };

      // Update in available staff
      setAvailableStaff((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id ? updatedEmployee : emp
        )
      );

      // Update in roles if assigned
      setRoles((prev) => {
        const newRoles = {};
        Object.keys(prev).forEach((role) => {
          newRoles[role] = prev[role].map((emp) =>
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
        performance: employeeFormData.performance,
        notes: "",
      };
      setAvailableStaff((prev) => [...prev, newEmployee]);
    }

    setShowEmployeeModal(false);
    setEditingEmployee(null);
    setEmployeeFormData({ name: "", skills: [], performance: 4.0 });
    setSelectedSkills([]);
  };

  const deleteEmployee = (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      // Remove from available staff
      setAvailableStaff((prev) => prev.filter((emp) => emp.id !== employee.id));

      // Remove from all roles
      setRoles((prev) => {
        const newRoles = {};
        Object.keys(prev).forEach((role) => {
          newRoles[role] = prev[role].filter((emp) => emp.id !== employee.id);
        });
        return newRoles;
      });
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const availableSkills = [
    "bartender",
    "runner",
    "server",
    "dishwasher",
    "host",
    "chef",
    "busser",
  ];

  const updateRoleCapacity = (roleName, newCapacity) => {
    const capacity = parseInt(newCapacity);
    if (!isNaN(capacity) && capacity >= 0) {
      setRoleCapacity((prev) => ({
        ...prev,
        [roleName]: capacity,
      }));
    }
    setEditingCapacity(null);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
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
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta, 1)
    );
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const assignTaskToStaff = (taskId, staffName) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, assignedTo: staffName } : task
      )
    );
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#4ade80";
      case "in-progress":
        return "#fbbf24";
      case "pending":
        return "#f87171";
      default:
        return "#94a3b8";
    }
  };

  const getManagerStatus = (task) => {
    // Completed is always completed
    if (task.status === "completed") {
      return { key: "completed", label: "Completed" };
    }

    // Has a photo but not completed → Pending Approval
    if (task.photo) {
      return { key: "in-progress", label: "Pending Approval" };
    }

    // Default: no photo, not completed → Not Started
    return { key: "pending", label: "Not Started" };
  };

  const filteredTasks =
    filterSection === "all"
      ? tasks
      : tasks.filter(
          (task) => task.section.toLowerCase() === filterSection.toLowerCase()
        );

  // Group tasks by status
  const tasksByStatus = {
    pending: tasks.filter((task) => task.status === "pending"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    completed: tasks.filter((task) => task.status === "completed"),
  };

  // Group tasks by person (assignee)
  const tasksByAssignee = tasks.reduce((acc, task) => {
    const key = task.assignedTo || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  // Reporting helpers
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const completionRate = totalTasks
    ? Math.round((completedCount / totalTasks) * 100)
    : 0;
  const verifiedCount = completedTasks.filter((t) => t.verified).length;
  const withPhotoCount = completedTasks.filter((t) => t.photo).length;
  const feedbackOnCompleted = completedTasks.filter((t) => t.feedback).length;

  const tasksBySectionSummary = completedTasks.reduce((acc, task) => {
    const key = task.section || "Other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const sectionBreakdown = Object.entries(tasksBySectionSummary).sort(
    (a, b) => b[1] - a[1]
  );

  const completionsByStaffSummary = completedTasks.reduce((acc, task) => {
    const key = task.assignedTo || "Unassigned";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topClosers = Object.entries(completionsByStaffSummary)
    .filter(([name]) => name !== "Unassigned")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const getTaskReportSummary = (task) => {
    const section = (task.section || "").toLowerCase();
    let sectionImpact = "";

    switch (section) {
      case "bar":
        sectionImpact =
          "Helped keep the bar service clean, stocked, and ready for the next wave of drink orders.";
        break;
      case "dining":
        sectionImpact =
          "Improved table readiness and guest turnover in the dining room, reducing wait times.";
        break;
      case "kitchen":
        sectionImpact =
          "Supported back-of-house flow, keeping the line organized and preventing ticket backups.";
        break;
      case "outdoor":
        sectionImpact =
          "Maintained the outdoor section so it stayed guest-ready and aligned with the main dining experience.";
        break;
      default:
        sectionImpact =
          "Contributed to overall shift readiness and guest experience for this service block.";
        break;
    }

    let urgencyImpact = "";
    if (task.priority === "urgent") {
      urgencyImpact =
        " This was flagged as an urgent task tied to live shift changes, so completing it quickly helped stabilize service flow.";
    }

    let verificationImpact = "";
    if (task.verified) {
      verificationImpact =
        " Completion was verified by a manager using the attached photo, so future audits can treat this as fully confirmed.";
    } else if (task.photo) {
      verificationImpact =
        " A photo was attached as informal evidence, even though the verification flag is not set.";
    } else {
      verificationImpact =
        " No photo evidence was attached, so completion is based on staff reporting only.";
    }

    let feedbackImpact = "";
    if (task.feedback) {
      feedbackImpact =
        " Manager feedback was recorded for this task and should be reviewed before the next similar assignment.";
    }

    return `${sectionImpact}${urgencyImpact}${verificationImpact}${feedbackImpact}`.trim();
  };

  const getSuggestedAssignments = (roleName) => {
    // Suggest based on skills and performance
    const suggested = availableStaff
      .filter((emp) => emp.skills.includes(roleName))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 2);
    return suggested;
  };

  const canConfirmShift = () => {
    // All non-zero capacity roles must be fully staffed
    return Object.keys(roleCapacity).every((roleName) => {
      const required = roleCapacity[roleName] || 0;
      if (required === 0) return true;
      const current = roles[roleName]?.length || 0;
      return current >= required;
    });
  };

  const confirmCurrentSchedule = () => {
    if (!canConfirmShift()) {
      alert("Please fill all required roles before confirming the shift.");
      return;
    }
    setScheduleStatus("confirmed");
    alert(
      "Shift confirmed. From now on, changes will surface staffing recommendations for last-minute adjustments."
    );
  };

  const applySuggestion = (suggestion) => {
    // 1) Remove this suggestion so it can't be applied twice
    setChangeSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));

    // 2) Helper to create a single urgent task per move with a custom title
    const makeUrgentTask = (taskTitle, employeeName) => {
      setTasks((prevTasks) => {
        // If an identical urgent task already exists, don't create another
        const alreadyExists = prevTasks.some(
          (t) =>
            t.title === taskTitle &&
            t.assignedTo === employeeName &&
            t.priority === "urgent" &&
            t.status === "pending"
        );

        if (alreadyExists) return prevTasks;

        const maxId = prevTasks.reduce((max, t) => Math.max(max, t.id), 0);
        const now = new Date();
        const timeLabel = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const newTask = {
          id: maxId + 1,
          title: taskTitle,
          assignedTo: employeeName,
          status: "pending",
          section: "Shift Change",
          timestamp: timeLabel,
          photo: null,
          priority: "urgent",
        };

        return [...prevTasks, newTask];
      });
    };

    if (suggestion.type === "reassign") {
      // FULL move: fromRole -> toRole
      setRoles((prev) => {
        const fromList = prev[suggestion.fromRole] || [];
        const toList = prev[suggestion.toRole] || [];
        const employee = fromList.find(
          (emp) => emp.id === suggestion.employeeId
        );
        if (!employee) return prev;

        // Don't add if they're already in the target role
        if (toList.some((emp) => emp.id === employee.id)) {
          return prev;
        }

        return {
          ...prev,
          [suggestion.fromRole]: fromList.filter(
            (emp) => emp.id !== employee.id
          ),
          [suggestion.toRole]: [...toList, employee],
        };
      });

      if (suggestion.createUrgentTask) {
        makeUrgentTask(
          `Cover ${suggestion.toRole} for this shift (moved from ${suggestion.fromRole})`,
          suggestion.employeeName
        );
      }
    } else if (suggestion.type === "capacityReassign") {
      // SPLIT move: keep in fromRole, ALSO show in toRole
      setRoles((prev) => {
        const fromList = prev[suggestion.fromRole] || [];
        const toList = prev[suggestion.toRole] || [];
        const employee =
          fromList.find((emp) => emp.id === suggestion.employeeId) ||
          toList.find((emp) => emp.id === suggestion.employeeId); // fallback

        if (!employee) return prev;

        // If already in target role, no need to add again
        if (toList.some((emp) => emp.id === employee.id)) {
          return prev;
        }

        return {
          ...prev,
          [suggestion.fromRole]: fromList, // keep them here
          [suggestion.toRole]: [...toList, employee],
        };
      });

      // Generic capacity impact for split-time options
      if (suggestion.capacityImpactRole) {
        setRoleCapacity((prevCap) => {
          const role = suggestion.capacityImpactRole;
          const delta = suggestion.capacityDelta ?? -1;
          const current = prevCap[role] ?? 0;
          return {
            ...prevCap,
            [role]: Math.max(current + delta, 0),
          };
        });
      }

      if (suggestion.createUrgentTask) {
        makeUrgentTask(
          `Split shift: help ${suggestion.toRole} while staying on ${suggestion.fromRole}`,
          suggestion.employeeName
        );
      }
    } else if (suggestion.type === "fromAvailable") {
      setAvailableStaff((prevAvail) => {
        const employee = prevAvail.find(
          (emp) => emp.id === suggestion.employeeId
        );
        if (!employee) return prevAvail;

        setRoles((prevRoles) => {
          const toList = prevRoles[suggestion.toRole] || [];

          // Avoid duplicating employee in target role
          if (toList.some((emp) => emp.id === employee.id)) {
            return prevRoles;
          }

          return {
            ...prevRoles,
            [suggestion.toRole]: [...toList, employee],
          };
        });

        if (suggestion.createUrgentTask) {
          makeUrgentTask(
            `Cover ${suggestion.toRole} (called in from standby)`,
            suggestion.employeeName
          );
        }

        // Remove from available list
        return prevAvail.filter((emp) => emp.id !== suggestion.employeeId);
      });
    }
  };

  const splitCounts = {};
  Object.values(roles).forEach((list) => {
    list.forEach((emp) => {
      splitCounts[emp.id] = (splitCounts[emp.id] || 0) + 1;
    });
  });

  // Build a unique list of all employees currently in the system
  const allEmployeesMap = new Map();
  availableStaff.forEach((emp) => allEmployeesMap.set(emp.id, emp));
  Object.values(roles).forEach((list) => {
    list.forEach((emp) => {
      if (!allEmployeesMap.has(emp.id)) {
        allEmployeesMap.set(emp.id, emp);
      }
    });
  });
  const allEmployees = Array.from(allEmployeesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="App">
      <div className="sidebar">
        <h1 className="app-title">Operations Dashboard</h1>
        <nav className="nav-menu">
          <button
            className={`nav-item ${
              currentView === "scheduling" ? "active" : ""
            }`}
            onClick={() => setCurrentView("scheduling")}
          >
            <span className="nav-icon">📅</span>
            Scheduling
          </button>
          <button
            className={`nav-item ${currentView === "tasks" ? "active" : ""}`}
            onClick={() => setCurrentView("tasks")}
          >
            <span className="nav-icon">✓</span>
            Tasks
          </button>
          <button
            className={`nav-item ${currentView === "reports" ? "active" : ""}`}
            onClick={() => setCurrentView("reports")}
          >
            <span className="nav-icon">📊</span>
            Reports
          </button>
          <button
            className={`nav-item ${
              currentView === "performance" ? "active" : ""
            }`}
            onClick={() => setCurrentView("performance")}
          >
            <span className="nav-icon">⭐</span>
            Performance Notes
          </button>
        </nav>
      </div>

      <div className="main-content">
        {currentView === "scheduling" && (
          <div className="scheduling-view" onDragOver={handleDragOver}>
            <div className="content-header">
              <div className="content-header-left">
                <h2 className="content-title">Schedule Upcoming Shift</h2>
                <p className="content-subtitle">
                  Confirm this schedule before the shift. Once confirmed, any
                  changes become live staffing adjustments.
                </p>
                <span className={`shift-status-pill ${scheduleStatus}`}>
                  {scheduleStatus === "draft"
                    ? "Draft schedule"
                    : "Live mode: Shift Assist active"}
                </span>
              </div>

              <div className="header-actions">
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
                        <button
                          onClick={() => changeMonth(-1)}
                          className="calendar-nav"
                        >
                          ‹
                        </button>
                        <span className="calendar-month">
                          {selectedDate.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <button
                          onClick={() => changeMonth(1)}
                          className="calendar-nav"
                        >
                          ›
                        </button>
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
                            className={`calendar-day ${!date ? "empty" : ""} ${
                              date &&
                              date.toDateString() ===
                                selectedDate.toDateString()
                                ? "selected"
                                : ""
                            } ${
                              date &&
                              date.toDateString() === new Date().toDateString()
                                ? "today"
                                : ""
                            }`}
                            onClick={() => date && selectDate(date)}
                            disabled={!date}
                          >
                            {date ? date.getDate() : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="confirm-shift-btn"
                  onClick={confirmCurrentSchedule}
                  disabled={
                    scheduleStatus === "confirmed" || !canConfirmShift()
                  }
                >
                  <span className="confirm-main-text">
                    {scheduleStatus === "confirmed"
                      ? "Shift locked"
                      : "Confirm schedule"}
                  </span>
                  <span className="confirm-sub-text">
                    {scheduleStatus === "confirmed"
                      ? "Editing now triggers Shift Assist recommendations."
                      : "Lock baseline & enable Shift Assist for last-minute changes."}
                  </span>
                </button>
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
                <div
                  className="modal-overlay"
                  onClick={() => setShowAddRole(false)}
                ></div>
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
                        onClick={() =>
                          setNewRoleCapacity(Math.max(1, newRoleCapacity - 1))
                        }
                      >
                        −
                      </button>
                      <span className="capacity-display">
                        {newRoleCapacity}
                      </span>
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
                        setNewRoleName("");
                        setNewRoleCapacity(1);
                      }}
                    >
                      Cancel
                    </button>
                    <button className="modal-confirm-btn" onClick={addNewRole}>
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
                    className={`role-column ${
                      understaffed ? "understaffed" : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropToRole(e, roleName)}
                  >
                    <div className="role-header">
                      <h3>
                        {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                      </h3>
                      <div className="capacity-controls">
                        {editingCapacity === roleName ? (
                          <input
                            type="number"
                            min="0"
                            defaultValue={required}
                            onBlur={(e) =>
                              updateRoleCapacity(roleName, e.target.value)
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                updateRoleCapacity(roleName, e.target.value);
                              }
                            }}
                            className="capacity-input"
                            autoFocus
                          />
                        ) : (
                          <div
                            className={`capacity-badge ${
                              understaffed ? "understaffed" : "staffed"
                            }`}
                            onClick={() => setEditingCapacity(roleName)}
                            title="Click to edit required staff"
                          >
                            <span className="capacity-current">{current}</span>
                            <span className="capacity-separator">/</span>
                            <span className="capacity-required">
                              {required}
                            </span>
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
                        {suggested.map((emp) => (
                          <div key={emp.id} className="suggestion-item">
                            {emp.name} ({emp.performance}★)
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="employees-list">
                      {employees.map((employee) => {
                        const isSplit = (splitCounts[employee.id] || 0) > 1;

                        return (
                          <div
                            key={employee.id}
                            className="employee-card assigned"
                            draggable
                            onDragStart={(e) => handleDragStart(e, employee)}
                          >
                            <div className="employee-card-top">
                              <span className="employee-name">
                                {employee.name}
                              </span>
                              {isSplit && (
                                <span className="split-badge">Split shift</span>
                              )}
                            </div>
                            <div className="employee-meta">
                              <span className="performance-badge">
                                {employee.performance}★
                              </span>
                              <button
                                className="remove-btn"
                                onClick={() => {
                                  setAvailableStaff((prev) => [
                                    ...prev,
                                    employee,
                                  ]);
                                  setRoles((prev) => ({
                                    ...prev,
                                    [roleName]: prev[roleName].filter(
                                      (emp) => emp.id !== employee.id
                                    ),
                                  }));
                                }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}

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

            {scheduleStatus === "confirmed" && (
              <div className="ai-suggestions-panel">
                <div className="ai-suggestions-header">
                  <h3>Dynamic Staffing Recommendations</h3>
                  <p className="ai-suggestions-subtitle">
                    When someone calls out or demand spikes, choose an option
                    below to rebalance coverage.
                  </p>
                </div>

                {changeSuggestions.length === 0 ? (
                  <div className="ai-suggestion-card ok">
                    <span className="ai-suggestion-icon">✅</span>
                    <div>
                      <div className="ai-suggestion-title">
                        All roles fully covered
                      </div>
                      <div className="ai-suggestion-text">
                        No staffing gaps detected. If a staff member becomes
                        unavailable, edits to the schedule will trigger fresh
                        suggestions here.
                      </div>
                    </div>
                  </div>
                ) : (
                  changeSuggestions.map((sug, index) => (
                    <div key={sug.id} className="ai-suggestion-card">
                      <span className="ai-suggestion-option-label">
                        Option {index + 1}
                      </span>
                      <div className="ai-suggestion-content">
                        <div className="ai-suggestion-title">
                          {sug.description}
                        </div>
                        <div className="ai-suggestion-text">{sug.tradeoff}</div>
                      </div>
                      <button
                        className="apply-suggestion-btn"
                        onClick={() => applySuggestion(sug)}
                      >
                        Apply & create urgent task
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

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
                {availableStaff.map((employee) => (
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
                      {employee.skills.map((skill) => (
                        <span key={skill} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <span className="performance-badge">
                      {employee.performance}★
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Management Modal */}
            {showEmployeeModal && (
              <>
                <div
                  className="modal-overlay"
                  onClick={() => setShowEmployeeModal(false)}
                ></div>
                <div className="modal employee-modal">
                  <div className="modal-header">
                    <h3>
                      {editingEmployee ? "Edit Employee" : "Add New Employee"}
                    </h3>
                  </div>
                  <div className="modal-body">
                    <label className="input-label">Employee Name</label>
                    <input
                      type="text"
                      value={employeeFormData.name}
                      onChange={(e) =>
                        setEmployeeFormData({
                          ...employeeFormData,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter employee name"
                      className="modal-input"
                      autoFocus
                    />

                    <label className="input-label">Skills</label>
                    <div className="skills-selector">
                      {availableSkills.map((skill) => (
                        <button
                          key={skill}
                          className={`skill-selector-btn ${
                            selectedSkills.includes(skill) ? "selected" : ""
                          }`}
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
                        onChange={(e) =>
                          setEmployeeFormData({
                            ...employeeFormData,
                            performance: parseFloat(e.target.value),
                          })
                        }
                        className="performance-slider"
                      />
                      <span className="performance-value">
                        {employeeFormData.performance.toFixed(1)}★
                      </span>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="modal-cancel-btn"
                      onClick={() => {
                        setShowEmployeeModal(false);
                        setEditingEmployee(null);
                        setEmployeeFormData({
                          name: "",
                          skills: [],
                          performance: 4.0,
                        });
                        setSelectedSkills([]);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="modal-confirm-btn"
                      onClick={saveEmployee}
                    >
                      {editingEmployee ? "Save Changes" : "Add Employee"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Add Employee to Role Modal */}
            {showRoleEmployeeModal && (
              <>
                <div
                  className="modal-overlay"
                  onClick={() => {
                    setShowRoleEmployeeModal(null);
                    setSelectedEmployeeForRole("");
                  }}
                ></div>
                <div className="modal employee-to-role-modal">
                  <div className="modal-header">
                    <h3>Add New Employee</h3>
                  </div>
                  <div className="modal-body">
                    <label className="input-label">Employee List</label>
                    <select
                      className="employee-select"
                      value={selectedEmployeeForRole}
                      onChange={(e) =>
                        setSelectedEmployeeForRole(e.target.value)
                      }
                    >
                      <option value=""></option>
                      {availableStaff.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name}{" "}
                          {emp.skills.includes(showRoleEmployeeModal)
                            ? "✓"
                            : ""}{" "}
                          ({emp.performance}★)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="modal-cancel-btn"
                      onClick={() => {
                        setShowRoleEmployeeModal(null);
                        setSelectedEmployeeForRole("");
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

        {currentView === "tasks" && (
          <div className="tasks-view">
            <div className="content-header">
              <div className="content-header-left">
                <h2 className="content-title">Task Monitor</h2>
                <p className="content-subtitle">
                  Track shift work by section, status, or person, and spot what
                  still needs attention at a glance.
                </p>
              </div>

              <div className="view-mode-toggle">
                <button
                  className={`mode-btn ${
                    taskViewMode === "section" ? "active" : ""
                  }`}
                  onClick={() => setTaskViewMode("section")}
                >
                  By Section
                </button>
                <button
                  className={`mode-btn ${
                    taskViewMode === "status" ? "active" : ""
                  }`}
                  onClick={() => setTaskViewMode("status")}
                >
                  By Status
                </button>
                <button
                  className={`mode-btn ${
                    taskViewMode === "person" ? "active" : ""
                  }`}
                  onClick={() => setTaskViewMode("person")}
                >
                  By Person
                </button>
              </div>
            </div>

            {taskViewMode === "section" && (
              <>
                <div className="task-filters">
                  <button
                    className={`filter-btn ${
                      filterSection === "all" ? "active" : ""
                    }`}
                    onClick={() => setFilterSection("all")}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${
                      filterSection === "bar" ? "active" : ""
                    }`}
                    onClick={() => setFilterSection("bar")}
                  >
                    Bar
                  </button>
                  <button
                    className={`filter-btn ${
                      filterSection === "dining" ? "active" : ""
                    }`}
                    onClick={() => setFilterSection("dining")}
                  >
                    Dining
                  </button>
                  <button
                    className={`filter-btn ${
                      filterSection === "kitchen" ? "active" : ""
                    }`}
                    onClick={() => setFilterSection("kitchen")}
                  >
                    Kitchen
                  </button>
                  <button
                    className={`filter-btn ${
                      filterSection === "outdoor" ? "active" : ""
                    }`}
                    onClick={() => setFilterSection("outdoor")}
                  >
                    Outdoor
                  </button>
                </div>

                <div className="tasks-grid">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="task-card"
                      style={{
                        borderLeftColor: getTaskStatusColor(task.status),
                      }}
                    >
                      <div className="task-header">
                        <h4 className="task-title">{task.title}</h4>
                        <div className="task-header-right">
                          {task.priority === "urgent" && (
                            <span className="task-chip urgent">Urgent</span>
                          )}
                          <span className="task-section">{task.section}</span>
                        </div>
                      </div>

                      <div className="task-meta">
                        <span className="task-time">⏰ {task.timestamp}</span>
                        {task.assignedTo && (
                          <span className="task-assigned">
                            👤 {task.assignedTo}
                          </span>
                        )}
                      </div>

                      <div className="task-status-controls">
                        {(() => {
                          const { key, label } = getManagerStatus(task);
                          const color = getTaskStatusColor(key);

                          return (
                            <>
                              <span
                                className="status-pill"
                                style={{ borderColor: color, color }}
                              >
                                {label}
                              </span>

                              {/* Manager can only review when it's pending approval */}
                              {key === "in-progress" && task.photo && (
                                <button
                                  className="verify-btn"
                                  onClick={() => openVerificationModal(task)}
                                >
                                  Review photo
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      {!task.assignedTo && (
                        <select
                          className="assign-select"
                          onChange={(e) =>
                            assignTaskToStaff(task.id, e.target.value)
                          }
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Assign to staff...
                          </option>
                          {initialEmployees.map((emp) => (
                            <option key={emp.id} value={emp.name}>
                              {emp.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {taskViewMode === "status" && (
              <div className="task-status-board">
                {/* Pending Column */}
                <div
                  className="status-column pending-column"
                  onDragOver={handleTaskDragOver}
                  onDrop={(e) => handleTaskDrop(e, "pending")}
                >
                  <div className="status-column-header">
                    <h3 className="status-column-title">
                      <span className="status-icon">📋</span>
                      Not Started
                    </h3>
                    <span className="task-count">
                      {tasksByStatus["pending"].length}
                    </span>
                  </div>
                  <div className="status-column-tasks">
                    {tasksByStatus["pending"].map((task) => (
                      <div
                        key={task.id}
                        className="task-card-mini"
                        draggable
                        onDragStart={(e) => handleTaskDragStart(e, task)}
                      >
                        <div className="task-card-header">
                          <h4 className="task-title-mini">{task.title}</h4>
                          <span className="task-section-badge">
                            {task.section}
                          </span>
                        </div>
                        <div className="task-meta-mini">
                          <span className="task-time-mini">
                            ⏰ {task.timestamp}
                          </span>
                          {task.assignedTo && (
                            <span className="task-assigned-mini">
                              👤 {task.assignedTo}
                            </span>
                          )}
                        </div>

                        {/* Display manager feedback if task was rejected */}
                        {task.feedback && (
                          <div className="task-feedback-display">
                            <div className="feedback-header">
                              <span className="feedback-icon">💬</span>
                              <span className="feedback-label">
                                Manager Feedback
                              </span>
                            </div>
                            <p className="feedback-text">{task.feedback}</p>
                            {task.feedbackTimestamp && (
                              <span className="feedback-timestamp">
                                {task.feedbackTimestamp}
                              </span>
                            )}
                          </div>
                        )}

                        <button
                          className="task-action-btn progress-btn"
                          onClick={() =>
                            updateTaskStatus(task.id, "in-progress")
                          }
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
                  onDrop={(e) => handleTaskDrop(e, "in-progress")}
                >
                  <div className="status-column-header">
                    <h3 className="status-column-title">
                      <span className="status-icon">🔍</span>
                      Pending Approval
                    </h3>
                    <span className="task-count">
                      {tasksByStatus["in-progress"].length}
                    </span>
                  </div>
                  <div className="status-column-tasks">
                    {tasksByStatus["in-progress"].map((task) => (
                      <div
                        key={task.id}
                        className="task-card-mini"
                        draggable
                        onDragStart={(e) => handleTaskDragStart(e, task)}
                        onClick={() => openVerificationModal(task)}
                      >
                        <div className="task-card-header">
                          <h4 className="task-title-mini">{task.title}</h4>
                          <span className="task-section-badge">
                            {task.section}
                          </span>
                        </div>
                        <div className="task-meta-mini">
                          <span className="task-time-mini">
                            ⏰ {task.timestamp}
                          </span>
                          {task.assignedTo && (
                            <span className="task-assigned-mini">
                              👤 {task.assignedTo}
                            </span>
                          )}
                        </div>

                        {/* Optional: keep upload so you can simulate staff attaching a photo */}
                        <div
                          className="image-upload-section"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="upload-label">
                            {task.photo ? (
                              <div className="photo-preview">
                                <img
                                  src={task.photo}
                                  alt="Task verification"
                                  className="task-photo"
                                />
                                <span className="photo-uploaded">
                                  ✓ Photo Uploaded
                                </span>
                              </div>
                            ) : (
                              <>
                                <span className="upload-icon">📷</span>
                                <span>Upload Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleImageUpload(e, task.id)
                                  }
                                  className="file-input"
                                />
                              </>
                            )}
                          </label>
                        </div>

                        <button
                          className="task-action-btn complete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVerificationModal(task);
                          }}
                          disabled={!task.photo}
                        >
                          Review &amp; Verify →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completed Column */}
                <div
                  className="status-column completed-column"
                  onDragOver={handleTaskDragOver}
                  onDrop={(e) => handleTaskDrop(e, "completed")}
                >
                  <div className="status-column-header">
                    <h3 className="status-column-title">
                      <span className="status-icon">✅</span>
                      Completed
                    </h3>
                    <span className="task-count">
                      {tasksByStatus["completed"].length}
                    </span>
                  </div>
                  <div className="status-column-tasks">
                    {tasksByStatus["completed"].map((task) => (
                      <div key={task.id} className="task-card-mini completed">
                        <div className="task-card-header">
                          <h4 className="task-title-mini">{task.title}</h4>
                          <span className="task-section-badge">
                            {task.section}
                          </span>
                        </div>
                        <div className="task-meta-mini">
                          <span className="task-time-mini">
                            ⏰ {task.timestamp}
                          </span>
                          {task.assignedTo && (
                            <span className="task-assigned-mini">
                              👤 {task.assignedTo}
                            </span>
                          )}
                        </div>
                        {task.photo && (
                          <div className="completed-photo-preview">
                            <img
                              src={task.photo}
                              alt="Completed task"
                              className="completed-task-photo"
                            />
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

            {taskViewMode === "person" && (
              <div className="task-person-board">
                {Object.entries(tasksByAssignee).map(
                  ([assignee, personTasks]) => {
                    const total = personTasks.length;
                    const pending = personTasks.filter(
                      (t) => t.status === "pending"
                    ).length;
                    const inProgress = personTasks.filter(
                      (t) => t.status === "in-progress"
                    ).length;
                    const completed = personTasks.filter(
                      (t) => t.status === "completed"
                    ).length;
                    const urgentCount = personTasks.filter(
                      (t) => t.priority === "urgent"
                    ).length;
                    const withPhoto = personTasks.filter((t) => t.photo).length;
                    const completionRate = total
                      ? Math.round((completed / total) * 100)
                      : 0;

                    const isUnassigned = assignee === "Unassigned";
                    const employee =
                      initialEmployees.find((e) => e.name === assignee) || null;

                    return (
                      <div
                        key={assignee}
                        className={`person-task-card ${
                          isUnassigned ? "person-unassigned" : ""
                        }`}
                      >
                        <div className="person-task-header">
                          <div className="person-identity">
                            <div
                              className={`person-avatar ${
                                isUnassigned ? "person-avatar-unassigned" : ""
                              }`}
                            >
                              {isUnassigned ? "U" : assignee[0]}
                            </div>

                            <div className="person-title-block">
                              <h3 className="person-name">
                                {isUnassigned ? "Unassigned tasks" : assignee}
                              </h3>

                              {isUnassigned ? (
                                <span className="person-tag unassigned-tag">
                                  Tasks that don’t have an owner yet
                                </span>
                              ) : (
                                employee &&
                                employee.skills &&
                                employee.skills.length > 0 && (
                                  <div className="person-skills">
                                    {employee.skills.map((skill) => (
                                      <span
                                        key={skill}
                                        className="skill-tag small"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div className="person-stats">
                            <div className="person-stat">
                              <span className="person-stat-label">Tasks</span>
                              <span className="person-stat-value">{total}</span>
                            </div>
                            <div className="person-stat">
                              <span className="person-stat-label">
                                Completed
                              </span>
                              <span className="person-stat-value">
                                {completed} ({completionRate}%)
                              </span>
                            </div>
                            <div className="person-stat">
                              <span className="person-stat-label">Urgent</span>
                              <span className="person-stat-value">
                                {urgentCount}
                              </span>
                            </div>
                            <div className="person-stat">
                              <span className="person-stat-label">
                                With Photo
                              </span>
                              <span className="person-stat-value">
                                {withPhoto}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="person-status-overview">
                          <div
                            className="status-chip"
                            style={{
                              borderColor: getTaskStatusColor("pending"),
                            }}
                          >
                            <span
                              className="status-dot"
                              style={{
                                backgroundColor: getTaskStatusColor("pending"),
                              }}
                            />
                            <span>Not started: {pending}</span>
                          </div>
                          <div
                            className="status-chip"
                            style={{
                              borderColor: getTaskStatusColor("in-progress"),
                            }}
                          >
                            <span
                              className="status-dot"
                              style={{
                                backgroundColor:
                                  getTaskStatusColor("in-progress"),
                              }}
                            />
                            <span>Pending approval: {inProgress}</span>
                          </div>
                          <div
                            className="status-chip"
                            style={{
                              borderColor: getTaskStatusColor("completed"),
                            }}
                          >
                            <span
                              className="status-dot"
                              style={{
                                backgroundColor:
                                  getTaskStatusColor("completed"),
                              }}
                            />
                            <span>Completed: {completed}</span>
                          </div>
                        </div>

                        <ul className="person-task-list">
                          {personTasks
                            .slice()
                            .sort((a, b) =>
                              (a.timestamp || "").localeCompare(
                                b.timestamp || ""
                              )
                            )
                            .map((task) => {
                              const statusColor = getTaskStatusColor(
                                task.status
                              );
                              let statusLabel = "Not started";
                              if (task.status === "in-progress")
                                statusLabel = "Pending approval";
                              if (task.status === "completed")
                                statusLabel = "Completed";

                              return (
                                <li key={task.id} className="person-task-item">
                                  <div className="person-task-main">
                                    <span className="person-task-title">
                                      {task.title}
                                    </span>
                                    <span
                                      className="person-task-status-pill"
                                      style={{
                                        borderColor: statusColor,
                                        color: statusColor,
                                      }}
                                    >
                                      {statusLabel}
                                    </span>
                                  </div>
                                  <div className="person-task-meta">
                                    <span>⏰ {task.timestamp}</span>
                                    <span>📍 {task.section}</span>
                                    {task.priority === "urgent" && (
                                      <span className="task-chip urgent">
                                        Urgent
                                      </span>
                                    )}
                                    {task.photo && (
                                      <span className="task-chip photo-chip">
                                        📷 Photo
                                      </span>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            <button
              className="add-task-btn"
              onClick={() => setShowAddTaskModal(true)}
            >
              + Add New Task
            </button>

            {/* Verification Modal */}
            {showVerificationModal && taskToVerify && (
              <>
                <div
                  className="modal-overlay"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setTaskToVerify(null);
                  }}
                ></div>
                <div className="modal verification-modal">
                  <div className="modal-header">
                    <h3>Verify Task Completion</h3>
                  </div>
                  <div className="modal-body">
                    <div className="verification-task-info">
                      <h4 className="verification-task-title">
                        {taskToVerify.title}
                      </h4>
                      <p className="verification-task-meta">
                        <span>📍 {taskToVerify.section}</span>
                        <span>⏰ {taskToVerify.timestamp}</span>
                        {taskToVerify.assignedTo && (
                          <span>👤 {taskToVerify.assignedTo}</span>
                        )}
                      </p>
                    </div>

                    {taskToVerify.photo && (
                      <div className="verification-photo-container">
                        <label className="input-label">Submitted Photo:</label>
                        <img
                          src={taskToVerify.photo}
                          alt="Task verification"
                          className="verification-photo"
                        />
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
                <div
                  className="modal-overlay"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setTaskToVerify(null);
                    setManagerFeedback("");
                  }}
                ></div>
                <div className="modal feedback-modal">
                  <div className="modal-header">
                    <h3>Manager Feedback</h3>
                  </div>
                  <div className="modal-body">
                    <div className="feedback-task-info">
                      <p className="feedback-context">You are rejecting:</p>
                      <h4 className="feedback-task-title">
                        {taskToVerify.title}
                      </h4>
                      <p className="feedback-task-details">
                        <span>📍 {taskToVerify.section}</span>
                        {taskToVerify.assignedTo && (
                          <span> • 👤 {taskToVerify.assignedTo}</span>
                        )}
                      </p>
                    </div>

                    <label className="input-label">
                      Feedback / Reason for Rejection
                    </label>
                    <textarea
                      value={managerFeedback}
                      onChange={(e) => setManagerFeedback(e.target.value)}
                      placeholder="Provide feedback on what needs to be corrected or redone..."
                      className="feedback-textarea"
                      rows="6"
                      autoFocus
                    />

                    <p className="feedback-note">
                      💡 This feedback will be visible to the staff member so
                      they know what to improve.
                    </p>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="modal-cancel-btn"
                      onClick={() => {
                        setShowFeedbackModal(false);
                        setTaskToVerify(null);
                        setManagerFeedback("");
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

            {/* Repeat Task Modal */}
            {showRepeatModal && taskToRepeat && (
              <>
                <div
                  className="modal-overlay"
                  onClick={() => {
                    setShowRepeatModal(false);
                    setTaskToRepeat(null);
                  }}
                ></div>
                <div className="modal repeat-task-modal">
                  <div className="modal-header">
                    <h3>Repeat Task?</h3>
                  </div>
                  <div className="modal-body">
                    <p>
                      A new copy of this task will be added to{" "}
                      <strong>Tasks</strong> while keeping the completed record.
                    </p>
                    <div className="verification-task-info">
                      <h4 className="verification-task-title">
                        {taskToRepeat.title}
                      </h4>
                      <p className="verification-task-meta">
                        <span>📍 {taskToRepeat.section}</span>
                        {taskToRepeat.assignedTo && (
                          <span> • 👤 {taskToRepeat.assignedTo}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="modal-cancel-btn"
                      onClick={() => {
                        setShowRepeatModal(false);
                        setTaskToRepeat(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="modal-confirm-btn"
                      onClick={() => {
                        const newTask = {
                          ...taskToRepeat,
                          id: Date.now(),
                          status: "pending",
                          photo: null,
                          verified: false,
                          feedback: undefined,
                          feedbackTimestamp: undefined,
                        };
                        setTasks((prev) => [...prev, newTask]);
                        setShowRepeatModal(false);
                        setTaskToRepeat(null);
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Add Task Modal */}
            {showAddTaskModal && (
              <>
                <div
                  className="modal-overlay"
                  onClick={() => setShowAddTaskModal(false)}
                ></div>
                <div className="modal add-task-modal">
                  <div className="modal-header">
                    <h3>Add New Task</h3>
                  </div>
                  <div className="modal-body">
                    <label className="input-label">Task Title</label>
                    <input
                      type="text"
                      value={newTaskData.title}
                      onChange={(e) =>
                        setNewTaskData({
                          ...newTaskData,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter task title"
                      className="modal-input"
                      autoFocus
                    />

                    <label className="input-label">Section</label>
                    <select
                      value={newTaskData.section}
                      onChange={(e) =>
                        setNewTaskData({
                          ...newTaskData,
                          section: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setNewTaskData({
                          ...newTaskData,
                          timestamp: e.target.value,
                        })
                      }
                      className="modal-input"
                    />

                    <label className="input-label">Assign To (Optional)</label>
                    <select
                      value={newTaskData.assignedTo}
                      onChange={(e) =>
                        setNewTaskData({
                          ...newTaskData,
                          assignedTo: e.target.value,
                        })
                      }
                      className="modal-select"
                    >
                      <option value="">Unassigned</option>
                      {initialEmployees.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="modal-cancel-btn"
                      onClick={() => {
                        setShowAddTaskModal(false);
                        setNewTaskData({
                          title: "",
                          section: "Bar",
                          timestamp: "",
                          assignedTo: "",
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="modal-confirm-btn"
                      onClick={addNewTask}
                      disabled={
                        !newTaskData.title.trim() || !newTaskData.timestamp
                      }
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {currentView === "reports" && (
          <div className="reports-view">
            <div className="content-header">
              <div className="content-header-left">
                <h2 className="content-title">Shift Reports</h2>
                <p className="content-subtitle">
                  Summary of all completed tasks for this session, including
                  verification status, photos, and manager feedback.
                </p>
              </div>
            </div>

            {/* High-level metrics */}
            <div className="reports-metrics-grid">
              <div className="report-metric-card">
                <span className="metric-label">Total Tasks</span>
                <span className="metric-value">{totalTasks}</span>
              </div>
              <div className="report-metric-card">
                <span className="metric-label">Completed</span>
                <span className="metric-value">{completedCount}</span>
              </div>
              <div className="report-metric-card">
                <span className="metric-label">Completion Rate</span>
                <span className="metric-value">{completionRate}%</span>
              </div>
              <div className="report-metric-card">
                <span className="metric-label">Verified w/ Photo</span>
                <span className="metric-value">
                  {verifiedCount}/{withPhotoCount}
                </span>
              </div>
              <div className="report-metric-card">
                <span className="metric-label">
                  Completed w/ Manager Feedback
                </span>
                <span className="metric-value">{feedbackOnCompleted}</span>
              </div>
            </div>

            {/* Section breakdown + Top closers */}
            <div className="reports-summary-row">
              <div className="report-panel">
                <h3 className="report-panel-title">Completion by Section</h3>
                {sectionBreakdown.length === 0 ? (
                  <p className="report-empty-state">
                    No completed tasks yet for this shift.
                  </p>
                ) : (
                  <ul className="report-list">
                    {sectionBreakdown.map(([section, count]) => (
                      <li key={section} className="report-list-item">
                        <span className="report-list-label">{section}</span>
                        <span className="report-list-value">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="report-panel">
                <h3 className="report-panel-title">Top Closers</h3>
                {topClosers.length === 0 ? (
                  <p className="report-empty-state">
                    No assigned staff completions yet.
                  </p>
                ) : (
                  <ul className="report-list">
                    {topClosers.map(([name, count]) => (
                      <li key={name} className="report-list-item">
                        <span className="report-list-label">{name}</span>
                        <span className="report-list-value">{count} tasks</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Detailed reports for each completed task */}
            <div className="reports-detailed-section">
              <h3 className="section-title">Completed Task Reports</h3>
              {completedTasks.length === 0 ? (
                <p className="report-empty-state">
                  Once tasks are marked as completed, they will appear here with
                  a full summary.
                </p>
              ) : (
                <div className="reports-cards-grid">
                  {completedTasks.map((task) => {
                    const isVerified = !!task.verified;
                    const hasPhoto = !!task.photo;
                    const hasFeedback = !!task.feedback;

                    return (
                      <div key={task.id} className="report-card">
                        <div className="report-card-header">
                          <div>
                            <h4 className="report-task-title">{task.title}</h4>
                            <div className="report-task-tags">
                              <span className="task-section-badge">
                                {task.section || "General"}
                              </span>
                              {task.priority === "urgent" && (
                                <span className="task-chip urgent">Urgent</span>
                              )}
                            </div>
                          </div>
                          <div className="report-task-status">
                            <span
                              className={`status-pill ${
                                isVerified ? "verified" : ""
                              }`}
                            >
                              {isVerified
                                ? "Completed & Verified"
                                : "Completed"}
                            </span>
                          </div>
                        </div>

                        <div className="report-task-meta">
                          <span>⏰ {task.timestamp}</span>
                          {task.assignedTo && <span>👤 {task.assignedTo}</span>}
                          {hasPhoto && <span>📷 Photo attached</span>}
                        </div>

                        <p className="report-summary-text">
                          {getTaskReportSummary(task)}
                        </p>

                        {hasFeedback && (
                          <div className="report-feedback-block">
                            <div className="feedback-header">
                              <span className="feedback-icon">💬</span>
                              <span className="feedback-label">
                                Manager Feedback
                              </span>
                            </div>
                            <p className="feedback-text">{task.feedback}</p>
                            {task.feedbackTimestamp && (
                              <span className="feedback-timestamp">
                                Logged at {task.feedbackTimestamp}
                              </span>
                            )}
                          </div>
                        )}

                        {hasPhoto && (
                          <div className="report-photo-preview">
                            <img
                              src={task.photo}
                              alt="Task evidence"
                              className="completed-task-photo"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === "performance" && (
          <div className="performance-view">
            <div className="content-header">
              <div className="content-header-left">
                <h2 className="content-title">Performance Notes</h2>
                <p className="content-subtitle">
                  Adjust ratings and capture shift-by-shift notes. Any changes
                  here will update the star ratings used in the Scheduling view.
                </p>
              </div>
            </div>

            <div className="available-section">
              <h3 className="section-title">Team Roster</h3>
              <div className="available-staff-grid">
                {allEmployees.map((emp) => {
                  // Simple label based on rating
                  let ratingLabel = "Developing";
                  if (emp.performance >= 4.5) ratingLabel = "Top performer";
                  else if (emp.performance >= 4.0) ratingLabel = "Consistent";
                  else if (emp.performance >= 3.5)
                    ratingLabel = "Needs coaching";

                  return (
                    <div key={emp.id} className="employee-card">
                      <div className="employee-card-header">
                        <span className="employee-name">{emp.name}</span>
                        <span className="performance-badge">
                          {emp.performance?.toFixed(1)}★
                        </span>
                      </div>

                      {emp.skills && emp.skills.length > 0 && (
                        <div className="employee-skills">
                          {emp.skills.map((skill) => (
                            <span key={skill} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div
                        className="performance-slider-container"
                        style={{ marginTop: "0.5rem" }}
                      >
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.1"
                          value={emp.performance || 3}
                          onChange={(e) =>
                            updateEmployeePerformanceFields(emp.id, {
                              performance: parseFloat(e.target.value),
                            })
                          }
                          className="performance-slider"
                        />
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                          }}
                        >
                          <span className="performance-value">
                            {(emp.performance || 3).toFixed(1)}★
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#666",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {ratingLabel}
                          </span>
                        </div>
                      </div>

                      <label
                        className="input-label"
                        style={{ marginTop: "0.75rem" }}
                      >
                        Performance Notes
                      </label>
                      <textarea
                        className="feedback-textarea"
                        rows={4}
                        placeholder="Add quick notes about tonight’s shift, strengths, and coaching points..."
                        value={emp.notes || ""}
                        onChange={(e) =>
                          updateEmployeePerformanceFields(emp.id, {
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
