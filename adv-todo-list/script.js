// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-active');
    });
    
    // Task operations
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.querySelector('.add-task-btn');
    const pendingTasksList = document.getElementById('pendingTasks');
    const completedTasksList = document.getElementById('completedTasks');
    
    // Task counter and chart update
    function updateTaskStats() {
        const pendingCount = document.querySelectorAll('#pendingTasks .task-item').length;
        const completedCount = document.querySelectorAll('#completedTasks .task-item').length;
        const totalCount = pendingCount + completedCount;
        
        // Update task count
        document.querySelector('.task-count').textContent = totalCount;
        
        // Update chart
        if (totalCount > 0) {
            const completedPercentage = Math.round((completedCount / totalCount) * 100);
            const pendingPercentage = 100 - completedPercentage;
            
            document.querySelector('.circle-done').setAttribute('stroke-dasharray', `${completedPercentage}, 100`);
            document.querySelector('.circle-pending').setAttribute('stroke-dasharray', `${pendingPercentage}, 100`);
        } else {
            document.querySelector('.circle-done').setAttribute('stroke-dasharray', '0, 100');
            document.querySelector('.circle-pending').setAttribute('stroke-dasharray', '0, 100');
        }
    }
    
    // Add new task
    function addNewTask() {
        const taskText = taskInput.value.trim();
        
        if (taskText !== '') {
            // Create unique ID for the task
            const taskId = 'task-' + Date.now();
            
            // Create task element
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <div class="task-checkbox">
                    <input type="checkbox" id="${taskId}">
                    <label for="${taskId}"></label>
                </div>
                <div class="task-text">${taskText}</div>
                <button class="star-btn">
                    <i class="far fa-star"></i>
                </button>
            `;
            
            // Add to pending tasks
            pendingTasksList.appendChild(taskItem);
            
            // Clear input
            taskInput.value = '';
            
            // Update stats
            updateTaskStats();
            
            // Add event listeners to new task
            setupTaskListeners(taskItem);
            
            // Save to localStorage
            saveTasksToLocalStorage();
        }
    }
    
    // Setup event listeners for task items
    function setupTaskListeners(taskItem) {
        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        const starBtn = taskItem.querySelector('.star-btn');
        
        // Toggle task completion
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                taskItem.classList.add('completed');
                completedTasksList.appendChild(taskItem);
            } else {
                taskItem.classList.remove('completed');
                pendingTasksList.appendChild(taskItem);
            }
            
            // Update stats and save
            updateTaskStats();
            saveTasksToLocalStorage();
        });
        
        // Toggle task importance
        starBtn.addEventListener('click', function() {
            this.classList.toggle('important');
            
            if (this.classList.contains('important')) {
                this.innerHTML = '<i class="fas fa-star"></i>';
            } else {
                this.innerHTML = '<i class="far fa-star"></i>';
            }
            
            saveTasksToLocalStorage();
        });
    }
    
    // Add task on button click
    addTaskBtn.addEventListener('click', addNewTask);
    
    // Add task on Enter key press
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewTask();
        }
    });
    
    // Setup API Integration
    // This is a placeholder function for the API integration
    async function fetchTasksFromAPI() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Process and add tasks from API
            data.forEach(item => {
                const taskId = 'api-task-' + item.id;
                
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';
                if (item.completed) {
                    taskItem.classList.add('completed');
                }
                
                taskItem.innerHTML = `
                    <div class="task-checkbox">
                        <input type="checkbox" id="${taskId}" ${item.completed ? 'checked' : ''}>
                        <label for="${taskId}"></label>
                        </div>
                    <div class="task-text">${item.title}</div>
                    <button class="star-btn">
                        <i class="far fa-star"></i>
                    </button>
                `;
                
                // Add to the appropriate list
                if (item.completed) {
                    completedTasksList.appendChild(taskItem);
                } else {
                    pendingTasksList.appendChild(taskItem);
                }
                
                // Setup event listeners
                setupTaskListeners(taskItem);
            });
            
            // Update task stats
            updateTaskStats();
            
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // Show error notification to user
            showNotification('Failed to load tasks from server', 'error');
        }
    }
    
    // Function to save tasks to localStorage
    function saveTasksToLocalStorage() {
        const pendingTasks = Array.from(pendingTasksList.querySelectorAll('.task-item')).map(item => {
            return {
                text: item.querySelector('.task-text').textContent,
                completed: false,
                important: item.querySelector('.star-btn').classList.contains('important')
            };
        });
        
        const completedTasks = Array.from(completedTasksList.querySelectorAll('.task-item')).map(item => {
            return {
                text: item.querySelector('.task-text').textContent,
                completed: true,
                important: item.querySelector('.star-btn').classList.contains('important')
            };
        });
        
        const allTasks = [...pendingTasks, ...completedTasks];
        localStorage.setItem('tasks', JSON.stringify(allTasks));
    }
    
    // Function to load tasks from localStorage
    function loadTasksFromLocalStorage() {
        const savedTasks = localStorage.getItem('tasks');
        
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            
            // Clear existing tasks
            pendingTasksList.innerHTML = '';
            completedTasksList.innerHTML = '';
            
            tasks.forEach((task, index) => {
                const taskId = 'saved-task-' + index;
                
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';
                if (task.completed) {
                    taskItem.classList.add('completed');
                }
                
                taskItem.innerHTML = `
                    <div class="task-checkbox">
                        <input type="checkbox" id="${taskId}" ${task.completed ? 'checked' : ''}>
                        <label for="${taskId}"></label>
                    </div>
                    <div class="task-text">${task.text}</div>
                    <button class="star-btn ${task.important ? 'important' : ''}">
                        <i class="${task.important ? 'fas' : 'far'} fa-star"></i>
                    </button>
                `;
                
                // Add to the appropriate list
                if (task.completed) {
                    completedTasksList.appendChild(taskItem);
                } else {
                    pendingTasksList.appendChild(taskItem);
                }
                
                // Setup event listeners
                setupTaskListeners(taskItem);
            });
            
            // Update task stats
            updateTaskStats();
        } else {
            // No saved tasks, fetch from API instead
            fetchTasksFromAPI();
        }
    }
    
    // Show notification message
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Initialize task event listeners for existing tasks
    document.querySelectorAll('.task-item').forEach(item => {
        setupTaskListeners(item);
    });
    
    // Load tasks on page load
    loadTasksFromLocalStorage();
    
    // Add event listeners for filter tabs in sidebar
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get the filter type from the tab text
            const filterType = this.querySelector('span').textContent.toLowerCase();
            
            // Apply filtering logic
            filterTasks(filterType);
        });
    });
    
    // Function to filter tasks based on selected filter
    function filterTasks(filterType) {
        const allTasks = document.querySelectorAll('.task-item');
        
        allTasks.forEach(task => {
            // Reset visibility
            task.style.display = 'flex';
            
            const isCompleted = task.classList.contains('completed');
            const isImportant = task.querySelector('.star-btn').classList.contains('important');
            
            switch (filterType) {
                case 'today':
                    // Show all tasks (default view)
                    break;
                    
                case 'important':
                    // Show only important tasks
                    if (!isImportant) {
                        task.style.display = 'none';
                    }
                    break;
                    
                case 'planned':
                    // This would filter tasks with due dates
                    // For now, just show a placeholder message
                    showNotification('Planned tasks filtering not implemented yet');
                    break;
                    
                case 'assigned to me':
                    // This would filter assigned tasks
                    showNotification('Assigned tasks filtering not implemented yet');
                    break;
            }
        });
    }
    
    // API sync feature (simulated)
    let isOnline = navigator.onLine;
    
    // Function to sync with API server
    async function syncWithServer() {
        if (!isOnline) {
            console.log('Cannot sync: Offline');
            return;
        }
        
        try {
            // Get tasks from localStorage
            const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
            
            // Example POST request to sync tasks
            const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 1, // Placeholder user ID
                    tasks: savedTasks
                })
            });
            
            if (response.ok) {
                showNotification('Tasks synced successfully', 'success');
            }
            
        } catch (error) {
            console.error('Sync error:', error);
            showNotification('Failed to sync tasks with server', 'error');
        }
    }
    
    // Check online status and setup listeners
    window.addEventListener('online', () => {
        isOnline = true;
        showNotification('You are online. Tasks will sync automatically.', 'success');
        syncWithServer(); // Sync when we come back online
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        showNotification('You are offline. Changes will be saved locally.', 'warning');
    });
    
    // Setup periodic sync (every 5 minutes)
    if (isOnline) {
        // Initial sync
        syncWithServer();
        
        // Set interval for periodic sync
        setInterval(syncWithServer, 5 * 60 * 1000);
    }
    
    // Handle drag and drop for tasks (basic implementation)
    let draggedTask = null;
    
    function setupDragAndDrop() {
        // Make tasks draggable
        document.querySelectorAll('.task-item').forEach(task => {
            task.setAttribute('draggable', true);
            
            task.addEventListener('dragstart', function(e) {
                draggedTask = this;
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', ''); // Required for Firefox
            });
            
            task.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
        });
        
        // Make lists droppable
        [pendingTasksList, completedTasksList].forEach(list => {
            list.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });
            
            list.addEventListener('dragleave', function() {
                this.classList.remove('drag-over');
            });
            
            list.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                
                if (draggedTask) {
                    this.appendChild(draggedTask);
                    
                    // Update task status based on which list it was dropped into
                    const checkbox = draggedTask.querySelector('input[type="checkbox"]');
                    
                    if (this === completedTasksList) {
                        checkbox.checked = true;
                        draggedTask.classList.add('completed');
                    } else {
                        checkbox.checked = false;
                        draggedTask.classList.remove('completed');
                    }
                    
                    // Update stats and save
                    updateTaskStats();
                    saveTasksToLocalStorage();
                }
            });
        });
    }
    
    // Setup drag and drop
    setupDragAndDrop();
    
    // Call updateTaskStats initially to set the correct values
    updateTaskStats();
});
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get references to the elements
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const appContainer = document.querySelector('.app-container');
    const sidebarContent = document.querySelector('.sidebar-nav, .user-profile, .add-list-btn, .today-stats');
    const sidebarHeader = document.querySelector('.sidebar-header');
    
    // Add click event listener to the menu toggle button
    menuToggle.addEventListener('click', function() {
        // Toggle a class on the app container to handle the sidebar visibility
        appContainer.classList.toggle('sidebar-collapsed');
        
        // Update the menu icon (optional)
        const menuIcon = menuToggle.querySelector('i');
        if (appContainer.classList.contains('sidebar-collapsed')) {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-arrow-right');
        } else {
            menuIcon.classList.remove('fa-arrow-right');
            menuIcon.classList.add('fa-bars');
        }
    });
});

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const sidebarNav = document.querySelector('.sidebar-nav');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const plannedNavItem = document.querySelector('.nav-item:nth-child(4)');
const assignedNavItem = document.querySelector('.nav-item:nth-child(5)');

// Hamburger Menu Functionality
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

// Task Checkbox Functionality
document.querySelectorAll('.task-checkbox input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const taskItem = this.closest('.task-item');
        if (this.checked) {
            taskItem.classList.add('completed');
            document.getElementById('completedTasks').appendChild(taskItem);
        } else {
            taskItem.classList.remove('completed');
            document.getElementById('pendingTasks').appendChild(taskItem);
        }
    });
});

// Star Button Functionality
document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.classList.toggle('important');
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });
});

// Add Task Functionality
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.querySelector('.add-task-btn');

addTaskBtn.addEventListener('click', addNewTask);
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addNewTask();
    }
});

function addNewTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const taskId = 'task' + (document.querySelectorAll('.task-item').length + 1);
    
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.innerHTML = `
        <div class="task-checkbox">
            <input type="checkbox" id="${taskId}">
            <label for="${taskId}"></label>
        </div>
        <div class="task-text">${taskText}</div>
        <button class="star-btn">
            <i class="far fa-star"></i>
        </button>
    `;

    document.getElementById('pendingTasks').appendChild(taskItem);
    taskInput.value = '';

    // Add event listeners to new elements
    const newCheckbox = taskItem.querySelector('.task-checkbox input');
    newCheckbox.addEventListener('change', function() {
        if (this.checked) {
            taskItem.classList.add('completed');
            document.getElementById('completedTasks').appendChild(taskItem);
        } else {
            taskItem.classList.remove('completed');
            document.getElementById('pendingTasks').appendChild(taskItem);
        }
    });

    const newStarBtn = taskItem.querySelector('.star-btn');
    newStarBtn.addEventListener('click', function() {
        this.classList.toggle('important');
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });
}

// Expand functionality for Planned button
plannedNavItem.addEventListener('click', function() {
    // Check if submenu already exists
    let submenu = this.querySelector('.submenu');
    
    // Toggle submenu
    if (submenu) {
        submenu.remove();
    } else {
        submenu = document.createElement('ul');
        submenu.className = 'submenu';
        
        // Create submenu items
        const submenuItems = [
            { icon: 'fas fa-calendar-day', text: 'Today' },
            { icon: 'fas fa-calendar-week', text: 'This Week' },
            { icon: 'fas fa-calendar-alt', text: 'This Month' },
            { icon: 'fas fa-calendar-plus', text: 'Custom' }
        ];
        
        submenuItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'submenu-item';
            li.innerHTML = `<i class="${item.icon}"></i><span>${item.text}</span>`;
            li.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering parent click
                alert(`${item.text} tasks selected`);
            });
            submenu.appendChild(li);
        });
        
        this.appendChild(submenu);
    }
});

// Expand functionality for Assigned to me button
assignedNavItem.addEventListener('click', function() {
    // Check if submenu already exists
    let submenu = this.querySelector('.submenu');
    
    // Toggle submenu
    if (submenu) {
        submenu.remove();
    } else {
        submenu = document.createElement('ul');
        submenu.className = 'submenu';
        
        // Create submenu items
        const submenuItems = [
            { icon: 'fas fa-user-friends', text: 'Team Tasks' },
            { icon: 'fas fa-users', text: 'Group Projects' },
            { icon: 'fas fa-user-clock', text: 'Pending Review' }
        ];
        
        submenuItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'submenu-item';
            li.innerHTML = `<i class="${item.icon}"></i><span>${item.text}</span>`;
            li.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering parent click
                alert(`${item.text} selected`);
            });
            submenu.appendChild(li);
        });
        
        this.appendChild(submenu);
    }
});

// Add this code to your script.js file

// Function to set up calendar date picker and scheduling functionality
function setupCalendarScheduling() {
    // Get references to elements
    const taskInputRow = document.querySelector('.task-input-row');
    const calendarBtn = taskInputRow.querySelector('.task-action-btn:nth-child(3)');
    const plannedNavItem = document.querySelector('.nav-item:nth-child(4)');
    
    // Create a container for the date picker that will be shown/hidden
    const datePickerContainer = document.createElement('div');
    datePickerContainer.className = 'date-picker-container';
    datePickerContainer.innerHTML = `
        <div class="date-picker-header">
            <h3>Select Due Date</h3>
            <button class="close-date-picker"><i class="fas fa-times"></i></button>
        </div>
        <div class="date-picker-body">
            <div class="date-quick-options">
                <button data-value="today">Today</button>
                <button data-value="tomorrow">Tomorrow</button>
                <button data-value="next-week">Next Week</button>
                <button data-value="custom">Custom Date</button>
            </div>
            <div class="custom-date-input" style="display: none;">
                <input type="date" id="customDateInput">
                <button class="set-custom-date">Set Date</button>
            </div>
        </div>
    `;
    
    // Insert date picker after task input row
    taskInputRow.parentNode.insertBefore(datePickerContainer, taskInputRow.nextSibling);
    
    // Initially hide the date picker
    datePickerContainer.style.display = 'none';
    
    // Show date picker when calendar button is clicked
    calendarBtn.addEventListener('click', function() {
        datePickerContainer.style.display = datePickerContainer.style.display === 'none' ? 'block' : 'none';
    });
    
    // Hide date picker when close button is clicked
    datePickerContainer.querySelector('.close-date-picker').addEventListener('click', function() {
        datePickerContainer.style.display = 'none';
    });
    
    // Handle quick date options
    const quickOptions = datePickerContainer.querySelectorAll('.date-quick-options button');
    const customDateContainer = datePickerContainer.querySelector('.custom-date-input');
    const customDateInput = datePickerContainer.querySelector('#customDateInput');
    
    quickOptions.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.dataset.value;
            
            if (value === 'custom') {
                customDateContainer.style.display = 'block';
                // Set default date to today
                const today = new Date();
                const formattedDate = today.toISOString().split('T')[0];
                customDateInput.value = formattedDate;
            } else {
                customDateContainer.style.display = 'none';
                // Apply selected date to current task input
                applyDateToTask(value);
                datePickerContainer.style.display = 'none';
            }
        });
    });
    
    // Handle custom date setting
    datePickerContainer.querySelector('.set-custom-date').addEventListener('click', function() {
        const selectedDate = customDateInput.value;
        if (selectedDate) {
            applyDateToTask(selectedDate);
            datePickerContainer.style.display = 'none';
        }
    });
    
    // Object to store tasks with due dates
    const scheduledTasks = {
        'today': [],
        'tomorrow': [],
        'thisWeek': [],
        'custom': {}
    };
    
    // Function to apply selected date to task
    function applyDateToTask(dateValue) {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();
        
        if (taskText === '') {
            showNotification('Please enter a task first', 'warning');
            return;
        }
        
        // Create the task with due date
        createTaskWithDueDate(taskText, dateValue);
        
        // Clear the input
        taskInput.value = '';
    }
    
    // Function to create a task with due date
    function createTaskWithDueDate(taskText, dateValue) {
        // Generate unique ID for the task
        const taskId = 'task-' + Date.now();
        
        // Create task element
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        
        // Format display date text based on dateValue
        let displayDate;
        let category;
        
        switch (dateValue) {
            case 'today':
                displayDate = 'Today';
                category = 'today';
                break;
            case 'tomorrow':
                displayDate = 'Tomorrow';
                category = 'tomorrow';
                break;
            case 'next-week':
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                displayDate = nextWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                category = 'thisWeek';
                break;
            default:
                // It's a custom date
                const customDate = new Date(dateValue);
                displayDate = customDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                category = 'custom';
        }
        
        // Create task HTML with due date badge
        taskItem.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="${taskId}">
                <label for="${taskId}"></label>
            </div>
            <div class="task-content">
                <div class="task-text">${taskText}</div>
                <div class="task-due-date">
                    <i class="far fa-calendar"></i>
                    <span>${displayDate}</span>
                </div>
            </div>
            <button class="star-btn">
                <i class="far fa-star"></i>
            </button>
        `;
        
        // Add to pending tasks list
        document.getElementById('pendingTasks').appendChild(taskItem);
        
        // Save to scheduled tasks object
        if (category === 'custom') {
            if (!scheduledTasks.custom[dateValue]) {
                scheduledTasks.custom[dateValue] = [];
            }
            scheduledTasks.custom[dateValue].push({
                id: taskId,
                text: taskText,
                date: dateValue,
                displayDate: displayDate,
                completed: false
            });
        } else {
            scheduledTasks[category].push({
                id: taskId,
                text: taskText,
                displayDate: displayDate,
                completed: false
            });
        }
        
        // Add event listeners
        setupTaskListeners(taskItem);
        
        // Save to localStorage
        saveScheduledTasksToLocalStorage();
        
        // Show notification
        showNotification(`Task scheduled for ${displayDate}`, 'success');
    }
    
    // Function to save scheduled tasks to localStorage
    function saveScheduledTasksToLocalStorage() {
        localStorage.setItem('scheduledTasks', JSON.stringify(scheduledTasks));
    }
    
    // Function to load scheduled tasks from localStorage
    function loadScheduledTasksFromLocalStorage() {
        const savedTasks = localStorage.getItem('scheduledTasks');
        
        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);
            // Merge saved tasks with current tasks
            Object.assign(scheduledTasks, parsedTasks);
        }
    }
    
    // Enhanced Planned navigation functionality
    plannedNavItem.addEventListener('click', function() {
        // Check if submenu already exists
        let submenu = this.querySelector('.submenu');
        
        // Toggle submenu
        if (submenu) {
            submenu.remove();
        } else {
            submenu = document.createElement('ul');
            submenu.className = 'submenu';
            
            // Create submenu items
            const submenuItems = [
                { icon: 'fas fa-calendar-day', text: 'Today', value: 'today' },
                { icon: 'fas fa-calendar-week', text: 'Tomorrow', value: 'tomorrow' },
                { icon: 'fas fa-calendar-alt', text: 'This Week', value: 'thisWeek' },
                { icon: 'fas fa-calendar-plus', text: 'Custom', value: 'custom' }
            ];
            
            // Function to update task counts dynamically
function updateTaskCounts() {
    submenuItems.forEach(item => {
        let taskCount = 0;

        if (item.value === 'custom') {
            Object.values(scheduledTasks.custom).forEach(tasks => {
                taskCount += tasks.length;
            });
        } else {
            taskCount = scheduledTasks[item.value].length;
        }

        // Find the corresponding submenu item
        const submenuItem = document.querySelector(`.submenu-item[data-value="${item.value}"]`);
        if (submenuItem) {
            let badge = submenuItem.querySelector(".task-count-badge");
            if (!badge) {
                // Create a new badge if it doesn't exist
                badge = document.createElement("span");
                badge.className = "task-count-badge";
                submenuItem.appendChild(badge);
            }
            
            // Update badge text
            badge.textContent = taskCount;

            // Hide badge if there are no tasks
            badge.style.display = taskCount > 0 ? "inline-block" : "none";
        }
    });
}

// Generate submenu items
submenuItems.forEach(item => {
    const li = document.createElement("li");
    li.className = "submenu-item";
    li.dataset.value = item.value; // Store category value for reference
    li.innerHTML = `<i class="${item.icon}"></i><span>${item.text}</span>`;

    let taskCount = 0;
    if (item.value === "custom") {
        Object.values(scheduledTasks.custom).forEach(tasks => {
            taskCount += tasks.length;
        });
    } else {
        taskCount = scheduledTasks[item.value].length;
    }

    if (taskCount > 0) {
        li.innerHTML += `<span class="task-count-badge">${taskCount}</span>`;
    }

    li.addEventListener("click", function (e) {
        e.stopPropagation();

        document.querySelectorAll(".nav-item").forEach(navItem => {
            navItem.classList.remove("active");
        });

        plannedNavItem.classList.add("active");
        showPlannedTasks(item.value, item.text);
    });

    submenu.appendChild(li);
});

// Update task counts initially and whenever a task is added/removed
updateTaskCounts();

// Hook into task addition and deletion
document.dispatchEvent(new Event("taskAdded"));
document.dispatchEvent(new Event("taskDeleted"));


            
            this.appendChild(submenu);
        }
    });
    
    // Function to show tasks in a specific planned category
    function showPlannedTasks(category, categoryName) {
        // Get task containers
        const pendingTasksList = document.getElementById('pendingTasks');
        const completedTasksList = document.getElementById('completedTasks');
        const mainHeader = document.querySelector('.main-header .dropdown-toggle');
        
        // Update header text
        mainHeader.innerHTML = `${categoryName} <i class="fas fa-chevron-down"></i>`;
        
        // Clear current tasks
        pendingTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';
        
        // Get tasks to display
        let tasksToDisplay = [];
        
        if (category === 'custom') {
            // Collect all custom date tasks
            Object.values(scheduledTasks.custom).forEach(tasks => {
                tasksToDisplay = tasksToDisplay.concat(tasks);
            });
        } else {
            tasksToDisplay = scheduledTasks[category];
        }
        
        // Sort tasks if needed (e.g., by date for custom dates)
        if (category === 'custom') {
            tasksToDisplay.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        
        // Display tasks
        tasksToDisplay.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            
            taskItem.innerHTML = `
                <div class="task-checkbox">
                    <input type="checkbox" id="${task.id}" ${task.completed ? 'checked' : ''}>
                    <label for="${task.id}"></label>
                </div>
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    <div class="task-due-date">
                        <i class="far fa-calendar"></i>
                        <span>${task.displayDate}</span>
                    </div>
                </div>
                <button class="star-btn">
                    <i class="far fa-star"></i>
                </button>
            `;
            
            // Add to appropriate list
            if (task.completed) {
                completedTasksList.appendChild(taskItem);
            } else {
                pendingTasksList.appendChild(taskItem);
            }
            
            // Add event listeners
            setupTaskListeners(taskItem);
        });
        
        // Show message if no tasks
        if (tasksToDisplay.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-tasks-message';
            emptyMessage.textContent = `No tasks scheduled for ${categoryName}`;
            pendingTasksList.appendChild(emptyMessage);
        }
    }
    
    // Enhanced setupTaskListeners function to handle scheduled tasks
    function setupTaskListeners(taskItem) {
        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        const starBtn = taskItem.querySelector('.star-btn');
        const taskId = checkbox.id;
        
        // Toggle task completion
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                taskItem.classList.add('completed');
                completedTasksList.appendChild(taskItem);
                
                // Update task completion status in scheduledTasks
                updateTaskCompletionStatus(taskId, true);
            } else {
                taskItem.classList.remove('completed');
                pendingTasksList.appendChild(taskItem);
                
                // Update task completion status in scheduledTasks
                updateTaskCompletionStatus(taskId, false);
            }
            
            // Save to localStorage
            saveScheduledTasksToLocalStorage();
        });
        
        // Toggle task importance
        starBtn.addEventListener('click', function() {
            this.classList.toggle('important');
            
            if (this.classList.contains('important')) {
                this.innerHTML = '<i class="fas fa-star"></i>';
            } else {
                this.innerHTML = '<i class="far fa-star"></i>';
            }
        });
    }
    
    // Function to update task completion status in scheduledTasks
    function updateTaskCompletionStatus(taskId, isCompleted) {
        // Check in all categories
        ['today', 'tomorrow', 'thisWeek'].forEach(category => {
            const taskIndex = scheduledTasks[category].findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                scheduledTasks[category][taskIndex].completed = isCompleted;
            }
        });
        
        // Check in custom dates
        Object.keys(scheduledTasks.custom).forEach(date => {
            const taskIndex = scheduledTasks.custom[date].findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                scheduledTasks.custom[date][taskIndex].completed = isCompleted;
            }
        });
    }
    
    // Call this function to load scheduled tasks when page loads
    loadScheduledTasksFromLocalStorage();
}

