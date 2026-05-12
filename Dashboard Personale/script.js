/**
 * LifeTracker Dashboard - Core JavaScript
 * Implementazione sicura e modulare senza dipendenze.
 */

// ==========================================
// UTILITY: SAFE DOM MANIPULATION
// ==========================================
// Evitiamo innerHTML creando elementi in modo sicuro
function createSafeElement(tag, className = '', textContent = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
}

// ==========================================
// STATE MANAGEMENT & LOCALSTORAGE
// ==========================================
const STORAGE_KEY = 'lifeTrackerData';

const defaultData = {
    theme: 'light',
    notes: '',
    favorites: [],
    tasks: [
        { id: 1, title: 'Completare report UI', desc: 'Consegnare i mockup al team.', priority: 'high', status: 'in-progress', date: '2026-05-12' },
        { id: 2, title: 'Meeting con i dev', desc: 'Allineamento sulle API.', priority: 'medium', status: 'todo', date: '2026-05-13' },
        { id: 3, title: 'Bug fix CSS', desc: 'Risolvere glitch su mobile.', priority: 'high', status: 'completed', date: '2026-05-10' },
        { id: 4, title: 'Aggiornare documentazione', desc: 'Scrivere il file README.', priority: 'low', status: 'todo', date: '2026-05-15' },
        { id: 5, title: 'Analisi SEO', desc: 'Controllare i core web vitals.', priority: 'medium', status: 'in-progress', date: '2026-05-14' }
    ]
};

function getAppData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { ...defaultData };
    } catch (e) {
        console.error("Errore lettura LocalStorage, ripristino default.");
        return { ...defaultData };
    }
}

function saveAppData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Errore salvataggio LocalStorage.");
    }
}

let appState = getAppData();

// ==========================================
// UI COMPONENTS (TOASTS & THEME)
// ==========================================
function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = createSafeElement('div', 'toast-container');
        document.body.appendChild(container);
    }
    const toast = createSafeElement('div', 'toast', message);
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function toggleTheme() {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    applyTheme(appState.theme);
    saveAppData(appState);
    showToast(`Tema ${appState.theme === 'dark' ? 'Scuro' : 'Chiaro'} attivato`);
}

// ==========================================
// NAVIGATION
// ==========================================
function initNavigation() {
    const hamburger = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('mobile-active');
        });

        // Chiude il menu clickando su un link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

// ==========================================
// PAGE SPECIFIC LOGIC: DASHBOARD (index.html)
// ==========================================
function initDashboard() {
    const tasksCompletedEl = document.getElementById('stat-completed');
    const progressBar = document.getElementById('progress-fill');
    const dailyTaskList = document.getElementById('daily-tasks-list');

    if (!tasksCompletedEl) return; // Non siamo nella home

    const totalTasks = appState.tasks.length;
    const completedTasks = appState.tasks.filter(t => t.status === 'completed').length;
    
    tasksCompletedEl.textContent = `${completedTasks} / ${totalTasks}`;
    
    if (progressBar) {
        const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
        setTimeout(() => { progressBar.style.width = `${percentage}%`; }, 100);
    }

    if (dailyTaskList) {
        dailyTaskList.innerHTML = ''; // Safe here because we rebuild with secure elements
        const pendingTasks = appState.tasks.filter(t => t.status !== 'completed').slice(0, 3);
        
        if (pendingTasks.length === 0) {
            dailyTaskList.appendChild(createSafeElement('p', 'text-muted', 'Nessun task in sospeso oggi! 🎉'));
        } else {
            pendingTasks.forEach(task => {
                const li = createSafeElement('div', 'card');
                li.style.marginBottom = '0.5rem';
                li.appendChild(createSafeElement('strong', '', task.title));
                dailyTaskList.appendChild(li);
            });
        }
    }
}

// ==========================================
// PAGE SPECIFIC LOGIC: TASKS (tasks.html)
// ==========================================
let currentVisibleTasks = 3;
let filteredTasksCache = [];

function renderTasks(tasksToRender) {
    const taskContainer = document.getElementById('task-container');
    if (!taskContainer) return;

    taskContainer.innerHTML = ''; // Pulisce contenitore

    if (tasksToRender.length === 0) {
        taskContainer.appendChild(createSafeElement('p', '', 'Nessun task trovato.'));
        return;
    }

    const tasksToShow = tasksToRender.slice(0, currentVisibleTasks);

    tasksToShow.forEach(task => {
        const card = createSafeElement('div', 'card task-card');
        
        const header = createSafeElement('div', 'task-header');
        header.appendChild(createSafeElement('h3', '', task.title));
        header.appendChild(createSafeElement('span', `badge ${task.priority}`, task.priority.toUpperCase()));
        card.appendChild(header);

        card.appendChild(createSafeElement('p', 'text-muted', task.desc.substring(0, 50) + '...'));
        
        const footer = createSafeElement('div', 'task-header');
        footer.style.marginTop = 'auto';
        footer.appendChild(createSafeElement('small', '', `Data: ${task.date}`));
        
        const btnGroup = createSafeElement('div');
        
        const detailBtn = createSafeElement('button', 'btn-secondary', 'Dettagli');
        detailBtn.addEventListener('click', () => openModal(task));
        
        const isFav = appState.favorites.includes(task.id);
        const favBtn = createSafeElement('button', 'btn-icon', isFav ? '★' : '☆');
        favBtn.addEventListener('click', () => toggleFavorite(task.id, favBtn));

        btnGroup.appendChild(detailBtn);
        btnGroup.appendChild(favBtn);
        footer.appendChild(btnGroup);
        
        card.appendChild(footer);
        taskContainer.appendChild(card);
    });

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = currentVisibleTasks >= tasksToRender.length ? 'none' : 'block';
    }
}

