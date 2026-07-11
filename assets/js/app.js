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

    const statusClasses = {
        'belum dikerjakan': 'belum',
        'sedang dikerjakan': 'sedang',
        'selesai': 'selesai'
    };

    card.innerHTML = `
        <div class="task-header">
            <div>
                <h3 class="task-title">${escapeHtml(task.task_name)}</3>
                <span class="task-course">
                    <i class="fas fa-book"></i> ${escapeHtml(task.course_name)}
                </span>
            </div>
            <div class="task-actions">
                <button class="icon-btn edit" onclick="loadTaskForEdit(${task.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn delete" onclick="deleteTask(${task.id})" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </div>

            <div class="task-info">
                <div class="info-item">
                    <i class="fas fa-calender-alt"></i>
                    <span class="${deadlineClass}">${formatDeadline(task.deadline)}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Prioritas: <strong>${capitalizeFirst(task.priority)}</strong></span>
                </div>
                <div class="info-item">
                    <i class="fas fa-info-circle"></i>
                    <span class="status-badge ${statusClasses[task.status]}">
                        <i class="fas ${statusIcons[task.status]}"></i>
                        ${capitalizeFirst(task.status)}
                    </span>
                </div>
            </div>
        ${task.notes ? `<div class="task-notes">${escapeHtml(task.notes)}</div>` : ''}
    `;

    return card;
}

function updateStats(tasks) {
    if (totalTasksEl) {
        totalTasksEl.textContent = tasks.length;
    }

    const pendingCount = tasks.filter(t =>
        t.status === 'belum dikerjakan' || t.status === 'sedang dikerjakan'
    ).length;

    if (pendingTasksEl) {
        pendingTasksEl.textContent = pendingCount;
    }
}

function openModal() {
    editingTaskId = null;
    if (taskForm) taskForm.reset();
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Tugas Baru';
    }
    if (taskModal) {
        taskModal.classList.add('show');
    }
}

function closeModalHandler() {
    if (taskModal) taskModal.classList.remove('show');
    if (taskForm) taskForm.reset();
    editingTaskId = null;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const taskData = {
        task_name: document.getElementById('taskName').value,
        course_name: document.getElementById('courseName').value,
        deadline: document.getElementById('deadline').value,
        status: document.getElementById('status').value,
        priority: document.getElementById('priority').value,
        notes: document.getElementById('notes').value
    };
    
    if (editingTaskId) {
        updateTask(editingTaskId, taskData);
    } else {
        createTask(taskData);
    }
}

function showToast(message, type = 'success') {
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDeadline(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    const options = { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const formattedDate = date.toLocaleDateString('id-ID', options);
    
    if (days < 0) {
        return `${formattedDate} (Terlambat ${Math.abs(days)} hari)`;
    } else if (days === 0) {
        return `${formattedDate} (Hari ini!)`;
    } else if (days === 1) {
        return `${formattedDate} (Besok)`;
    } else if (days <= 3) {
        return `${formattedDate} (${days} hari lagi)`;
    }
    
    return formattedDate;
}

function isDeadlineUrgent(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return days <= 3;
}

function formatDateTimeForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.deleteTask = deleteTask;
window.loadTaskForEdit = loadTaskForEdit;