// Add styles for calendar functionality
function addCalendarStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .date-picker-container {
            background-color: var(--card-bg);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin: 10px 0;
            padding: 15px;
            width: 100%;
        }
        
        .date-picker-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .date-picker-header h3 {
            margin: 0;
            font-weight: 500;
        }
        
        .date-picker-header .close-date-picker {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: var(--text-color);
        }
        
        .date-quick-options {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        
        .date-quick-options button {
            background-color: var(--element-bg);
            border: 1px solid var(--border-color);
            color: var(--text-color);
            border-radius: 4px;
            padding: 8px 15px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .date-quick-options button:hover {
            background-color: var(--primary-color);
            color: white;
        }
        
        .custom-date-input {
            display: flex;
            gap: 10px;
        }
        
        .custom-date-input input {
            flex: 1;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
            background-color: var(--element-bg);
            color: var(--text-color);
        }
        
        .custom-date-input button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
            cursor: pointer;
        }
        
        .task-due-date {
            font-size: 12px;
            color: var(--muted-text);
            display: flex;
            align-items: center;
            gap: 5px;
            margin-top: 5px;
        }
        
        .task-content {
            flex: 1;
        }
        
        .task-count-badge {
            background-color: var(--primary-color);
            color: white;
            border-radius: 50%;
            font-size: 12px;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 10px;
        }
        
        .empty-tasks-message {
            padding: 20px;
            text-align: center;
            color: var(--muted-text);
            font-style: italic;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Call these functions when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add calendar functionality styles
    addCalendarStyles();
    
    // Set up calendar scheduling functionality
    setupCalendarScheduling();
});

