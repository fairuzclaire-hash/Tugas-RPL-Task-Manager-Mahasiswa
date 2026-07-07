const API_URL = 'api';
let currentFilter = 'all';
let editingTaskId = null;

let tasksGrid, emptyState, taskModal, taskForm, addTaskBtn, closeModal, cancelBtn;
let modalTitle, toast, toastMessage, totalTasksEl, pendingTasksEl;

document.addEventListener('DOMContentLoaded', () => {
    tasksGrid = document.getElementById('tasksGrid');
    emptyState = document.getElementById('emptyState');
    taskModal = document.getElementById('taskModal');
    taskForm = document.getElementById('taskForm');
    addTaskBtn = document.getElementById('addTaskBtn');
    closeModal = document.getElementById('closeModal');
    cancelBtn = document.getElementById('cancelBtn');
    modalTitle = document.getElementById('modalTitle');
    toast = document.getElementById('toast');
    toastMessage = document.getElementById('toastMessage');
    totalTasksEl = document.getElementById('totalTasks');
    pendingTasksEl = document.getElementById('pendingTasks');
    
    setupEventListeners();
    loadTasks();
});

function setupEventListeners() {
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => openModal());
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => closeModalHandler());
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModalHandler());
    }
    
    if (taskModal) {
        taskModal.addEventListener('click', (e) => {
            if (e.target === taskModal) closeModalHandler();
        });
    }
    
    if (taskForm) {
        taskForm.addEventListener('submit', handleFormSubmit);
    }
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.status;
            loadTasks();
        });
    });
}

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/get_tasks.php`);
        const data = await response.json();
        
        if (data.success && data.tasks) {
            displayTasks(data.tasks);
            updateStats(data.tasks);
        } else {
            console.error('Error:', data.message);
            showToast('Gagal memuat tugas', 'error');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Gagal memuat tugas', 'error');
    }
}

async function createTask(taskData) {
    try {
        const response = await fetch(`${API_URL}/create_task.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('✅ Tugas berhasil ditambahkan!');
            loadTasks();
            closeModalHandler();
        } else {
            showToast(data.message || 'Gagal menambahkan tugas', 'error');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showToast('Gagal menambahkan tugas', 'error');
    }
}
