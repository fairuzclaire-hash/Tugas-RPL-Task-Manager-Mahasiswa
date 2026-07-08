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

async function updateTask(id, taskData) {
    try  {
        taskData.id = id;

        const response = await fetch(`${API_URL}/update_task.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('✅ Tugas berhasil diupdate');
            loasTasks();
            closeModalHandler();
        } else {
            showToast(data.message || 'Gagal mengupdate tugas', 'error');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showToast('Gagal mengupdate tugas', 'error');
    }
}

async function deleteTask(id) {
    if (!confirm('Yakin ingin menghapus tugas ini?')) return;

    try {
        const response = await fetch(`${API_URL}/delete_task.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });

        const data await response.json();

        if (data.success) {
            showToast('🗑️ Tugas berhasil dihapus!');
            loadTasks();
        } else {
            showToast(data.message || 'Gagal menghapus tugas', 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Gagal menghapus tugas', 'error');
    }
}

async function loadTaskForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/get_task.php?id=${id}`);
        const data task = await response.json();

        if (data.success && data.task) {
            const task = data.task;
            editingTaskId = id;

            document.getElementById('taskName').value = task.task_name;
            document.getElementById('courseName').value = task.course_name;
            document.getElementById('deadline').value = formatDateTimeForInput(task.deadline);
            document.getElementById('status').value = task.status;
            document.getElementById('priority').value = task.priority;
            document.getElementById('notes').value = task.notes || '';
    
            if (modalTitle) {
                modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Tugas';
            }
            if (taskModal) {
                taskModal.classList.add('show');
            }
        } else {
            showToast(data.message || 'Gagal memuat data tugas', 'error');
        }
    } catch (error) {
        console.error('Error loading task:', error);
        shoToast('Gagal memuat data tugas', 'error');
    }
}

function displayTasks(tasks) {
    if (!tasksGrid) return;

    let filteredTasks = tasks;
    if (currentFilter !=='all') {
        filteredTasks = tasks.filter(task => task.status === currentFilter);
    }

    filteredTasks.sort((a,b) => new Date(a.deadline) - new Date(b.deadline));

    tasksGrid.innerHTML = '';

    if (filteredTasks.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
            tasksGrid.appendChild(emptyState);
        }
        return;
    }

    if (emptyState) {
        emptyState.style.display = 'none';
    }

    flteredTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        taskGrid.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card priority-${task.priority}`;

    const isUrgent = isDeadlineUrgent(task.deadline);
    const deadlineClass = isUrgent ? 'deadline urgent' : 'deadline';

    const statusIcons = {
        'belum dikerjakan': 'fa-clock',
        'sedang dikerjakan': 'fa_spinner',
        'selesai': 'fa-check-circle'
    };
