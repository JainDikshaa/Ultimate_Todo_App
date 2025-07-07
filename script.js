// DOM Elements
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const dueDate = document.getElementById('dueDate');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');

// Load tasks from localStorage
document.addEventListener('DOMContentLoaded', loadTasks);

// Add Task
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

function addTask() {
  const title = taskInput.value.trim();
  const priority = prioritySelect.value;
  const due = dueDate.value;

  if (title === '') {
    showAlert('Please enter a task!', 'error');
    return;
  }

  const task = {
    id: Date.now(),
    title,
    priority,
    due,
    completed: false
  };

  addTaskToDOM(task);
  saveTaskToStorage(task);
  taskInput.value = '';
  dueDate.value = '';
  showAlert('Task added successfully!', 'success');
}

function addTaskToDOM(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.priority}`;
  li.dataset.id = task.id;
  
  const dueDateFormatted = task.due ? new Date(task.due).toLocaleDateString() : 'No deadline';
  
  li.innerHTML = `
    <div class="task-content">
      <div class="task-title">${task.title}</div>
      <div class="task-due">
        <i class="far fa-calendar-alt"></i>
        ${dueDateFormatted}
      </div>
    </div>
    <div class="task-actions">
      <button class="complete-btn" title="Mark as complete">
        <i class="fas fa-check"></i>
      </button>
      <button class="delete-btn" title="Delete task">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;

  if (task.completed) {
    li.classList.add('completed');
  }

  taskList.appendChild(li);

  // Add event listeners
  li.querySelector('.complete-btn').addEventListener('click', toggleComplete);
  li.querySelector('.delete-btn').addEventListener('click', deleteTask);
}

function toggleComplete(e) {
  const li = e.target.closest('li');
  li.classList.toggle('completed');
  
  const taskId = parseInt(li.dataset.id);
  const tasks = getTasksFromStorage();
  const task = tasks.find(task => task.id === taskId);
  
  if (task) {
    task.completed = !task.completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}

function deleteTask(e) {
  const li = e.target.closest('li');
  li.classList.add('fade-out');
  
  setTimeout(() => {
    const taskId = parseInt(li.dataset.id);
    removeTaskFromStorage(taskId);
    li.remove();
    showAlert('Task deleted!', 'info');
  }, 300);
}

// Filter Tasks
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterTasks(btn.dataset.filter);
  });
});

function filterTasks(filter) {
  const tasks = document.querySelectorAll('.task-item');
  
  tasks.forEach(task => {
    switch(filter) {
      case 'pending':
        task.style.display = task.classList.contains('completed') ? 'none' : 'flex';
        break;
      case 'completed':
        task.style.display = task.classList.contains('completed') ? 'flex' : 'none';
        break;
      default:
        task.style.display = 'flex';
    }
  });
}

// Local Storage Functions
function saveTaskToStorage(task) {
  const tasks = getTasksFromStorage();
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasksFromStorage() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

function removeTaskFromStorage(id) {
  let tasks = getTasksFromStorage();
  tasks = tasks.filter(task => task.id !== id);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = getTasksFromStorage();
  tasks.forEach(task => addTaskToDOM(task));
}

// Show Alert
function showAlert(message, type) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.classList.add('fade-out');
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

// Add fade-out animation to CSS
const style = document.createElement('style');
style.textContent = `
  .alert {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    color: white;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }
  .alert-success { background: #00b894; }
  .alert-error { background: #d63031; }
  .alert-info { background: #0984e3; }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .fade-out {
    animation: fadeOut 0.3s ease-out forwards;
  }
  @keyframes fadeOut {
    to { opacity: 0; transform: translateY(20px); }
  }
`;
document.head.appendChild(style);