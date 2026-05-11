/**

 * LifeTracker Dashboard - Core Script

 */


// --- STATO APPLICAZIONE ---

let tasks = JSON.parse(localStorage.getItem('tasks')) || [

    { id: 1, title: 'Studiare JavaScript', priority: 3, status: 'pending', date: new Date().toISOString() },

    { id: 2, title: 'Allenamento Mattutino', priority: 2, status: 'completed', date: new Date().toISOString() }

];


let notes = JSON.parse(localStorage.getItem('notes')) || [];

let currentTheme = localStorage.getItem('theme') || 'light';


// --- INIZIALIZZAZIONE ---

document.addEventListener('DOMContentLoaded', () => {

    initTheme();

    renderTasks();

    renderNotes();

    setupEventListeners();

});


// --- GESTIONE TEMA ---

function initTheme() {

    document.documentElement.setAttribute('data-theme', currentTheme);

    const themeBtn = document.getElementById('theme-switcher');

    themeBtn.innerHTML = currentTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

}


function toggleTheme() {

    currentTheme = currentTheme === 'light' ? 'dark' : 'light';

    localStorage.setItem('theme', currentTheme);

    initTheme();

    showToast(`Tema ${currentTheme} attivato`);

}


// --- NAVIGAZIONE SPA ---

function setupEventListeners() {

    // Mobile Menu

    const menuToggle = document.querySelector('.menu-toggle');

    const navbar = document.querySelector('.navbar');

    menuToggle.addEventListener('click', () => navbar.classList.toggle('active'));


    // Nav Links

    document.querySelectorAll('.nav-link').forEach(link => {

        link.addEventListener('click', (e) => {

            e.preventDefault();

            const target = e.target.getAttribute('href').substring(1);

            switchPage(target);

            if(window.innerWidth <= 768) navbar.classList.remove('active');

        });

    });


    // Theme Switcher

    document.getElementById('theme-switcher').addEventListener('click', toggleTheme);


    // Task Filters

    document.getElementById('search-tasks').addEventListener('input', renderTasks);

    document.getElementById('filter-status').addEventListener('change', renderTasks);

    document.getElementById('sort-tasks').addEventListener('change', renderTasks);

    document.getElementById('reset-filters').addEventListener('click', resetFilters);


    // Form Task

    const taskModal = document.getElementById('task-modal');

    document.getElementById('open-task-modal').addEventListener('click', () => {

        taskModal.classList.add('active');

        taskModal.setAttribute('aria-hidden', 'false');

    });


    document.querySelector('.close-modal').addEventListener('click', closeModal);

    

    // Chiudi modale click esterno o ESC

    window.addEventListener('click', (e) => { if(e.target === taskModal) closeModal(); });

    window.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });


    document.getElementById('task-form').addEventListener('submit', handleTaskSubmit);

    document.getElementById('note-form').addEventListener('submit', handleNoteSubmit);

}


function switchPage(pageId) {

    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    

    document.getElementById(pageId).classList.add('active');

    document.querySelector(`[href="#${pageId}"]`).classList.add('active');

}


// --- LOGICA TASK ---

function renderTasks() {

    const container = document.getElementById('tasks-container');

    const searchTerm = document.getElementById('search-tasks').value.toLowerCase();

    const filterStatus = document.getElementById('filter-status').value;

    const sortBy = document.getElementById('sort-tasks').value;


    let filtered = tasks.filter(t => 

        t.title.toLowerCase().includes(searchTerm) && 

        (filterStatus === 'all' || t.status === filterStatus)

    );


    // Ordinamento

    filtered.sort((a, b) => {

        if (sortBy === 'alpha') return a.title.localeCompare(b.title);

        if (sortBy === 'priority') return b.priority - a.priority;

        return new Date(b.date) - new Date(a.date);

    });


    container.innerHTML = ''; // Pulizia sicura prima del render con createElement


    filtered.forEach(task => {

        const card = document.createElement('div');

        card.className = 'card task-card';

        

        const h3 = document.createElement('h3');

        h3.textContent = task.title;


        const p = document.createElement('p');

        p.textContent = `Priorità: ${getPriorityLabel(task.priority)}`;

        p.style.color = 'var(--text-muted)';


        const btnRow = document.createElement('div');

        btnRow.style.marginTop = '1rem';

        

        const completeBtn = document.createElement('button');

        completeBtn.className = 'btn btn-outline';

        completeBtn.textContent = task.status === 'completed' ? 'Riapri' : 'Completa';

        completeBtn.onclick = () => toggleTaskStatus(task.id);


        card.appendChild(h3);

        card.appendChild(p);

        card.appendChild(completeBtn);

        container.appendChild(card);

    });


    updateDashboardSummary();

}


function handleTaskSubmit(e) {

    e.preventDefault();

    const name = document.getElementById('task-name').value;

    const priority = parseInt(document.getElementById('task-priority').value);


    const newTask = {

        id: Date.now(),

        title: name,

        priority: priority,

        status: 'pending',

        date: new Date().toISOString()

    };


    tasks.push(newTask);

    saveAndRefresh();

    closeModal();

    showToast("Task aggiunto con successo!");

    e.target.reset();

}


function toggleTaskStatus(id) {

    tasks = tasks.map(t => t.id === id ? {...t, status: t.status === 'completed' ? 'pending' : 'completed'} : t);

    saveAndRefresh();

}


// --- LOGICA NOTE ---

function renderNotes() {

    const container = document.getElementById('notes-container');

    container.innerHTML = '';


    notes.forEach(note => {

        const card = document.createElement('div');

        card.className = 'card';

        

        const h4 = document.createElement('h4');

        h4.textContent = note.title;

        

        const p = document.createElement('p');

        p.textContent = note.content;

        

        card.appendChild(h4);

        card.appendChild(p);

        container.appendChild(card);

    });

}


function handleNoteSubmit(e) {

    e.preventDefault();

    const title = document.getElementById('note-title').value;

    const content = document.getElementById('note-content').value;


    notes.push({ title, content, id: Date.now() });

    localStorage.setItem('notes', JSON.stringify(notes));

    renderNotes();

    showToast("Nota salvata!");

    e.target.reset();

}


// --- UTILITY ---

function saveAndRefresh() {

    localStorage.setItem('tasks', JSON.stringify(tasks));

    renderTasks();

}


function getPriorityLabel(p) {

    return p === 3 ? 'Alta' : p === 2 ? 'Media' : 'Bassa';

}


function closeModal() {

    document.getElementById('task-modal').classList.remove('active');

}


function showToast(message) {

    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');

    toast.className = 'toast';

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);

}


function resetFilters() {

    document.getElementById('search-tasks').value = '';

    document.getElementById('filter-status').value = 'all';

    renderTasks();

}


function updateDashboardSummary() {

    const display = document.getElementById('top-task-display');

    const pending = tasks.filter(t => t.status === 'pending');

    if (display) {

        display.textContent = pending.length > 0 ? pending[0].title : "Nessun task in sospeso! 🎉";

    }

}


