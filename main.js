// Task data structure
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingTaskId = null;

// DOM elements
const taskInput = document.getElementById('new-task-input');
const prioritySelect = document.getElementById('priority-select');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// Initialize the app
function init() {
  renderTasks();
  updateProgressBar();
  
  // Event listeners
  addTaskBtn.addEventListener('click', handleTaskFormSubmit);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleTaskFormSubmit();
  });
}

// Handle form submission (add or update task)
function handleTaskFormSubmit() {
  const text = taskInput.value.trim();
  if (text === '') return;
  
  if (editingTaskId) {
    // Update existing task
    updateTask(editingTaskId, text, prioritySelect.value);
  } else {
    // Add new task
    addTask(text, prioritySelect.value);
  }
  
  // Reset form
  resetForm();
}

// Add a new task
function addTask(text, priority) {
  const newTask = {
    id: Date.now(),
    text,
    completed: false,
    priority,
    createdAt: new Date()
  };
  
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  updateProgressBar();
}

// Update an existing task
function updateTask(id, text, priority) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, text, priority } : task
  );
  
  saveTasks();
  renderTasks();
}

// Toggle task completion
function toggleTask(id) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
  updateProgressBar();
}

// Delete a task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  updateProgressBar();
  
  // If we're editing this task, reset the form
  if (editingTaskId === id) {
    resetForm();
  }
}

// Edit a task
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  
  // Set form to edit mode
  taskInput.value = task.text;
  prioritySelect.value = task.priority;
  taskInput.focus();
  editingTaskId = task.id;
  addTaskBtn.textContent = 'UPDATE';
}

// Reset the form to add mode
function resetForm() {
  taskInput.value = '';
  prioritySelect.value = 'low';
  editingTaskId = null;
  addTaskBtn.textContent = 'ADD TASK';
  taskInput.focus();
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Format relative time
function formatRelativeTime(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }
}

// Render all tasks
function renderTasks() {
  taskList.innerHTML = '';
  
  if (tasks.length === 0) {
    taskList.innerHTML = '<p class="text-gray-500 text-center py-4">No tasks yet. Add a task to get started!</p>';
    return;
  }
  
  tasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.className = 'border-b border-gray-100 py-4 flex items-start justify-between';
    
    // Create checkbox
    const checkbox = document.createElement('div');
    checkbox.className = `h-6 w-6 rounded-full border-2 border-gray-300 flex-shrink-0 cursor-pointer ${task.completed ? 'bg-green-500 border-green-500 flex items-center justify-center text-white' : ''}`;
    checkbox.addEventListener('click', () => toggleTask(task.id));
    
    if (task.completed) {
      checkbox.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      `;
    }
    
    // Create task content
    const taskContent = document.createElement('div');
    taskContent.className = 'flex flex-col flex-grow ml-4';
    
    const taskText = document.createElement('span');
    taskText.className = `${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`;
    taskText.textContent = task.text;
    
    const taskMeta = document.createElement('div');
    taskMeta.className = 'flex items-center mt-1';
    
    const priorityBadge = document.createElement('span');
    
    // Use Tailwind classes for priority badge
    let priorityClass = '';
    if (task.priority === 'high') {
      priorityClass = 'bg-red-400';
    } else if (task.priority === 'medium') {
      priorityClass = 'bg-yellow-400';
    } else {
      priorityClass = 'bg-green-400';
    }
    
    priorityBadge.className = `text-xs px-2 py-1 rounded-md text-white capitalize ${priorityClass}`;
    priorityBadge.textContent = task.priority;
    
    const timeAgo = document.createElement('span');
    timeAgo.className = 'text-xs text-gray-500 ml-2';
    timeAgo.textContent = formatRelativeTime(task.createdAt);
    
    taskMeta.appendChild(priorityBadge);
    taskMeta.appendChild(timeAgo);
    
    taskContent.appendChild(taskText);
    taskContent.appendChild(taskMeta);
    
    // Create action buttons
    const actions = document.createElement('div');
    actions.className = 'flex gap-2';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'p-1 rounded hover:bg-gray-100 text-gray-600';
    editBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    `;
    editBtn.addEventListener('click', () => editTask(task.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'p-1 rounded hover:bg-gray-100 text-red-500';
    deleteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    `;
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    // Assemble task item
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskContent);
    taskItem.appendChild(actions);
    
    taskList.appendChild(taskItem);
  });
}

// Update progress bar
function updateProgressBar() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = `${completed}/${total} Completed`;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add some sample tasks if none exist
if (tasks.length === 0) {
  tasks = [
    {
      id: 1,
      text: 'Complete project documentation',
      completed: false,
      priority: 'high',
      createdAt: new Date(Date.now() - 26 * 60 * 1000) // 26 minutes ago
    },
    {
      id: 2,
      text: 'Plan next sprint',
      completed: false,
      priority: 'high',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: 3,
      text: 'Review pull requests',
      completed: true,
      priority: 'medium',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
      id: 4,
      text: 'Update dependencies',
      completed: true,
      priority: 'low',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
    },
    {
      id: 5,
      text: 'Setup development environment',
      completed: true,
      priority: 'medium',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 1 month ago
    }
  ];
  saveTasks();
}