// Add this to your existing script.js file

// Function to create and handle the task edit menu
function setupTaskEditMenu() {
    // Get references to elements
    const taskInputRow = document.querySelector('.task-input-row');
    const taskList = document.getElementById('pendingTasks');
    
    // Create the edit menu container
    const editMenuContainer = document.createElement('div');
    editMenuContainer.className = 'task-edit-menu';
    editMenuContainer.innerHTML = `
        <div class="edit-menu-header">
            <div class="task-checkbox">
                <input type="checkbox" id="editTaskCheckbox">
                <label for="editTaskCheckbox"></label>
            </div>
            <input type="text" class="edit-task-name" placeholder="Task name">
            <button class="star-btn edit-star-btn">
                <i class="far fa-star"></i>
            </button>
            <button class="close-edit-menu">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="edit-menu-body">
            <ul class="edit-menu-options">
                <li class="edit-menu-option">
                    <div class="edit-option-icon">
                        <i class="fas fa-plus"></i>
                    </div>
                    <span>Add Step</span>
                </li>
                <li class="edit-menu-option">
                    <div class="edit-option-icon">
                        <i class="far fa-bell"></i>
                    </div>
                    <span>Set Reminder</span>
                </li>
                <li class="edit-menu-option">
                    <div class="edit-option-icon">
                        <i class="far fa-calendar"></i>
                    </div>
                    <span>Add Due Date</span>
                </li>
                <li class="edit-menu-option">
                    <div class="edit-option-icon">
                        <i class="fas fa-sync-alt"></i>
                    </div>
                    <span>Repeat</span>
                </li>
                <li class="edit-menu-option">
                    <div class="edit-option-icon">
                        <i class="far fa-sticky-note"></i>
                    </div>
                    <span>Add Notes</span>
                </li>
            </ul>
        </div>
        <div class="edit-menu-footer">
            <div class="creation-info">Created Today</div>
            <button class="delete-task-btn">
                <i class="far fa-trash-alt"></i>
            </button>
        </div>
    `;
    
    // Add the edit menu to the document body (hidden initially)
    document.body.appendChild(editMenuContainer);
    editMenuContainer.style.display = 'none';
    
    // Track the current task being edited
    let currentEditTask = null;
    
    // Function to show the edit menu for a task
    function showEditMenu(taskItem) {
        const taskText = taskItem.querySelector('.task-text').textContent;
        const isStarred = taskItem.querySelector('.star-btn').classList.contains('important');
        const isCompleted = taskItem.classList.contains('completed');
        
        // Update the edit menu with task details
        const editTaskInput = editMenuContainer.querySelector('.edit-task-name');
        editTaskInput.value = taskText;
        
        const editStarBtn = editMenuContainer.querySelector('.edit-star-btn');
        if (isStarred) {
            editStarBtn.classList.add('important');
            editStarBtn.innerHTML = '<i class="fas fa-star"></i>';
        } else {
            editStarBtn.classList.remove('important');
            editStarBtn.innerHTML = '<i class="far fa-star"></i>';
        }
        
        const editCheckbox = editMenuContainer.querySelector('#editTaskCheckbox');
        editCheckbox.checked = isCompleted;
        
        // Show the edit menu
        editMenuContainer.style.display = 'block';
        
        // Reference to the current task being edited
        currentEditTask = taskItem;
        
        // Position the edit menu
        positionEditMenu();
        
        // Focus on the task name input
        editTaskInput.focus();
    }
    
    // Function to position the edit menu
    function positionEditMenu() {
        // Get the main content area
        const mainContent = document.querySelector('.main-content');
        const mainRect = mainContent.getBoundingClientRect();
        
        // Position the edit menu in the center of the main content area
        editMenuContainer.style.position = 'fixed';
        editMenuContainer.style.left = `${mainRect.left + mainRect.width/2 - editMenuContainer.offsetWidth/2}px`;
        editMenuContainer.style.top = `${mainRect.top + mainRect.height/2 - editMenuContainer.offsetHeight/2}px`;
        
        // Add overlay
        addOverlay();
    }
    
    // Function to add overlay
    function addOverlay() {
        // Check if overlay already exists
        let overlay = document.querySelector('.edit-menu-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'edit-menu-overlay';
            document.body.appendChild(overlay);
            
            // Close edit menu when clicking overlay
            overlay.addEventListener('click', hideEditMenu);
        }
        
        overlay.style.display = 'block';
    }
    
    // Function to hide the edit menu
    function hideEditMenu() {
        editMenuContainer.style.display = 'none';
        
        // Hide overlay
        const overlay = document.querySelector('.edit-menu-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // Reset current edit task
        currentEditTask = null;
    }
    
    // Event listener for clicking on task items to edit
    document.addEventListener('click', function(e) {
        // Check if clicked on task text
        if (e.target.classList.contains('task-text')) {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                showEditMenu(taskItem);
            }
        }
    });
    
    // Event listener for close button
    editMenuContainer.querySelector('.close-edit-menu').addEventListener('click', hideEditMenu);
    
    // Update task when edit menu changes are made
    const editTaskInput = editMenuContainer.querySelector('.edit-task-name');
    editTaskInput.addEventListener('input', function() {
        if (currentEditTask) {
            currentEditTask.querySelector('.task-text').textContent = this.value;
            saveTasksToLocalStorage();
        }
    });
    
    // Star button functionality in edit menu
    const editStarBtn = editMenuContainer.querySelector('.edit-star-btn');
    editStarBtn.addEventListener('click', function() {
        this.classList.toggle('important');
        
        if (this.classList.contains('important')) {
            this.innerHTML = '<i class="fas fa-star"></i>';
        } else {
            this.innerHTML = '<i class="far fa-star"></i>';
        }
        
        // Update task star button
        if (currentEditTask) {
            const taskStarBtn = currentEditTask.querySelector('.star-btn');
            if (this.classList.contains('important')) {
                taskStarBtn.classList.add('important');
                taskStarBtn.innerHTML = '<i class="fas fa-star"></i>';
            } else {
                taskStarBtn.classList.remove('important');
                taskStarBtn.innerHTML = '<i class="far fa-star"></i>';
            }
            
            saveTasksToLocalStorage();
        }
    });
    
    // Checkbox functionality in edit menu
    const editCheckbox = editMenuContainer.querySelector('#editTaskCheckbox');
    editCheckbox.addEventListener('change', function() {
        if (currentEditTask) {
            const taskCheckbox = currentEditTask.querySelector('input[type="checkbox"]');
            taskCheckbox.checked = this.checked;
            
            // Trigger the change event on the task checkbox
            const changeEvent = new Event('change');
            taskCheckbox.dispatchEvent(changeEvent);
        }
    });
    
    // Delete button functionality
    editMenuContainer.querySelector('.delete-task-btn').addEventListener('click', function() {
        if (currentEditTask) {
            currentEditTask.remove();
            hideEditMenu();
            saveTasksToLocalStorage();
            updateTaskStats(); // If you have this function
        }
    });
    
    // Handle edit menu options
    const editOptions = editMenuContainer.querySelectorAll('.edit-menu-option');
    
    editOptions.forEach(option => {
        option.addEventListener('click', function() {
            const optionText = this.querySelector('span').textContent;
            
            switch (optionText) {
                case 'Add Step':
                    handleAddStep();
                    break;
                case 'Set Reminder':
                    handleSetReminder();
                    break;
                case 'Add Due Date':
                    handleAddDueDate();
                    break;
                case 'Repeat':
                    handleRepeat();
                    break;
                case 'Add Notes':
                    handleAddNotes();
                    break;
            }
        });
    });
    
    // Placeholder functions for edit menu options
    function handleAddStep() {
        // Create step input
        const stepInput = document.createElement('div');
        stepInput.className = 'step-input';
        stepInput.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="step-${Date.now()}">
                <label for="step-${Date.now()}"></label>
            </div>
            <input type="text" placeholder="Add step" class="step-text-input">
        `;
        
        // Insert before the edit menu options
        const editMenuBody = editMenuContainer.querySelector('.edit-menu-body');
        editMenuBody.insertBefore(stepInput, editMenuBody.firstChild);
        
        // Focus on the new step input
        stepInput.querySelector('.step-text-input').focus();
    }
    
    function handleSetReminder() {
        showNotification('Reminder functionality will be implemented soon', 'info');
    }
    
    function handleAddDueDate() {
        // Check if date picker already exists in edit menu
        let datePicker = editMenuContainer.querySelector('.edit-due-date');
        
        if (datePicker) {
            // Remove if already shown
            datePicker.remove();
        } else {
            // Create date picker
            datePicker = document.createElement('div');
            datePicker.className = 'edit-due-date';
            datePicker.innerHTML = `
                <div class="due-date-options">
                    <button data-value="today">Today</button>
                    <button data-value="tomorrow">Tomorrow</button>
                    <button data-value="next-week">Next Week</button>
                    <button class="custom-date-btn">Custom</button>
                </div>
                <div class="custom-date-container" style="display: none;">
                    <input type="date" class="custom-date-input">
                    <button class="apply-custom-date">Apply</button>
                </div>
            `;
            
            // Insert after edit menu options
            const editMenuBody = editMenuContainer.querySelector('.edit-menu-body');
            editMenuBody.appendChild(datePicker);
            
            // Add event listeners for date options
            datePicker.querySelectorAll('.due-date-options button').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (this.classList.contains('custom-date-btn')) {
                        // Show custom date input
                        datePicker.querySelector('.custom-date-container').style.display = 'flex';
                    } else {
                        // Apply selected date
                        applyDueDate(this.dataset.value);
                        datePicker.remove();
                    }
                });
            });
            
            // Apply custom date
            datePicker.querySelector('.apply-custom-date').addEventListener('click', function() {
                const customDate = datePicker.querySelector('.custom-date-input').value;
                if (customDate) {
                    applyDueDate(customDate);
                    datePicker.remove();
                }
            });
        }
    }
    
    function applyDueDate(dateValue) {
        if (!currentEditTask) return;
        
        // Format display date text
        let displayDate;
        
        switch (dateValue) {
            case 'today':
                displayDate = 'Today';
                break;
            case 'tomorrow':
                displayDate = 'Tomorrow';
                break;
            case 'next-week':
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                displayDate = nextWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                break;
            default:
                // It's a custom date
                const customDate = new Date(dateValue);
                displayDate = customDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        // Check if task already has a due date
        let dueDateElement = currentEditTask.querySelector('.task-due-date');
        
        if (!dueDateElement) {
            // Create task-content div if not exists
            let taskContent = currentEditTask.querySelector('.task-content');
            if (!taskContent) {
                const taskText = currentEditTask.querySelector('.task-text');
                // Create task-content and move task-text inside it
                taskContent = document.createElement('div');
                taskContent.className = 'task-content';
                taskText.parentNode.insertBefore(taskContent, taskText);
                taskContent.appendChild(taskText);
            }
            
            // Create due date element
            dueDateElement = document.createElement('div');
            dueDateElement.className = 'task-due-date';
            dueDateElement.innerHTML = `
                <i class="far fa-calendar"></i>
                <span>${displayDate}</span>
            `;
            
            taskContent.appendChild(dueDateElement);
        } else {
            // Update existing due date
            dueDateElement.querySelector('span').textContent = displayDate;
        }
        
        // Save changes
        saveTasksToLocalStorage();
    }
    
    function handleRepeat() {
        showNotification('Repeat functionality will be implemented soon', 'info');
    }
    
    function handleAddNotes() {
        // Check if notes area already exists
        let notesArea = editMenuContainer.querySelector('.task-notes');
        
        if (notesArea) {
            // Remove if already shown
            notesArea.remove();
        } else {
            // Create notes area
            notesArea = document.createElement('div');
            notesArea.className = 'task-notes';
            notesArea.innerHTML = `
                <textarea placeholder="Add notes"></textarea>
            `;
            
            // Insert at the end of edit menu body
            const editMenuBody = editMenuContainer.querySelector('.edit-menu-body');
            editMenuBody.appendChild(notesArea);
            
            // Focus on the textarea
            notesArea.querySelector('textarea').focus();
        }
    }
    
    // Ensure proper size and position when window is resized
    window.addEventListener('resize', function() {
        if (editMenuContainer.style.display === 'block') {
            positionEditMenu();
        }
    });
}

// Add styles for task edit menu
function addTaskEditMenuStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .task-edit-menu {
            background-color: var(--card-bg);
            border-radius: 8px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
            width: 350px;
            z-index: 1000;
        }
        
        .edit-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }
        
        .edit-menu-header {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .edit-task-name {
            flex: 1;
            margin: 0 10px;
            border: none;
            background: transparent;
            font-size: 16px;
            color: var(--text-color);
            padding: 8px;
            border-radius: 4px;
        }
        
        .edit-task-name:focus {
            background-color: var(--hover-bg);
            outline: none;
        }
        
        .close-edit-menu {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--muted-text);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-left: 10px;
        }
        
        .close-edit-menu:hover {
            background-color: var(--hover-bg);
        }
        
        .edit-menu-body {
            padding: 16px;
        }
        
        .edit-menu-options {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        
        .edit-menu-option {
            display: flex;
            align-items: center;
            padding: 10px;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .edit-menu-option:hover {
            background-color: var(--hover-bg);
        }
        
        .edit-option-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            margin-right: 12px;
            color: var(--primary-color);
        }
        
        .edit-menu-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-top: 1px solid var(--border-color);
        }
        
        .creation-info {
            font-size: 12px;
            color: var(--muted-text);
        }
        
        .delete-task-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--danger-color, #dc3545);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .delete-task-btn:hover {
            background-color: var(--hover-bg);
        }
        
        .step-input {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 12px;
        }
        
        .step-text-input {
            flex: 1;
            border: none;
            background: transparent;
            padding: 8px;
            color: var(--text-color);
            font-size: 14px;
        }
        
        .step-text-input:focus {
            outline: none;
            background-color: var(--hover-bg);
            border-radius: 4px;
        }
        
        .edit-due-date {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
        }
        
        .due-date-options {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 12px;
        }
        
        .due-date-options button {
            background-color: var(--element-bg);
            border: 1px solid var(--border-color);
            color: var(--text-color);
            border-radius: 4px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .due-date-options button:hover {
            background-color: var(--hover-bg);
        }
        
        .custom-date-container {
            display: flex;
            gap: 8px;
        }
        
        .custom-date-input {
            flex: 1;
            padding: 6px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
            background-color: var(--element-bg);
            color: var(--text-color);
        }
        
        .apply-custom-date {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 6px 12px;
            cursor: pointer;
        }
        
        .task-notes {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
        }
        
        .task-notes textarea {
            width: 100%;
            min-height: 100px;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
            background-color: var(--element-bg);
            color: var(--text-color);
            resize: vertical;
        }
        
        .task-notes textarea:focus {
            outline: none;
            border-color: var(--primary-color);
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Call these functions when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add task edit menu styles
    addTaskEditMenuStyles();
    
    // Set up task edit menu functionality
    setupTaskEditMenu();
});

// Add this to your existing script.js file

document.addEventListener("DOMContentLoaded", function () {
    const layoutBtn = document.querySelector(".layout-btn");
    const tasksContainer = document.querySelector(".tasks-container");

    let listViewHTML = null;
    let isBlocksView = false;

    layoutBtn.addEventListener("click", function () {
        if (isBlocksView) {
            // Switch back to list view
            if (listViewHTML) {
                tasksContainer.innerHTML = listViewHTML;
                setupTaskEventListeners(); // Restore list view event listeners
            }
            layoutBtn.querySelector("i").className = "fas fa-th-large"; // Icon: Blocks
        } else {
            // Store list view before switching
            listViewHTML = tasksContainer.innerHTML;
            renderBlocksView();
            layoutBtn.querySelector("i").className = "fas fa-list"; // Icon: List
        }

        isBlocksView = !isBlocksView;
    });

    function renderBlocksView() {
        // Get tasks from the existing list before clearing
        const pendingTasks = [...document.querySelectorAll("#pendingTasks .task-item")];
        const completedTasks = [...document.querySelectorAll("#completedTasks .task-item")];

        // Clear existing content
        tasksContainer.innerHTML = "";

        // Create block containers
        const pendingContainer = createBlockContainer("To Do", "pending-blocks");
        const completedContainer = createBlockContainer("Completed", "completed-blocks");

        // Convert and append tasks
        pendingTasks.forEach(taskItem => pendingContainer.querySelector(".blocks-grid").appendChild(convertToBlock(taskItem)));
        completedTasks.forEach(taskItem => completedContainer.querySelector(".blocks-grid").appendChild(convertToBlock(taskItem, true)));

        tasksContainer.appendChild(pendingContainer);
        tasksContainer.appendChild(completedContainer);

        setupBlocksEventListeners(); // Apply interactions for block view
    }

    function createBlockContainer(title, className) {
        const container = document.createElement("div");
        container.className = `blocks-container ${className}`;
        container.innerHTML = `<h3>${title}</h3><div class="blocks-grid"></div>`;
        return container;
    }

    function convertToBlock(taskItem, isCompleted = false) {
        const taskId = taskItem.querySelector("input[type='checkbox']").id;
        const taskText = taskItem.querySelector(".task-text").textContent;
        const isImportant = taskItem.querySelector(".star-btn").classList.contains("important");

        const taskBlock = document.createElement("div");
        taskBlock.className = "task-block";
        if (isCompleted) taskBlock.classList.add("completed");

        taskBlock.innerHTML = `
            <div class="task-block-content">
                <div class="task-checkbox">
                    <input type="checkbox" id="${taskId}-block" ${isCompleted ? "checked" : ""}>
                    <label for="${taskId}-block"></label>
                </div>
                <div class="task-text">${taskText}</div>
            </div>
            <button class="star-btn ${isImportant ? "important" : ""}">
                <i class="${isImportant ? "fas" : "far"} fa-star"></i>
            </button>
        `;

        return taskBlock;
    }

    function setupBlocksEventListeners() {
        document.querySelectorAll(".task-block .task-checkbox input").forEach(checkbox => {
            checkbox.addEventListener("change", function () {
                const taskBlock = this.closest(".task-block");
                if (this.checked) {
                    taskBlock.classList.add("completed");
                    document.querySelector(".completed-blocks .blocks-grid").appendChild(taskBlock);
                } else {
                    taskBlock.classList.remove("completed");
                    document.querySelector(".pending-blocks .blocks-grid").appendChild(taskBlock);
                }
            });
        });

        document.querySelectorAll(".task-block .star-btn").forEach(button => {
            button.addEventListener("click", function () {
                this.classList.toggle("important");
                this.querySelector("i").className = this.classList.contains("important") ? "fas fa-star" : "far fa-star";
            });
        });
    }

    function setupTaskEventListeners() {
        document.querySelectorAll(".task-item .task-checkbox input").forEach(checkbox => {
            checkbox.addEventListener("change", function () {
                const taskItem = this.closest(".task-item");
                if (this.checked) {
                    taskItem.classList.add("completed");
                    document.getElementById("completedTasks").appendChild(taskItem);
                } else {
                    taskItem.classList.remove("completed");
                    document.getElementById("pendingTasks").appendChild(taskItem);
                }
            });
        });

        document.querySelectorAll(".task-item .star-btn").forEach(button => {
            button.addEventListener("click", function () {
                this.classList.toggle("important");
                this.querySelector("i").className = this.classList.contains("important") ? "fas fa-star" : "far fa-star";
            });
        });
    }

    setupTaskEventListeners(); // Initial setup for list view
});