function toggleFavorite(id, btnElement) {
    const index = appState.favorites.indexOf(id);
    if (index === -1) {
        appState.favorites.push(id);
        btnElement.textContent = '★';
        showToast('Aggiunto ai preferiti');
    } else {
        appState.favorites.splice(index, 1);
        btnElement.textContent = '☆';
        showToast('Rimosso dai preferiti');
    }
    saveAppData(appState);
}

function handleFiltersAndSearch() {
    const searchInput = document.getElementById('search-task');
    const filterSelect = document.getElementById('filter-status');
    const sortSelect = document.getElementById('sort-task');
    const resetBtn = document.getElementById('reset-filters');
    const loadMoreBtn = document.getElementById('load-more-btn');

    if (!searchInput) return;

    function applyLogic() {
        const query = searchInput.value.toLowerCase();
        const status = filterSelect.value;
        const sortBy = sortSelect.value;

        // Filter
        filteredTasksCache = appState.tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(query) || task.desc.toLowerCase().includes(query);
            const matchesStatus = status === 'all' || task.status === status || (status === 'high-priority' && task.priority === 'high');
            return matchesSearch && matchesStatus;
        });

        // Sort
        filteredTasksCache.sort((a, b) => {
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            if (sortBy === 'date') return new Date(a.date) - new Date(b.date);
            if (sortBy === 'priority') {
                const p = { high: 1, medium: 2, low: 3 };
                return p[a.priority] - p[b.priority];
            }
            return 0;
        });

        currentVisibleTasks = 3; // Reset pagination
        renderTasks(filteredTasksCache);
    }

    searchInput.addEventListener('input', applyLogic);
    filterSelect.addEventListener('change', applyLogic);
    sortSelect.addEventListener('change', applyLogic);
    
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterSelect.value = 'all';
        sortSelect.value = 'date';
        applyLogic();
    });

    loadMoreBtn.addEventListener('click', () => {
        currentVisibleTasks += 3;
        renderTasks(filteredTasksCache);
    });

    // Inizializzazione
    applyLogic();
}

// ==========================================
// MODAL LOGIC
// ==========================================
function openModal(task) {
    const modal = document.getElementById('task-modal');
    if (!modal) return;

    // Svuota e riempie in sicurezza
    const titleEl = document.getElementById('modal-title');
    const descEl = document.getElementById('modal-desc');
    const metaEl = document.getElementById('modal-meta');

    titleEl.textContent = task.title;
    descEl.textContent = task.desc;
    metaEl.textContent = `Stato: ${task.status} | Priorità: ${task.priority} | Data: ${task.date}`;

    modal.classList.add('active');
    
    // Focus management per accessibilità
    const closeBtn = document.getElementById('close-modal-btn');
    closeBtn.focus();
}

function initModalControls() {
    const modal = document.getElementById('task-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    
    if (!modal) return;

    function closeModal() { modal.classList.remove('active'); }

    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(); // Click outside
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ==========================================
// PAGE SPECIFIC LOGIC: PROFILE (profile.html)
// ==========================================
function initProfile() {
    const noteArea = document.getElementById('personal-notes');
    const contactForm = document.getElementById('contact-form');

    if (noteArea) {
        noteArea.value = appState.notes || '';
        noteArea.addEventListener('input', (e) => {
            appState.notes = e.target.value;
            saveAppData(appState);
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic Client-side validation
            const name = document.getElementById('contact-name');
            const email = document.getElementById('contact-email');
            const msg = document.getElementById('contact-msg');
            
            let isValid = true;

            // Reset errori
            document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
            document.querySelectorAll('input, textarea').forEach(el => el.classList.remove('input-error'));

            if (!name.value.trim()) {
                showError(name, 'Il nome è obbligatorio.');
                isValid = false;
            }
            if (!email.value.includes('@')) {
                showError(email, 'Email non valida.');
                isValid = false;
            }
            if (msg.value.length < 10) {
                showError(msg, 'Il messaggio deve avere almeno 10 caratteri.');
                isValid = false;
            }

            if (isValid) {
                showToast('Messaggio inviato con successo!');
                contactForm.reset();
            }
        });
    }
}

function showError(inputElement, message) {
    inputElement.classList.add('input-error');
    const errorEl = inputElement.nextElementSibling;
    if (errorEl && errorEl.classList.contains('error-msg')) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

// ==========================================
// APP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(appState.theme);
    initNavigation();
    initDashboard();
    handleFiltersAndSearch();
    initModalControls();
    initProfile();
});
