document.addEventListener('DOMContentLoaded', () => {


    let activeTask = null; // Variabel untuk menyimpan kartu yang sedang aktif

    // Menambahkan event listener ke seluruh container untuk memilih kartu
    document.querySelector('.container').addEventListener('click', (e) => {

        const clickedTask = e.target.closest('.task-item');

        // Jika ada kartu yang aktif sebelumnya, hapus kelas 'active'
        if (activeTask) {
            activeTask.classList.remove('active');
        }

        // Jika yang diklik adalah kartu tugas, jadikan ia aktif
        if (clickedTask) {
            activeTask = clickedTask;
            activeTask.classList.add('active');
        } else {
            // Jika yang diklik bukan kartu, nonaktifkan semuanya
            activeTask = null;
        }
    });

    // Mendengarkan tombol keyboard yang ditekan
    window.addEventListener('keydown', (e) => {

        if (!activeTask) {
            return;
        }

        // Mencegah perilaku default browser (seperti scroll halaman)
        e.preventDefault();

        const moveAmount = 10; // Jumlah piksel per gerakan
        let top = parseInt(activeTask.style.top) || 0;
        let left = parseInt(activeTask.style.left) || 0;

        // Menggerakkan kartu berdasarkan tombol panah yang ditekan
        switch (e.key) {
            case 'ArrowUp':
                activeTask.style.top = (top - moveAmount) + 'px';
                break;
            case 'ArrowDown':
                activeTask.style.top = (top + moveAmount) + 'px';
                break;
            case 'ArrowLeft':
                activeTask.style.left = (left - moveAmount) + 'px';
                break;
            case 'ArrowRight':
                activeTask.style.left = (left + moveAmount) + 'px';
                break;
        }
    });

    // --- DOM ELEMENT SELECTION ---
    const timeDisplay = document.getElementById('time-display');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const priorityInput = document.getElementById('priority-input');
    const deadlineInput = document.getElementById('deadline-input'); // Baru
    const todoList = document.getElementById('todo-list');
    const doneList = document.getElementById('done-list');
    const deleteAllBtn = document.getElementById('delete-all-btn');

    // --- STATE MANAGEMENT ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // --- FUNCTIONS ---
    const updateTime = () => {
        const now = new Date();

        const dayName = now.toLocaleDateString('id-ID', {
            weekday: 'long'
        });
        const fullDate = now.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // MODIFIKASI: Bungkus tanggal dengan <span> agar bisa di-styling di CSS
        timeDisplay.innerHTML = `<strong>${dayName}</strong><br><span>${fullDate}</span>`;
    };

    const renderTasks = () => {
        todoList.innerHTML = '';
        doneList.innerHTML = '';

        tasks.forEach(task => {
            const isCompleted = task.completed;
            const now = new Date();
            const deadlineDate = new Date(task.deadline);
            now.setHours(0, 0, 0, 0);

            const isOverdue = !isCompleted && now > deadlineDate;

            let taskItemClasses = 'task-item';
            if (isCompleted) taskItemClasses += ' completed';
            if (isOverdue) taskItemClasses += ' overdue';

            // UBAH BARIS DI BAWAH INI
            const deadlineFormatted = deadlineDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const taskHTML = `
            <div class="${taskItemClasses}" data-id="${task.id}">
    <div>
        <div class="task-header">
            <span class="priority-tag ${task.priority}">${task.priority.toUpperCase()}</span>
            <button class="delete-task-btn" aria-label="Hapus Tugas">
    <img src="trash icon.png" alt="Hapus">
</button>
        </div>
        <p class="task-text">${task.text}</p>
    </div>
    <div>
        <div class="task-meta">
            <span class="meta-created">Dibuat: ${new Date(task.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span><br>
            <span class="meta-deadline">Deadline: ${deadlineFormatted}</span>
        </div>
        <div class="task-footer">
            <input type="checkbox" ${isCompleted ? 'checked' : ''}>
        </div>
    </div>
</div>
`;

            if (isCompleted) {
                doneList.insertAdjacentHTML('beforeend', taskHTML);
            } else {
                todoList.insertAdjacentHTML('beforeend', taskHTML);
            }
        });
        saveTasks();
    };

    const addTask = (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text === '' || deadlineInput.value === '') {
            alert("Harap isi nama tugas dan deadline!");
            return;
        }

        const newTask = {
            id: Date.now(),
            text: text,
            priority: priorityInput.value,
            deadline: deadlineInput.value, // Simpan deadline
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.unshift(newTask);
        taskInput.value = '';
        deadlineInput.value = '';
        renderTasks();
    };

    const toggleTaskCompletion = (e) => {
        if (e.target.matches('input[type="checkbox"]')) {
            const taskItem = e.target.closest('.task-item');
            const taskId = Number(taskItem.dataset.id);
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                renderTasks();
            }
        }
    };

    const deleteAllTasks = () => {
        if (tasks.length > 0 && confirm('Anda yakin ingin menghapus SEMUA tugas?')) {
            tasks = [];
            renderTasks();
        }
    };

    // --- EVENT LISTENERS ---

// 1. Listener untuk form submit
taskForm.addEventListener('submit', addTask);

// 2. Listener untuk tombol "HAPUS SEMUA"
deleteAllBtn.addEventListener('click', deleteAllTasks);

// 3. Listener utama untuk semua aksi di dalam kartu (centang dan hapus)
document.querySelector('.container').addEventListener('click', (e) => {
    // Logika untuk mencentang/membatalkan centang checkbox
    if (e.target.matches('input[type="checkbox"]')) {
        const taskItem = e.target.closest('.task-item');
        const taskId = Number(taskItem.dataset.id);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            renderTasks();
        }
    }

    // Logika untuk tombol hapus per tugas
    if (e.target.closest('.delete-task-btn')) {
        const taskItem = e.target.closest('.task-item');
        const taskId = Number(taskItem.dataset.id);
        
        // Panggil fungsi deleteTask yang sudah dibuat
        if (confirm('Anda yakin ingin menghapus tugas ini?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            renderTasks(); // Panggil renderTasks untuk memperbarui tampilan
        }
    }
});

    // --- INITIALIZATION ---
    updateTime();
    renderTasks();
});