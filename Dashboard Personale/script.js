// Creazione sicura degli elementi
function createSafeElement(tag, className = '', textContent = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
}

const STORAGE_KEY = 'lifeDashboardGlow';

// Dati di default tematizzati
const defaultData = {
    notes: 'Le mie note preziose...\n\n1. Ricordarsi di bere acqua 💧\n2. Leggere 10 pagine del libro nuovo 📖',
    favorites: [],
    tasks: [
        { id: 1, title: 'Morning Routine ✨', desc: 'Skincare, meditazione (10 min) e colazione sana.', priority: 'high', status: 'todo', date: '2026-05-13' },
        { id: 2, title: 'Revisione Budget Mensile 📊', desc: 'Controllare le spese e aggiornare il file excel.', priority: 'medium', status: 'in-progress', date: '2026-05-14' },
        { id: 3, title: 'Workout Gambe 🏋️‍♀️', desc: 'Scheda B in palestra.', priority: 'high', status: 'completed', date: '2026-05-12' },
        { id: 4, title: 'Preparare Outfit', desc: 'Scegliere i vestiti per il brunch di domenica.', priority: 'low', status: 'todo', date: '2026-05-15' },
        { id: 5, title: 'Rispondere alle Email 💌', desc: 'Svuotare la casella di posta principale.', priority: 'medium', status: 'in-progress', date: '2026-05-12' }
    ]
};

function getAppData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { ...defaultData };
    } catch (e) {
        return { ...defaultData };
    }
}

function saveAppData(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
}

let appState = getAppData();

// Sistema di Toast Notification
function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = createSafeElement('div', 'toast-container');
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '2000';
        document.body.appendChild(container);
    }
    const toast = createSafeElement('div', 'toast', message);
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Inizializzazione Dashboard (index.html)
function initDashboard() {
    const tasksCompletedEl = document.getElementById('stat-completed');
    const progressBar = document.getElementById('progress-fill');
    const dailyTaskList = document.getElementById('daily-tasks-list');

    if (!tasksCompletedEl) return;

    const totalTasks = appState.tasks.length;
    const completedTasks = appState.tasks.filter(t => t.status === 'completed').length;
    
    tasksCompletedEl.textContent = `${completedTasks} / ${totalTasks}`;
    
    if (progressBar) {
        const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
        setTimeout(() => { progressBar.style.width = `${percentage}%`; }, 300);
    }

    if (dailyTaskList) {
        dailyTaskList.innerHTML = ''; 
        const pendingTasks = appState.tasks.filter(t => t.status !== 'completed').slice(0, 3);
        
        if (pendingTasks.length === 0) {
            dailyTaskList.appendChild(createSafeElement('p', 'text-muted', 'Tutto completato, goditi il relax! 🌸'));
        } else {
            pendingTasks.forEach(task => {
                const li = createSafeElement('div', 'card');
                li.style.marginBottom = '1rem';
                li.appendChild(createSafeElement('strong', '', task.title));
                dailyTaskList.appendChild(li);
            });
        }
    }
}

// Logica per le Task (tasks.html)
let currentVisibleTasks = 4;
let filteredTasksCache = [];

function renderTasks(tasksToRender) {
    const taskContainer = document.getElementById('task-container');
    if (!taskContainer) return;

    taskContainer.innerHTML = ''; 
    const tasksToShow = tasksToRender.slice(0, currentVisibleTasks);

    if (tasksToShow.length === 0) {
        taskContainer.appendChild(createSafeElement('p', '', 'Nessuna attività trovata 🎀'));
        return;
    }

    tasksToShow.forEach(task => {
        const card = createSafeElement('div', 'card task-card');
        
        const header = createSafeElement('div', 'task-header');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.marginBottom = '0.5rem';
        header.appendChild(createSafeElement('h3', '', task.title));
        header.appendChild(createSafeElement('span', `badge ${task.priority}`, task.priority));
        card.appendChild(header);

        card.appendChild(createSafeElement('p', 'text-muted', task.desc));
        
        const footer = createSafeElement('div');
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        footer.style.alignItems = 'center';
        footer.style.marginTop = '1.5rem';
        footer.appendChild(createSafeElement('small', '', `🗓 ${task.date}`));
        
        const isFav = appState.favorites.includes(task.id);
        const favBtn = createSafeElement('button', 'btn-secondary', isFav ? '💖 Salvato' : '🤍 Salva');
        favBtn.style.padding = '0.3rem 0.8rem';
        favBtn.addEventListener('click', () => {
            const index = appState.favorites.indexOf(task.id);
            if (index === -1) { appState.favorites.push(task.id); showToast('Aggiunto ai preferiti ✨'); }
            else { appState.favorites.splice(index, 1); showToast('Rimosso dai preferiti 🍂'); }
            saveAppData(appState);
            handleFiltersAndSearch(); // Ricarica
        });

        footer.appendChild(favBtn);
        card.appendChild(footer);
        taskContainer.appendChild(card);
    });

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) loadMoreBtn.style.display = currentVisibleTasks >= tasksToRender.length ? 'none' : 'inline-block';
}

function handleFiltersAndSearch() {
    const searchInput = document.getElementById('search-task');
    const filterSelect = document.getElementById('filter-status');
    const sortSelect = document.getElementById('sort-task');

    if (!searchInput) return;

    function applyLogic() {
        const query = searchInput.value.toLowerCase();
        const status = filterSelect.value;
        const sortBy = sortSelect.value;

        filteredTasksCache = appState.tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(query) || task.desc.toLowerCase().includes(query);
            const matchesStatus = status === 'all' || task.status === status || (status === 'high-priority' && task.priority === 'high');
            return matchesSearch && matchesStatus;
        });

        filteredTasksCache.sort((a, b) => {
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            if (sortBy === 'date') return new Date(a.date) - new Date(b.date);
            return 0;
        });

        renderTasks(filteredTasksCache);
    }

    searchInput.addEventListener('input', applyLogic);
    filterSelect.addEventListener('change', applyLogic);
    sortSelect.addEventListener('change', applyLogic);
    
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => { currentVisibleTasks += 4; renderTasks(filteredTasksCache); });
    }

    applyLogic();
}

// Logica Profilo (profile.html)
function initProfile() {
    const noteArea = document.getElementById('personal-notes');
    if (noteArea) {
        noteArea.value = appState.notes || '';
        noteArea.addEventListener('input', (e) => {
            appState.notes = e.target.value;
            saveAppData(appState);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    handleFiltersAndSearch();
    initProfile();
});
