// Internationalization (i18n) module
const i18n = {
  currentLang: localStorage.getItem('crm-language') || 'sv',

  translations: {
    sv: {
      'hero.subtitle': 'Ett enkelt CRM för privatpersoner och små team som behöver ett smidigt sätt att hantera affärsrelationer utan krångel.',
      'hero.cta': 'Kom igång',
      'why.title': 'Varför Simple CRM?',
      'why.people.title': 'Håll koll på personer',
      'why.people.desc': 'Vet vem du pratat med, vad ni diskuterade och vad som behöver hända härnäst.',
      'why.organized.title': 'Håll ordning',
      'why.organized.desc': 'Gruppera kontakter per företag, lägg till anteckningar och sätt påminnelser.',
      'why.team.title': 'Arbeta tillsammans',
      'why.team.desc': 'Bjud in ditt team och dela allt direkt. Alla håller sig synkade.',
      'why.data.title': 'Förlora aldrig data',
      'why.data.desc': 'Arkivera istället för att radera, återställ när som helst, och säkerhetskopiera med ett klick.',
      'features.title': 'Funktioner',
      'features.contacts.title': 'Kontakter & Företag',
      'features.contacts.desc': 'Hantera affärsrelationer med detaljerade profiler, anteckningar vid varje interaktion och komplett kontakthistorik.',
      'features.candidates.title': 'Kandidathantering',
      'features.candidates.desc': 'Separat hantering av kandidater för rekrytering. Ladda upp CV, lägg till intervjuanteckningar och följ din pipeline.',
      'features.tasks.title': 'Uppgifter & Att-göra',
      'features.tasks.desc': 'Skapa uppgifter kopplade till kontakter, företag eller kandidater. Sätt förfallodatum och följ upp varje steg.',
      'features.checklists.title': 'Checklistor & Steg-för-steg',
      'features.checklists.desc': 'Skapa återanvändbara checklistmallar för upprepade processer. Bocka av steg direkt i uppgiften, lägg till egna steg och redigera inline.',
      'features.search.title': 'Sök & Filtrera',
      'features.search.desc': 'Hitta kontakter, företag och kandidater snabbt med sökning och filtrering. Sortera listor efter namn, datum eller status.',
      'features.backup.title': 'Säkerhetskopiering',
      'features.backup.desc': 'Exportera hela databasen som ZIP med alla filer. Importera säkerhetskopior när som helst. Din data är alltid säker och portabel.',
      'cta.title': 'Redo att komma igång?',
      'cta.subtitle': 'Skapa ditt kostnadsfria konto och börja organisera dina kontakter idag.',
      'cta.button': 'Skapa konto'
    },
    en: {
      'hero.subtitle': 'A simple CRM for individuals and small teams who need an easy way to manage business relationships without hassle.',
      'hero.cta': 'Get Started',
      'why.title': 'Why Simple CRM?',
      'why.people.title': 'Keep track of people',
      'why.people.desc': 'Know who you talked to, what you discussed, and what needs to happen next.',
      'why.organized.title': 'Stay organized',
      'why.organized.desc': 'Group contacts by company, add notes, and set reminders.',
      'why.team.title': 'Work together',
      'why.team.desc': 'Invite your team and share everything instantly. Everyone stays in sync.',
      'why.data.title': 'Never lose data',
      'why.data.desc': 'Archive instead of delete, restore anytime, and backup with one click.',
      'features.title': 'Features',
      'features.contacts.title': 'Contacts & Companies',
      'features.contacts.desc': 'Manage business relationships with detailed profiles, notes on every interaction, and complete contact history.',
      'features.candidates.title': 'Candidate Management',
      'features.candidates.desc': 'Separate candidate management for recruiting. Upload resumes, add interview notes, and track your pipeline.',
      'features.tasks.title': 'Tasks & To-dos',
      'features.tasks.desc': 'Create tasks linked to contacts, companies, or candidates. Set due dates and track every step to completion.',
      'features.checklists.title': 'Checklists & Step-by-step',
      'features.checklists.desc': 'Create reusable checklist templates for repeating processes. Check off steps inline, add custom steps, and edit directly in the task.',
      'features.search.title': 'Search & Filter',
      'features.search.desc': 'Find contacts, companies, and candidates fast with search and filtering. Sort lists by name, date, or status.',
      'features.backup.title': 'Data Backup',
      'features.backup.desc': 'Export your entire database as a ZIP with all files. Import backups anytime. Your data is always safe and portable.',
      'cta.title': 'Ready to get started?',
      'cta.subtitle': 'Create your free account and start organizing your contacts today.',
      'cta.button': 'Create Account'
    },
    de: {
      'hero.subtitle': 'Ein einfaches CRM für Einzelpersonen und kleine Teams, die eine unkomplizierte Möglichkeit zur Verwaltung von Geschäftsbeziehungen benötigen.',
      'hero.cta': 'Loslegen',
      'why.title': 'Warum Simple CRM?',
      'why.people.title': 'Behalten Sie den Überblick',
      'why.people.desc': 'Wissen Sie, mit wem Sie gesprochen haben, was besprochen wurde und was als nächstes passieren muss.',
      'why.organized.title': 'Bleiben Sie organisiert',
      'why.organized.desc': 'Gruppieren Sie Kontakte nach Unternehmen, fügen Sie Notizen hinzu und setzen Sie Erinnerungen.',
      'why.team.title': 'Zusammenarbeiten',
      'why.team.desc': 'Laden Sie Ihr Team ein und teilen Sie alles sofort. Alle bleiben synchron.',
      'why.data.title': 'Niemals Daten verlieren',
      'why.data.desc': 'Archivieren statt löschen, jederzeit wiederherstellen und mit einem Klick sichern.',
      'features.title': 'Funktionen',
      'features.contacts.title': 'Kontakte & Unternehmen',
      'features.contacts.desc': 'Verwalten Sie Geschäftsbeziehungen mit detaillierten Profilen, Notizen zu jeder Interaktion und vollständiger Kontakthistorie.',
      'features.candidates.title': 'Kandidatenverwaltung',
      'features.candidates.desc': 'Separate Kandidatenverwaltung für Recruiting. Laden Sie Lebensläufe hoch, fügen Sie Interviewnotizen hinzu und verfolgen Sie Ihre Pipeline.',
      'features.tasks.title': 'Aufgaben & To-dos',
      'features.tasks.desc': 'Erstellen Sie Aufgaben, verknüpft mit Kontakten, Unternehmen oder Kandidaten. Setzen Sie Fälligkeiten und verfolgen Sie jeden Schritt.',
      'features.checklists.title': 'Checklisten & Schritt-für-Schritt',
      'features.checklists.desc': 'Erstellen Sie wiederverwendbare Checklistenvorlagen für wiederkehrende Prozesse. Haken Sie Schritte direkt in der Aufgabe ab und bearbeiten Sie inline.',
      'features.search.title': 'Suchen & Filtern',
      'features.search.desc': 'Finden Sie Kontakte, Unternehmen und Kandidaten schnell mit Suche und Filterung. Sortieren Sie Listen nach Name, Datum oder Status.',
      'features.backup.title': 'Datensicherung',
      'features.backup.desc': 'Exportieren Sie Ihre gesamte Datenbank als ZIP mit allen Dateien. Importieren Sie Backups jederzeit. Ihre Daten sind immer sicher und portabel.',
      'cta.title': 'Bereit loszulegen?',
      'cta.subtitle': 'Erstellen Sie Ihr kostenloses Konto und beginnen Sie noch heute, Ihre Kontakte zu organisieren.',
      'cta.button': 'Konto erstellen'
    },
    fr: {
      'hero.subtitle': 'Un CRM simple pour les particuliers et les petites équipes qui ont besoin d\'un moyen facile de gérer leurs relations professionnelles sans complications.',
      'hero.cta': 'Commencer',
      'why.title': 'Pourquoi Simple CRM ?',
      'why.people.title': 'Gardez le fil',
      'why.people.desc': 'Sachez à qui vous avez parlé, de quoi vous avez discuté et ce qui doit se passer ensuite.',
      'why.organized.title': 'Restez organisé',
      'why.organized.desc': 'Groupez les contacts par entreprise, ajoutez des notes et définissez des rappels.',
      'why.team.title': 'Travaillez ensemble',
      'why.team.desc': 'Invitez votre équipe et partagez tout instantanément. Tout le monde reste synchronisé.',
      'why.data.title': 'Ne perdez jamais de données',
      'why.data.desc': 'Archivez au lieu de supprimer, restaurez à tout moment et sauvegardez en un clic.',
      'features.title': 'Fonctionnalités',
      'features.contacts.title': 'Contacts & Entreprises',
      'features.contacts.desc': 'Gérez vos relations professionnelles avec des profils détaillés, des notes sur chaque interaction et un historique complet des contacts.',
      'features.candidates.title': 'Gestion des candidats',
      'features.candidates.desc': 'Gestion séparée des candidats pour le recrutement. Téléchargez des CV, ajoutez des notes d\'entretien et suivez votre pipeline.',
      'features.tasks.title': 'Tâches & À faire',
      'features.tasks.desc': 'Créez des tâches liées aux contacts, entreprises ou candidats. Définissez des échéances et suivez chaque étape.',
      'features.checklists.title': 'Checklists & Étape par étape',
      'features.checklists.desc': 'Créez des modèles de checklists réutilisables pour les processus récurrents. Cochez les étapes directement dans la tâche et modifiez en ligne.',
      'features.search.title': 'Recherche & Filtrage',
      'features.search.desc': 'Trouvez contacts, entreprises et candidats rapidement grâce à la recherche et au filtrage. Triez les listes par nom, date ou statut.',
      'features.backup.title': 'Sauvegarde des données',
      'features.backup.desc': 'Exportez toute votre base de données en ZIP avec tous les fichiers. Importez des sauvegardes à tout moment. Vos données sont toujours sécurisées et portables.',
      'cta.title': 'Prêt à commencer ?',
      'cta.subtitle': 'Créez votre compte gratuit et commencez à organiser vos contacts dès aujourd\'hui.',
      'cta.button': 'Créer un compte'
    }
  },

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('crm-language', lang);
    this.applyTranslations();
    this.updateFlagHighlight();
  },

  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.translations[this.currentLang]?.[key];
      if (translation) {
        el.textContent = translation;
      }
    });
  },

  updateFlagHighlight() {
    document.querySelectorAll('.lang-flag').forEach(flag => {
      if (flag.getAttribute('data-lang') === this.currentLang) {
        flag.classList.add('border-sky-400');
        flag.classList.remove('border-transparent');
      } else {
        flag.classList.remove('border-sky-400');
        flag.classList.add('border-transparent');
      }
    });
  },

  init() {
    this.applyTranslations();
    this.updateFlagHighlight();
  }
};

// Toggle user menu dropdown
function toggleUserMenu() {
  const dropdown = document.getElementById('user-menu-dropdown');
  dropdown.classList.toggle('hidden');
}

function toggleMobileMenu() {
  document.getElementById('mobile-nav').classList.toggle('hidden');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('user-menu-dropdown');
  const button = document.getElementById('user-menu-button');
  if (dropdown && button && !dropdown.contains(e.target) && !button.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

// Authentication module
const auth = {
  currentUser: null,

  async checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        this.currentUser = await res.json();
        this.showLoggedInUI();
        await teamManager.checkInvitations();
        return true;
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    }
    this.currentUser = null;
    this.showLandingPage();
    return false;
  },

  showLoggedInUI() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    const navLinks = document.getElementById('nav-links');
    navLinks.className = 'ml-10 hidden md:flex space-x-2';
    document.getElementById('mobile-menu-button').classList.remove('hidden');
    document.getElementById('user-section').classList.remove('hidden');
    document.getElementById('current-user').textContent = this.currentUser.username;
    document.getElementById('auth-modal').classList.add('hidden');

    // Update user role badge
    const roleBadge = document.getElementById('user-role-badge');
    if (this.currentUser.role === 'owner') {
      roleBadge.textContent = 'Owner';
      roleBadge.className = 'px-2.5 py-0.5 text-xs rounded-full mr-2 bg-amber-400/90 text-amber-900 font-medium';
      roleBadge.classList.remove('hidden');
    } else if (this.currentUser.role === 'member') {
      roleBadge.textContent = 'Member';
      roleBadge.className = 'px-2.5 py-0.5 text-xs rounded-full mr-2 bg-emerald-400/90 text-emerald-900 font-medium';
      roleBadge.classList.remove('hidden');
    } else {
      roleBadge.classList.add('hidden');
    }

    // Update team menu items
    this.updateTeamMenu();

    // Load team logo
    this.loadTeamLogo();
  },

  async loadTeamLogo() {
    try {
      const res = await fetch('/api/team/logo');
      if (res.ok) {
        const data = await res.json();
        const logoContainer = document.getElementById('team-logo-container');
        const logoImg = document.getElementById('team-logo');
        if (data.logoUrl) {
          logoImg.src = data.logoUrl;
          logoContainer.classList.remove('hidden');
        } else {
          logoContainer.classList.add('hidden');
        }
      }
    } catch (err) {
      console.error('Error loading team logo:', err);
    }
  },

  updateTeamMenu() {
    const menuItems = document.getElementById('team-menu-items');
    const divider = document.getElementById('menu-divider');

    if (this.currentUser.role === 'owner') {
      menuItems.innerHTML = `
        <button onclick="router.navigate('archive'); toggleUserMenu();" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Archive
        </button>
        <button onclick="router.navigate('team-settings'); toggleUserMenu();" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Team Settings
        </button>
      `;
      divider.classList.remove('hidden');
    } else if (this.currentUser.role === 'member') {
      menuItems.innerHTML = `
        <button onclick="router.navigate('archive'); toggleUserMenu();" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Archive
        </button>
        <button onclick="router.navigate('team-settings'); toggleUserMenu();" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Settings
        </button>
        <button onclick="teamManager.leaveTeam(); toggleUserMenu();" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
          Leave Team
        </button>
      `;
      divider.classList.remove('hidden');
    } else {
      // Solo user - show option to invite/create team
      menuItems.innerHTML = `
        <button onclick="router.navigate('archive'); toggleUserMenu();" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Archive
        </button>
        <button onclick="router.navigate('team-settings'); toggleUserMenu();" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Invite Team Members
        </button>
      `;
      divider.classList.remove('hidden');
    }
  },

  showLandingPage() {
    document.getElementById('nav-links').className = 'ml-10 hidden space-x-2';
    document.getElementById('mobile-menu-button').classList.add('hidden');
    document.getElementById('mobile-nav').classList.add('hidden');
    document.getElementById('user-section').classList.add('hidden');
    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('landing-page').classList.remove('hidden');
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('app').innerHTML = '';
  },

  hideAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
  },

  showLoginModal() {
    const authModal = document.getElementById('auth-modal');
    authModal.classList.remove('hidden');

    document.getElementById('auth-modal-content').innerHTML = `
      <div id="login-form">
        <button onclick="auth.hideAuthModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Welcome Back</h2>
          <p class="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div id="auth-error" class="hidden mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"></div>

        <form onsubmit="auth.login(event)">
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <input type="text" id="login-username" required autocomplete="username" autofocus
                   class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input type="password" id="login-password" required autocomplete="current-password"
                   class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
          </div>

          <button type="submit"
                  class="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white py-2.5 px-4 rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all font-medium shadow-sm">
            Sign In
          </button>
        </form>

        <p class="mt-5 text-center text-sm text-slate-600">
          Don't have an account?
          <a href="#" onclick="auth.showRegisterForm(); return false;" class="text-sky-600 hover:text-sky-700 font-medium">Create one</a>
        </p>
      </div>
    `;
    focusAutofocus(document.getElementById('auth-modal-content'));
  },

  showRegisterForm() {
    document.getElementById('auth-modal-content').innerHTML = `
      <div id="register-form">
        <button onclick="auth.hideAuthModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Create Account</h2>
          <p class="text-slate-500 text-sm mt-1">Get started with Simple CRM</p>
        </div>

        <div id="auth-error" class="hidden mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"></div>

        <form onsubmit="auth.register(event)">
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <input type="text" id="register-username" required autocomplete="username" autofocus
                   class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input type="email" id="register-email" required autocomplete="email"
                   class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Password (min 6 characters)</label>
            <input type="password" id="register-password" required minlength="6" autocomplete="new-password"
                   class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
          </div>

          <button type="submit"
                  class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 px-4 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-sm">
            Create Account
          </button>
        </form>

        <p class="mt-5 text-center text-sm text-slate-600">
          Already have an account?
          <a href="#" onclick="auth.showLoginModal(); return false;" class="text-sky-600 hover:text-sky-700 font-medium">Sign in</a>
        </p>
      </div>
    `;
    focusAutofocus(document.getElementById('auth-modal-content'));
  },

  showAuthError(message) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  },

  async login(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        this.showAuthError(data.error || 'Login failed');
        return;
      }

      this.currentUser = data;
      this.showLoggedInUI();
      await teamManager.checkInvitations();
      router.navigate('contacts');
    } catch (err) {
      console.error('Login error:', err);
      this.showAuthError('Connection error. Please try again.');
    }
  },

  async register(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        this.showAuthError(data.error || 'Registration failed');
        return;
      }

      this.currentUser = data;
      this.showLoggedInUI();
      await teamManager.checkInvitations();
      router.navigate('contacts');
    } catch (err) {
      console.error('Register error:', err);
      this.showAuthError('Connection error. Please try again.');
    }
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    this.currentUser = null;
    this.showLandingPage();
  }
};

// API helper functions with 401 handling
const api = {
  async get(url) {
    const res = await fetch(url);
    if (res.status === 401) {
      auth.showLoginModal();
      throw new Error('Authentication required');
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async post(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.status === 401) {
      auth.showLoginModal();
      throw new Error('Authentication required');
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async put(url, data) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.status === 401) {
      auth.showLoginModal();
      throw new Error('Authentication required');
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async delete(url) {
    const res = await fetch(url, { method: 'DELETE' });
    if (res.status === 401) {
      auth.showLoginModal();
      throw new Error('Authentication required');
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  }
};

// Simple router with browser history support
const router = {
  currentRoute: null,
  _skipPush: false, // flag to prevent pushing state on popstate

  // Build hash URL from route + params, e.g. #contacts, #contact-detail/abc123
  _toHash(route, params) {
    let hash = '#' + route;
    if (params.id) hash += '/' + params.id;
    return hash;
  },

  // Parse hash URL back to route + params
  _fromHash(hash) {
    if (!hash || hash === '#') return { route: 'contacts', params: {} };
    const parts = hash.replace(/^#/, '').split('/');
    const route = parts[0];
    const params = {};
    if (parts[1]) params.id = parts[1];
    return { route, params };
  },

  navigate(route, params = {}) {
    this.currentRoute = { route, params };
    // Push to browser history unless we're handling a popstate event
    if (!this._skipPush) {
      history.pushState({ route, params }, '', this._toHash(route, params));
    }
    this.render();
    this.updateNav();
  },

  updateNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      const route = link.dataset.route;
      const current = this.currentRoute?.route;
      const isActive = route === current ||
          (route === 'contacts' && current?.startsWith('contact')) ||
          (route === 'companies' && current?.startsWith('company')) ||
          (route === 'candidates' && current?.startsWith('candidate')) ||
          (route === 'todos' && current?.startsWith('todo')) ||
          (route === 'inbox' && current?.startsWith('inbox')) ||
          (route === 'requests' && current?.startsWith('request'));
      if (isActive) {
        link.classList.add('bg-white/25', 'text-white');
        link.classList.remove('text-blue-100');
      } else {
        link.classList.remove('bg-white/25', 'text-white');
        link.classList.add('text-blue-100');
      }
    });
  },

  async render() {
    const app = document.getElementById('app');
    const { route, params } = this.currentRoute || { route: 'contacts', params: {} };

    try {
      switch (route) {
        case 'contacts':
          await views.contactList(app);
          break;
        case 'contact-detail':
          // On desktop, show split-view; on mobile, show full-page detail
          if (window.innerWidth >= 768) {
            await views.contactList(app, params.id);
          } else {
            await views.contactDetail(app, params.id);
          }
          break;
        case 'contact-form':
          await views.contactForm(app, params.id, params.companyId);
          break;
        case 'companies':
          await views.companyList(app);
          break;
        case 'company-detail':
          await views.companyDetail(app, params.id);
          break;
        case 'company-form':
          await views.companyForm(app, params.id);
          break;
        case 'todos':
          await views.todoList(app);
          break;
        case 'todo-form':
          await views.todoForm(app, params.linkedType, params.linkedId);
          break;
        case 'candidates':
          await views.candidateList(app);
          break;
        case 'candidate-detail':
          await views.candidateDetail(app, params.id);
          break;
        case 'candidate-form':
          await views.candidateForm(app, params.id);
          break;
        case 'team-settings':
          await views.teamSettings(app);
          break;
        case 'inbox':
          await views.inboxList(app);
          break;
        case 'inbox-detail':
          await views.inboxDetail(app, params.id);
          break;
        case 'requests':
          await views.requestList(app);
          break;
        case 'request-detail':
          await views.requestDetail(app, params.id);
          break;
        case 'archive':
          await views.archiveView(app);
          break;
        default:
          await views.contactList(app);
      }
    } catch (err) {
      if (err.message !== 'Authentication required') {
        const errDiv = document.createElement('div');
        errDiv.className = 'text-red-600';
        errDiv.textContent = 'Error: ' + err.message;
        app.innerHTML = '';
        app.appendChild(errDiv);
      }
    }

    // Auto-focus first element with [autofocus] after route render
    focusAutofocus(app);
  }
};

// Find and focus the first element with the autofocus attribute within a container
function focusAutofocus(container) {
  if (!container) return;
  const el = container.querySelector('[autofocus]');
  if (el && typeof el.focus === 'function') {
    setTimeout(() => el.focus(), 0);
  }
}

// Modal helper
const MODAL_SIZES = { md: 'max-w-md', lg: 'max-w-3xl' };

const modal = {
  // opts.size: 'md' (default, every existing form) | 'lg' (long read-only text)
  show(content, opts = {}) {
    if (content !== undefined) {
      document.getElementById('modal-content').innerHTML = content;
    }
    const panel = document.getElementById('modal-panel');
    if (panel) {
      for (const cls of Object.values(MODAL_SIZES)) panel.classList.remove(cls);
      panel.classList.add(MODAL_SIZES[opts.size] || MODAL_SIZES.md);
    }
    document.getElementById('modal').classList.remove('hidden');
    focusAutofocus(document.getElementById('modal-content'));
  },
  hide() {
    document.getElementById('modal').classList.add('hidden');
  },
  isOpen() {
    const el = document.getElementById('modal');
    return !!el && !el.classList.contains('hidden');
  }
};

// Close modal on backdrop click
document.getElementById('modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal') modal.hide();
});

// ...and on Escape. Without this the only way out of a full-screen overlay is
// to hit exactly the backdrop, which is fiddly once the panel is large.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.isOpen()) modal.hide();
});

// Team Manager module
const teamManager = {
  pendingInvitation: null,
  hasSoloData: false,

  async checkInvitations() {
    try {
      const data = await api.get('/api/invitations');
      if (data.invitations && data.invitations.length > 0) {
        this.pendingInvitation = data.invitations[0];
        this.hasSoloData = data.hasSoloData;
        this.showInvitationBanner();
      } else {
        this.hideInvitationBanner();
      }
    } catch (err) {
      console.error('Error checking invitations:', err);
    }
  },

  showInvitationBanner() {
    const banner = document.getElementById('invitation-banner');
    const text = document.getElementById('invitation-text');
    if (banner && text && this.pendingInvitation) {
      text.textContent = `You've been invited to join ${this.pendingInvitation.inviterUsername}'s team.`;
      banner.classList.remove('hidden');
    }
  },

  hideInvitationBanner() {
    const banner = document.getElementById('invitation-banner');
    if (banner) {
      banner.classList.add('hidden');
    }
    this.pendingInvitation = null;
  },

  showAcceptModal() {
    if (!this.pendingInvitation) return;

    let mergeOption = '';
    if (this.hasSoloData) {
      mergeOption = `
        <div class="mb-4">
          <p class="text-sm text-slate-600 mb-2">You have existing data. What would you like to do with it?</p>
          <div class="space-y-2">
            <label class="flex items-center">
              <input type="radio" name="merge-choice" value="merge" checked class="mr-2 text-emerald-600 focus:ring-emerald-500">
              <span class="text-sm text-slate-700">Merge my data into the team</span>
            </label>
            <label class="flex items-center">
              <input type="radio" name="merge-choice" value="fresh" class="mr-2 text-emerald-600 focus:ring-emerald-500">
              <span class="text-sm text-slate-700">Start fresh (my data will be deleted)</span>
            </label>
          </div>
        </div>
      `;
    }

    modal.show(`
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Join Team</h3>
      <p class="text-slate-600 mb-4">
        You're about to join <strong class="text-slate-800">${this.pendingInvitation.inviterUsername}</strong>'s team.
        You'll have access to all team data and can collaborate with other members.
      </p>
      ${mergeOption}
      <div class="flex justify-end space-x-2">
        <button onclick="modal.hide()" class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">
          Cancel
        </button>
        <button onclick="teamManager.acceptInvitation()" class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 font-medium shadow-sm">
          Join Team
        </button>
      </div>
    `);
  },

  async acceptInvitation() {
    if (!this.pendingInvitation) return;

    const mergeChoice = document.querySelector('input[name="merge-choice"]:checked');
    const mergeData = mergeChoice ? mergeChoice.value === 'merge' : false;

    try {
      await api.post(`/api/invitations/${this.pendingInvitation.id}/accept`, { mergeData });
      modal.hide();
      this.hideInvitationBanner();
      // Refresh user data
      await auth.checkAuth();
      router.navigate('contacts');
    } catch (err) {
      console.error('Error accepting invitation:', err);
      alert('Failed to accept invitation. Please try again.');
    }
  },

  async declineInvitation() {
    if (!this.pendingInvitation) return;

    if (!confirm('Are you sure you want to decline this invitation?')) return;

    try {
      await api.post(`/api/invitations/${this.pendingInvitation.id}/decline`, {});
      this.hideInvitationBanner();
    } catch (err) {
      console.error('Error declining invitation:', err);
      alert('Failed to decline invitation. Please try again.');
    }
  },

  async leaveTeam() {
    if (!confirm('Are you sure you want to leave this team? All data you created will stay with the team, and you will start with an empty dataset.')) {
      return;
    }

    try {
      await api.post('/api/team/leave', {});
      await auth.checkAuth();
      router.navigate('contacts');
    } catch (err) {
      console.error('Error leaving team:', err);
      alert('Failed to leave team. Please try again.');
    }
  },

  async inviteMember(email) {
    try {
      await api.post('/api/team/invite', { email });
      return { success: true };
    } catch (err) {
      console.error('Error inviting member:', err);
      return { error: 'Failed to send invitation' };
    }
  },

  async removeMember(memberId) {
    try {
      await api.delete(`/api/team/members/${memberId}`);
      return { success: true };
    } catch (err) {
      console.error('Error removing member:', err);
      return { error: 'Failed to remove member' };
    }
  },

  async cancelInvitation(invitationId) {
    try {
      await api.delete(`/api/team/invite/${invitationId}`);
      return { success: true };
    } catch (err) {
      console.error('Error cancelling invitation:', err);
      return { error: 'Failed to cancel invitation' };
    }
  },

  async transferOwnership(newOwnerId) {
    try {
      await api.post('/api/team/transfer', { newOwnerId });
      return { success: true };
    } catch (err) {
      console.error('Error transferring ownership:', err);
      return { error: 'Failed to transfer ownership' };
    }
  }
};

// Format date for display
function formatDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleDateString('sv-SE');
}

// Format date with time for notes
function formatDateTime(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString('sv-SE');
  const timeStr = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dateStr} ${timeStr}`;
}

// Views
const views = {
  // Track selected contact for split-view
  selectedContactId: null,

  // Contact List View (Main) - supports both full-width and split-view modes
  async contactList(container, selectedId = null) {
    const contacts = await api.get('/api/contacts');
    this._contacts = contacts;
    this._currentSort = 'name';
    this._sortAsc = true;
    this.selectedContactId = selectedId;

    // Check if we're in split-view mode (has selection and desktop width)
    const isSplitView = selectedId && window.innerWidth >= 768;

    if (isSplitView) {
      container.innerHTML = `
        <div class="flex gap-6">
          <!-- Left: Compact contact list -->
          <div id="contact-list-panel" class="w-80 flex-shrink-0">
            <div class="mb-4 flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-slate-800">Contacts</h2>
                <p class="text-slate-500 text-sm">${contacts.length} contacts</p>
              </div>
              <button onclick="router.navigate('contact-form')"
                      class="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-3 py-1.5 rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all font-medium shadow-sm text-sm">
                + Add
              </button>
            </div>

            <div class="mb-3">
              <input type="text" id="search-input" placeholder="Search..." autofocus
                     class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
                     oninput="views.filterContactsCompact()">
            </div>

            <div id="contacts-compact-list" class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden max-h-[calc(100vh-280px)] overflow-y-auto">
              ${this.renderCompactContactList(contacts, selectedId)}
            </div>
          </div>

          <!-- Right: Contact detail panel -->
          <div id="contact-detail-panel" class="flex-1 min-w-0">
            <!-- Detail content loaded here -->
          </div>
        </div>
      `;

      // Load the selected contact's details
      await this.loadContactDetailPanel(selectedId);
    } else {
      // Full-width mode (no selection or mobile)
      container.innerHTML = `
        <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 class="text-2xl font-bold text-slate-800">Contacts</h2>
            <p class="text-slate-500">${contacts.length} contacts</p>
          </div>
          <button onclick="router.navigate('contact-form')"
                  class="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-5 py-2.5 rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all font-medium shadow-sm">
            + Add Contact
          </button>
        </div>

        <div class="mb-4">
          <input type="text" id="search-input" placeholder="Search contacts..." autofocus
                 class="w-full md:w-96 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                 oninput="views.filterContacts()">
        </div>

        <div class="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
          <table class="min-w-full divide-y divide-slate-200 responsive-table">
            <thead class="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onclick="views.sortContacts('name')">
                  Name <span id="sort-name" class="text-sky-600"></span>
                </th>
                <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onclick="views.sortContacts('company')">
                  Company <span id="sort-company"></span>
                </th>
                <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onclick="views.sortContacts('lastNote')">
                  Last Note <span id="sort-lastNote"></span>
                </th>
              </tr>
            </thead>
            <tbody id="contacts-table" class="bg-white divide-y divide-slate-100">
              ${this.renderContactRows(contacts)}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('sort-name').textContent = '↑';
    }
  },

  // Render compact contact list for split-view
  renderCompactContactList(contacts, selectedId = null) {
    if (contacts.length === 0) {
      return `<div class="px-4 py-8 text-center text-slate-500">No contacts found</div>`;
    }
    return contacts.map(c => `
      <div class="px-4 py-3 cursor-pointer transition-colors border-l-4 ${c.id === selectedId
        ? 'bg-sky-50 border-sky-500'
        : 'border-transparent hover:bg-slate-50'}"
           onclick="views.selectContact('${c.id}')">
        <div class="font-medium text-slate-800 truncate">${this.escapeHtml(c.name)}</div>
        <div class="text-sm text-slate-500 truncate">${this.escapeHtml(c.companyName || '')}</div>
      </div>
    `).join('');
  },

  // Select a contact - handles both mobile and desktop
  async selectContact(id) {
    // On mobile, navigate to full-page detail view
    if (window.innerWidth < 768) {
      router.navigate('contact-detail', { id });
      return;
    }

    // Check if we're already in split-view mode
    const detailPanel = document.getElementById('contact-detail-panel');

    if (!detailPanel) {
      // Not in split-view yet, navigate to trigger full split-view render
      router.navigate('contact-detail', { id });
      return;
    }

    // Already in split-view, just update the selection
    this.selectedContactId = id;

    // Update URL for bookmarking (replaceState to avoid extra history entries for split-view clicks)
    history.replaceState({ route: 'contact-detail', params: { id } }, '', `#contact-detail/${id}`);

    // Update selection highlight in list
    this.updateContactSelection(id);

    // Load contact details in the right panel
    await this.loadContactDetailPanel(id);
  },

  // Update visual selection in compact list
  updateContactSelection(selectedId) {
    const listContainer = document.getElementById('contacts-compact-list');
    if (!listContainer) return;

    listContainer.innerHTML = this.renderCompactContactList(this._contacts, selectedId);
  },

  // Load contact detail into the right panel
  async loadContactDetailPanel(id) {
    const panel = document.getElementById('contact-detail-panel');
    if (!panel) return;

    const [contact, allTodos] = await Promise.all([
      api.get(`/api/contacts/${id}`),
      api.get('/api/todos?createdBy=all')
    ]);
    const todos = allTodos.filter(t => t.linkedType === 'contact' && t.linkedId === id);

    panel.innerHTML = `
      <div class="bg-white shadow-sm rounded-xl p-6 mb-6 border border-slate-200">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-2xl font-bold text-slate-800">${this.escapeHtml(contact.name)}</h2>
            <a href="#" onclick="router.navigate('company-detail', {id: '${contact.companyId}'}); return false;"
               class="text-sky-600 hover:text-sky-700 font-medium">${this.escapeHtml(contact.companyName)}</a>
          </div>
          <div class="flex gap-2">
            <button onclick="views.closeContactDetail()"
                    class="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <button onclick="router.navigate('contact-form', {id: '${contact.id}'})"
                    class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium">
              Edit
            </button>
            <button onclick="views.archiveContact('${contact.id}')"
                    class="bg-amber-50 text-amber-600 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors font-medium">
              Archive
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          ${contact.role ? `<div><span class="text-slate-500">Role:</span> <span class="text-slate-700">${this.escapeHtml(contact.role)}</span></div>` : ''}
          ${contact.department ? `<div><span class="text-slate-500">Department:</span> <span class="text-slate-700">${this.escapeHtml(contact.department)}</span></div>` : ''}
          ${contact.email ? `<div><span class="text-slate-500">Email:</span> <a href="mailto:${this.escapeHtml(contact.email)}" class="text-sky-600 hover:text-sky-700">${this.escapeHtml(contact.email)}</a></div>` : ''}
          ${contact.phone ? `<div><span class="text-slate-500">Phone:</span> <span class="text-slate-700">${this.escapeHtml(contact.phone)}</span></div>` : ''}
        </div>

        ${contact.description ? `
          <div class="mt-4 pt-4 border-t border-slate-200">
            <h3 class="text-sm font-medium text-slate-500 mb-2">Description</h3>
            <p class="text-slate-700">${this.escapeHtml(contact.description)}</p>
          </div>
        ` : ''}
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">Notes & ToDos</h3>

        <form onsubmit="views.addNote(event, '${contact.id}')" class="mb-6">
          <textarea id="new-note" rows="3" placeholder="Add a note..."
                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"></textarea>
          <div class="mt-2 flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" id="make-todo" class="h-4 w-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500">
              Make this a ToDo
            </label>
            <button type="submit" class="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all font-medium shadow-sm">
              Add
            </button>
          </div>
        </form>

        <div class="mb-3 flex gap-2 text-sm">
          <span class="text-slate-500">Sort by:</span>
          <button onclick="views.sortActivity('date')" class="activity-sort text-sky-600 font-medium" data-sort="date">Date <span id="sort-activity-date">↓</span></button>
          <button onclick="views.sortActivity('type')" class="activity-sort text-slate-600 hover:text-slate-800" data-sort="type">Type <span id="sort-activity-type"></span></button>
        </div>

        <div id="activity-list" class="space-y-4">
          ${this.renderActivityList(contact.notes, todos, contact.id, 'contact')}
        </div>
      </div>
    `;

    this._currentContact = contact;
    this._currentTodos = todos;
    this._activitySort = 'date';
    this._activitySortAsc = false;
  },

  // Close contact detail and return to full-width list
  closeContactDetail() {
    this.selectedContactId = null;
    router.navigate('contacts');
  },

  // Filter for compact list in split-view
  filterContactsCompact() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = this._contacts.filter(c =>
      c.name.toLowerCase().includes(query) ||
      (c.companyName || '').toLowerCase().includes(query) ||
      (c.role || '').toLowerCase().includes(query)
    );
    document.getElementById('contacts-compact-list').innerHTML = this.renderCompactContactList(filtered, this.selectedContactId);
  },

  renderContactRows(contacts) {
    if (contacts.length === 0) {
      return `<tr><td colspan="3" class="px-6 py-8 text-center text-slate-500">No contacts found</td></tr>`;
    }
    return contacts.map(c => `
      <tr class="hover:bg-sky-50/50 cursor-pointer transition-colors" onclick="views.selectContact('${c.id}')">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="font-medium text-slate-800">${this.escapeHtml(c.name)}</div>
          ${c.role ? `<div class="text-sm text-slate-500">${this.escapeHtml(c.role)}</div>` : ''}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-slate-600" data-label="Company">${this.escapeHtml(c.companyName || '-')}</td>
        <td class="px-6 py-4 whitespace-nowrap text-slate-500" data-label="Last Note">${formatDateTime(c.lastNoteDate)}</td>
      </tr>
    `).join('');
  },

  filterContacts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = this._contacts.filter(c =>
      c.name.toLowerCase().includes(query) ||
      (c.companyName || '').toLowerCase().includes(query) ||
      (c.role || '').toLowerCase().includes(query) ||
      (c.department || '').toLowerCase().includes(query) ||
      (c.description || '').toLowerCase().includes(query)
    );
    document.getElementById('contacts-table').innerHTML = this.renderContactRows(filtered);
  },

  sortContacts(field) {
    // Toggle direction if same field, otherwise reset to ascending
    if (this._currentSort === field) {
      this._sortAsc = !this._sortAsc;
    } else {
      this._currentSort = field;
      this._sortAsc = true;
    }

    // Clear sort indicators
    ['name', 'company', 'lastNote'].forEach(f => {
      document.getElementById(`sort-${f}`).textContent = '';
    });

    const sorted = [...this._contacts].sort((a, b) => {
      let result;
      switch (field) {
        case 'company':
          result = (a.companyName || '').localeCompare(b.companyName || '');
          break;
        case 'lastNote':
          if (!a.lastNoteDate && !b.lastNoteDate) result = 0;
          else if (!a.lastNoteDate) result = 1;
          else if (!b.lastNoteDate) result = -1;
          else result = new Date(b.lastNoteDate) - new Date(a.lastNoteDate);
          break;
        default:
          result = (a.name || '').localeCompare(b.name || '');
      }
      return this._sortAsc ? result : -result;
    });

    document.getElementById(`sort-${field}`).textContent = this._sortAsc ? '↑' : '↓';
    document.getElementById('contacts-table').innerHTML = this.renderContactRows(sorted);
  },

  // Contact Detail View
  async contactDetail(container, id) {
    const [contact, allTodos] = await Promise.all([
      api.get(`/api/contacts/${id}`),
      api.get('/api/todos?createdBy=all')
    ]);
    const todos = allTodos.filter(t => t.linkedType === 'contact' && t.linkedId === id);

    container.innerHTML = `
      <div class="mb-6">
        <a href="#" onclick="router.navigate('contacts'); return false;" class="text-sky-600 hover:text-sky-700 font-medium">
          ← Back to Contacts
        </a>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-4 sm:p-6 mb-6 border border-slate-200">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-800">${this.escapeHtml(contact.name)}</h2>
            <a href="#" onclick="router.navigate('company-detail', {id: '${contact.companyId}'}); return false;"
               class="text-sky-600 hover:text-sky-700 font-medium">${this.escapeHtml(contact.companyName)}</a>
          </div>
          <div class="flex gap-2">
            <button onclick="router.navigate('contact-form', {id: '${contact.id}'})"
                    class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm">
              Edit
            </button>
            <button onclick="views.archiveContact('${contact.id}')"
                    class="bg-amber-50 text-amber-600 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors font-medium text-sm">
              Archive
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          ${contact.role ? `<div><span class="text-slate-500">Role:</span> <span class="text-slate-700">${this.escapeHtml(contact.role)}</span></div>` : ''}
          ${contact.department ? `<div><span class="text-slate-500">Department:</span> <span class="text-slate-700">${this.escapeHtml(contact.department)}</span></div>` : ''}
          ${contact.email ? `<div><span class="text-slate-500">Email:</span> <a href="mailto:${this.escapeHtml(contact.email)}" class="text-sky-600 hover:text-sky-700">${this.escapeHtml(contact.email)}</a></div>` : ''}
          ${contact.phone ? `<div><span class="text-slate-500">Phone:</span> <span class="text-slate-700">${this.escapeHtml(contact.phone)}</span></div>` : ''}
        </div>

        ${contact.description ? `
          <div class="mt-4 pt-4 border-t border-slate-200">
            <h3 class="text-sm font-medium text-slate-500 mb-2">Description</h3>
            <p class="text-slate-700">${this.escapeHtml(contact.description)}</p>
          </div>
        ` : ''}
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">Notes & ToDos</h3>

        <form onsubmit="views.addNote(event, '${contact.id}')" class="mb-6">
          <textarea id="new-note" rows="3" placeholder="Add a note..."
                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"></textarea>
          <div class="mt-2 flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" id="make-todo" class="h-4 w-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500">
              Make this a ToDo
            </label>
            <button type="submit" class="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all font-medium shadow-sm">
              Add
            </button>
          </div>
        </form>

        <div class="mb-3 flex gap-2 text-sm">
          <span class="text-slate-500">Sort by:</span>
          <button onclick="views.sortActivity('date')" class="activity-sort text-sky-600 font-medium" data-sort="date">Date <span id="sort-activity-date">↓</span></button>
          <button onclick="views.sortActivity('type')" class="activity-sort text-slate-600 hover:text-slate-800" data-sort="type">Type <span id="sort-activity-type"></span></button>
        </div>

        <div id="activity-list" class="space-y-4">
          ${this.renderActivityList(contact.notes, todos, contact.id, 'contact')}
        </div>
      </div>
    `;

    this._currentContact = contact;
    this._currentTodos = todos;
    this._activitySort = 'date';
    this._activitySortAsc = false;
  },

  renderNotes(notes, contactId) {
    if (!notes || notes.length === 0) {
      return '<p class="text-slate-500">No notes yet</p>';
    }

    // Sort notes by date, newest first
    const sorted = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return sorted.map(note => `
      <div class="border-l-4 border-sky-300 pl-4 py-2 bg-sky-50/30 rounded-r-lg" data-note-id="${note.id}">
        <div class="flex justify-between items-start">
          <p class="text-slate-700 whitespace-pre-wrap">${this.escapeHtml(note.content)}</p>
          <div class="flex gap-2 ml-4">
            <button onclick="views.editNote('${contactId}', '${note.id}')" class="text-slate-400 hover:text-slate-600 text-sm">Edit</button>
            <button onclick="views.deleteNote('${contactId}', '${note.id}')" class="text-red-400 hover:text-red-600 text-sm">Delete</button>
          </div>
        </div>
        <p class="text-xs text-slate-400 mt-1">${formatDateTime(note.createdAt)}</p>
      </div>
    `).join('');
  },

  // Combined activity list (notes + todos)
  renderActivityList(notes, todos, entityId, entityType) {
    // Combine notes and todos into unified items
    const items = [];

    (notes || []).forEach(note => {
      items.push({
        type: 'note',
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
        completed: false
      });
    });

    (todos || []).forEach(todo => {
      items.push({
        type: 'todo',
        id: todo.id,
        content: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        createdAt: todo.createdAt,
        completed: todo.completed,
        checklistItemsState: todo.checklistItemsState || []
      });
    });

    if (items.length === 0) {
      return '<p class="text-gray-500">No notes or ToDos yet</p>';
    }

    // Sort based on current sort setting
    const sortField = this._activitySort || 'date';
    const sortAsc = this._activitySortAsc !== undefined ? this._activitySortAsc : false;

    items.sort((a, b) => {
      let result;
      if (sortField === 'type') {
        result = a.type.localeCompare(b.type);
      } else {
        result = new Date(b.createdAt) - new Date(a.createdAt);
      }
      return sortAsc ? -result : result;
    });

    return items.map(item => {
      if (item.type === 'note') {
        return `
          <div class="border-l-4 border-sky-300 pl-4 py-2 bg-sky-50/30 rounded-r-lg" data-note-id="${item.id}">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <span class="inline-block px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-700 font-medium mb-1">Note</span>
                <p class="text-slate-700 whitespace-pre-wrap">${this.escapeHtml(item.content)}</p>
              </div>
              <div class="flex gap-2 ml-4">
                <button onclick="views.editNote('${entityId}', '${item.id}')" class="text-slate-400 hover:text-slate-600 text-sm">Edit</button>
                <button onclick="views.deleteNote('${entityId}', '${item.id}')" class="text-red-400 hover:text-red-600 text-sm">Delete</button>
              </div>
            </div>
            <p class="text-xs text-slate-400 mt-1">${formatDateTime(item.createdAt)}</p>
          </div>
        `;
      } else {
        return `
          <div class="border-l-4 ${item.completed ? 'border-slate-300 bg-slate-50/50' : 'border-emerald-400 bg-emerald-50/30'} pl-4 py-2 rounded-r-lg ${item.completed ? 'opacity-60' : ''}" data-todo-id="${item.id}">
            <div class="flex justify-between items-start">
              <div class="flex items-start flex-1">
                <input type="checkbox" ${item.completed ? 'checked' : ''}
                       onchange="views.toggleTodoInline('${item.id}', this.checked, '${entityType}', '${entityId}')"
                       class="h-4 w-4 mt-1 text-emerald-600 rounded border-slate-300 cursor-pointer focus:ring-emerald-500">
                <div class="ml-2 flex-1">
                  <span class="inline-block px-2 py-0.5 text-xs rounded-full ${item.completed ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'} font-medium mb-1">ToDo</span>
                  <p class="text-slate-700 ${item.completed ? 'line-through' : ''}">${this.escapeHtml(item.content)}</p>
                  ${item.description ? `<p class="text-sm text-slate-500 mt-1">${this.escapeHtml(item.description)}</p>` : ''}
                  ${item.checklistItemsState && item.checklistItemsState.length > 0 ? `
                  <div class="mt-2">
                    <div class="text-xs font-medium text-slate-500 mb-1">Checklist (${item.checklistItemsState.filter(ci => ci.checked).length}/${item.checklistItemsState.length})</div>
                    <div class="checklist-grid columns-1 sm:columns-2 lg:columns-3 gap-x-4">
                      ${item.checklistItemsState.map((ci, idx) => `
                        <div class="flex items-center gap-2 group break-inside-avoid mb-1">
                          <input type="checkbox" ${ci.checked ? 'checked' : ''} ${item.completed ? 'disabled' : ''}
                                 onchange="views.toggleChecklistItemInline('${item.id}', ${idx}, this.checked, '${entityType}', '${entityId}')"
                                 class="h-3.5 w-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0">
                          <span onclick="views.startEditChecklistItemInline(this, '${item.id}', ${idx}, '${entityType}', '${entityId}')"
                                class="text-xs ${ci.checked ? 'line-through text-slate-400' : 'text-slate-600'} ${!item.completed ? 'cursor-text hover:bg-emerald-50 rounded px-1 -mx-1' : ''}">${this.escapeHtml(ci.text)}</span>
                          ${!item.completed ? `<button onclick="views.removeChecklistItemInline('${item.id}', ${idx}, '${entityType}', '${entityId}')" class="text-red-300 hover:text-red-500 text-xs ml-auto opacity-0 group-hover:opacity-100 shrink-0" title="Remove">&times;</button>` : ''}
                        </div>
                      `).join('')}
                    </div>
                    ${!item.completed ? `<button onclick="views.addChecklistItemInPlaceInline('${item.id}', '${entityType}', '${entityId}', this)" class="text-emerald-500 hover:text-emerald-700 text-xs mt-1 flex items-center gap-1"><span class="text-base leading-none">+</span></button>` : ''}
                  </div>` : ''}
                  <p class="text-xs text-slate-400 mt-1">Due: ${formatDateTime(item.dueDate)} | Created: ${formatDateTime(item.createdAt)}</p>
                </div>
              </div>
              <div class="flex gap-2 ml-4">
                <button onclick="views.editTodoInline('${item.id}', '${entityType}', '${entityId}')" class="text-slate-400 hover:text-slate-600 text-sm">Edit</button>
                <button onclick="views.deleteTodoInline('${item.id}', '${entityType}', '${entityId}')" class="text-red-400 hover:text-red-600 text-sm">Delete</button>
              </div>
            </div>
          </div>
        `;
      }
    }).join('');
  },

  sortActivity(field) {
    if (this._activitySort === field) {
      this._activitySortAsc = !this._activitySortAsc;
    } else {
      this._activitySort = field;
      this._activitySortAsc = field === 'type' ? true : false;
    }

    // Update sort indicators
    document.querySelectorAll('.activity-sort').forEach(btn => {
      const sortField = btn.dataset.sort;
      const indicator = document.getElementById(`sort-activity-${sortField}`);
      if (sortField === field) {
        btn.classList.remove('text-slate-600');
        btn.classList.add('text-sky-600', 'font-medium');
        indicator.textContent = this._activitySortAsc ? '↑' : '↓';
      } else {
        btn.classList.remove('text-sky-600', 'font-medium');
        btn.classList.add('text-slate-600');
        indicator.textContent = '';
      }
    });

    // Re-render the list
    const contact = this._currentContact;
    const todos = this._currentTodos;
    if (contact) {
      document.getElementById('activity-list').innerHTML =
        this.renderActivityList(contact.notes, todos, contact.id, 'contact');
    }
  },

  async addNote(event, contactId) {
    event.preventDefault();
    const content = document.getElementById('new-note').value.trim();
    if (!content) return;

    const makeTodo = document.getElementById('make-todo')?.checked;

    if (makeTodo) {
      // Create as ToDo instead
      await api.post('/api/todos', {
        title: content,
        description: '',
        dueDate: new Date().toISOString(),
        linkedType: 'contact',
        linkedId: contactId
      });
    } else {
      // Create as regular note
      await api.post(`/api/contacts/${contactId}/notes`, { content });
    }
    router.navigate('contact-detail', { id: contactId });
  },

  async editNote(contactId, noteId) {
    const note = this._currentContact.notes.find(n => n.id === noteId);
    if (!note) return;

    modal.show(`
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Edit Note</h3>
      <textarea id="edit-note-content" rows="4" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">${this.escapeHtml(note.content)}</textarea>
      <div class="flex justify-end gap-2 mt-4">
        <button onclick="modal.hide()" class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
        <button onclick="views.saveNote('${contactId}', '${noteId}')" class="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-700 hover:to-blue-700 font-medium shadow-sm">Save</button>
      </div>
    `);
  },

  async saveNote(contactId, noteId) {
    const content = document.getElementById('edit-note-content').value.trim();
    if (!content) return;

    await api.put(`/api/contacts/${contactId}/notes/${noteId}`, { content });
    modal.hide();
    router.navigate('contact-detail', { id: contactId });
  },

  async deleteNote(contactId, noteId) {
    if (!confirm('Delete this note?')) return;
    await api.delete(`/api/contacts/${contactId}/notes/${noteId}`);
    router.navigate('contact-detail', { id: contactId });
  },

  async archiveContact(id) {
    if (!confirm('Archive this contact? You can restore it later from the Archive.')) return;
    try {
      await api.delete(`/api/contacts/${id}`);
      router.navigate('contacts');
    } catch (err) {
      console.error('Error archiving contact:', err);
      alert('Failed to archive contact: ' + err.message);
    }
  },

  async restoreContact(id) {
    try {
      await api.post(`/api/contacts/${id}/restore`);
      router.navigate('archive');
    } catch (err) {
      console.error('Error restoring contact:', err);
      alert('Failed to restore contact: ' + err.message);
    }
  },

  // Contact Form
  async contactForm(container, id, preselectedCompanyId) {
    const companies = await api.get('/api/companies');
    let contact = { name: '', role: '', department: '', description: '', email: '', phone: '', companyId: preselectedCompanyId || '' };

    if (id) {
      contact = await api.get(`/api/contacts/${id}`);
    }

    container.innerHTML = `
      <div class="mb-6">
        <a href="#" onclick="router.navigate('contacts'); return false;" class="text-sky-600 hover:text-sky-700 font-medium">
          ← Back to Contacts
        </a>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">${id ? 'Edit Contact' : 'New Contact'}</h2>

        <form onsubmit="views.saveContact(event, '${id || ''}')" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
            <input type="text" id="contact-name" value="${this.escapeHtml(contact.name)}" required autofocus
                   class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" id="contact-email" value="${this.escapeHtml(contact.email || '')}"
                     oninput="views.maybeGuessContactName(this.value); views.maybeGuessContactCompany(this.value)"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input type="tel" id="contact-phone" value="${this.escapeHtml(contact.phone || '')}"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Company *</label>
            <select id="contact-company" onchange="views.toggleNewCompany()"
                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
              <option value="">Select a company</option>
              <option value="__new__">+ Add new company...</option>
              ${companies.map(c => `<option value="${c.id}" ${c.id === contact.companyId ? 'selected' : ''}>${this.escapeHtml(c.name)}</option>`).join('')}
            </select>
            <div id="new-company-field" class="hidden mt-2">
              <input type="text" id="new-company-name" placeholder="Enter new company name"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <input type="text" id="contact-role" value="${this.escapeHtml(contact.role || '')}"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
              <input type="text" id="contact-department" value="${this.escapeHtml(contact.department || '')}"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea id="contact-description" rows="3"
                      class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">${this.escapeHtml(contact.description || '')}</textarea>
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <button type="button" onclick="router.navigate('contacts')"
                    class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
            <button type="submit"
                    class="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all font-medium shadow-sm">Save</button>
          </div>
        </form>
      </div>
    `;
  },

  toggleNewCompany() {
    const select = document.getElementById('contact-company');
    const newField = document.getElementById('new-company-field');
    const newInput = document.getElementById('new-company-name');

    if (select.value === '__new__') {
      newField.classList.remove('hidden');
      newInput.required = true;
      select.required = false;
    } else {
      newField.classList.add('hidden');
      newInput.required = false;
      newInput.value = '';
      select.required = true;
    }
  },

  async saveContact(event, id) {
    event.preventDefault();

    let companyId = document.getElementById('contact-company').value;

    // Create new company if needed
    if (companyId === '__new__') {
      const newCompanyName = document.getElementById('new-company-name').value.trim();
      if (!newCompanyName) {
        alert('Please enter a company name');
        return;
      }
      const newCompany = await api.post('/api/companies', { name: newCompanyName });
      companyId = newCompany.id;
    }

    const data = {
      name: document.getElementById('contact-name').value,
      companyId: companyId,
      role: document.getElementById('contact-role').value,
      department: document.getElementById('contact-department').value,
      description: document.getElementById('contact-description').value,
      email: document.getElementById('contact-email').value,
      phone: document.getElementById('contact-phone').value
    };

    if (id) {
      await api.put(`/api/contacts/${id}`, data);
      router.navigate('contact-detail', { id });
    } else {
      const contact = await api.post('/api/contacts', data);
      router.navigate('contact-detail', { id: contact.id });
    }
  },

  // Company List View
  async companyList(container) {
    const companies = await api.get('/api/companies');

    container.innerHTML = `
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Companies</h2>
          <p class="text-slate-500">${companies.length} companies</p>
        </div>
        <button onclick="router.navigate('company-form')"
                class="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all font-medium shadow-sm">
          + Add Company
        </button>
      </div>

      <div class="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        <table class="min-w-full divide-y divide-slate-200 responsive-table">
          <thead class="bg-gradient-to-r from-slate-50 to-slate-100">
            <tr>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Technologies</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contacts</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-100">
            ${companies.length === 0 ? `
              <tr><td colspan="3" class="px-6 py-8 text-center text-slate-500">No companies yet</td></tr>
            ` : companies.map(c => `
              <tr class="hover:bg-violet-50/50 cursor-pointer transition-colors" onclick="router.navigate('company-detail', {id: '${c.id}'})">
                <td class="px-6 py-4 whitespace-nowrap font-medium text-slate-800">${this.escapeHtml(c.name)}</td>
                <td class="px-6 py-4 text-slate-600" data-label="Technologies">${this.escapeHtml(c.technologies || '-')}</td>
                <td class="px-6 py-4 whitespace-nowrap text-slate-500" data-label="Contacts">${c.contactCount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // Company Detail View
  async companyDetail(container, id) {
    const [company, allTodos] = await Promise.all([
      api.get(`/api/companies/${id}`),
      api.get('/api/todos?createdBy=all')
    ]);
    const todos = allTodos.filter(t => t.linkedType === 'company' && t.linkedId === id);

    container.innerHTML = `
      <div class="mb-6">
        <a href="#" onclick="router.navigate('companies'); return false;" class="text-violet-600 hover:text-violet-700 font-medium">
          ← Back to Companies
        </a>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-4 sm:p-6 mb-6 border border-slate-200">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-800">${this.escapeHtml(company.name)}</h2>
            ${company.technologies ? `<p class="text-slate-600 mt-1">${this.escapeHtml(company.technologies)}</p>` : ''}
          </div>
          <div class="flex gap-2">
            <button onclick="router.navigate('company-form', {id: '${company.id}'})"
                    class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm">
              Edit
            </button>
            <button onclick="views.archiveCompany('${company.id}')"
                    class="bg-amber-50 text-amber-600 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors font-medium text-sm">
              Archive
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          ${company.organizationNumber ? `<div><span class="text-slate-500">Org.nr:</span> <span class="text-slate-700">${this.escapeHtml(company.organizationNumber)}</span></div>` : ''}
          ${company.address ? `<div><span class="text-slate-500">Adress:</span> <span class="text-slate-700">${this.escapeHtml(company.address)}</span></div>` : ''}
        </div>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-4 sm:p-6 mb-6 border border-slate-200">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h3 class="text-lg font-semibold text-slate-800">Contacts (${company.contacts.length})</h3>
          <button onclick="router.navigate('contact-form', {companyId: '${company.id}'})"
                  class="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all font-medium shadow-sm text-sm">
            + Add Contact
          </button>
        </div>

        ${company.contacts.length === 0 ? `
          <p class="text-slate-500">No contacts at this company</p>
        ` : `
          <div class="space-y-3">
            ${company.contacts.map(c => `
              <div class="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-sky-50 cursor-pointer transition-colors border border-slate-100"
                   onclick="router.navigate('contact-detail', {id: '${c.id}'})">
                <div>
                  <div class="font-medium text-slate-800">${this.escapeHtml(c.name)}</div>
                  ${c.role ? `<div class="text-sm text-slate-500">${this.escapeHtml(c.role)}</div>` : ''}
                </div>
                <span class="text-slate-400">→</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">Notes & ToDos</h3>

        <form onsubmit="views.addCompanyTodo(event, '${company.id}')" class="mb-6">
          <textarea id="company-new-note" rows="3" placeholder="Add a note or ToDo..."
                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"></textarea>
          <div class="mt-2 flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" id="company-make-todo" class="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" checked>
              Make this a ToDo
            </label>
            <button type="submit" class="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all font-medium shadow-sm">
              Add
            </button>
          </div>
        </form>

        <div class="mb-3 flex gap-2 text-sm">
          <span class="text-slate-500">Sort by:</span>
          <button onclick="views.sortCompanyActivity('date')" class="company-activity-sort text-violet-600 font-medium" data-sort="date">Date <span id="sort-company-activity-date">↓</span></button>
          <button onclick="views.sortCompanyActivity('type')" class="company-activity-sort text-slate-600 hover:text-slate-800" data-sort="type">Type <span id="sort-company-activity-type"></span></button>
        </div>

        <div id="company-activity-list" class="space-y-4">
          ${this.renderCompanyActivityList(todos, company.id)}
        </div>
      </div>
    `;

    this._currentCompany = company;
    this._companyTodos = todos;
    this._companyActivitySort = 'date';
    this._companyActivitySortAsc = false;
  },

  async archiveCompany(id) {
    if (!confirm('Archive this company and all its contacts? You can restore it later from the Archive.')) return;
    try {
      await api.delete(`/api/companies/${id}`);
      router.navigate('companies');
    } catch (err) {
      console.error('Error archiving company:', err);
      alert('Failed to archive company: ' + err.message);
    }
  },

  async restoreCompany(id) {
    try {
      await api.post(`/api/companies/${id}/restore`);
      router.navigate('archive');
    } catch (err) {
      console.error('Error restoring company:', err);
      alert('Failed to restore company: ' + err.message);
    }
  },

  // Company activity list (todos only for companies, but could add company-level notes later)
  renderCompanyActivityList(todos, companyId) {
    const items = (todos || []).map(todo => ({
      type: 'todo',
      id: todo.id,
      content: todo.title,
      description: todo.description,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt,
      completed: todo.completed,
      checklistItemsState: todo.checklistItemsState || []
    }));

    if (items.length === 0) {
      return '<p class="text-slate-500">No ToDos yet</p>';
    }

    // Sort based on current sort setting
    const sortField = this._companyActivitySort || 'date';
    const sortAsc = this._companyActivitySortAsc !== undefined ? this._companyActivitySortAsc : false;

    items.sort((a, b) => {
      let result;
      if (sortField === 'type') {
        result = a.type.localeCompare(b.type);
      } else {
        result = new Date(b.createdAt) - new Date(a.createdAt);
      }
      return sortAsc ? -result : result;
    });

    return items.map(item => `
      <div class="border-l-4 ${item.completed ? 'border-slate-300 bg-slate-50/50' : 'border-emerald-400 bg-emerald-50/30'} pl-4 py-2 rounded-r-lg ${item.completed ? 'opacity-60' : ''}" data-todo-id="${item.id}">
        <div class="flex justify-between items-start">
          <div class="flex items-start flex-1">
            <input type="checkbox" ${item.completed ? 'checked' : ''}
                   onchange="views.toggleTodoInline('${item.id}', this.checked, 'company', '${companyId}')"
                   class="h-4 w-4 mt-1 text-emerald-600 rounded border-slate-300 cursor-pointer focus:ring-emerald-500">
            <div class="ml-2 flex-1">
              <span class="inline-block px-2 py-0.5 text-xs rounded-full ${item.completed ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'} font-medium mb-1">ToDo</span>
              <p class="text-slate-700 ${item.completed ? 'line-through' : ''}">${this.escapeHtml(item.content)}</p>
              ${item.description ? `<p class="text-sm text-slate-500 mt-1">${this.escapeHtml(item.description)}</p>` : ''}
              ${item.checklistItemsState && item.checklistItemsState.length > 0 ? `
              <div class="mt-2">
                <div class="text-xs font-medium text-slate-500 mb-1">Checklist (${item.checklistItemsState.filter(ci => ci.checked).length}/${item.checklistItemsState.length})</div>
                <div class="checklist-grid columns-1 sm:columns-2 lg:columns-3 gap-x-4">
                  ${item.checklistItemsState.map((ci, idx) => `
                    <div class="flex items-center gap-2 group break-inside-avoid mb-1">
                      <input type="checkbox" ${ci.checked ? 'checked' : ''} ${item.completed ? 'disabled' : ''}
                             onchange="views.toggleChecklistItemInline('${item.id}', ${idx}, this.checked, 'company', '${companyId}')"
                             class="h-3.5 w-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0">
                      <span onclick="views.startEditChecklistItemInline(this, '${item.id}', ${idx}, 'company', '${companyId}')"
                            class="text-xs ${ci.checked ? 'line-through text-slate-400' : 'text-slate-600'} ${!item.completed ? 'cursor-text hover:bg-emerald-50 rounded px-1 -mx-1' : ''}">${this.escapeHtml(ci.text)}</span>
                      ${!item.completed ? `<button onclick="views.removeChecklistItemInline('${item.id}', ${idx}, 'company', '${companyId}')" class="text-red-300 hover:text-red-500 text-xs ml-auto opacity-0 group-hover:opacity-100 shrink-0" title="Remove">&times;</button>` : ''}
                    </div>
                  `).join('')}
                </div>
                ${!item.completed ? `<button onclick="views.addChecklistItemInPlaceInline('${item.id}', 'company', '${companyId}', this)" class="text-emerald-500 hover:text-emerald-700 text-xs mt-1 flex items-center gap-1"><span class="text-base leading-none">+</span></button>` : ''}
              </div>` : ''}
              <p class="text-xs text-slate-400 mt-1">Due: ${formatDateTime(item.dueDate)} | Created: ${formatDateTime(item.createdAt)}</p>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button onclick="views.editTodoInline('${item.id}', 'company', '${companyId}')" class="text-slate-400 hover:text-slate-600 text-sm">Edit</button>
            <button onclick="views.deleteTodoInline('${item.id}', 'company', '${companyId}')" class="text-red-400 hover:text-red-600 text-sm">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  sortCompanyActivity(field) {
    if (this._companyActivitySort === field) {
      this._companyActivitySortAsc = !this._companyActivitySortAsc;
    } else {
      this._companyActivitySort = field;
      this._companyActivitySortAsc = field === 'type' ? true : false;
    }

    // Update sort indicators
    document.querySelectorAll('.company-activity-sort').forEach(btn => {
      const sortField = btn.dataset.sort;
      const indicator = document.getElementById(`sort-company-activity-${sortField}`);
      if (sortField === field) {
        btn.classList.remove('text-slate-600');
        btn.classList.add('text-violet-600', 'font-medium');
        indicator.textContent = this._companyActivitySortAsc ? '↑' : '↓';
      } else {
        btn.classList.remove('text-violet-600', 'font-medium');
        btn.classList.add('text-slate-600');
        indicator.textContent = '';
      }
    });

    // Re-render the list
    const company = this._currentCompany;
    const todos = this._companyTodos;
    if (company) {
      document.getElementById('company-activity-list').innerHTML =
        this.renderCompanyActivityList(todos, company.id);
    }
  },

  async addCompanyTodo(event, companyId) {
    event.preventDefault();
    const content = document.getElementById('company-new-note').value.trim();
    if (!content) return;

    const makeTodo = document.getElementById('company-make-todo')?.checked;

    if (makeTodo) {
      await api.post('/api/todos', {
        title: content,
        description: '',
        dueDate: new Date().toISOString(),
        linkedType: 'company',
        linkedId: companyId
      });
    }
    // Note: Companies don't have notes in the current data model, so we only support todos for now
    router.navigate('company-detail', { id: companyId });
  },

  // Company Form
  async companyForm(container, id) {
    let company = { name: '', technologies: '', organizationNumber: '', address: '' };

    if (id) {
      company = await api.get(`/api/companies/${id}`);
    }

    container.innerHTML = `
      <div class="mb-6">
        <a href="#" onclick="router.navigate('companies'); return false;" class="text-violet-600 hover:text-violet-700 font-medium">
          ← Back to Companies
        </a>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">${id ? 'Edit Company' : 'New Company'}</h2>

        <form onsubmit="views.saveCompany(event, '${id || ''}')" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
            <input type="text" id="company-name" value="${this.escapeHtml(company.name)}" required autofocus
                   class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Organisationsnr</label>
              <input type="text" id="company-orgnum" value="${this.escapeHtml(company.organizationNumber || '')}"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Adress</label>
              <input type="text" id="company-address" value="${this.escapeHtml(company.address || '')}"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Technologies</label>
            <input type="text" id="company-technologies" value="${this.escapeHtml(company.technologies || '')}"
                   placeholder="e.g., React, Node.js, PostgreSQL"
                   class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors">
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <button type="button" onclick="router.navigate('companies')"
                    class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
            <button type="submit"
                    class="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all font-medium shadow-sm">Save</button>
          </div>
        </form>
      </div>
    `;
  },

  async saveCompany(event, id) {
    event.preventDefault();

    const data = {
      name: document.getElementById('company-name').value,
      organizationNumber: document.getElementById('company-orgnum').value,
      address: document.getElementById('company-address').value,
      technologies: document.getElementById('company-technologies').value
    };

    if (id) {
      await api.put(`/api/companies/${id}`, data);
      router.navigate('company-detail', { id });
    } else {
      const company = await api.post('/api/companies', data);
      router.navigate('company-detail', { id: company.id });
    }
  },

  // ToDo List View
  async todoList(container) {
    if (this._todoOwnerFilter === undefined) {
      this._todoOwnerFilter = auth.currentUser?.id || '';
    }

    const hasTeam = auth.currentUser?.role === 'owner' || auth.currentUser?.role === 'member';
    let teamMembers = [];
    if (hasTeam) {
      try {
        const teamInfo = await api.get('/api/team');
        teamMembers = teamInfo.members || [];
      } catch (_) { /* ignore */ }
    }

    const ownerParam = this._todoOwnerFilter;
    const qs = ownerParam ? `?createdBy=${encodeURIComponent(ownerParam)}` : '';
    const todos = await api.get(`/api/todos${qs}`);

    const ownerFilterHtml = hasTeam ? `
        <select id="todo-owner-filter"
                class="ml-auto px-4 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-slate-700 text-sm"
                onchange="views.changeTodoOwner(this.value)">
          <option value="${auth.currentUser.id}" ${ownerParam === auth.currentUser.id ? 'selected' : ''}>My ToDos</option>
          ${teamMembers.filter(m => m.id !== auth.currentUser.id).map(m =>
            `<option value="${m.id}" ${ownerParam === m.id ? 'selected' : ''}>${this.escapeHtml(m.username)}</option>`
          ).join('')}
          <option value="all" ${ownerParam === 'all' ? 'selected' : ''}>All ToDos (Team)</option>
        </select>
    ` : '';

    container.innerHTML = `
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">ToDos</h2>
          <p class="text-slate-500">${todos.filter(t => !t.completed).length} active, ${todos.filter(t => t.completed).length} completed</p>
        </div>
        <button onclick="views.showAddTodoModal()"
                class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-sm">
          + Add ToDo
        </button>
      </div>

      <div class="mb-4 flex gap-2 items-center flex-wrap">
        <button onclick="views.filterTodos('all')" class="todo-filter px-4 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-medium transition-colors" data-filter="all">All</button>
        <button onclick="views.filterTodos('active')" class="todo-filter px-4 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition-colors" data-filter="active">Active</button>
        <button onclick="views.filterTodos('completed')" class="todo-filter px-4 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition-colors" data-filter="completed">Completed</button>
        ${ownerFilterHtml}
      </div>

      <div class="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        <div class="flex items-center px-4 sm:px-6 py-3 border-b border-slate-100 bg-emerald-50/30">
          <span class="h-5 w-5 rounded border border-dashed border-slate-300 shrink-0" aria-hidden="true"></span>
          <input type="text" id="quick-add-todo" placeholder="Skriv en ny ToDo och tryck Enter…"
                 onkeydown="views.quickAddTodoKey(event)" autocomplete="off"
                 class="ml-4 flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 text-sm">
        </div>
        <div id="todos-list" class="divide-y divide-slate-100">
          ${this.renderTodoRows(todos)}
        </div>
      </div>
    `;

    this._todos = todos;
    this._todoFilter = 'all';
  },

  renderTodoRows(todos) {
    if (todos.length === 0) {
      return `<div class="px-6 py-8 text-center text-slate-500">No ToDos found</div>`;
    }
    return todos.map(t => {
      const linkedLabel = t.linkedType === 'contact' ? `${this.escapeHtml(t.linkedName)} @ ${this.escapeHtml(t.linkedCompanyName || '')}` :
                          t.linkedType === 'candidate' ? `${this.escapeHtml(t.linkedName)} (Candidate)` :
                          t.linkedType === 'general' ? (t.linkedId === 'email' ? '(From email)' : '(No link)') :
                          this.escapeHtml(t.linkedName);
      const hasChecklist = t.checklistItemsState && t.checklistItemsState.length > 0;
      const checkedCount = hasChecklist ? t.checklistItemsState.filter(i => i.checked).length : 0;
      const totalCount = hasChecklist ? t.checklistItemsState.length : 0;

      return `
      <div class="flex flex-wrap items-start px-4 sm:px-6 py-4 ${t.completed ? 'bg-slate-50' : 'hover:bg-emerald-50/30'} transition-colors" data-todo-id="${t.id}">
        <input type="checkbox" ${t.completed ? 'checked' : ''}
               onchange="views.toggleTodo('${t.id}', this.checked)"
               class="h-5 w-5 mt-1 text-emerald-600 rounded border-slate-300 cursor-pointer focus:ring-emerald-500">
        <div class="ml-4 flex-1 min-w-0 ${t.completed ? 'opacity-50' : ''}">
          <div class="font-medium text-slate-800 ${t.completed ? 'line-through' : ''}">${this.escapeHtml(t.title)}</div>
          ${t.description ? `<div class="text-sm text-slate-600 mt-1">${this.escapeHtml(t.description)}</div>` : ''}
          ${hasChecklist ? `
          <div class="mt-2 ml-1">
            <div class="text-xs font-medium text-slate-500 mb-1">Checklist (${checkedCount}/${totalCount})</div>
            <div class="checklist-grid columns-1 sm:columns-2 lg:columns-3 gap-x-4">
              ${t.checklistItemsState.map((item, idx) => `
                <div class="flex items-center gap-2 group break-inside-avoid mb-1">
                  <input type="checkbox" ${item.checked ? 'checked' : ''} ${t.completed ? 'disabled' : ''}
                         onchange="views.toggleChecklistItem('${t.id}', ${idx}, this.checked)"
                         class="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0">
                  <span onclick="views.startEditChecklistItem(this, '${t.id}', ${idx})"
                        class="text-sm ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'} ${!t.completed ? 'cursor-text hover:bg-emerald-50 rounded px-1 -mx-1' : ''}">${this.escapeHtml(item.text)}</span>
                  ${!t.completed ? `<button onclick="views.removeChecklistItem('${t.id}', ${idx})" class="text-red-300 hover:text-red-500 text-xs ml-auto opacity-0 group-hover:opacity-100 shrink-0" title="Remove">&times;</button>` : ''}
                </div>
              `).join('')}
            </div>
            ${!t.completed ? `<button onclick="views.addChecklistItemInPlace('${t.id}', this)" class="text-emerald-500 hover:text-emerald-700 text-sm mt-1 flex items-center gap-1"><span class="text-lg leading-none">+</span></button>` : ''}
          </div>` : `
          ${!t.completed ? `<button onclick="views.addChecklistItemInPlace('${t.id}', this)" class="text-emerald-500 hover:text-emerald-700 text-xs mt-1 flex items-center gap-1"><span class="text-base leading-none">+</span> <span>Add checklist</span></button>` : ''}
          `}
          <div class="text-sm text-slate-500 mt-1">
            <span class="mr-3">${linkedLabel}</span>
            <span class="text-slate-400">Due: ${formatDateTime(t.dueDate)}</span>
          </div>
        </div>
        <div class="flex gap-2 ml-9 sm:ml-0 mt-2 sm:mt-0">
          ${t.linkedType !== 'general' ? `<button onclick="views.navigateToLinked('${t.linkedType}', '${t.linkedId}')" class="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View</button>` : ''}
          <button onclick="views.editTodo('${t.id}')" class="text-slate-400 hover:text-slate-600 text-sm">Edit</button>
          <button onclick="views.deleteTodo('${t.id}')" class="text-red-400 hover:text-red-600 text-sm">Delete</button>
        </div>
      </div>`;
    }).join('');
  },

  async changeTodoOwner(value) {
    this._todoOwnerFilter = value;
    const container = document.getElementById('app');
    if (container) await this.todoList(container);
  },

  async filterTodos(filter) {
    this._todoFilter = filter;

    // Update button styles
    document.querySelectorAll('.todo-filter').forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.remove('bg-slate-100', 'text-slate-600');
        btn.classList.add('bg-emerald-100', 'text-emerald-700');
      } else {
        btn.classList.remove('bg-emerald-100', 'text-emerald-700');
        btn.classList.add('bg-slate-100', 'text-slate-600');
      }
    });

    let filtered = this._todos;
    if (filter === 'active') {
      filtered = this._todos.filter(t => !t.completed);
    } else if (filter === 'completed') {
      filtered = this._todos.filter(t => t.completed);
    }

    document.getElementById('todos-list').innerHTML = this.renderTodoRows(filtered);
  },

  // Quick-add: create an unlinked (general) ToDo straight from the top row of
  // the list, without opening the modal. Enter submits; focus returns to the
  // input so several todos can be added in a row.
  async quickAddTodoKey(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const input = event.target;
    const title = input.value.trim();
    if (!title) return;

    input.disabled = true;
    try {
      await api.post('/api/todos', {
        title,
        description: '',
        dueDate: new Date().toISOString(),
        linkedType: 'general',
        linkedId: 'none',
        checklistId: null
      });
    } catch (err) {
      input.disabled = false;
      input.focus();
      alert('Could not create ToDo: ' + (err.message || err));
      return;
    }

    const container = document.getElementById('app');
    if (container) await this.todoList(container);
    const fresh = document.getElementById('quick-add-todo');
    if (fresh) fresh.focus();
  },

  async toggleTodo(id, completed) {
    await api.put(`/api/todos/${id}`, { completed });
    router.navigate('todos');
  },

  navigateToLinked(type, id) {
    if (type === 'contact') {
      router.navigate('contact-detail', { id });
    } else if (type === 'candidate') {
      router.navigate('candidate-detail', { id });
    } else if (type === 'general') {
      // General/email-generated todos have no linked entity
      return;
    } else {
      router.navigate('company-detail', { id });
    }
  },

  async showAddTodoModal(linkedType = null, linkedId = null) {
    const [companies, contacts, candidates, checklists] = await Promise.all([
      api.get('/api/companies'),
      api.get('/api/contacts'),
      api.get('/api/candidates'),
      api.get('/api/checklists')
    ]);

    modal.show(`
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Add ToDo</h3>
      <form onsubmit="views.saveTodo(event)">
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
          <input type="text" id="todo-title" required autofocus
                 class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Link to</label>
          <select id="todo-linked-type" onchange="views.updateLinkedOptions()"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
            <option value="general" ${(!linkedType || linkedType === 'general') ? 'selected' : ''}>None (no link)</option>
            <option value="contact" ${linkedType === 'contact' ? 'selected' : ''}>Contact</option>
            <option value="company" ${linkedType === 'company' ? 'selected' : ''}>Company</option>
            <option value="candidate" ${linkedType === 'candidate' ? 'selected' : ''}>Candidate</option>
          </select>
        </div>

        <div id="todo-link-target" class="mb-4" ${(!linkedType || linkedType === 'general') ? 'style="display:none"' : ''}>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Select</label>
          <select id="todo-linked-id"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
            ${linkedType === 'company' ?
              companies.map(c => `<option value="${c.id}" ${c.id === linkedId ? 'selected' : ''}>${this.escapeHtml(c.name)}</option>`).join('') :
              linkedType === 'candidate' ?
              candidates.map(c => `<option value="${c.id}" ${c.id === linkedId ? 'selected' : ''}>${this.escapeHtml(c.name)}${c.role ? ' - ' + this.escapeHtml(c.role) : ''}</option>`).join('') :
              contacts.map(c => `<option value="${c.id}" ${c.id === linkedId ? 'selected' : ''}>${this.escapeHtml(c.name)} @ ${this.escapeHtml(c.companyName)}</option>`).join('')
            }
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Checklist</label>
          <div class="flex gap-2">
            <select id="todo-checklist-id"
                    class="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
              <option value="">No checklist</option>
              ${checklists.map(cl => `<option value="${cl.id}">${this.escapeHtml(cl.name)} (${cl.items.length} items)</option>`).join('')}
            </select>
            <button type="button" onclick="views.showChecklistManager()"
                    class="px-3 py-2.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors" title="Manage checklists">
              Manage
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
          <input type="datetime-local" id="todo-due-date" value="${new Date().toISOString().slice(0, 16)}"
                 class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea id="todo-description" rows="3" placeholder="Additional details..."
                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"></textarea>
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" onclick="modal.hide()" class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
          <button type="submit" class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 font-medium shadow-sm">Save</button>
        </div>
      </form>
    `);

    // Store data for updateLinkedOptions
    this._modalCompanies = companies;
    this._modalContacts = contacts;
    this._modalCandidates = candidates;
    this._modalChecklists = checklists;
  },

  updateLinkedOptions() {
    const type = document.getElementById('todo-linked-type').value;
    const target = document.getElementById('todo-link-target');
    const select = document.getElementById('todo-linked-id');

    if (type === 'general') {
      if (target) target.style.display = 'none';
      return;
    }
    if (target) target.style.display = '';

    if (type === 'company') {
      select.innerHTML = this._modalCompanies.map(c =>
        `<option value="${c.id}">${this.escapeHtml(c.name)}</option>`
      ).join('');
    } else if (type === 'candidate') {
      select.innerHTML = this._modalCandidates.map(c =>
        `<option value="${c.id}">${this.escapeHtml(c.name)}${c.role ? ' - ' + this.escapeHtml(c.role) : ''}</option>`
      ).join('');
    } else {
      select.innerHTML = this._modalContacts.map(c =>
        `<option value="${c.id}">${this.escapeHtml(c.name)} @ ${this.escapeHtml(c.companyName)}</option>`
      ).join('');
    }
  },

  async saveTodo(event) {
    event.preventDefault();

    const dueDateInput = document.getElementById('todo-due-date').value;
    const checklistId = document.getElementById('todo-checklist-id').value;
    const linkedType = document.getElementById('todo-linked-type').value;
    const linkedId = linkedType === 'general'
      ? 'none'
      : document.getElementById('todo-linked-id').value;

    if (linkedType !== 'general' && !linkedId) {
      alert('Please choose what to link this ToDo to (or pick "None").');
      return;
    }

    const data = {
      title: document.getElementById('todo-title').value,
      description: document.getElementById('todo-description').value,
      dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : new Date().toISOString(),
      linkedType,
      linkedId,
      checklistId: checklistId || null
    };

    await api.post('/api/todos', data);
    modal.hide();
    router.navigate('todos');
  },

  async editTodo(id) {
    const todo = this._todos.find(t => t.id === id);
    if (!todo) return;

    const [companies, contacts, candidates, checklists] = await Promise.all([
      api.get('/api/companies'),
      api.get('/api/contacts'),
      api.get('/api/candidates'),
      api.get('/api/checklists')
    ]);

    const dueDateValue = todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : '';

    const renderLinkedOptions = (type, selectedId) => {
      if (type === 'company') {
        return companies.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${this.escapeHtml(c.name)}</option>`).join('');
      } else if (type === 'candidate') {
        return candidates.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${this.escapeHtml(c.name)}${c.role ? ' - ' + this.escapeHtml(c.role) : ''}</option>`).join('');
      }
      return contacts.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${this.escapeHtml(c.name)} @ ${this.escapeHtml(c.companyName)}</option>`).join('');
    };

    modal.show(`
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Edit ToDo</h3>
      <form onsubmit="views.updateTodo(event, '${id}')">
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
          <input type="text" id="edit-todo-title" value="${this.escapeHtml(todo.title)}" required autofocus
                 class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Link to *</label>
          <select id="edit-todo-linked-type" onchange="views.updateEditLinkedOptions()"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
            <option value="general" ${todo.linkedType === 'general' ? 'selected' : ''}>None (no link)</option>
            <option value="contact" ${todo.linkedType === 'contact' ? 'selected' : ''}>Contact</option>
            <option value="company" ${todo.linkedType === 'company' ? 'selected' : ''}>Company</option>
            <option value="candidate" ${todo.linkedType === 'candidate' ? 'selected' : ''}>Candidate</option>
          </select>
        </div>

        <div id="edit-todo-link-target" class="mb-4" ${todo.linkedType === 'general' ? 'style="display:none"' : ''}>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Select</label>
          <select id="edit-todo-linked-id"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
            ${renderLinkedOptions(todo.linkedType, todo.linkedId)}
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Checklist</label>
          <select id="edit-todo-checklist-id"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
            <option value="">No checklist</option>
            ${checklists.map(cl => `<option value="${cl.id}" ${cl.id === todo.checklistId ? 'selected' : ''}>${this.escapeHtml(cl.name)} (${cl.items.length} items)</option>`).join('')}
          </select>
          <p class="text-xs text-slate-400 mt-1">Changing checklist will reset checklist progress</p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
          <input type="datetime-local" id="edit-todo-due-date" value="${dueDateValue}"
                 class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea id="edit-todo-description" rows="3"
                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">${this.escapeHtml(todo.description || '')}</textarea>
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" onclick="modal.hide()" class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
          <button type="submit" class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 font-medium shadow-sm">Save</button>
        </div>
      </form>
    `);

    this._editModalCompanies = companies;
    this._editModalContacts = contacts;
    this._editModalCandidates = candidates;
    this._editTodoOriginal = todo;
  },

  updateEditLinkedOptions() {
    const type = document.getElementById('edit-todo-linked-type').value;
    const target = document.getElementById('edit-todo-link-target');
    const select = document.getElementById('edit-todo-linked-id');

    if (type === 'general') {
      if (target) target.style.display = 'none';
      return;
    }
    if (target) target.style.display = '';

    if (type === 'company') {
      select.innerHTML = this._editModalCompanies.map(c =>
        `<option value="${c.id}">${this.escapeHtml(c.name)}</option>`
      ).join('');
    } else if (type === 'candidate') {
      select.innerHTML = this._editModalCandidates.map(c =>
        `<option value="${c.id}">${this.escapeHtml(c.name)}${c.role ? ' - ' + this.escapeHtml(c.role) : ''}</option>`
      ).join('');
    } else {
      select.innerHTML = this._editModalContacts.map(c =>
        `<option value="${c.id}">${this.escapeHtml(c.name)} @ ${this.escapeHtml(c.companyName)}</option>`
      ).join('');
    }
  },

  async updateTodo(event, id) {
    event.preventDefault();

    const title = document.getElementById('edit-todo-title').value.trim();
    if (!title) return;

    const dueDateInput = document.getElementById('edit-todo-due-date').value;
    const newChecklistId = document.getElementById('edit-todo-checklist-id').value || null;
    const original = this._editTodoOriginal;

    const newLinkedType = document.getElementById('edit-todo-linked-type').value;
    const updateData = {
      title,
      description: document.getElementById('edit-todo-description').value,
      dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : null,
      linkedType: newLinkedType,
      linkedId: newLinkedType === 'general' ? 'none' : document.getElementById('edit-todo-linked-id').value
    };

    // Only send checklistId if it changed (to trigger rebuild of items)
    if (newChecklistId !== (original?.checklistId || null)) {
      updateData.checklistId = newChecklistId;
    }

    await api.put(`/api/todos/${id}`, updateData);
    modal.hide();
    router.navigate('todos');
  },

  async deleteTodo(id) {
    if (!confirm('Delete this ToDo?')) return;
    await api.delete(`/api/todos/${id}`);
    router.navigate('todos');
  },

  addChecklistItemInPlace(todoId, btn) {
    // Insert an inline input before the + button
    const container = btn.closest('.ml-1') || btn.parentElement;
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center gap-2 mb-1 mt-1';
    wrapper.innerHTML = `
      <input type="checkbox" disabled class="h-4 w-4 text-emerald-600 rounded border-slate-300 shrink-0">
      <input type="text" placeholder="New step..." autofocus
             class="text-sm border border-emerald-300 rounded px-2 py-0.5 flex-1 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
    `;
    btn.before(wrapper);
    const input = wrapper.querySelector('input[type="text"]');
    input.focus();

    const save = async () => {
      const text = input.value.trim();
      if (!text) { wrapper.remove(); return; }
      const todo = this._todos.find(t => t.id === todoId);
      if (!todo) return;
      const updatedItems = [...(todo.checklistItemsState || []), { text, checked: false }];
      todo.checklistItemsState = updatedItems;
      await api.put(`/api/todos/${todoId}`, { checklistItemsState: updatedItems });
      router.navigate('todos');
    };
    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { wrapper.remove(); }
    });
  },

  startEditChecklistItem(span, todoId, itemIndex) {
    const todo = this._todos?.find(t => t.id === todoId);
    if (!todo || todo.completed) return;

    const currentText = todo.checklistItemsState[itemIndex].text;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'text-sm border border-emerald-300 rounded px-1 py-0 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full';

    span.replaceWith(input);
    input.focus();
    input.select();

    const save = async () => {
      const newText = input.value.trim();
      if (!newText || newText === currentText) {
        // Restore original span
        const newSpan = document.createElement('span');
        newSpan.className = span.className;
        newSpan.textContent = currentText;
        newSpan.setAttribute('onclick', span.getAttribute('onclick'));
        input.replaceWith(newSpan);
        return;
      }
      const updatedItems = [...todo.checklistItemsState];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], text: newText };
      todo.checklistItemsState = updatedItems;
      await api.put(`/api/todos/${todoId}`, { checklistItemsState: updatedItems });
      router.navigate('todos');
    };
    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = currentText; input.blur(); }
    });
  },

  async removeChecklistItem(todoId, itemIndex) {
    const todo = this._todos.find(t => t.id === todoId);
    if (!todo) return;

    const updatedItems = todo.checklistItemsState.filter((_, idx) => idx !== itemIndex);
    todo.checklistItemsState = updatedItems;

    await api.put(`/api/todos/${todoId}`, { checklistItemsState: updatedItems });
    router.navigate('todos');
  },

  async toggleChecklistItem(todoId, itemIndex, checked) {
    const todo = this._todos.find(t => t.id === todoId);
    if (!todo) return;

    const updatedItems = [...todo.checklistItemsState];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], checked };
    todo.checklistItemsState = updatedItems;

    await api.put(`/api/todos/${todoId}`, { checklistItemsState: updatedItems });
  },

  async showChecklistManager() {
    // Save current form state before switching to manager
    this._todoFormState = {
      title: document.getElementById('todo-title')?.value || '',
      description: document.getElementById('todo-description')?.value || '',
      dueDate: document.getElementById('todo-due-date')?.value || '',
      linkedType: document.getElementById('todo-linked-type')?.value || 'contact',
      linkedId: document.getElementById('todo-linked-id')?.value || '',
      checklistId: document.getElementById('todo-checklist-id')?.value || ''
    };
    modal.hide();
    const checklists = await api.get('/api/checklists');
    this._managedChecklists = checklists;

    modal.show(`
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Manage Checklists</h3>
      <div id="checklist-manager-list" class="mb-4 max-h-64 overflow-y-auto">
        ${this.renderChecklistManagerList(checklists)}
      </div>
      <div class="border-t border-slate-200 pt-4">
        <h4 class="text-sm font-medium text-slate-700 mb-2">Create New Checklist</h4>
        <div class="mb-3">
          <input type="text" id="new-checklist-name" placeholder="Checklist name..." autofocus
                 class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm">
        </div>
        <div id="new-checklist-items" class="mb-3 space-y-2">
          <div class="flex gap-2">
            <input type="text" placeholder="Step 1..." class="checklist-item-input flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            <button type="button" onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-600 text-sm px-2">Remove</button>
          </div>
        </div>
        <div class="flex gap-2 mb-3">
          <button type="button" onclick="views.addChecklistItemInput()"
                  class="text-sm text-emerald-600 hover:text-emerald-700 font-medium">+ Add Step</button>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" onclick="views.closeChecklistManager()"
                  class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Back</button>
          <button type="button" onclick="views.saveNewChecklist()"
                  class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 font-medium shadow-sm text-sm">Create Checklist</button>
        </div>
      </div>
    `);
  },

  renderChecklistManagerList(checklists) {
    if (checklists.length === 0) {
      return '<p class="text-sm text-slate-500 py-2">No checklists yet. Create one below.</p>';
    }
    return checklists.map(cl => `
      <div class="flex items-start justify-between py-2 border-b border-slate-100 last:border-0">
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm text-slate-800">${this.escapeHtml(cl.name)}</div>
          <div class="text-xs text-slate-500 mt-0.5">${cl.items.length} steps - by ${this.escapeHtml(cl.createdByUsername || 'unknown')}</div>
          <div class="text-xs text-slate-400 mt-0.5">${cl.items.map(i => this.escapeHtml(i)).join(', ')}</div>
        </div>
        <div class="flex gap-1 ml-2">
          <button onclick="views.editChecklist('${cl.id}')" class="text-slate-400 hover:text-slate-600 text-xs px-1">Edit</button>
          <button onclick="views.deleteChecklist('${cl.id}')" class="text-red-400 hover:text-red-600 text-xs px-1">Delete</button>
        </div>
      </div>
    `).join('');
  },

  addChecklistItemInput() {
    const container = document.getElementById('new-checklist-items') || document.getElementById('edit-checklist-items');
    const count = container.querySelectorAll('.checklist-item-input').length + 1;
    const div = document.createElement('div');
    div.className = 'flex gap-2';
    div.innerHTML = `
      <input type="text" placeholder="Step ${count}..." class="checklist-item-input flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
      <button type="button" onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-600 text-sm px-2">Remove</button>
    `;
    container.appendChild(div);
  },

  async saveNewChecklist() {
    const name = document.getElementById('new-checklist-name').value.trim();
    if (!name) return alert('Please enter a checklist name');

    const inputs = document.querySelectorAll('#new-checklist-items .checklist-item-input');
    const items = Array.from(inputs).map(i => i.value.trim()).filter(i => i);
    if (items.length === 0) return alert('Please add at least one step');

    await api.post('/api/checklists', { name, items });
    this.showChecklistManager();
  },

  async editChecklist(id) {
    const checklists = await api.get('/api/checklists');
    const cl = checklists.find(c => c.id === id);
    if (!cl) return;

    modal.show(`
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Edit Checklist</h3>
      <div class="mb-3">
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
        <input type="text" id="edit-checklist-name" value="${this.escapeHtml(cl.name)}" autofocus
               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm">
      </div>
      <div class="mb-3">
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Steps</label>
        <div id="edit-checklist-items" class="space-y-2">
          ${cl.items.map((item, idx) => `
            <div class="flex gap-2">
              <input type="text" value="${this.escapeHtml(item)}" class="checklist-item-input flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <button type="button" onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-600 text-sm px-2">Remove</button>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="mb-3">
        <button type="button" onclick="views.addChecklistItemInput()"
                class="text-sm text-emerald-600 hover:text-emerald-700 font-medium">+ Add Step</button>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" onclick="views.showChecklistManager()"
                class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Back</button>
        <button type="button" onclick="views.saveEditChecklist('${id}')"
                class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 font-medium shadow-sm text-sm">Save</button>
      </div>
    `);
  },

  async saveEditChecklist(id) {
    const name = document.getElementById('edit-checklist-name').value.trim();
    if (!name) return alert('Please enter a checklist name');

    const inputs = document.querySelectorAll('#edit-checklist-items .checklist-item-input');
    const items = Array.from(inputs).map(i => i.value.trim()).filter(i => i);
    if (items.length === 0) return alert('Please add at least one step');

    try {
      await api.put(`/api/checklists/${id}`, { name, items });
      this.showChecklistManager();
    } catch (err) {
      alert(err.message || 'Failed to update checklist');
    }
  },

  async deleteChecklist(id) {
    if (!confirm('Delete this checklist? Existing ToDos using it will keep their current steps.')) return;
    try {
      await api.delete(`/api/checklists/${id}`);
      this.showChecklistManager();
    } catch (err) {
      alert(err.message || 'Failed to delete checklist');
    }
  },

  async closeChecklistManager() {
    modal.hide();
    const state = this._todoFormState;
    // Re-open the add todo modal with preserved linked type/id
    await this.showAddTodoModal(state?.linkedType || null, state?.linkedId || null);
    // Restore all form fields after modal is shown
    if (state) {
      const titleEl = document.getElementById('todo-title');
      const descEl = document.getElementById('todo-description');
      const dateEl = document.getElementById('todo-due-date');
      const checklistEl = document.getElementById('todo-checklist-id');
      if (titleEl) titleEl.value = state.title;
      if (descEl) descEl.value = state.description;
      if (dateEl) dateEl.value = state.dueDate;
      if (checklistEl) checklistEl.value = state.checklistId;
      this._todoFormState = null;
    }
  },

  addChecklistItemInPlaceInline(todoId, linkedType, linkedId, btn) {
    const container = btn.parentElement;
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center gap-2 mb-1 mt-1';
    wrapper.innerHTML = `
      <input type="checkbox" disabled class="h-3.5 w-3.5 text-emerald-600 rounded border-slate-300 shrink-0">
      <input type="text" placeholder="New step..." autofocus
             class="text-xs border border-emerald-300 rounded px-2 py-0.5 flex-1 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
    `;
    btn.before(wrapper);
    const input = wrapper.querySelector('input[type="text"]');
    input.focus();

    const save = async () => {
      const text = input.value.trim();
      if (!text) { wrapper.remove(); return; }
      const todos = this._todosCacheFor(linkedType);
      const todo = todos?.find(t => t.id === todoId);
      if (!todo) return;
      const updatedItems = [...(todo.checklistItemsState || []), { text, checked: false }];
      todo.checklistItemsState = updatedItems;
      await api.put(`/api/todos/${todoId}`, { checklistItemsState: updatedItems });
      this._navigateDetail(linkedType, linkedId);
    };
    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { wrapper.remove(); }
    });
  },

  _todosCacheFor(linkedType) {
    if (linkedType === 'contact') return this._currentTodos;
    if (linkedType === 'candidate') return this._candidateTodos;
    return this._companyTodos;
  },

  _navigateDetail(linkedType, linkedId) {
    if (linkedType === 'contact') router.navigate('contact-detail', { id: linkedId });
    else if (linkedType === 'candidate') router.navigate('candidate-detail', { id: linkedId });
    else router.navigate('company-detail', { id: linkedId });
  },

  startEditChecklistItemInline(span, todoId, itemIndex, linkedType, linkedId) {
    const todos = this._todosCacheFor(linkedType);
    const todo = todos?.find(t => t.id === todoId);
    if (!todo || todo.completed) return;

    const currentText = todo.checklistItemsState[itemIndex].text;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'text-xs border border-emerald-300 rounded px-1 py-0 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full';

    span.replaceWith(input);
    input.focus();
    input.select();

    const save = async () => {
      const newText = input.value.trim();
      if (!newText || newText === currentText) {
        const newSpan = document.createElement('span');
        newSpan.className = span.className;
        newSpan.textContent = currentText;
        newSpan.setAttribute('onclick', span.getAttribute('onclick'));
        input.replaceWith(newSpan);
        return;
      }
      const updatedItems = [...todo.checklistItemsState];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], text: newText };
      todo.checklistItemsState = updatedItems;
      await api.put(`/api/todos/${todoId}`, { checklistItemsState: updatedItems });
      this._navigateDetail(linkedType, linkedId);
    };
    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = currentText; input.blur(); }
    });
  },

  async removeChecklistItemInline(todoId, itemIndex, linkedType, linkedId) {
    const todos = this._todosCacheFor(linkedType);
    const todo = todos?.find(t => t.id === todoId);
    if (!todo) return;

    const updatedItems = todo.checklistItemsState.filter((_, idx) => idx !== itemIndex);
    todo.checklistItemsState = updatedItems;

    await api.put(`/api/todos/${todoId}`, { checklistItemsState: updatedItems });
    this._navigateDetail(linkedType, linkedId);
  },

  async toggleChecklistItemInline(todoId, itemIndex, checked, linkedType, linkedId) {
    const todos = this._todosCacheFor(linkedType);
    const todo = todos?.find(t => t.id === todoId);
    if (!todo) return;

    const updatedItems = [...todo.checklistItemsState];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], checked };
    todo.checklistItemsState = updatedItems;

    await api.put(`/api/todos/${todoId}`, { checklistItemsState: updatedItems });
    this._navigateDetail(linkedType, linkedId);
  },

  async toggleTodoInline(todoId, completed, linkedType, linkedId) {
    await api.put(`/api/todos/${todoId}`, { completed });
    this._navigateDetail(linkedType, linkedId);
  },

  async editTodoInline(todoId, linkedType, linkedId) {
    const todos = this._todosCacheFor(linkedType);
    const todo = todos?.find(t => t.id === todoId);
    if (!todo) return;

    const [companies, contacts, candidates, checklists] = await Promise.all([
      api.get('/api/companies'),
      api.get('/api/contacts'),
      api.get('/api/candidates'),
      api.get('/api/checklists')
    ]);

    const dueDateValue = todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : '';

    const renderLinkedOptions = (type, selectedId) => {
      if (type === 'company') {
        return companies.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${this.escapeHtml(c.name)}</option>`).join('');
      } else if (type === 'candidate') {
        return candidates.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${this.escapeHtml(c.name)}${c.role ? ' - ' + this.escapeHtml(c.role) : ''}</option>`).join('');
      }
      return contacts.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${this.escapeHtml(c.name)} @ ${this.escapeHtml(c.companyName)}</option>`).join('');
    };

    modal.show(`
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Edit ToDo</h3>
      <form onsubmit="views.updateTodoInline(event, '${todoId}', '${linkedType}', '${linkedId}')">
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
          <input type="text" id="edit-todo-title" value="${this.escapeHtml(todo.title)}" required autofocus
                 class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Link to *</label>
          <select id="edit-todo-linked-type" onchange="views.updateEditLinkedOptions()"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
            <option value="general" ${todo.linkedType === 'general' ? 'selected' : ''}>None (no link)</option>
            <option value="contact" ${todo.linkedType === 'contact' ? 'selected' : ''}>Contact</option>
            <option value="company" ${todo.linkedType === 'company' ? 'selected' : ''}>Company</option>
            <option value="candidate" ${todo.linkedType === 'candidate' ? 'selected' : ''}>Candidate</option>
          </select>
        </div>

        <div id="edit-todo-link-target" class="mb-4" ${todo.linkedType === 'general' ? 'style="display:none"' : ''}>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Select</label>
          <select id="edit-todo-linked-id"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
            ${renderLinkedOptions(todo.linkedType, todo.linkedId)}
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Checklist</label>
          <select id="edit-todo-checklist-id"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
            <option value="">No checklist</option>
            ${checklists.map(cl => `<option value="${cl.id}" ${cl.id === todo.checklistId ? 'selected' : ''}>${this.escapeHtml(cl.name)} (${cl.items.length} items)</option>`).join('')}
          </select>
          <p class="text-xs text-slate-400 mt-1">Changing checklist will reset checklist progress</p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
          <input type="datetime-local" id="edit-todo-due-date" value="${dueDateValue}"
                 class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea id="edit-todo-description" rows="3"
                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">${this.escapeHtml(todo.description || '')}</textarea>
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" onclick="modal.hide()" class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
          <button type="submit" class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 font-medium shadow-sm">Save</button>
        </div>
      </form>
    `);

    this._editModalCompanies = companies;
    this._editModalContacts = contacts;
    this._editModalCandidates = candidates;
    this._editTodoOriginal = todo;
  },

  async updateTodoInline(event, todoId, origLinkedType, origLinkedId) {
    event.preventDefault();

    const title = document.getElementById('edit-todo-title').value.trim();
    if (!title) return;

    const dueDateInput = document.getElementById('edit-todo-due-date').value;
    const newChecklistId = document.getElementById('edit-todo-checklist-id').value || null;
    const original = this._editTodoOriginal;
    const newLinkedType = document.getElementById('edit-todo-linked-type').value;
    const newLinkedId = newLinkedType === 'general' ? 'none' : document.getElementById('edit-todo-linked-id').value;

    const updateData = {
      title,
      description: document.getElementById('edit-todo-description').value,
      dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : null,
      linkedType: newLinkedType,
      linkedId: newLinkedId
    };

    if (newChecklistId !== (original?.checklistId || null)) {
      updateData.checklistId = newChecklistId;
    }

    await api.put(`/api/todos/${todoId}`, updateData);
    modal.hide();
    this._navigateDetail(origLinkedType, origLinkedId);
  },

  async deleteTodoInline(todoId, linkedType, linkedId) {
    if (!confirm('Delete this ToDo?')) return;
    await api.delete(`/api/todos/${todoId}`);
    this._navigateDetail(linkedType, linkedId);
  },

  // ============ Candidate Views ============

  // Candidate category labels
  _candidateCategories: {
    in_progress: 'In Progress',
    employed_no_assignment: 'Anställd utan uppdrag',
    declined: 'Declined',
    not_qualified: 'Not Qualified',
    contact_later: 'Contact Later',
    hired: 'Hired'
  },

  // Candidate List View
  async candidateList(container) {
    // Initialize owner filter default = current user on first entry
    if (this._candidateOwnerFilter === undefined) {
      this._candidateOwnerFilter = auth.currentUser?.id || '';
    }

    const hasTeam = auth.currentUser?.role === 'owner' || auth.currentUser?.role === 'member';
    let teamMembers = [];
    if (hasTeam) {
      try {
        const teamInfo = await api.get('/api/team');
        teamMembers = teamInfo.members || [];
      } catch (_) { /* ignore */ }
    }

    const ownerParam = this._candidateOwnerFilter;
    // Always fetch the broadest set so search can fall back to "all candidates / all categories"
    const qs = hasTeam ? '?createdBy=all' : '';
    const candidates = await api.get(`/api/candidates${qs}`);
    const categoryLabels = this._candidateCategories;

    const ownerFilterHtml = hasTeam ? `
        <select id="candidate-owner-filter"
                class="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors bg-white text-slate-700"
                onchange="views.changeCandidateOwner(this.value)">
          <option value="${auth.currentUser.id}" ${ownerParam === auth.currentUser.id ? 'selected' : ''}>My Candidates</option>
          ${teamMembers.filter(m => m.id !== auth.currentUser.id).map(m =>
            `<option value="${m.id}" ${ownerParam === m.id ? 'selected' : ''}>${this.escapeHtml(m.username)}</option>`
          ).join('')}
          <option value="all" ${ownerParam === 'all' ? 'selected' : ''}>All Candidates (Team)</option>
        </select>
    ` : '';

    container.innerHTML = `
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Candidates</h2>
          <p class="text-slate-500">${candidates.length} candidates</p>
        </div>
        <div class="flex gap-2">
          <button onclick="views.showCVImportModal()"
                  class="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2.5 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all font-medium shadow-sm text-sm">
            Import CVs
          </button>
          <button onclick="router.navigate('candidate-form')"
                  class="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-5 py-2.5 rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all font-medium shadow-sm">
            + Add Candidate
          </button>
        </div>
      </div>

      <div class="mb-4 flex flex-col sm:flex-row gap-3">
        <input type="text" id="candidate-search-input" placeholder="Search candidates..." autofocus
               class="w-full sm:flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
               oninput="views.filterCandidates()" onkeydown="views.candidateSearchKey(event)" autocomplete="off">
        ${ownerFilterHtml}
        <select id="candidate-category-filter"
                class="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors bg-white text-slate-700"
                onchange="views.filterCandidates()">
          <option value="">All Categories</option>
          ${Object.entries(categoryLabels).map(([key, label]) =>
            `<option value="${key}" ${key === 'in_progress' ? 'selected' : ''}>${label}</option>`
          ).join('')}
        </select>
      </div>

      <div class="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        <!-- Mobile sort controls -->
        <div class="md:hidden px-4 py-2 bg-slate-50 border-b border-slate-200 flex gap-2 flex-wrap">
          <span class="text-xs text-slate-500 self-center">Sort:</span>
          <button onclick="views.sortCandidates('name')" class="text-xs px-2 py-1 rounded bg-slate-200 text-slate-700">Name <span id="sort-candidate-name-m" class="text-rose-600"></span></button>
          <button onclick="views.sortCandidates('role')" class="text-xs px-2 py-1 rounded bg-slate-200 text-slate-700">Role <span id="sort-candidate-role-m"></span></button>
        </div>
        <table class="min-w-full divide-y divide-slate-200 responsive-table">
          <thead class="bg-gradient-to-r from-slate-50 to-slate-100">
            <tr>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onclick="views.sortCandidates('name')">
                Name <span id="sort-candidate-name" class="text-rose-600"></span>
              </th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onclick="views.sortCandidates('role')">
                Role <span id="sort-candidate-role"></span>
              </th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Category
              </th>
              ${hasTeam ? `<th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Added By</th>` : ''}
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody id="candidates-table" class="bg-white divide-y divide-slate-100">
            ${this.renderCandidateRows(candidates)}
          </tbody>
        </table>
      </div>
    `;

    this._candidates = candidates;
    this._candidateSort = 'name';
    this._candidateSortAsc = true;
    document.getElementById('sort-candidate-name').textContent = '↑';
    // Apply default filter
    this.filterCandidates();
  },

  showCVImportModal() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Import CVs</h3>
      <p class="text-sm text-slate-500 mb-4">Upload CV files (PDF or Word). The AI will extract candidate information automatically.</p>
      <form onsubmit="views.submitCVImport(event)">
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">CV Files *</label>
          <input type="file" id="cv-import-files" multiple required accept=".pdf,.doc,.docx"
                 class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm">
          <p class="text-xs text-slate-400 mt-1">PDF, DOC, DOCX. Up to 50 files.</p>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="cv-import-category" value="in_progress" checked class="text-rose-500 focus:ring-rose-500">
              <span class="text-sm text-slate-700">New candidate (In Progress)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="cv-import-category" value="employed_no_assignment" class="text-indigo-500 focus:ring-indigo-500">
              <span class="text-sm text-slate-700">Sigma-anställd utan uppdrag</span>
            </label>
          </div>
        </div>
        <div id="cv-import-progress" class="hidden mb-4">
          <div class="text-sm text-slate-600 mb-1" id="cv-import-status">Processing...</div>
          <div class="w-full bg-slate-200 rounded-full h-2.5">
            <div id="cv-import-bar" class="bg-violet-500 h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>
        <div id="cv-import-results" class="hidden mb-4 max-h-64 overflow-y-auto space-y-1"></div>
        <div class="flex justify-end gap-2">
          <button type="button" onclick="modal.hide()" id="cv-import-close" class="px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
          <button type="submit" id="cv-import-btn" class="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all font-medium shadow-sm">
            Import
          </button>
        </div>
      </form>
    `;
    modal.show();
  },

  async submitCVImport(e) {
    e.preventDefault();
    const filesInput = document.getElementById('cv-import-files');
    const files = filesInput.files;
    if (files.length === 0) return;

    const category = document.querySelector('input[name="cv-import-category"]:checked').value;
    const btn = document.getElementById('cv-import-btn');
    const progressDiv = document.getElementById('cv-import-progress');
    const statusEl = document.getElementById('cv-import-status');
    const bar = document.getElementById('cv-import-bar');
    const resultsEl = document.getElementById('cv-import-results');

    btn.disabled = true;
    btn.textContent = 'Uploading...';
    progressDiv.classList.remove('hidden');
    resultsEl.classList.remove('hidden');
    resultsEl.innerHTML = '';
    statusEl.textContent = `Uploading ${files.length} file(s)...`;
    bar.style.width = '5%';

    const formData = new FormData();
    for (const file of files) {
      formData.append('cvFiles', file);
    }
    formData.append('category', category);

    try {
      const response = await fetch('/api/candidates/import-cvs', {
        method: 'POST',
        body: formData
      });

      if (!response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const err = await response.json();
        throw new Error(err.error || 'Import failed');
      }

      btn.textContent = 'Processing...';
      bar.style.width = '10%';

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            this._handleImportEvent(evt, statusEl, bar, resultsEl, btn);
          } catch (_) {}
        }
      }
    } catch (err) {
      bar.style.width = '0%';
      progressDiv.classList.add('hidden');
      btn.disabled = false;
      btn.textContent = 'Import';
      alert('Error: ' + err.message);
    }
  },

  _handleImportEvent(evt, statusEl, bar, resultsEl, btn) {
    if (evt.type === 'start') {
      statusEl.textContent = `Processing ${evt.total} file(s)...`;
      return;
    }

    if (evt.type === 'progress') {
      const pct = Math.round(((evt.index + 1) / evt.total) * 100);
      bar.style.width = pct + '%';

      if (evt.status === 'extracting') {
        statusEl.textContent = `Extracting text: ${this.escapeHtml(evt.file)} (${evt.index + 1}/${evt.total})`;
      } else if (evt.status === 'parsing') {
        statusEl.textContent = `AI parsing: ${this.escapeHtml(evt.file)} (${evt.index + 1}/${evt.total})`;
      } else if (evt.status === 'created') {
        statusEl.textContent = `Created: ${this.escapeHtml(evt.name)} (${evt.index + 1}/${evt.total})`;
        resultsEl.innerHTML += `<div class="flex items-center gap-2 py-1 text-sm">
          <span class="text-emerald-500">&#10003;</span>
          <a href="#" onclick="modal.hide(); router.navigate('candidate-detail', {id: '${evt.candidateId}'}); return false;" class="text-violet-600 hover:text-violet-700 font-medium">${this.escapeHtml(evt.name)}</a>
          <span class="text-slate-400">${this.escapeHtml(evt.role || '')}</span>
        </div>`;
        resultsEl.scrollTop = resultsEl.scrollHeight;
      } else if (evt.status === 'duplicate') {
        statusEl.textContent = `Merged into existing: ${this.escapeHtml(evt.name)} (${evt.index + 1}/${evt.total})`;
        resultsEl.innerHTML += `<div class="flex items-center gap-2 py-1 text-sm">
          <span class="text-blue-500" title="Matched an existing candidate by email">&#8635;</span>
          <a href="#" onclick="modal.hide(); router.navigate('candidate-detail', {id: '${evt.candidateId}'}); return false;" class="text-violet-600 hover:text-violet-700 font-medium">${this.escapeHtml(evt.name)}</a>
          <span class="text-blue-500 text-xs">merged (existing email)</span>
        </div>`;
        resultsEl.scrollTop = resultsEl.scrollHeight;
      } else if (evt.status === 'skipped' || evt.status === 'error') {
        resultsEl.innerHTML += `<div class="flex items-center gap-2 py-1 text-sm">
          <span class="text-red-500">&#10007;</span>
          <span class="text-slate-700">${this.escapeHtml(evt.file)}</span>
          <span class="text-red-500 text-xs">${this.escapeHtml(evt.error || evt.status)}</span>
        </div>`;
        resultsEl.scrollTop = resultsEl.scrollHeight;
      }
      return;
    }

    if (evt.type === 'done') {
      bar.style.width = '100%';
      statusEl.textContent = `Done: ${evt.created} created` + (evt.merged > 0 ? `, ${evt.merged} merged` : '') + (evt.failed > 0 ? `, ${evt.failed} failed` : '') + ` of ${evt.total}`;
      // Repurpose the primary button into a working "Done": it was a disabled
      // submit button, which is why clicking "Done" did nothing. Turn it into a
      // plain button that closes the modal and refreshes the candidates list.
      btn.textContent = 'Done';
      btn.disabled = false;
      btn.type = 'button';
      btn.onclick = () => { modal.hide(); router.navigate('candidates'); };
      // The Cancel button is now redundant — hide it.
      const closeBtn = document.getElementById('cv-import-close');
      if (closeBtn) closeBtn.classList.add('hidden');
    }
  },

  _categoryBadgeClass(category) {
    const colors = {
      in_progress: 'bg-amber-100 text-amber-700',
      employed_no_assignment: 'bg-indigo-100 text-indigo-700',
      declined: 'bg-red-100 text-red-700',
      not_qualified: 'bg-slate-100 text-slate-600',
      contact_later: 'bg-blue-100 text-blue-700',
      hired: 'bg-emerald-100 text-emerald-700'
    };
    return colors[category] || 'bg-slate-100 text-slate-500';
  },

  renderCandidateRows(candidates) {
    const categoryLabels = this._candidateCategories;
    const hasTeam = auth.currentUser?.role === 'owner' || auth.currentUser?.role === 'member';
    const colspan = hasTeam ? 5 : 4;
    if (candidates.length === 0) {
      return `<tr><td colspan="${colspan}" class="px-6 py-8 text-center text-slate-500">No candidates found</td></tr>`;
    }
    const currentUserId = auth.currentUser?.id;
    return candidates.map(c => {
      const ownerLabel = c.createdBy === currentUserId
        ? 'My Candidates'
        : (c.createdByUsername || '-');
      const categoryLabel = c.category ? (categoryLabels[c.category] || c.category) : '-';
      return `
      <tr class="hover:bg-rose-50/50 cursor-pointer transition-colors" data-candidate-id="${c.id}" onclick="router.navigate('candidate-detail', {id: '${c.id}'})">
        <td class="px-6 py-3">
          <div class="font-medium text-slate-800">${this.escapeHtml(c.name)}</div>
          ${c.skills ? `<div class="text-xs text-slate-400 mt-0.5 truncate max-w-md">${this.escapeHtml(c.skills)}</div>` : ''}
        </td>
        <td class="px-6 py-3 whitespace-nowrap text-slate-600" data-label="Role">${this.escapeHtml(c.role || '-')}</td>
        <td class="px-6 py-3 whitespace-nowrap" data-label="Category">
          ${c.category ? `<span class="px-2 py-1 rounded-full text-xs font-medium ${this._categoryBadgeClass(c.category)}">${this.escapeHtml(categoryLabels[c.category] || c.category)}</span>` : '<span class="text-slate-400">-</span>'}
        </td>
        ${hasTeam ? `<td class="px-6 py-3 whitespace-nowrap text-slate-600" data-label="Added By">${this.escapeHtml(c.createdByUsername || '-')}</td>` : ''}
        <td class="px-6 py-3 whitespace-nowrap" data-label="Status">
          <div class="text-xs text-slate-700 leading-tight">${this.escapeHtml(ownerLabel)}</div>
          <div class="text-xs text-slate-500 leading-tight">${this.escapeHtml(categoryLabel)}</div>
        </td>
      </tr>
    `;
    }).join('');
  },

  _candidateMatchesQuery(c, query) {
    return c.name.toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.phone || '').toLowerCase().includes(query) ||
      (c.role || '').toLowerCase().includes(query) ||
      (c.skills || '').toLowerCase().includes(query) ||
      (c.resumeText || '').toLowerCase().includes(query);
  },

  renderCandidateSeparatorRow(count) {
    const hasTeam = auth.currentUser?.role === 'owner' || auth.currentUser?.role === 'member';
    const colspan = hasTeam ? 5 : 4;
    return `<tr class="bg-slate-50">
      <td colspan="${colspan}" class="px-6 py-2 text-xs text-slate-500 italic border-t border-slate-200">
        Other matches across all candidates and categories (${count})
      </td>
    </tr>`;
  },

  async changeCandidateOwner(value) {
    this._candidateOwnerFilter = value;
    const container = document.getElementById('app');
    if (container) await this.candidateList(container);
  },

  filterCandidates() {
    const query = document.getElementById('candidate-search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('candidate-category-filter').value;
    const ownerFilter = this._candidateOwnerFilter; // user id, 'all', or ''
    const all = this._candidates || [];

    const matchesOwner = c =>
      !ownerFilter || ownerFilter === 'all' || c.createdBy === ownerFilter;
    const matchesCategory = c =>
      !categoryFilter || c.category === categoryFilter;

    const primary = all.filter(c =>
      matchesOwner(c) &&
      matchesCategory(c) &&
      (!query || this._candidateMatchesQuery(c, query))
    );

    let secondary = [];
    if (query) {
      const filterIsAll = (!ownerFilter || ownerFilter === 'all') && !categoryFilter;
      if (!filterIsAll) {
        const primaryIds = new Set(primary.map(c => c.id));
        secondary = all.filter(c =>
          !primaryIds.has(c.id) && this._candidateMatchesQuery(c, query)
        );
      }
    }

    const tbody = document.getElementById('candidates-table');
    tbody.innerHTML = this.renderCandidateRows(primary) +
      (secondary.length
        ? this.renderCandidateSeparatorRow(secondary.length) + this.renderCandidateRows(secondary)
        : '');

    // While searching, pre-highlight the top match so ↓/↑/Enter can drive the
    // list straight from the search box. With no query, clear the highlight.
    if (query) {
      this._highlightCandidate(0);
    } else {
      this._candidateRows().forEach(r => r.classList.remove('bg-rose-100'));
      this._candidateActiveIndex = -1;
    }
  },

  // Returns the selectable candidate <tr> rows (excludes separator / empty rows)
  _candidateRows() {
    const tbody = document.getElementById('candidates-table');
    return tbody ? Array.from(tbody.querySelectorAll('tr[data-candidate-id]')) : [];
  },

  // Highlight the candidate row at `index` (clamped) and scroll it into view
  _highlightCandidate(index) {
    const rows = this._candidateRows();
    rows.forEach(r => r.classList.remove('bg-rose-100'));
    if (rows.length === 0) { this._candidateActiveIndex = -1; return; }
    const i = Math.max(0, Math.min(index, rows.length - 1));
    rows[i].classList.add('bg-rose-100');
    rows[i].scrollIntoView({ block: 'nearest' });
    this._candidateActiveIndex = i;
  },

  // ↓/↑ move the highlight through the filtered list; Enter opens the highlighted
  // candidate — all without leaving the search box.
  candidateSearchKey(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this._highlightCandidate((this._candidateActiveIndex ?? -1) + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this._highlightCandidate((this._candidateActiveIndex ?? 0) - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const rows = this._candidateRows();
      const el = rows[this._candidateActiveIndex ?? 0] || rows[0];
      if (el) router.navigate('candidate-detail', { id: el.getAttribute('data-candidate-id') });
    }
  },

  sortCandidates(field) {
    if (this._candidateSort === field) {
      this._candidateSortAsc = !this._candidateSortAsc;
    } else {
      this._candidateSort = field;
      this._candidateSortAsc = true;
    }

    // Clear sort indicators (desktop + mobile)
    ['name', 'role', 'skills'].forEach(f => {
      document.getElementById(`sort-candidate-${f}`).textContent = '';
      const mEl = document.getElementById(`sort-candidate-${f}-m`);
      if (mEl) mEl.textContent = '';
    });

    this._candidates.sort((a, b) => {
      let result;
      switch (field) {
        case 'role':
          result = (a.role || '').localeCompare(b.role || '');
          break;
        case 'skills':
          result = (a.skills || '').localeCompare(b.skills || '');
          break;
        default:
          result = (a.name || '').localeCompare(b.name || '');
      }
      return this._candidateSortAsc ? result : -result;
    });

    const arrow = this._candidateSortAsc ? '↑' : '↓';
    document.getElementById(`sort-candidate-${field}`).textContent = arrow;
    const mEl = document.getElementById(`sort-candidate-${field}-m`);
    if (mEl) mEl.textContent = arrow;
    this.filterCandidates();
  },

  // Candidate Detail View
  async candidateDetail(container, id) {
    const [candidate, allTodos] = await Promise.all([
      api.get(`/api/candidates/${id}`),
      api.get('/api/todos?createdBy=all')
    ]);
    const todos = allTodos.filter(t => t.linkedType === 'candidate' && t.linkedId === id);
    const files = candidate.files || [];
    const fileCount = files.length;

    container.innerHTML = `
      <div class="mb-6">
        <a href="#" onclick="router.navigate('candidates'); return false;" class="text-rose-600 hover:text-rose-700 font-medium">
          ← Back to Candidates
        </a>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-4 sm:p-6 mb-6 border border-slate-200">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-800">${this.escapeHtml(candidate.name)}</h2>
            ${candidate.role ? `<p class="text-slate-600">${this.escapeHtml(candidate.role)}</p>` : ''}
            ${candidate.category ? `<span class="inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${this._categoryBadgeClass(candidate.category)}">${this.escapeHtml(this._candidateCategories[candidate.category] || candidate.category)}</span>` : ''}
          </div>
          <div class="flex gap-2 flex-wrap">
            <button onclick="router.navigate('candidate-form', {id: '${candidate.id}'})"
                    class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm">
              Edit
            </button>
            <button onclick="views.showTransferCandidateModal('${candidate.id}')"
                    class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm">
              Transfer
            </button>
            <button onclick="views.showOfferModal('${candidate.id}')"
                    class="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-sm">
              Skapa erbjudande
            </button>
            <button onclick="views.deleteCandidate('${candidate.id}')"
                    class="bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm">
              Delete
            </button>
          </div>
        </div>

        ${candidate.createdByUsername ? `<p class="text-xs text-slate-500 mb-2">Owner: <span class="font-medium text-slate-700">${this.escapeHtml(candidate.createdByUsername)}</span></p>` : ''}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          ${candidate.email ? `<div><span class="text-slate-500">Email:</span> <a href="mailto:${this.escapeHtml(candidate.email)}" class="text-rose-600 hover:text-rose-700">${this.escapeHtml(candidate.email)}</a></div>` : ''}
          ${candidate.phone ? `<div><span class="text-slate-500">Phone:</span> <span class="text-slate-700">${this.escapeHtml(candidate.phone)}</span></div>` : ''}
        </div>

        ${candidate.skills ? `
          <div class="mt-4 pt-4 border-t border-slate-200">
            <h3 class="text-sm font-medium text-slate-500 mb-2">Skills</h3>
            <p class="text-slate-700">${this.escapeHtml(candidate.skills)}</p>
          </div>
        ` : ''}

        <div id="candidate-request-matches" class="hidden mt-4 pt-4 border-t border-slate-200">
        </div>

        <div class="mt-4 pt-4 border-t border-slate-200">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-medium text-slate-500">Files (${fileCount}/5)</h3>
            ${fileCount < 5 ? `
              <label class="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium text-sm cursor-pointer">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Upload File
                <input type="file" accept=".pdf,.doc,.docx" class="hidden" onchange="views.uploadCandidateFile('${candidate.id}', this)">
              </label>
            ` : ''}
          </div>
          ${files.length > 0 ? `
            <div class="space-y-2">
              ${files.map(f => `
                <div class="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                  <a href="/api/candidates/${candidate.id}/files/${f.id}"
                     class="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium text-sm"
                     download>
                    <svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    ${this.escapeHtml(f.originalName)}
                  </a>
                  <div class="flex items-center gap-2">
                    ${f.mimeType === 'application/pdf' ? `
                      <button onclick="views.previewCandidateFile('${candidate.id}', '${f.id}')"
                              class="text-slate-400 hover:text-slate-600 text-xs">Preview</button>
                    ` : ''}
                    <button onclick="views.deleteCandidateFile('${candidate.id}', '${f.id}')"
                            class="text-red-400 hover:text-red-600 text-xs">Remove</button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-sm text-slate-400">No files uploaded</p>'}
        </div>

        <div class="mt-4 pt-4 border-t border-slate-200">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-medium text-slate-500">Anställningserbjudanden</h3>
            <button onclick="views.showOfferModal('${candidate.id}')"
                    class="inline-flex items-center text-emerald-700 hover:text-emerald-800 font-medium text-sm">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Skapa nytt erbjudande
            </button>
          </div>
          <div id="offers-list">
            <p class="text-sm text-slate-400">Laddar...</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 mb-6 border border-slate-200">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">Comments & ToDos</h3>

        <form onsubmit="views.addCandidateComment(event, '${candidate.id}')" class="mb-6">
          <textarea id="new-candidate-comment" rows="3" placeholder="Add a comment..."
                    class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"></textarea>
          <div class="mt-2 flex items-center justify-between gap-3 flex-wrap">
            <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" id="candidate-make-todo" class="w-4 h-4 text-rose-600 rounded focus:ring-rose-500">
              Make this a ToDo
            </label>
            <button type="submit" class="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all font-medium shadow-sm">
              Add Comment
            </button>
          </div>
        </form>

        <div class="mb-3 flex gap-2 text-sm">
          <span class="text-slate-500">Sort by:</span>
          <button onclick="views.sortCandidateActivity('date')" class="candidate-activity-sort text-rose-600 font-medium" data-sort="date">Date <span id="sort-candidate-activity-date">↓</span></button>
          <button onclick="views.sortCandidateActivity('type')" class="candidate-activity-sort text-slate-600 hover:text-slate-800" data-sort="type">Type <span id="sort-candidate-activity-type"></span></button>
        </div>

        <div id="candidate-activity-list" class="space-y-4">
          ${this.renderCandidateActivityList(candidate.comments, todos, candidate.id)}
        </div>
      </div>

      <div id="pdf-preview-container"></div>
    `;

    this._currentCandidate = candidate;
    this._candidateTodos = todos;

    // Lazy-load PDF preview for the first PDF file
    const firstPdf = files.find(f => f.mimeType === 'application/pdf');
    if (firstPdf) {
      requestAnimationFrame(() => {
        this.loadPdfPreview(candidate.id, firstPdf.id, firstPdf.originalName);
      });
    }

    // Load offers and request matches in the background
    this.loadOffersList(candidate.id);
    this.loadCandidateRequestMatches(candidate.id);
  },

  async loadCandidateRequestMatches(candidateId) {
    const container = document.getElementById('candidate-request-matches');
    if (!container) return;
    try {
      // Load cached results instantly (GET)
      const result = await api.get(`/api/candidates/${candidateId}/match-requests`);
      // A background auto-match may still be running (e.g. just after importing
      // this candidate). Show a spinner and poll until it finishes, so the user
      // doesn't see an empty list and have to click Refresh manually.
      if (result.status === 'pending') {
        this._renderMatchesPending(container);
        this.pollCandidateRequestMatches(candidateId);
        return;
      }
      this._renderRequestMatches(container, result.matches, candidateId);
    } catch (err) {
      console.error('Error loading request matches:', err);
    }
  },

  async pollCandidateRequestMatches(candidateId) {
    let attempts = 0;
    const poll = async () => {
      attempts++;
      if (attempts > 40) return; // give up after ~60s; cached list stays shown
      // Stop if the user navigated away from this candidate's detail view.
      const container = document.getElementById('candidate-request-matches');
      if (!container) return;
      try {
        const result = await api.get(`/api/candidates/${candidateId}/match-requests`);
        if (result.status !== 'pending') {
          this._renderRequestMatches(container, result.matches, candidateId);
          return;
        }
      } catch (_) { /* transient — keep polling */ }
      setTimeout(poll, 1500);
    };
    setTimeout(poll, 1500);
  },

  _renderMatchesPending(container) {
    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-slate-500">Matching Open Requests</h3>
      </div>
      <p class="text-xs text-slate-400 flex items-center gap-2">
        <span class="inline-block w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></span>
        Matching against open requests…
      </p>
    `;
  },

  async refreshCandidateRequestMatches(candidateId) {
    const container = document.getElementById('candidate-request-matches');
    if (!container) return;
    const btn = document.getElementById('refresh-matches-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Matching...'; }
    try {
      const result = await api.post(`/api/candidates/${candidateId}/match-requests`);
      this._renderRequestMatches(container, result.matches, candidateId);
    } catch (err) {
      console.error('Error refreshing request matches:', err);
      if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }
    }
  },

  _renderRequestMatches(container, matches, candidateId) {
    if (!matches || matches.length === 0) {
      container.classList.remove('hidden');
      container.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-slate-500">Matching Open Requests</h3>
          <button id="refresh-matches-btn" onclick="views.refreshCandidateRequestMatches('${candidateId}')"
                  class="text-xs text-violet-600 hover:text-violet-700 font-medium">Refresh</button>
        </div>
        <p class="text-xs text-slate-400">No matching requests found.</p>
      `;
      return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-slate-500">Matching Open Requests</h3>
        <button id="refresh-matches-btn" onclick="views.refreshCandidateRequestMatches('${candidateId}')"
                class="text-xs text-violet-600 hover:text-violet-700 font-medium">Refresh</button>
      </div>
      <div class="space-y-2">
        ${matches.map(m => `
          <a href="#" onclick="router.navigate('request-detail', {id: '${m.requestId}'}); return false;"
             class="flex items-center gap-3 p-3 rounded-lg border border-violet-200 bg-violet-50/50 hover:bg-violet-100/50 transition-colors">
            <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-violet-200 text-violet-800">
              ${m.score}%
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-violet-700 truncate">${this.escapeHtml(m.title)}</div>
              ${m.role ? `<div class="text-xs text-slate-500">${this.escapeHtml(m.role)}</div>` : ''}
              ${m.strengths ? `<div class="text-xs text-emerald-700 mt-0.5">${this.escapeHtml(m.strengths)}</div>` : ''}
                ${m.gaps ? `<div class="text-xs text-red-500 mt-0.5">${this.escapeHtml(m.gaps)}</div>` : ''}
                ${!m.strengths && m.reasoning ? `<div class="text-xs text-slate-600 mt-0.5">${this.escapeHtml(m.reasoning)}</div>` : ''}
            </div>
            <svg class="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        `).join('')}
      </div>
    `;
  },

  async loadOffersList(candidateId) {
    const target = document.getElementById('offers-list');
    if (!target) return;
    try {
      const offers = await api.get(`/api/candidates/${candidateId}/offers`);
      this._candidateOffers = offers;
      if (!offers.length) {
        target.innerHTML = '<p class="text-sm text-slate-400">Inga erbjudanden ännu. Klicka på "Skapa nytt erbjudande" för att börja.</p>';
        return;
      }
      target.innerHTML = `
        <div class="space-y-2">
          ${offers.map((o) => `
            <div class="border border-slate-200 rounded-lg p-3">
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div class="text-sm">
                  <div class="font-medium text-slate-800">
                    ${o.contractType === 'permanent' ? 'Tillsvidare' : 'Provanställning'} —
                    ${this.escapeHtml(this._formatSwedishNumber(o.fixedSalary))} kr/mån + ${o.variablePercentage}%
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">
                    Skapat ${new Date(o.createdAt).toLocaleString('sv-SE')}
                    ${o.createdByUsername ? ' av ' + this.escapeHtml(o.createdByUsername) : ''}
                    ${o.calculation && o.calculation.yearly ? ` • Årslön: ${this.escapeHtml(this._formatSwedishNumber(o.calculation.yearly.total))} kr` : ''}
                  </div>
                </div>
                <div class="flex gap-2 flex-wrap">
                  <a href="/api/candidates/${candidateId}/offers/${o.id}/eml" download
                     class="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-xs font-medium px-2 py-1 bg-emerald-50 rounded">
                    Öppna i Outlook
                  </a>
                  <a href="/api/candidates/${candidateId}/offers/${o.id}/contract" download
                     class="text-blue-700 hover:text-blue-800 text-xs font-medium px-2 py-1 bg-blue-50 rounded">
                    Avtal (.docx)
                  </a>
                  <a href="/api/candidates/${candidateId}/offers/${o.id}/attachment" download
                     class="text-blue-700 hover:text-blue-800 text-xs font-medium px-2 py-1 bg-blue-50 rounded">
                    Bilaga (.pdf)
                  </a>
                  <button onclick="views.reviseOffer('${candidateId}', '${o.id}')"
                          class="text-slate-700 hover:text-slate-900 text-xs font-medium px-2 py-1 bg-slate-100 rounded">
                    Revidera
                  </button>
                  <button onclick="views.deleteOffer('${candidateId}', '${o.id}')"
                          class="text-red-600 hover:text-red-700 text-xs font-medium px-2 py-1 bg-red-50 rounded">
                    Ta bort
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      console.error('Error loading offers:', err);
      target.innerHTML = '<p class="text-sm text-red-500">Kunde inte ladda erbjudanden.</p>';
    }
  },

  _formatSwedishNumber(n) {
    if (n == null || !isFinite(n)) return '0';
    return new Intl.NumberFormat('sv-SE').format(Math.round(n));
  },

  reviseOffer(candidateId, offerId) {
    const offer = (this._candidateOffers || []).find((o) => o.id === offerId);
    if (!offer) return;
    this.showOfferModal(candidateId, offer);
  },

  async deleteOffer(candidateId, offerId) {
    if (!confirm('Ta bort detta erbjudande? Filerna kommer också tas bort.')) return;
    try {
      await api.delete(`/api/candidates/${candidateId}/offers/${offerId}`);
      this.loadOffersList(candidateId);
    } catch (err) {
      alert('Kunde inte ta bort erbjudandet: ' + (err.message || err));
    }
  },

  // ----- Salary calculator (vanilla JS port of salary-model.ts) -----

  _SALARY_CONST: {
    DEFAULT_SALARY_COST_FACTOR: 1.466,
    DEFAULT_SOCIAL_FEES_DIVISOR: 1.3142,
    DEFAULT_VARIABLE_PERCENTAGE: 10,
    DEFAULT_VACATION_DAYS: [0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 5],
    SEMESTER_SUPPLEMENT_MONTH_INDEX: 3,
    SEMESTER_SUPPLEMENT_PERCENT: 0.12,
    WORKING_HOURS_BY_YEAR: {
      2024: [176, 168, 168, 168, 168, 160, 184, 176, 168, 184, 168, 160],
      2025: [176, 160, 168, 160, 160, 168, 184, 168, 176, 184, 160, 176],
      2026: [160, 160, 176, 160, 152, 168, 184, 168, 176, 176, 168, 176],
      2027: [168, 160, 184, 168, 152, 176, 176, 176, 176, 168, 168, 176],
    },
    MONTH_LABELS_SV: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dec'],
  },

  _getWorkingHoursForYear(year) {
    return this._SALARY_CONST.WORKING_HOURS_BY_YEAR[year] || this._SALARY_CONST.WORKING_HOURS_BY_YEAR[2026];
  },

  _computeVariableSalary(inp) {
    const C = this._SALARY_CONST;
    const salaryCostFactor = inp.salaryCostFactor != null ? inp.salaryCostFactor : C.DEFAULT_SALARY_COST_FACTOR;
    const socialFeesDivisor = inp.socialFeesDivisor != null ? inp.socialFeesDivisor : C.DEFAULT_SOCIAL_FEES_DIVISOR;
    const variablePct = inp.variablePercentage / 100;
    const safeAt = (a, i) => (a && typeof a[i] === 'number' ? a[i] : 0);
    const months = [];
    let totalVacation = 0;
    for (let i = 0; i < 12; i++) {
      const maxH = safeAt(inp.maxHours, i);
      const intH = safeAt(inp.internalHours, i);
      const extH = safeAt(inp.extraHours, i);
      const vac = safeAt(inp.vacationDays, i);
      totalVacation += vac;
      const totalHours = maxH - intH + extH - vac * 8;
      const revenue = inp.expectedRate * totalHours;
      const profit = revenue - inp.fixedSalary * salaryCostFactor;
      const variableGross = profit > 0 ? profit * variablePct : 0;
      const variableNet = variableGross > 0 ? variableGross / socialFeesDivisor : 0;
      months.push({
        maxHours: maxH, internalHours: intH, extraHours: extH, vacationDays: vac,
        totalHours, revenue, profit, variableGross, variableNet,
        semesterSupplementGross: 0, semesterSupplementNet: 0,
        total: inp.fixedSalary + variableNet,
      });
    }
    const annualGross = months.reduce((a, m) => a + m.variableGross, 0);
    const supplementGross = annualGross * C.SEMESTER_SUPPLEMENT_PERCENT;
    const supplementNet = supplementGross / socialFeesDivisor;
    const apr = months[C.SEMESTER_SUPPLEMENT_MONTH_INDEX];
    if (apr) {
      apr.semesterSupplementGross = supplementGross;
      apr.semesterSupplementNet = supplementNet;
      apr.total = inp.fixedSalary + apr.variableNet + supplementNet;
    }
    const sum = (k) => months.reduce((a, m) => a + m[k], 0);
    return {
      months,
      yearly: {
        totalHours: sum('totalHours'),
        totalVacationDays: totalVacation,
        revenue: sum('revenue'),
        profit: sum('profit'),
        variableGross: annualGross,
        variableNet: sum('variableNet'),
        semesterSupplementGross: supplementGross,
        semesterSupplementNet: supplementNet,
        total: sum('total'),
        averageMonthly: sum('total') / 12,
        annualFixed: inp.fixedSalary * 12,
      },
      inputs: {
        fixedSalary: inp.fixedSalary,
        expectedRate: inp.expectedRate,
        variablePercentage: inp.variablePercentage,
        salaryCostFactor,
        socialFeesDivisor,
      },
    };
  },

  // ----- Offer modal -----

  showOfferModal(candidateId, prefill) {
    const candidate = this._currentCandidate;
    if (!candidate || candidate.id !== candidateId) return;

    // Default state: pre-fill from previous offer if revising; otherwise use sane defaults.
    const today = new Date().toISOString().slice(0, 10);
    const year = (prefill && prefill.salaryYear) || new Date().getFullYear();
    const initialMaxHours = prefill && prefill.calculation && prefill.calculation.months
      ? prefill.calculation.months.map((m) => m.maxHours)
      : this._getWorkingHoursForYear(year);
    const initialVacation = prefill && prefill.calculation && prefill.calculation.months
      ? prefill.calculation.months.map((m) => m.vacationDays)
      : [...this._SALARY_CONST.DEFAULT_VACATION_DAYS];

    const state = {
      contractType: (prefill && prefill.contractType) || 'probationary',
      candidateName: (prefill && prefill.candidateName) || candidate.name || '',
      personalNumber: (prefill && prefill.personalNumber) || '',
      startDate: (prefill && prefill.startDate) || '',
      workLocation: (prefill && prefill.workLocation) || 'Lund',
      department: (prefill && prefill.department) || '2402',
      signLocation: (prefill && prefill.signLocation) || (prefill && prefill.workLocation) || 'Lund',
      signDate: (prefill && prefill.signDate) || today,
      signerName: (prefill && prefill.signerName) || 'Thomas Hermansson',
      signerTitle: (prefill && prefill.signerTitle) || 'Vice President, Sigma Technology Software Solution',
      salaryYear: year,
      fixedSalary: (prefill && prefill.fixedSalary) || 45000,
      expectedRate: (prefill && prefill.expectedRate) || 950,
      variablePercentage: (prefill && prefill.variablePercentage) != null ? prefill.variablePercentage : 10,
      maxHours: initialMaxHours,
      vacationDays: initialVacation,
      submitting: false,
    };

    // Build container
    const root = document.createElement('div');
    root.id = 'offer-modal-root';
    root.className = 'fixed inset-0 z-50 flex items-center justify-center';
    root.innerHTML = `
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" data-close="1"></div>
      <div class="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-7xl mx-4 max-h-[95vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">${prefill ? 'Revidera' : 'Skapa'} anställningserbjudande</h3>
            <p class="text-xs text-slate-500 mt-0.5">${this.escapeHtml(candidate.name)}</p>
          </div>
          <button data-close="1" class="text-slate-400 hover:text-slate-600 p-1 rounded">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="px-6 py-4">
          <div id="offer-modal-body"></div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    document.body.style.overflow = 'hidden';
    root.addEventListener('click', (e) => {
      if (e.target.dataset && e.target.dataset.close === '1') views.hideOfferModal();
    });

    this._offerState = state;
    this.renderOfferModalBody();
  },

  hideOfferModal() {
    const root = document.getElementById('offer-modal-root');
    if (root) root.remove();
    document.body.style.overflow = '';
    this._offerState = null;
  },

  renderOfferModalBody() {
    const s = this._offerState;
    if (!s) return;
    const body = document.getElementById('offer-modal-body');
    if (!body) return;

    const calc = this._computeVariableSalary({
      fixedSalary: Number(s.fixedSalary) || 0,
      expectedRate: Number(s.expectedRate) || 0,
      variablePercentage: Number(s.variablePercentage) || 0,
      maxHours: s.maxHours,
      vacationDays: s.vacationDays,
      internalHours: new Array(12).fill(0),
      extraHours: new Array(12).fill(0),
    });
    s.calc = calc;

    const months = this._SALARY_CONST.MONTH_LABELS_SV;
    const fmt = (n) => this._formatSwedishNumber(n);

    const previewClause = s.contractType === 'permanent'
      ? 'tillsvidareanställning med en uppsägningstid på 1 månad'
      : 'provanställning i 6 månader (uppsägningstid 2 veckor), därefter tillsvidare med uppsägningstid 1 månad';

    body.innerHTML = `
      <!-- Contract fields -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Avtalstyp</label>
          <select data-bind="contractType" class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
            <option value="probationary" ${s.contractType === 'probationary' ? 'selected' : ''}>Provanställning</option>
            <option value="permanent" ${s.contractType === 'permanent' ? 'selected' : ''}>Tillsvidare</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Kandidatens namn *</label>
          <input data-bind="candidateName" value="${this.escapeHtml(s.candidateName)}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Personnummer</label>
          <input data-bind="personalNumber" placeholder="ÅÅÅÅMMDD-XXXX" value="${this.escapeHtml(s.personalNumber)}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Startdatum</label>
          <input type="date" data-bind="startDate" value="${this.escapeHtml(s.startDate)}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Tjänstgöringsort</label>
          <input data-bind="workLocation" value="${this.escapeHtml(s.workLocation)}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Avdelning</label>
          <input data-bind="department" value="${this.escapeHtml(s.department)}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Signeringsort</label>
          <input data-bind="signLocation" value="${this.escapeHtml(s.signLocation)}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Signeringsdatum</label>
          <input type="date" data-bind="signDate" value="${this.escapeHtml(s.signDate)}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Lönesamtals-år</label>
          <input type="number" data-bind="salaryYear" min="2024" max="2030" value="${s.salaryYear}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Signerare (namn)</label>
          <input data-bind="signerName" value="${this.escapeHtml(s.signerName)}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-slate-600 mb-1">Signerare (titel)</label>
          <input data-bind="signerTitle" value="${this.escapeHtml(s.signerTitle)}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
      </div>

      <hr class="my-4 border-slate-200">

      <h4 class="font-semibold text-slate-800 mb-3">Lönekalkylator</h4>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Fast månadslön (netto, kr) *</label>
          <input type="number" data-bind="fixedSalary" value="${s.fixedSalary}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Arvode (kr / tim)</label>
          <input type="number" data-bind="expectedRate" value="${s.expectedRate}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">%-sats rörlig (brutto)</label>
          <input type="number" step="0.5" data-bind="variablePercentage" value="${s.variablePercentage}"
                 class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
        </div>
      </div>

      <div class="border border-slate-200 rounded-md overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-2 py-2 text-left font-semibold text-slate-600 sticky left-0 bg-slate-50 min-w-[170px]">Rad</th>
              ${months.map((m) => `<th class="px-2 py-2 text-right font-semibold text-slate-600 min-w-[60px]">${m}</th>`).join('')}
              <th class="px-2 py-2 text-right font-semibold text-slate-900 min-w-[80px]">Summa</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="bg-white">
              <td class="px-2 py-1 text-slate-700 font-medium sticky left-0 bg-white">Max ord. timmar</td>
              ${s.maxHours.map((v, i) => `
                <td class="px-1 py-1">
                  <input type="number" data-bind-arr="maxHours" data-idx="${i}"
                         value="${v === 0 ? '' : v}" placeholder="0"
                         class="w-full px-1 py-1 text-right border border-slate-200 rounded text-xs">
                </td>
              `).join('')}
              <td class="px-2 py-1 text-right font-semibold text-slate-800">${fmt(s.maxHours.reduce((a, b) => a + (Number(b) || 0), 0))}</td>
            </tr>
            <tr class="bg-white">
              <td class="px-2 py-1 text-slate-700 font-medium sticky left-0 bg-white">Semesterdagar</td>
              ${s.vacationDays.map((v, i) => `
                <td class="px-1 py-1">
                  <input type="number" data-bind-arr="vacationDays" data-idx="${i}"
                         value="${v === 0 ? '' : v}" placeholder="0"
                         class="w-full px-1 py-1 text-right border border-slate-200 rounded text-xs">
                </td>
              `).join('')}
              <td class="px-2 py-1 text-right font-semibold text-slate-800">${fmt(s.vacationDays.reduce((a, b) => a + (Number(b) || 0), 0))}</td>
            </tr>
            ${[
              { label: 'Totalt antal timmar', vals: calc.months.map((m) => m.totalHours), total: calc.yearly.totalHours, money: false, tone: 'gray' },
              { label: 'Arvode / månad', vals: calc.months.map((m) => m.revenue), total: calc.yearly.revenue, money: true, tone: 'gray' },
              { label: '− Lönekostnad (profit)', vals: calc.months.map((m) => m.profit), total: calc.yearly.profit, money: true, tone: 'muted' },
              { label: 'Rörlig lön brutto', vals: calc.months.map((m) => m.variableGross), total: calc.yearly.variableGross, money: true, tone: 'gray' },
              { label: 'Rörlig lön netto', vals: calc.months.map((m) => m.variableNet), total: calc.yearly.variableNet, money: true, tone: 'green' },
              { label: 'Sem.tillägg rörlig (Apr)', vals: calc.months.map((m) => m.semesterSupplementNet), total: calc.yearly.semesterSupplementNet, money: true, tone: 'green' },
              { label: 'Fast + rörlig (netto)', vals: calc.months.map((m) => m.total), total: calc.yearly.total, money: true, tone: 'strong' },
            ].map((row) => `
              <tr class="bg-slate-50/50">
                <td class="px-2 py-1 text-slate-700 font-medium sticky left-0 bg-slate-50/50">${row.label}</td>
                ${row.vals.map((v) => `<td class="px-2 py-1 text-right ${row.tone === 'green' ? 'text-emerald-700 font-medium' : row.tone === 'strong' ? 'text-blue-700 font-semibold' : row.tone === 'muted' ? 'text-slate-400' : 'text-slate-800'}">${fmt(v)}</td>`).join('')}
                <td class="px-2 py-1 text-right ${row.tone === 'green' ? 'text-emerald-700' : row.tone === 'strong' ? 'text-blue-700' : 'text-slate-800'} font-semibold">${fmt(row.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
        <div class="p-3 border border-slate-200 rounded-lg bg-white">
          <p class="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Årslön fast</p>
          <p class="text-lg font-semibold mt-0.5 text-slate-900">${fmt(calc.yearly.annualFixed)} kr</p>
          <p class="text-[11px] text-slate-500 mt-0.5">12 × fast månadslön</p>
        </div>
        <div class="p-3 border border-slate-200 rounded-lg bg-white">
          <p class="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Årslön rörlig (netto)</p>
          <p class="text-lg font-semibold mt-0.5 text-emerald-700">${fmt(calc.yearly.variableNet + calc.yearly.semesterSupplementNet)} kr</p>
          <p class="text-[11px] text-slate-500 mt-0.5">${s.variablePercentage}% + sem.tillägg</p>
        </div>
        <div class="p-3 border border-slate-200 rounded-lg bg-white">
          <p class="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Total årslön (netto)</p>
          <p class="text-lg font-semibold mt-0.5 text-blue-700">${fmt(calc.yearly.total)} kr</p>
        </div>
        <div class="p-3 border border-slate-200 rounded-lg bg-white">
          <p class="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Snittlön / mån</p>
          <p class="text-lg font-semibold mt-0.5 text-slate-900">${fmt(calc.yearly.averageMonthly)} kr</p>
        </div>
      </div>

      <hr class="my-4 border-slate-200">

      <h4 class="font-semibold text-slate-800 mb-2">Förhandsvisning av kontraktstext</h4>
      <div class="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-700 space-y-1.5 mb-4">
        <p><strong>${s.contractType === 'permanent' ? 'Tillsvidareanställning' : 'Provanställning'}</strong> i ${this.escapeHtml(s.workLocation || '—')} på avdelning ${this.escapeHtml(s.department || '—')}, från och med ${this.escapeHtml(s.startDate || '—')}.</p>
        <p>${this.escapeHtml(s.candidateName || '—')} (${this.escapeHtml(s.personalNumber || '—')}) anställs som ${previewClause}.</p>
        <p>Lönen fastställs till <strong>${fmt(s.fixedSalary)} kr/mån</strong> (oberoende av ${s.salaryYear} års lönesamtal).</p>
        <p>Beräknad <strong>total årslön (netto): ${fmt(calc.yearly.total)} kr</strong>, varav rörlig ${fmt(calc.yearly.variableNet + calc.yearly.semesterSupplementNet)} kr.</p>
        <p class="text-xs text-slate-500">Signerare: ${this.escapeHtml(s.signerName || '')} — ${this.escapeHtml(s.signerTitle || '')}</p>
      </div>

      <div class="flex justify-end gap-2 sticky bottom-0 bg-white pt-4 border-t border-slate-200 -mx-6 px-6 -mb-4 pb-4">
        <button onclick="views.hideOfferModal()"
                class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
          Avbryt
        </button>
        <button id="offer-submit-btn" onclick="views.submitOffer()" ${s.submitting ? 'disabled' : ''}
                class="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg hover:from-emerald-600 hover:to-teal-700 shadow-sm disabled:opacity-50">
          ${s.submitting ? 'Skapar...' : 'Skapa erbjudande & öppna i Outlook'}
        </button>
      </div>
    `;

    // Wire up bindings
    body.querySelectorAll('[data-bind]').forEach((el) => {
      el.addEventListener('input', (e) => {
        const k = el.dataset.bind;
        let v = el.value;
        if (['fixedSalary', 'expectedRate', 'variablePercentage', 'salaryYear'].includes(k)) {
          v = v === '' ? '' : Number(v);
        }
        this._offerState[k] = v;
        this._scheduleOfferRerender();
      });
    });
    body.querySelectorAll('[data-bind-arr]').forEach((el) => {
      el.addEventListener('input', (e) => {
        const k = el.dataset.bindArr;
        const i = Number(el.dataset.idx);
        const v = el.value === '' ? 0 : Number(el.value);
        this._offerState[k][i] = isFinite(v) ? v : 0;
        this._scheduleOfferRerender();
      });
    });
  },

  _scheduleOfferRerender() {
    if (this._offerRerenderTimer) return;
    this._offerRerenderTimer = setTimeout(() => {
      this._offerRerenderTimer = null;
      const focused = document.activeElement;
      const focusedSel = focused && focused.dataset && focused.dataset.bind
        ? `[data-bind="${focused.dataset.bind}"]`
        : focused && focused.dataset && focused.dataset.bindArr
        ? `[data-bind-arr="${focused.dataset.bindArr}"][data-idx="${focused.dataset.idx}"]`
        : null;
      const cursor = focused && typeof focused.selectionStart === 'number' ? focused.selectionStart : null;
      this.renderOfferModalBody();
      if (focusedSel) {
        const el = document.querySelector('#offer-modal-body ' + focusedSel);
        if (el) {
          el.focus();
          if (cursor != null && el.setSelectionRange) {
            try { el.setSelectionRange(cursor, cursor); } catch (e) { /* ignore */ }
          }
        }
      }
    }, 80);
  },

  async submitOffer() {
    const s = this._offerState;
    if (!s) return;
    if (!s.candidateName || !s.candidateName.trim()) {
      alert('Kandidatens namn krävs');
      return;
    }
    if (!s.fixedSalary || !s.expectedRate) {
      alert('Fast lön och arvode krävs');
      return;
    }

    s.submitting = true;
    this.renderOfferModalBody();
    const candidateId = this._currentCandidate.id;

    try {
      const offer = await api.post(`/api/candidates/${candidateId}/offers`, {
        contractType: s.contractType,
        candidateName: s.candidateName,
        personalNumber: s.personalNumber,
        startDate: s.startDate,
        workLocation: s.workLocation,
        department: s.department,
        signLocation: s.signLocation,
        signDate: s.signDate,
        signerName: s.signerName,
        signerTitle: s.signerTitle,
        salaryYear: Number(s.salaryYear) || new Date().getFullYear(),
        fixedSalary: Number(s.fixedSalary) || 0,
        expectedRate: Number(s.expectedRate) || 0,
        variablePercentage: Number(s.variablePercentage) || 0,
        maxHours: s.maxHours,
        vacationDays: s.vacationDays,
        internalHours: new Array(12).fill(0),
        extraHours: new Array(12).fill(0),
      });
      this.hideOfferModal();
      this.loadOffersList(candidateId);
      // Trigger .eml download in a hidden anchor — Outlook on Windows opens it as a draft.
      const a = document.createElement('a');
      a.href = `/api/candidates/${candidateId}/offers/${offer.id}/eml`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('submitOffer error:', err);
      alert('Kunde inte skapa erbjudandet: ' + (err.message || err));
      s.submitting = false;
      this.renderOfferModalBody();
    }
  },

  loadPdfPreview(candidateId, fileId, fileName) {
    const container = document.getElementById('pdf-preview-container');
    if (!container) return;

    container.innerHTML = `
      <div class="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">PDF Preview: ${this.escapeHtml(fileName)}</h3>
        <div id="pdf-loading" class="flex items-center justify-center py-8 text-slate-400">
          <svg class="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Loading preview...
        </div>
        <iframe id="pdf-iframe"
                src="/api/candidates/${candidateId}/files/${fileId}?inline=true"
                class="w-full border border-slate-200 rounded-lg hidden"
                style="height: 800px;"
                onload="views.onPdfLoaded()"
                onerror="views.onPdfError()">
        </iframe>
        <div id="pdf-error" class="hidden text-center py-8 text-slate-400">
          Preview not available. <a href="/api/candidates/${candidateId}/files/${fileId}" download class="text-rose-600 hover:text-rose-700">Download instead</a>
        </div>
      </div>
    `;
  },

  onPdfLoaded() {
    const loading = document.getElementById('pdf-loading');
    const iframe = document.getElementById('pdf-iframe');
    if (loading) loading.classList.add('hidden');
    if (iframe) iframe.classList.remove('hidden');
  },

  onPdfError() {
    const loading = document.getElementById('pdf-loading');
    const errorDiv = document.getElementById('pdf-error');
    if (loading) loading.classList.add('hidden');
    if (errorDiv) errorDiv.classList.remove('hidden');
  },

  previewCandidateFile(candidateId, fileId) {
    const file = this._currentCandidate.files.find(f => f.id === fileId);
    if (!file) return;
    this.loadPdfPreview(candidateId, fileId, file.originalName);
    document.getElementById('pdf-preview-container').scrollIntoView({ behavior: 'smooth' });
  },

  _canTransferCandidate(candidate) {
    const user = auth.currentUser;
    if (!user) return false;
    return user.role === 'owner' || user.role === 'member';
  },

  async showTransferCandidateModal(candidateId) {
    const candidate = this._currentCandidate;
    if (!candidate || candidate.id !== candidateId) return;

    const user = auth.currentUser;
    if (!user || (user.role !== 'owner' && user.role !== 'member')) {
      alert('Transfer is only available for team users. Create a team in Team Settings to share candidates with teammates.');
      return;
    }

    let members = [];
    try {
      const teamInfo = await api.get('/api/team');
      members = (teamInfo.members || []).filter(m => m.id !== candidate.createdBy);
    } catch (_) { /* ignore */ }

    if (members.length === 0) {
      alert('No other team members available to transfer to.');
      return;
    }

    modal.show(`
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Transfer Candidate</h3>
      <p class="text-sm text-slate-600 mb-4">Transfer <span class="font-medium">${this.escapeHtml(candidate.name)}</span> to another team member. The new owner will see this candidate in their list.</p>
      <form onsubmit="views.submitTransferCandidate(event, '${candidate.id}')">
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">New Owner *</label>
          <select id="transfer-candidate-new-owner" required autofocus
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
            ${members.map(m => `<option value="${m.id}">${this.escapeHtml(m.username)}${m.isOwner ? ' (team owner)' : ''}</option>`).join('')}
          </select>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" onclick="modal.hide()" class="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
          <button type="submit" class="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all font-medium shadow-sm">Transfer</button>
        </div>
      </form>
    `);
  },

  async submitTransferCandidate(event, candidateId) {
    event.preventDefault();
    const newOwnerId = document.getElementById('transfer-candidate-new-owner').value;
    if (!newOwnerId) return;

    try {
      await api.post(`/api/candidates/${candidateId}/transfer`, { newOwnerId });
      modal.hide();
      router.navigate('candidates');
    } catch (err) {
      alert(`Transfer failed: ${err.message}`);
    }
  },

  async deleteCandidate(id) {
    if (!confirm('Delete this candidate? This cannot be undone.')) return;
    try {
      await api.delete(`/api/candidates/${id}`);
      router.navigate('candidates');
    } catch (err) {
      console.error('Error deleting candidate:', err);
      alert('Failed to delete candidate: ' + err.message);
    }
  },


  async uploadCandidateFile(candidateId, input) {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/candidates/${candidateId}/files`, {
        method: 'POST',
        body: formData
      });

      if (response.status === 401) {
        auth.showLoginModal();
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload file');
      }

      router.navigate('candidate-detail', { id: candidateId });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async deleteCandidateFile(candidateId, fileId) {
    if (!confirm('Remove this file?')) return;
    try {
      await api.delete(`/api/candidates/${candidateId}/files/${fileId}`);
      router.navigate('candidate-detail', { id: candidateId });
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file: ' + err.message);
    }
  },

  renderCandidateActivityList(comments, todos, candidateId) {
    const items = [];

    (comments || []).forEach(c => {
      items.push({
        type: 'comment',
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        completed: false
      });
    });

    (todos || []).forEach(todo => {
      items.push({
        type: 'todo',
        id: todo.id,
        content: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        createdAt: todo.createdAt,
        completed: todo.completed,
        checklistItemsState: todo.checklistItemsState || []
      });
    });

    if (items.length === 0) {
      return '<p class="text-slate-500">No comments or ToDos yet</p>';
    }

    const sortField = this._candidateActivitySort || 'date';
    const sortAsc = this._candidateActivitySortAsc !== undefined ? this._candidateActivitySortAsc : false;

    items.sort((a, b) => {
      let result;
      if (sortField === 'type') {
        result = a.type.localeCompare(b.type);
      } else {
        result = new Date(b.createdAt) - new Date(a.createdAt);
      }
      return sortAsc ? -result : result;
    });

    const entityType = 'candidate';
    const entityId = candidateId;

    return items.map(item => {
      if (item.type === 'comment') {
        return `
          <div class="border-l-4 border-rose-300 pl-4 py-2 bg-rose-50/30 rounded-r-lg" data-comment-id="${item.id}">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <span class="inline-block px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-700 font-medium mb-1">Comment</span>
                <p class="text-slate-700 whitespace-pre-wrap">${this.escapeHtml(item.content)}</p>
              </div>
              <div class="flex gap-2 ml-4">
                <button onclick="views.editCandidateComment('${entityId}', '${item.id}')" class="text-slate-400 hover:text-slate-600 text-sm">Edit</button>
                <button onclick="views.deleteCandidateComment('${entityId}', '${item.id}')" class="text-red-400 hover:text-red-600 text-sm">Delete</button>
              </div>
            </div>
            <p class="text-xs text-slate-400 mt-1">${formatDateTime(item.createdAt)}</p>
          </div>
        `;
      } else {
        return `
          <div class="border-l-4 ${item.completed ? 'border-slate-300 bg-slate-50/50' : 'border-emerald-400 bg-emerald-50/30'} pl-4 py-2 rounded-r-lg ${item.completed ? 'opacity-60' : ''}" data-todo-id="${item.id}">
            <div class="flex justify-between items-start">
              <div class="flex items-start flex-1">
                <input type="checkbox" ${item.completed ? 'checked' : ''}
                       onchange="views.toggleTodoInline('${item.id}', this.checked, '${entityType}', '${entityId}')"
                       class="h-4 w-4 mt-1 text-emerald-600 rounded border-slate-300 cursor-pointer focus:ring-emerald-500">
                <div class="ml-2 flex-1">
                  <span class="inline-block px-2 py-0.5 text-xs rounded-full ${item.completed ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'} font-medium mb-1">ToDo</span>
                  <p class="text-slate-700 ${item.completed ? 'line-through' : ''}">${this.escapeHtml(item.content)}</p>
                  ${item.description ? `<p class="text-sm text-slate-500 mt-1">${this.escapeHtml(item.description)}</p>` : ''}
                  ${item.checklistItemsState && item.checklistItemsState.length > 0 ? `
                  <div class="mt-2">
                    <div class="text-xs font-medium text-slate-500 mb-1">Checklist (${item.checklistItemsState.filter(ci => ci.checked).length}/${item.checklistItemsState.length})</div>
                    <div class="checklist-grid columns-1 sm:columns-2 lg:columns-3 gap-x-4">
                      ${item.checklistItemsState.map((ci, idx) => `
                        <div class="flex items-center gap-2 group break-inside-avoid mb-1">
                          <input type="checkbox" ${ci.checked ? 'checked' : ''} ${item.completed ? 'disabled' : ''}
                                 onchange="views.toggleChecklistItemInline('${item.id}', ${idx}, this.checked, '${entityType}', '${entityId}')"
                                 class="h-3.5 w-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0">
                          <span onclick="views.startEditChecklistItemInline(this, '${item.id}', ${idx}, '${entityType}', '${entityId}')"
                                class="text-xs ${ci.checked ? 'line-through text-slate-400' : 'text-slate-600'} ${!item.completed ? 'cursor-text hover:bg-emerald-50 rounded px-1 -mx-1' : ''}">${this.escapeHtml(ci.text)}</span>
                          ${!item.completed ? `<button onclick="views.removeChecklistItemInline('${item.id}', ${idx}, '${entityType}', '${entityId}')" class="text-red-300 hover:text-red-500 text-xs ml-auto opacity-0 group-hover:opacity-100 shrink-0" title="Remove">&times;</button>` : ''}
                        </div>
                      `).join('')}
                    </div>
                    ${!item.completed ? `<button onclick="views.addChecklistItemInPlaceInline('${item.id}', '${entityType}', '${entityId}', this)" class="text-emerald-500 hover:text-emerald-700 text-xs mt-1 flex items-center gap-1"><span class="text-base leading-none">+</span></button>` : ''}
                  </div>` : ''}
                  <p class="text-xs text-slate-400 mt-1">Due: ${formatDateTime(item.dueDate)} | Created: ${formatDateTime(item.createdAt)}</p>
                </div>
              </div>
              <div class="flex gap-2 ml-4">
                <button onclick="views.editTodoInline('${item.id}', '${entityType}', '${entityId}')" class="text-slate-400 hover:text-slate-600 text-sm">Edit</button>
                <button onclick="views.deleteTodoInline('${item.id}', '${entityType}', '${entityId}')" class="text-red-400 hover:text-red-600 text-sm">Delete</button>
              </div>
            </div>
          </div>
        `;
      }
    }).join('');
  },

  sortCandidateActivity(field) {
    if (this._candidateActivitySort === field) {
      this._candidateActivitySortAsc = !this._candidateActivitySortAsc;
    } else {
      this._candidateActivitySort = field;
      this._candidateActivitySortAsc = field === 'type' ? true : false;
    }

    document.querySelectorAll('.candidate-activity-sort').forEach(btn => {
      const sortField = btn.dataset.sort;
      const indicator = document.getElementById(`sort-candidate-activity-${sortField}`);
      if (sortField === field) {
        btn.classList.remove('text-slate-600');
        btn.classList.add('text-rose-600', 'font-medium');
        indicator.textContent = this._candidateActivitySortAsc ? '↑' : '↓';
      } else {
        btn.classList.remove('text-rose-600', 'font-medium');
        btn.classList.add('text-slate-600');
        indicator.textContent = '';
      }
    });

    const candidate = this._currentCandidate;
    const todos = this._candidateTodos;
    if (candidate) {
      document.getElementById('candidate-activity-list').innerHTML =
        this.renderCandidateActivityList(candidate.comments, todos, candidate.id);
    }
  },

  renderCandidateComments(comments, candidateId) {
    if (!comments || comments.length === 0) {
      return '<p class="text-slate-500">No comments yet</p>';
    }

    return comments.map(comment => `
      <div class="border-l-4 border-rose-300 pl-4 py-2 bg-rose-50/30 rounded-r-lg" data-comment-id="${comment.id}">
        <div class="flex justify-between items-start">
          <p class="text-slate-700 whitespace-pre-wrap">${this.escapeHtml(comment.content)}</p>
          <div class="flex gap-2 ml-4">
            <button onclick="views.editCandidateComment('${candidateId}', '${comment.id}')" class="text-slate-400 hover:text-slate-600 text-sm">Edit</button>
            <button onclick="views.deleteCandidateComment('${candidateId}', '${comment.id}')" class="text-red-400 hover:text-red-600 text-sm">Delete</button>
          </div>
        </div>
        <p class="text-xs text-slate-400 mt-1">${formatDateTime(comment.createdAt)}</p>
      </div>
    `).join('');
  },

  async addCandidateComment(event, candidateId) {
    event.preventDefault();
    const content = document.getElementById('new-candidate-comment').value.trim();
    if (!content) return;

    const makeTodo = document.getElementById('candidate-make-todo')?.checked;

    try {
      if (makeTodo) {
        await api.post('/api/todos', {
          title: content,
          description: '',
          dueDate: new Date().toISOString(),
          linkedType: 'candidate',
          linkedId: candidateId
        });
      } else {
        await api.post(`/api/candidates/${candidateId}/comments`, { content });
      }
      router.navigate('candidate-detail', { id: candidateId });
    } catch (err) {
      if (err.message !== 'Authentication required') {
        alert('Error saving comment: ' + err.message);
      }
    }
  },

  async editCandidateComment(candidateId, commentId) {
    const comment = this._currentCandidate.comments.find(c => c.id === commentId);
    if (!comment) return;

    modal.show(`
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Edit Comment</h3>
      <textarea id="edit-candidate-comment-content" rows="4" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors">${this.escapeHtml(comment.content)}</textarea>
      <div class="flex justify-end gap-2 mt-4">
        <button onclick="modal.hide()" class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
        <button onclick="views.saveCandidateComment('${candidateId}', '${commentId}')" class="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-rose-600 hover:to-pink-700 font-medium shadow-sm">Save</button>
      </div>
    `);
  },

  async saveCandidateComment(candidateId, commentId) {
    const content = document.getElementById('edit-candidate-comment-content').value.trim();
    if (!content) return;

    await api.put(`/api/candidates/${candidateId}/comments/${commentId}`, { content });
    modal.hide();
    router.navigate('candidate-detail', { id: candidateId });
  },

  async deleteCandidateComment(candidateId, commentId) {
    if (!confirm('Delete this comment?')) return;
    await api.delete(`/api/candidates/${candidateId}/comments/${commentId}`);
    router.navigate('candidate-detail', { id: candidateId });
  },

  // Candidate Form View
  async candidateForm(container, id) {
    let candidate = { name: '', email: '', phone: '', role: '', skills: '', files: [] };

    if (id) {
      candidate = await api.get(`/api/candidates/${id}`);
    }

    const files = candidate.files || [];

    container.innerHTML = `
      <div class="mb-6">
        <a href="#" onclick="router.navigate('candidates'); return false;" class="text-rose-600 hover:text-rose-700 font-medium">
          ← Back to Candidates
        </a>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">${id ? 'Edit Candidate' : 'New Candidate'}</h2>

        <form id="candidate-form" onsubmit="views.saveCandidate(event, '${id || ''}')" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
            <input type="text" id="candidate-name" value="${this.escapeHtml(candidate.name)}" required autofocus
                   class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" id="candidate-email" value="${this.escapeHtml(candidate.email || '')}"
                     oninput="views.maybeGuessCandidateName(this.value)"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input type="tel" id="candidate-phone" value="${this.escapeHtml(candidate.phone || '')}"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <input type="text" id="candidate-role" value="${this.escapeHtml(candidate.role || '')}"
                     placeholder="e.g., Senior Developer, Product Manager"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select id="candidate-category"
                      class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors bg-white">
                ${Object.entries(this._candidateCategories).map(([key, label]) =>
                  `<option value="${key}" ${(candidate.category || 'in_progress') === key ? 'selected' : ''}>${label}</option>`
                ).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Skills</label>
            <input type="text" id="candidate-skills" value="${this.escapeHtml(candidate.skills || '')}"
                   placeholder="e.g., JavaScript, React, Node.js, PostgreSQL"
                   class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">File (PDF, DOC, DOCX - max 10MB)</label>
            ${files.length > 0 ? `
              <div class="mb-2 space-y-1">
                ${files.map(f => `
                  <div class="text-sm text-slate-500 flex items-center gap-2">
                    <span>${this.escapeHtml(f.originalName)}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${files.length < 5 ? `
              <input type="file" id="candidate-resume" accept=".pdf,.doc,.docx"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100">
            ` : '<p class="text-sm text-amber-600">Maximum 5 files reached. Remove files from the detail view to upload more.</p>'}
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <button type="button" onclick="router.navigate('candidates')"
                    class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
            <button type="submit"
                    class="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all font-medium shadow-sm">Save</button>
          </div>
        </form>
      </div>
    `;
  },

  // Parse "firstname.lastname@domain" style emails into "Firstname Lastname"
  guessNameFromEmail(email) {
    if (!email || typeof email !== 'string') return '';
    const at = email.indexOf('@');
    if (at < 1) return '';
    const local = email.slice(0, at).replace(/\+.*/, '');
    const parts = local
      .split(/[._\-]+/)
      .map(p => p.replace(/\d+/g, '').trim())
      .filter(p => p.length >= 2);
    if (parts.length === 0) return '';
    return parts
      .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(' ');
  },

  maybeGuessCandidateName(email) {
    this._maybeGuessNameInto('candidate-name', email);
  },

  maybeGuessContactName(email) {
    this._maybeGuessNameInto('contact-name', email);
  },

  _maybeGuessNameInto(inputId, email) {
    const nameInput = document.getElementById(inputId);
    if (!nameInput || nameInput.value.trim() !== '') return;
    if (!email.includes('@')) return;
    const guess = this.guessNameFromEmail(email);
    if (guess) nameInput.value = guess;
  },

  // Try to match the email domain against an existing company (contacts only).
  // Skips free-email providers and leaves the selection alone if the user
  // already picked a company.
  maybeGuessContactCompany(email) {
    const select = document.getElementById('contact-company');
    if (!select) return;
    if (select.value && select.value !== '') return;
    const key = this._companyKeyFromEmail(email);
    if (!key) return;
    const opts = Array.from(select.options).filter(o => o.value && o.value !== '__new__');
    const wordsOf = text => (text || '').toLowerCase().split(/[\s\-_.,&/]+/).filter(Boolean);
    // Prefer exact word match, fall back to prefix either direction
    let match = opts.find(o => wordsOf(o.textContent).includes(key));
    if (!match) {
      match = opts.find(o => wordsOf(o.textContent).some(w =>
        w.length >= 3 && (w.startsWith(key) || key.startsWith(w))));
    }
    if (match) select.value = match.value;
  },

  _companyKeyFromEmail(email) {
    if (!email || typeof email !== 'string') return '';
    const at = email.indexOf('@');
    if (at < 1 || at === email.length - 1) return '';
    const host = email.slice(at + 1).toLowerCase().trim();
    if (!host.includes('.')) return '';
    const freeProviders = new Set([
      'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'hotmail.com',
      'outlook.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com',
      'aol.com', 'protonmail.com', 'proton.me', 'pm.me', 'fastmail.com',
      'yandex.com', 'mail.com', 'zoho.com', 'gmx.com', 'gmx.de', 'web.de',
      'mailbox.org'
    ]);
    if (freeProviders.has(host)) return '';
    const parts = host.split('.');
    if (parts.length < 2) return '';
    const ccSecondLevel = new Set(['co', 'com', 'org', 'net', 'gov', 'edu', 'ac']);
    let key = parts[parts.length - 2];
    if (parts.length >= 3 && ccSecondLevel.has(key) && parts[parts.length - 1].length <= 3) {
      key = parts[parts.length - 3];
    }
    return key.length >= 3 ? key : '';
  },

  async saveCandidate(event, id) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('candidate-name').value);
    formData.append('email', document.getElementById('candidate-email').value);
    formData.append('phone', document.getElementById('candidate-phone').value);
    formData.append('role', document.getElementById('candidate-role').value);
    formData.append('skills', document.getElementById('candidate-skills').value);
    formData.append('category', document.getElementById('candidate-category').value);

    const resumeInput = document.getElementById('candidate-resume');
    if (resumeInput && resumeInput.files[0]) {
      formData.append('resume', resumeInput.files[0]);
    }

    try {
      let response;
      if (id) {
        response = await fetch(`/api/candidates/${id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        response = await fetch('/api/candidates', {
          method: 'POST',
          body: formData
        });
      }

      if (response.status === 401) {
        auth.showLoginModal();
        throw new Error('Authentication required');
      }

      // Duplicate email — offer to open the existing candidate instead.
      if (response.status === 409) {
        const data = await response.json();
        if (data.existingId && confirm(`${data.error}\n\nOpen the existing candidate?`)) {
          router.navigate('candidate-detail', { id: data.existingId });
        }
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save candidate');
      }

      const candidate = await response.json();
      router.navigate('candidate-detail', { id: candidate.id });
    } catch (err) {
      if (err.message !== 'Authentication required') {
        alert('Error: ' + err.message);
      }
    }
  },

  // Team Settings View (Owner or Solo user who wants to create a team)
  async teamSettings(container) {

    const teamData = await api.get('/api/team');
    const isSolo = auth.currentUser.role === 'solo';
    const isMember = auth.currentUser.role === 'member';
    const isOwner = auth.currentUser.role === 'owner';

    container.innerHTML = `
      <div class="mb-6">
        <a href="#" onclick="router.navigate('contacts'); return false;" class="text-sky-600 hover:text-sky-700 font-medium">
          ← Back to Contacts
        </a>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 mb-6 border border-slate-200">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">${isMember ? 'Settings' : isSolo ? 'Create a Team' : 'Team Settings'}</h2>

        ${!isMember ? `
        ${isSolo ? `
        <div class="mb-6 p-4 bg-sky-50 rounded-lg border border-sky-100">
          <p class="text-sky-800">Invite someone to create a team. Once they accept, you'll both be able to see and edit all data. You'll become the team owner.</p>
        </div>
        ` : ''}

        ${!isSolo ? `
        <!-- Team Logo -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Team Logo</h3>
          <p class="text-sm text-slate-500 mb-3">Upload a logo that will be displayed in the navigation bar for all team members.</p>
          <div class="flex items-center gap-4">
            <div id="current-logo-preview" class="w-24 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
              ${teamData.team?.logoFilename
                ? `<img src="/uploads/${teamData.team.logoFilename}" alt="Current logo" class="max-w-full max-h-full object-contain">`
                : `<span class="text-slate-400 text-sm">No logo</span>`
              }
            </div>
            <div class="flex flex-col gap-2">
              <input type="file" id="logo-file" accept="image/*" class="hidden" onchange="views.handleLogoUpload(event)">
              <button onclick="document.getElementById('logo-file').click()" class="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all font-medium shadow-sm text-sm">
                ${teamData.team?.logoFilename ? 'Change Logo' : 'Upload Logo'}
              </button>
              ${teamData.team?.logoFilename ? `
              <button onclick="views.removeLogo()" class="text-red-500 hover:text-red-700 text-sm font-medium">
                Remove Logo
              </button>
              ` : ''}
            </div>
          </div>
          <p class="text-xs text-slate-400 mt-2">Supported formats: PNG, JPG, GIF, WebP, SVG. Max size: 2MB.</p>
          <div id="logo-message" class="mt-2 text-sm hidden"></div>
        </div>
        ` : ''}

        <!-- Invite Member -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Invite Team Member</h3>
          <form onsubmit="views.sendInvitation(event)" class="flex gap-2">
            <input type="email" id="invite-email" placeholder="Enter email address" required autofocus
                   class="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            <button type="submit" class="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all font-medium shadow-sm">
              Send Invitation
            </button>
          </form>
          <div id="invite-message" class="mt-2 text-sm hidden"></div>
        </div>

        ${!isSolo ? `
        <!-- Pending Invitations -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Pending Invitations</h3>
          <div id="pending-invitations">
            ${this.renderPendingInvitations(teamData.invitations)}
          </div>
        </div>

        <!-- Team Members -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Team Members</h3>
          <div id="team-members" class="space-y-2">
            ${this.renderTeamMembers(teamData.members)}
          </div>
        </div>

        <!-- Transfer Ownership -->
        ${teamData.members && teamData.members.filter(m => !m.isOwner).length > 0 ? `
        <div class="border-t border-slate-200 pt-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Transfer Ownership</h3>
          <p class="text-sm text-slate-600 mb-4">Transfer team ownership to another member. You will become a regular member after the transfer.</p>
          <div class="flex gap-2">
            <select id="new-owner-select" class="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors">
              <option value="">Select a member...</option>
              ${teamData.members.filter(m => !m.isOwner).map(m => `
                <option value="${m.id}">${this.escapeHtml(m.username)} (${this.escapeHtml(m.email)})</option>
              `).join('')}
            </select>
            <button onclick="views.transferOwnership()" class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-sm">
              Transfer
            </button>
          </div>
        </div>
        ` : ''}
        ` : ''}
        ` : ''}

        <!-- Authorized Email Addresses (AI Inbox) -->
        <div class="border-t border-slate-200 pt-6 mt-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">My Email Addresses (AI Inbox)</h3>
          <p class="text-sm text-slate-600 mb-4">Register your email addresses here. Only emails from these addresses will be processed by the AI Inbox.</p>
          <form onsubmit="views.addUserEmail(event)" class="flex gap-2 mb-4">
            <input type="email" id="user-email-input" placeholder="your@email.com" required
                   class="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            <input type="text" id="user-email-label" placeholder="Label (e.g. Work)"
                   class="w-32 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            <button type="submit" class="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all font-medium shadow-sm">
              Add
            </button>
          </form>
          <div id="user-emails-list"></div>
          <div id="user-email-message" class="mt-2 text-sm hidden"></div>
        </div>

        <!-- Change Password -->
        <div class="border-t border-slate-200 pt-6 mt-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Change Password</h3>
          <form onsubmit="views.changePassword(event)" class="max-w-sm">
            <div class="mb-3">
              <label class="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input type="password" id="current-password" required
                     class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            </div>
            <div class="mb-3">
              <label class="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input type="password" id="new-password" required minlength="6"
                     class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            </div>
            <button type="submit" class="bg-gradient-to-r from-sky-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all font-medium shadow-sm text-sm">
              Change Password
            </button>
          </form>
          <div id="password-message" class="mt-2 text-sm hidden"></div>
        </div>

        <!-- Data Backup Section -->
        <div class="border-t border-slate-200 pt-6 mt-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Data Backup</h3>
          <p class="text-sm text-slate-600 mb-4">Export your data as a ZIP file including all uploaded files, or import a previously exported backup.</p>

          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Export -->
            <div class="flex-1 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 class="font-medium text-slate-700 mb-2">Export Data</h4>
              <p class="text-sm text-slate-500 mb-3">Download your data as a ZIP — companies, contacts, candidates, notes, ToDos, checklists, consultant requests &amp; matches, AI inbox emails, employment offers, and all uploaded files. Restorable via Import.</p>
              <button onclick="views.exportData()" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-medium shadow-sm">
                Download Backup
              </button>
              <p class="text-xs text-slate-400 mt-3 mb-2">Full database snapshot — an exact copy of the entire database (incl. users &amp; teams) for disaster recovery. Restore by replacing the server's database file.</p>
              <button onclick="views.downloadDbSnapshot()" class="w-full bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-all font-medium text-sm">
                Download Full Database
              </button>
            </div>

            <!-- Import -->
            <div class="flex-1 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 class="font-medium text-slate-700 mb-2">Import Data</h4>
              <p class="text-sm text-slate-500 mb-3">Restore data from a previously exported backup file. This will add to your existing data.</p>
              <input type="file" id="import-file" accept=".json,.zip" class="hidden" onchange="views.handleImportFile(event)">
              <button onclick="document.getElementById('import-file').click()" class="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all font-medium shadow-sm">
                Import Backup
              </button>
            </div>
          </div>
          <div id="backup-message" class="mt-3 text-sm hidden"></div>
        </div>
      </div>
    `;

    this._teamData = teamData;

    // Load user emails for AI inbox
    this.loadUserEmails();
  },

  async loadUserEmails() {
    try {
      const emails = await api.get('/api/user-emails');
      const container = document.getElementById('user-emails-list');
      if (!container) return;
      if (emails.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-sm">No email addresses registered yet.</p>';
      } else {
        container.innerHTML = emails.map(e => `
          <div class="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <span class="text-slate-800 font-medium">${this.escapeHtml(e.email)}</span>
              ${e.label ? `<span class="text-xs ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">${this.escapeHtml(e.label)}</span>` : ''}
            </div>
            <button onclick="views.removeUserEmail('${e.id}')" class="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
          </div>
        `).join('');
      }
    } catch (err) {
      console.error('Error loading user emails:', err);
    }
  },

  async addUserEmail(e) {
    e.preventDefault();
    const email = document.getElementById('user-email-input').value.trim();
    const label = document.getElementById('user-email-label').value.trim();
    const msgEl = document.getElementById('user-email-message');
    try {
      const res = await fetch('/api/user-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, label })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add email');
      }
      document.getElementById('user-email-input').value = '';
      document.getElementById('user-email-label').value = '';
      msgEl.textContent = `Added ${email}`;
      msgEl.className = 'mt-2 text-sm text-emerald-600';
      msgEl.classList.remove('hidden');
      setTimeout(() => msgEl.classList.add('hidden'), 3000);
      this.loadUserEmails();
    } catch (err) {
      msgEl.textContent = err.message || 'Failed to add email';
      msgEl.className = 'mt-2 text-sm text-red-600';
      msgEl.classList.remove('hidden');
    }
  },

  async changePassword(e) {
    e.preventDefault();
    const msgEl = document.getElementById('password-message');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: document.getElementById('current-password').value,
          newPassword: document.getElementById('new-password').value
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value = '';
      msgEl.textContent = 'Password changed successfully';
      msgEl.className = 'mt-2 text-sm text-emerald-600';
      msgEl.classList.remove('hidden');
      setTimeout(() => msgEl.classList.add('hidden'), 5000);
    } catch (err) {
      msgEl.textContent = err.message;
      msgEl.className = 'mt-2 text-sm text-red-600';
      msgEl.classList.remove('hidden');
    }
  },

  async removeUserEmail(emailId) {
    if (!confirm('Remove this email address?')) return;
    try {
      await api.delete(`/api/user-emails/${emailId}`);
      this.loadUserEmails();
    } catch (err) {
      alert('Failed to remove email');
    }
  },

  renderPendingInvitations(invitations) {
    if (!invitations || invitations.length === 0) {
      return '<p class="text-slate-500">No pending invitations</p>';
    }
    return invitations.map(inv => `
      <div class="flex items-center justify-between py-3 border-b border-slate-100">
        <div>
          <span class="text-slate-800 font-medium">${this.escapeHtml(inv.email)}</span>
          <span class="text-sm text-slate-500 ml-2">Sent ${formatDate(inv.createdAt)}</span>
        </div>
        <button onclick="views.cancelInvitation('${inv.id}')" class="text-red-500 hover:text-red-700 text-sm font-medium">
          Cancel
        </button>
      </div>
    `).join('');
  },

  renderTeamMembers(members) {
    return members.map(m => `
      <div class="flex items-center justify-between py-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="text-slate-800 font-medium">${this.escapeHtml(m.username)}</span>
          <span class="text-sm text-slate-500">(${this.escapeHtml(m.email)})</span>
          ${m.isOwner ? '<span class="px-2.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-medium">Owner</span>' : ''}
        </div>
        ${!m.isOwner ? `
          <button onclick="views.removeMember('${m.id}')" class="text-red-500 hover:text-red-700 text-sm font-medium">
            Remove
          </button>
        ` : ''}
      </div>
    `).join('');
  },

  async sendInvitation(event) {
    event.preventDefault();
    const email = document.getElementById('invite-email').value;
    const messageEl = document.getElementById('invite-message');

    const result = await teamManager.inviteMember(email);

    if (result.success) {
      messageEl.textContent = 'Invitation sent successfully!';
      messageEl.className = 'mt-2 text-sm text-green-600';
      messageEl.classList.remove('hidden');
      document.getElementById('invite-email').value = '';
      // Refresh auth state (user may have become owner)
      await auth.checkAuth();
      // Refresh the view
      await this.teamSettings(document.getElementById('app'));
    } else {
      messageEl.textContent = result.error || 'Failed to send invitation';
      messageEl.className = 'mt-2 text-sm text-red-600';
      messageEl.classList.remove('hidden');
    }
  },

  async cancelInvitation(invitationId) {
    if (!confirm('Cancel this invitation?')) return;
    await teamManager.cancelInvitation(invitationId);
    await this.teamSettings(document.getElementById('app'));
  },

  async handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const messageEl = document.getElementById('logo-message');

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      messageEl.textContent = 'File too large. Maximum size is 2MB.';
      messageEl.className = 'mt-2 text-sm text-red-600';
      messageEl.classList.remove('hidden');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await fetch('/api/team/logo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      messageEl.textContent = 'Logo uploaded successfully!';
      messageEl.className = 'mt-2 text-sm text-green-600';
      messageEl.classList.remove('hidden');

      // Refresh the logo in navbar
      auth.loadTeamLogo();

      // Refresh the settings view
      await this.teamSettings(document.getElementById('app'));
    } catch (err) {
      console.error('Logo upload error:', err);
      messageEl.textContent = 'Upload failed: ' + err.message;
      messageEl.className = 'mt-2 text-sm text-red-600';
      messageEl.classList.remove('hidden');
    }

    event.target.value = '';
  },

  async removeLogo() {
    if (!confirm('Remove the team logo?')) return;

    try {
      const res = await fetch('/api/team/logo', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to remove logo');
      }

      // Refresh the logo in navbar
      auth.loadTeamLogo();

      // Refresh the settings view
      await this.teamSettings(document.getElementById('app'));
    } catch (err) {
      console.error('Logo remove error:', err);
      alert('Failed to remove logo: ' + err.message);
    }
  },

  async removeMember(memberId) {
    if (!confirm('Remove this team member? They will lose access to team data but their created data will stay.')) return;
    await teamManager.removeMember(memberId);
    await this.teamSettings(document.getElementById('app'));
  },

  async transferOwnership() {
    const newOwnerId = document.getElementById('new-owner-select').value;
    if (!newOwnerId) {
      alert('Please select a member to transfer ownership to.');
      return;
    }
    if (!confirm('Are you sure you want to transfer ownership? You will become a regular member.')) return;

    const result = await teamManager.transferOwnership(newOwnerId);
    if (result.success) {
      await auth.checkAuth();
      router.navigate('contacts');
    } else {
      alert(result.error || 'Failed to transfer ownership');
    }
  },

  // Data Backup Functions
  async exportData() {
    try {
      const response = await fetch('/api/backup/export', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simple-crm-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      this.showBackupMessage('Data exported successfully!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      this.showBackupMessage('Export failed: ' + err.message, 'error');
    }
  },

  async downloadDbSnapshot() {
    try {
      this.showBackupMessage('Preparing full database snapshot…', 'success');
      const response = await fetch('/api/backup/db-snapshot', { method: 'GET', credentials: 'include' });
      if (!response.ok) {
        let msg = 'Snapshot failed';
        try { msg = (await response.json()).error || msg; } catch (_) {}
        throw new Error(msg);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simple-crm-full-db-${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.showBackupMessage('Full database snapshot downloaded.', 'success');
    } catch (err) {
      console.error('DB snapshot error:', err);
      this.showBackupMessage('Snapshot failed: ' + err.message, 'error');
    }
  },

  async handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const isZip = file.name.endsWith('.zip') || file.type === 'application/zip';

      if (isZip) {
        // ZIP import: upload the file directly
        if (!confirm(`Import backup from "${file.name}"?\n\nNote: This adds to your existing data, it does not replace it.`)) {
          event.target.value = '';
          return;
        }

        const formData = new FormData();
        formData.append('backup', file);

        const response = await fetch('/api/backup/import-zip', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Import failed');

        this.showBackupMessage(
          `Import successful! Added ${result.imported.companies} companies, ${result.imported.contacts} contacts, ${result.imported.candidates} candidates.`,
          'success'
        );
      } else {
        // Legacy JSON import
        const text = await file.text();
        const importData = JSON.parse(text);

        if (!importData.version || !importData.data) {
          throw new Error('Invalid backup file format');
        }

        const summary = [];
        if (importData.data.companies?.length) summary.push(`${importData.data.companies.length} companies`);
        if (importData.data.contacts?.length) summary.push(`${importData.data.contacts.length} contacts`);
        if (importData.data.candidates?.length) summary.push(`${importData.data.candidates.length} candidates`);

        if (!confirm(`Import backup from ${importData.exportedAt?.split('T')[0] || 'unknown date'}?\n\nThis will add: ${summary.join(', ') || 'no data'}\n\nNote: This adds to your existing data, it does not replace it.`)) {
          event.target.value = '';
          return;
        }

        const response = await fetch('/api/backup/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ importData })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Import failed');

        this.showBackupMessage(
          `Import successful! Added ${result.imported.companies} companies, ${result.imported.contacts} contacts, ${result.imported.candidates} candidates.`,
          'success'
        );
      }
    } catch (err) {
      console.error('Import error:', err);
      this.showBackupMessage('Import failed: ' + err.message, 'error');
    }

    event.target.value = '';
  },

  showBackupMessage(message, type) {
    const el = document.getElementById('backup-message');
    if (!el) return;
    el.classList.remove('hidden', 'text-green-600', 'text-red-600');
    el.classList.add(type === 'success' ? 'text-green-600' : 'text-red-600');
    el.textContent = message;
    setTimeout(() => el.classList.add('hidden'), 5000);
  },

  // Archive View - shows archived companies and contacts
  async archiveView(container) {
    const [companies, contacts] = await Promise.all([
      api.get('/api/archive/companies'),
      api.get('/api/archive/contacts')
    ]);

    container.innerHTML = `
      <div class="mb-6">
        <a href="#" onclick="router.navigate('contacts'); return false;" class="text-sky-600 hover:text-sky-700 font-medium">
          ← Back to Contacts
        </a>
      </div>

      <h1 class="text-2xl font-bold text-slate-800 mb-6">Archive</h1>

      <div class="bg-white shadow-sm rounded-xl p-6 mb-6 border border-slate-200">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Archived Companies (${companies.length})</h2>
        ${companies.length === 0 ? `
          <p class="text-slate-500">No archived companies</p>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-sm text-slate-500 border-b border-slate-200">
                  <th class="pb-3 font-medium">Company</th>
                  <th class="pb-3 font-medium">Contacts</th>
                  <th class="pb-3 font-medium">Archived</th>
                  <th class="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${companies.map(c => `
                  <tr class="border-b border-slate-100">
                    <td class="py-3">
                      <div class="font-medium text-slate-800">${this.escapeHtml(c.name)}</div>
                      ${c.technologies ? `<div class="text-sm text-slate-500">${this.escapeHtml(c.technologies)}</div>` : ''}
                    </td>
                    <td class="py-3 text-slate-600">${c.contactCount}</td>
                    <td class="py-3 text-sm text-slate-500">${new Date(c.archivedAt).toLocaleDateString()}</td>
                    <td class="py-3">
                      <button onclick="views.restoreCompany('${c.id}')"
                              class="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium">
                        Restore
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 mb-6 border border-slate-200">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Archived Contacts (${contacts.length})</h2>
        ${contacts.length === 0 ? `
          <p class="text-slate-500">No archived contacts</p>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-sm text-slate-500 border-b border-slate-200">
                  <th class="pb-3 font-medium">Contact</th>
                  <th class="pb-3 font-medium">Company</th>
                  <th class="pb-3 font-medium">Archived</th>
                  <th class="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${contacts.map(c => `
                  <tr class="border-b border-slate-100">
                    <td class="py-3">
                      <div class="font-medium text-slate-800">${this.escapeHtml(c.name)}</div>
                      ${c.role ? `<div class="text-sm text-slate-500">${this.escapeHtml(c.role)}</div>` : ''}
                    </td>
                    <td class="py-3 text-slate-600">${this.escapeHtml(c.companyName)}</td>
                    <td class="py-3 text-sm text-slate-500">${new Date(c.archivedAt).toLocaleDateString()}</td>
                    <td class="py-3">
                      <button onclick="views.restoreContact('${c.id}')"
                              class="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium">
                        Restore
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  // ============ AI Email Inbox ============

  async inboxList(container) {
    const emails = await api.get('/api/inbox');

    container.innerHTML = `
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">AI Inbox</h2>
          <p class="text-slate-500">${emails.length} email(s) processed</p>
        </div>
        <div class="flex gap-2">
          <button onclick="views.showSimulateEmailModal()"
                  class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-medium shadow-sm">
            + Simulate Email
          </button>
          <button id="extract-resumes-btn" onclick="views.extractAllResumes()"
                  class="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-all font-medium text-sm border border-slate-200 disabled:opacity-50"
                  title="Extract text from all uploaded resumes for AI matching">
            Extract Resumes
          </button>
        </div>
      </div>

      <div class="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        <div id="inbox-list" class="divide-y divide-slate-100">
          ${this.renderInboxRows(emails)}
        </div>
      </div>
    `;
  },

  renderInboxRows(emails) {
    if (emails.length === 0) {
      return '<div class="px-6 py-8 text-center text-slate-500">No emails yet. Use "Simulate Email" to test the AI inbox.</div>';
    }
    return emails.map(e => {
      const statusColor = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        completed: 'bg-emerald-100 text-emerald-800',
        failed: 'bg-red-100 text-red-800',
        review: 'bg-amber-100 text-amber-800'
      }[e.status] || 'bg-slate-100 text-slate-800';

      const classColor = {
        new_contact: 'bg-sky-100 text-sky-800',
        consultant_request: 'bg-violet-100 text-violet-800',
        todo: 'bg-emerald-100 text-emerald-800',
        pending: 'bg-slate-100 text-slate-500'
      }[e.classification] || 'bg-slate-100 text-slate-800';

      const classLabel = {
        new_contact: 'New Contact',
        consultant_request: 'Consultant Request',
        todo: 'ToDo',
        pending: 'Pending'
      }[e.classification] || e.classification;

      return `
      <div class="flex flex-wrap items-start px-4 sm:px-6 py-4 hover:bg-indigo-50/30 transition-colors cursor-pointer"
           onclick="router.navigate('inbox-detail', {id: '${e.id}'})">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="font-medium text-slate-800">${this.escapeHtml(e.fromName || e.fromEmail)}</span>
            <span class="text-xs px-2 py-0.5 rounded-full ${classColor}">${classLabel}</span>
            <span class="text-xs px-2 py-0.5 rounded-full ${statusColor} inline-flex items-center gap-1.5">
              ${e.status === 'processing' || e.status === 'pending'
                ? '<span class="inline-block w-2.5 h-2.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>'
                : ''}${e.status}
            </span>
            ${(e.status === 'processing' || e.status === 'pending') && this._inboxStageLabels[e.stage]
              ? `<span class="text-xs text-slate-500">${this.escapeHtml(this._inboxStageLabels[e.stage])}</span>`
              : ''}
          </div>
          <div class="text-sm text-slate-700 font-medium">${this.escapeHtml(e.subject || '(no subject)')}</div>
          <div class="text-sm text-slate-500 mt-1 truncate">${this.escapeHtml(e.body.substring(0, 120))}${e.body.length > 120 ? '...' : ''}</div>
          ${e.actionSummary ? `<div class="text-xs text-indigo-600 mt-1">${this.escapeHtml(e.actionSummary)}</div>` : ''}
        </div>
        <div class="text-xs text-slate-400 ml-4 mt-1 shrink-0 text-right">
          <div>${formatDateTime(e.createdAt)}</div>
          ${e.createdByUsername ? `<div class="text-slate-500">${this.escapeHtml(e.createdByUsername)}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  },

  async inboxDetail(container, emailId) {
    const email = await api.get(`/api/inbox/${emailId}`);

    // A job may still be running — because we just submitted it, because we
    // reloaded/deep-linked into a running one, or because a teammate started it.
    // Polling therefore belongs here rather than in the submit handler, so every
    // route into this view resumes progress instead of showing a frozen badge.
    const isRunning = email.status === 'pending' || email.status === 'processing';

    const classMap = { new_contact: 'New Contact', consultant_request: 'Consultant Request', todo: 'ToDo', pending: 'Pending' };
    const classColorMap = { new_contact: 'bg-sky-100 text-sky-800', consultant_request: 'bg-violet-100 text-violet-800', todo: 'bg-emerald-100 text-emerald-800' };
    const classTypes = (email.classification || 'pending').split(', ').map(c => c.trim());
    const classLabelsHtml = classTypes.map(c => {
      const label = classMap[c] || c;
      const color = classColorMap[c] || 'bg-slate-100 text-slate-800';
      return `<span class="text-sm px-3 py-1 rounded-full ${color}">${label}</span>`;
    }).join(' ');

    const statusColor = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      failed: 'bg-red-100 text-red-800',
      review: 'bg-amber-100 text-amber-800'
    }[email.status] || 'bg-slate-100 text-slate-800';

    // Build action links — supports multiple actions (comma-separated types/ids)
    let actionLinks = '';
    if (email.status === 'completed' && email.actionType) {
      const types = email.actionType.split(', ');
      const ids = email.actionId ? email.actionId.split(', ') : [];
      const links = [];
      for (let i = 0; i < types.length; i++) {
        const t = types[i].trim();
        const id = (ids[i] || '').trim();
        if (t === 'new_contact' || t === 'existing_contact') {
          links.push(`<a href="#" onclick="router.navigate('contact-detail', {id: '${id}'}); return false;" class="text-sky-600 hover:text-sky-700 font-medium">View Contact →</a>`);
        } else if (t === 'consultant_request') {
          links.push(`<a href="#" onclick="router.navigate('request-detail', {id: '${id}'}); return false;" class="text-violet-600 hover:text-violet-700 font-medium">View Request →</a>`);
        } else if (t === 'todo') {
          links.push(`<a href="#" onclick="router.navigate('todos'); return false;" class="text-emerald-600 hover:text-emerald-700 font-medium">View ToDos →</a>`);
        }
      }
      actionLinks = links.join(' &nbsp; ');
    }

    container.innerHTML = `
      <div class="mb-6">
        <a href="#" onclick="router.navigate('inbox'); return false;" class="text-indigo-600 hover:text-indigo-700 font-medium">
          ← Back to Inbox
        </a>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 mb-6 border border-slate-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-800">${this.escapeHtml(email.subject || '(no subject)')}</h2>
            <p class="text-slate-600">From: ${this.escapeHtml(email.fromName ? email.fromName + ' <' + email.fromEmail + '>' : email.fromEmail)}</p>
            <p class="text-sm text-slate-400">Received: ${formatDateTime(email.createdAt)}</p>
          </div>
          <div class="flex items-center gap-2">
            ${classLabelsHtml}
            <span class="text-sm px-3 py-1 rounded-full ${statusColor}">${email.status}</span>
          </div>
        </div>

        ${isRunning ? `
        <div id="inbox-progress" class="bg-indigo-50 rounded-lg p-4 mb-4 border border-indigo-200">
          <div class="flex items-center gap-3">
            <span class="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0"></span>
            <div class="text-sm font-medium text-indigo-800">
              ${this.escapeHtml(this._inboxStageLabels[email.stage] || 'Processing…')}
            </div>
          </div>
        </div>
        ` : ''}

        ${email.confidence ? `<div class="text-sm text-slate-500 mb-4">Confidence: ${Math.round(email.confidence * 100)}%</div>` : ''}

        <div class="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
          <h3 class="text-sm font-semibold text-slate-600 mb-2">Email Body</h3>
          <pre class="text-sm text-slate-700 whitespace-pre-wrap font-sans">${this.escapeHtml(email.body)}</pre>
        </div>

        ${email.extractedData && (Array.isArray(email.extractedData) ? email.extractedData.length > 0 : Object.keys(email.extractedData).length > 0) ? `
        <div class="bg-indigo-50 rounded-lg p-4 mb-4 border border-indigo-200">
          <h3 class="text-sm font-semibold text-indigo-700 mb-2">Extracted Data</h3>
          ${(Array.isArray(email.extractedData) ? email.extractedData : [email.extractedData]).map((item, idx) => `
            ${Array.isArray(email.extractedData) && email.extractedData.length > 1 ? `<div class="text-xs font-bold text-indigo-600 uppercase mt-${idx > 0 ? '3' : '0'} mb-1">${this.escapeHtml(item.classification || 'Action ' + (idx + 1))}</div>` : ''}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${Object.entries(item).filter(([key]) => key !== 'classification').map(([key, val]) =>
                val ? `<div><span class="text-xs text-indigo-500 uppercase">${this.escapeHtml(key.replace(/_/g, ' '))}</span><br><span class="text-sm text-slate-800">${this.escapeHtml(String(val))}</span></div>` : ''
              ).join('')}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${email.actionSummary ? `
        <div class="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-200">
          <h3 class="text-sm font-semibold text-emerald-700 mb-2">Actions Taken</h3>
          <div id="inbox-actions-list">
            ${this.renderInboxActions(email)}
          </div>
        </div>
        ` : ''}

        ${email.errorMessage ? `
        <div class="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
          <h3 class="text-sm font-semibold text-red-700 mb-2">Error</h3>
          <p class="text-sm text-red-600">${this.escapeHtml(email.errorMessage)}</p>
        </div>
        ` : ''}

        <div class="flex gap-2 mt-4">
          ${email.status === 'failed' || email.status === 'review' ? `
          <button id="reprocess-btn" onclick="views.reprocessEmail('${email.id}')"
                  class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-medium shadow-sm text-sm disabled:opacity-50">
            Reprocess
          </button>
          ` : ''}
          <button onclick="views.deleteInboxEmail('${email.id}')"
                  class="text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2">
            Delete
          </button>
        </div>
      </div>
    `;

    if (isRunning) {
      this.pollInboxStatus(emailId);
    } else {
      // Terminal state — retire any loop still polling this view.
      this._inboxPollToken++;
    }
  },

  showSimulateEmailModal() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Paste Email</h3>
      <p class="text-sm text-slate-500 mb-4">Paste the raw email content below. Can be a single email or a conversation thread. The AI will extract sender, subject and content automatically.</p>
      <form onsubmit="views.submitSimulatedEmail(event)">
        <div>
          <textarea id="sim-raw-email" rows="14" required autofocus
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    placeholder="Paste email here, e.g.:

From: Johan Svensson <johan@example.com>
Subject: Need a Java developer
Date: 2026-05-26

Hi Thomas,

We're looking for a senior Java developer..."></textarea>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button type="button" onclick="modal.hide()" class="px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
          <button type="submit" id="sim-submit-btn" class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-medium shadow-sm">
            Send to AI
          </button>
        </div>
      </form>
    `;
    modal.show();
  },

  async submitSimulatedEmail(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('sim-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
      const rawEmail = document.getElementById('sim-raw-email').value.trim();
      if (!rawEmail) throw new Error('Please paste an email');

      const res = await fetch('/api/inbox/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      modal.hide();
      // The detail view starts its own polling (see inboxDetail).
      router.navigate('inbox-detail', { id: data.id });
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send to AI';
      alert('Error: ' + (err.message || 'Failed to process email'));
    }
  },

  // Token identifying the poll loop that currently "owns" the inbox detail view.
  // Navigating to another email (or away and back) bumps it, so a stale loop
  // exits instead of racing the new one for the same DOM node.
  _inboxPollToken: 0,

  // Poll an inbox email until it reaches a terminal state.
  //
  // The AI job takes 30s-3min (classify + optional resume backfill + chunked
  // candidate matching, all queued behind a shared concurrency gate). The old
  // loop gave up after ~31s, which left the page frozen on "processing" forever
  // even though the work completed fine in the background — the reported bug.
  //
  // So: no fixed attempt cap. Poll briskly at first, then back off to keep the
  // request rate low on long jobs, and stop when the user navigates away.
  async pollInboxStatus(emailId) {
    const token = ++this._inboxPollToken;
    const startedAt = Date.now();
    const MAX_WAIT_MS = 15 * 60 * 1000; // safety stop; jobs never legitimately run this long

    const delayFor = (elapsed) => {
      if (elapsed < 30000) return 2000;   // first 30s — user is watching
      if (elapsed < 120000) return 4000;  // next 90s
      return 8000;                        // long tail
    };

    const poll = async () => {
      // Stale loop, or the user left this email's detail view.
      if (token !== this._inboxPollToken) return;
      if (router.currentRoute?.route !== 'inbox-detail' ||
          router.currentRoute?.params?.id !== emailId) return;

      const elapsed = Date.now() - startedAt;
      if (elapsed > MAX_WAIT_MS) {
        this._renderInboxStalled(emailId);
        return;
      }

      try {
        const email = await api.get(`/api/inbox/${emailId}`);
        if (token !== this._inboxPollToken) return;

        if (email.status === 'completed' || email.status === 'failed' || email.status === 'review') {
          await this.inboxDetail(document.getElementById('app'), emailId);
          return;
        }
        // Still running — refresh just the progress line, not the whole view,
        // so we don't fight the user's scroll position every few seconds.
        this._renderInboxProgress(email, elapsed);
        setTimeout(poll, delayFor(elapsed));
      } catch (err) {
        if (token !== this._inboxPollToken) return;
        // Transient (429, blip, server restart) — keep waiting, slower.
        setTimeout(poll, Math.max(4000, delayFor(elapsed)));
      }
    };

    setTimeout(poll, 1500);
  },

  _inboxStageLabels: {
    classifying: 'Reading and classifying the email…',
    extracting_resumes: 'Extracting text from new CVs…',
    matching: 'Matching candidates against the request…',
    executing: 'Creating contacts, requests and ToDos…'
  },

  _renderInboxProgress(email, elapsedMs) {
    const el = document.getElementById('inbox-progress');
    if (!el) return;
    const label = this._inboxStageLabels[email.stage] || 'Processing…';
    const secs = Math.round(elapsedMs / 1000);
    const elapsedText = secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
    el.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0"></span>
        <div>
          <div class="text-sm font-medium text-indigo-800">${this.escapeHtml(label)}</div>
          <div class="text-xs text-indigo-500 mt-0.5">
            Running for ${elapsedText}. This can take a couple of minutes — you can leave this page, the work continues.
          </div>
        </div>
      </div>`;
  },

  _renderInboxStalled(emailId) {
    const el = document.getElementById('inbox-progress');
    if (!el) return;
    el.innerHTML = `
      <div class="text-sm text-amber-800">
        Still processing after 15 minutes — something is likely stuck.
        <button onclick="views.inboxDetail(document.getElementById('app'), '${emailId}')"
                class="underline font-medium ml-1">Refresh</button>
      </div>`;
  },

  async reprocessEmail(emailId) {
    // Disable immediately: a double-click used to start two concurrent runs.
    // The server rejects the second with 409, but there is no reason to send it.
    const btn = document.getElementById('reprocess-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Starting…'; }
    try {
      await api.post(`/api/inbox/${emailId}/reprocess`);
      // Re-render; the view sees status 'processing' and starts polling.
      await this.inboxDetail(document.getElementById('app'), emailId);
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = 'Reprocess'; }
      if (String(err.message).includes('409')) {
        // Someone else already started it — just show the live state.
        await this.inboxDetail(document.getElementById('app'), emailId);
        return;
      }
      alert('Error: ' + err.message);
    }
  },

  renderInboxActions(email) {
    const types = (email.actionType || '').split(', ').map(s => s.trim());
    const ids = (email.actionId || '').split(', ').map(s => s.trim());
    const summaries = (email.actionSummary || '').split(' | ').map(s => s.trim());

    return types.map((t, i) => {
      const id = ids[i] || '';
      const summary = summaries[i] || t;
      const isContact = t === 'new_contact' || t === 'existing_contact';
      const isRequest = t === 'consultant_request';
      const isTodo = t === 'todo';

      const typeLabel = { new_contact: 'Contact', existing_contact: 'Contact', consultant_request: 'Request', todo: 'ToDo' }[t] || t;
      const typeColor = { new_contact: 'bg-sky-100 text-sky-700', existing_contact: 'bg-sky-100 text-sky-700', consultant_request: 'bg-violet-100 text-violet-700', todo: 'bg-emerald-100 text-emerald-700' }[t] || 'bg-slate-100 text-slate-600';

      let viewLink = '';
      if (isContact && id) viewLink = `<a href="#" onclick="router.navigate('contact-detail', {id: '${id}'}); return false;" class="text-sky-600 hover:text-sky-700 text-xs font-medium">View</a>`;
      else if (isRequest && id) viewLink = `<a href="#" onclick="router.navigate('request-detail', {id: '${id}'}); return false;" class="text-violet-600 hover:text-violet-700 text-xs font-medium">View</a>`;
      else if (isTodo) viewLink = `<a href="#" onclick="router.navigate('todos'); return false;" class="text-emerald-600 hover:text-emerald-700 text-xs font-medium">View</a>`;

      const deleteBtn = (isContact && id && t === 'new_contact')
        ? `<button onclick="views.undoInboxAction('${email.id}', '${id}', 'contact', ${i})" class="text-red-400 hover:text-red-600 text-xs font-medium ml-auto">Delete</button>`
        : '';

      return `
        <div class="flex items-center gap-2 py-1.5 ${i > 0 ? 'border-t border-emerald-200/50' : ''}" id="inbox-action-${i}">
          <span class="text-xs px-2 py-0.5 rounded-full ${typeColor}">${typeLabel}</span>
          <span class="text-sm text-slate-700 flex-1">${this.escapeHtml(summary)}</span>
          ${viewLink}
          ${deleteBtn}
        </div>`;
    }).join('');
  },

  async undoInboxAction(emailId, entityId, entityType, actionIndex) {
    if (!confirm('Delete this contact? This cannot be undone.')) return;
    try {
      if (entityType === 'contact') {
        await api.delete(`/api/contacts/${entityId}`);
      }
      // Remove the action row from the UI
      const row = document.getElementById(`inbox-action-${actionIndex}`);
      if (row) {
        row.innerHTML = `<span class="text-xs text-slate-400 italic">Deleted</span>`;
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  async deleteInboxEmail(emailId) {
    if (!confirm('Delete this email from inbox?')) return;
    try {
      await api.delete(`/api/inbox/${emailId}`);
      router.navigate('inbox');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  // Backfill CV text in bounded batches. The endpoint used to parse the entire
  // library in one request, blocking the server for everyone; it now returns
  // after a batch and reports what is left, so we loop here with the UI alive.
  async extractAllResumes() {
    const btn = document.getElementById('extract-resumes-btn');
    if (btn) { btn.disabled = true; }
    let extracted = 0;
    let skipped = 0;
    try {
      // Bounded: each round must make progress, so a stuck row can't spin forever.
      for (let round = 0; round < 40; round++) {
        if (btn) btn.textContent = round === 0 ? 'Extracting…' : `Extracting… (${extracted} done)`;
        const result = await api.post('/api/inbox/extract-resumes');
        extracted += result.extracted || 0;
        skipped += result.skipped || 0;
        if (result.done || (result.extracted === 0 && result.skipped === 0)) break;
      }
      alert(`Extracted text from ${extracted} resume(s).` +
            (skipped > 0 ? ` ${skipped} had no extractable content and won't be retried.` : ''));
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Extract Resumes'; }
    }
  },

  // ============ Consultant Requests ============

  async requestList(container) {
    const requests = await api.get('/api/requests');

    // Sort: active first (open, in_progress), then closed/filled
    const activeStatuses = ['open', 'in_progress'];
    const sorted = [...requests].sort((a, b) => {
      const aActive = activeStatuses.includes(a.status) ? 0 : 1;
      const bActive = activeStatuses.includes(b.status) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    container.innerHTML = `
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Consultant Requests</h2>
          <p class="text-slate-500">${requests.filter(r => activeStatuses.includes(r.status)).length} active, ${requests.length} total</p>
        </div>
      </div>

      <div class="mb-4">
        <input type="text" id="request-search-input" placeholder="Search requests..." autofocus
               class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
               oninput="views.filterRequests()" onkeydown="views.requestSearchKey(event)" autocomplete="off">
      </div>

      <div class="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        <table class="responsive-table min-w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Request</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Matches</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody id="requests-table" class="divide-y divide-slate-100">
            ${sorted.length === 0
              ? `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500">No consultant requests yet. They are created automatically when the AI Inbox receives a request email.</td></tr>`
              : this.renderRequestRows(sorted)}
          </tbody>
        </table>
      </div>
    `;

    this._requests = sorted;
    this._requestActiveIndex = -1;
  },

  renderRequestRows(requests) {
    if (!requests || requests.length === 0) {
      return `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500">No matching requests</td></tr>`;
    }
    return requests.map(r => {
      const isClosed = r.status === 'closed' || r.status === 'filled';
      const statusColor = { open: 'bg-emerald-100 text-emerald-800', in_progress: 'bg-blue-100 text-blue-800', filled: 'bg-violet-100 text-violet-800', closed: 'bg-slate-100 text-slate-600' }[r.status] || 'bg-slate-100 text-slate-600';
      const ageMs = r.createdAt ? Date.now() - new Date(r.createdAt).getTime() : Infinity;
      const isNew = ageMs >= 0 && ageMs < 3 * 24 * 60 * 60 * 1000;
      const newBadge = isNew ? `<span class="text-xs font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded mr-1 align-middle">New</span>` : '';
      return `
      <tr class="${isClosed ? 'opacity-50' : 'hover:bg-violet-50/30'} transition-colors cursor-pointer" data-request-id="${r.id}" onclick="router.navigate('request-detail', {id: '${r.id}'})">
        <td class="px-6 py-4" data-label="Request">
          <div class="font-medium ${isClosed ? 'text-slate-400 line-through' : 'text-slate-800'}">${newBadge}${this.escapeHtml(r.title)}</div>
          ${r.role ? `<div class="text-sm text-slate-500">${this.escapeHtml(r.role)}</div>` : ''}
        </td>
        <td class="px-6 py-4 text-slate-600" data-label="Client">${this.escapeHtml(r.clientName || r.clientEmail || '-')}</td>
        <td class="px-6 py-4 text-sm text-slate-600" data-label="Skills">${this.escapeHtml((r.requiredSkills || '').replace(/\*\*/g, '').substring(0, 60))}${(r.requiredSkills || '').length > 60 ? '...' : ''}</td>
        <td class="px-6 py-4" data-label="Matches">
          ${r.matchedCandidates && r.matchedCandidates.length > 0
            ? `<span class="text-violet-600 font-medium">${r.matchedCandidates.length} match(es)</span>`
            : '<span class="text-slate-400">None</span>'}
        </td>
        <td class="px-6 py-4" data-label="Status"><span class="text-xs px-2 py-1 rounded-full ${statusColor}">${r.status}</span></td>
        <td class="px-6 py-4 text-sm text-slate-500" data-label="Date">
          <div>${formatDateTime(r.createdAt)}</div>
          ${r.createdByUsername ? `<div class="text-xs text-slate-400">${this.escapeHtml(r.createdByUsername)}</div>` : ''}
        </td>
      </tr>`;
    }).join('');
  },

  _requestMatchesQuery(r, query) {
    return (r.title || '').toLowerCase().includes(query) ||
      (r.role || '').toLowerCase().includes(query) ||
      (r.clientName || '').toLowerCase().includes(query) ||
      (r.clientEmail || '').toLowerCase().includes(query) ||
      (r.requiredSkills || '').replace(/\*\*/g, '').toLowerCase().includes(query) ||
      (r.description || '').toLowerCase().includes(query) ||
      (r.status || '').toLowerCase().includes(query);
  },

  filterRequests() {
    const input = document.getElementById('request-search-input');
    const tbody = document.getElementById('requests-table');
    if (!tbody) return;
    const all = this._requests || [];
    if (all.length === 0) return; // keep the "no requests yet" message
    const query = (input ? input.value : '').toLowerCase();
    const filtered = query ? all.filter(r => this._requestMatchesQuery(r, query)) : all;
    tbody.innerHTML = this.renderRequestRows(filtered);

    if (query && filtered.length) {
      this._highlightRequest(0);
    } else {
      this._requestRows().forEach(r => r.classList.remove('bg-violet-100'));
      this._requestActiveIndex = -1;
    }
  },

  // Selectable request <tr> rows (excludes the empty-state row)
  _requestRows() {
    const tbody = document.getElementById('requests-table');
    return tbody ? Array.from(tbody.querySelectorAll('tr[data-request-id]')) : [];
  },

  _highlightRequest(index) {
    const rows = this._requestRows();
    rows.forEach(r => r.classList.remove('bg-violet-100'));
    if (rows.length === 0) { this._requestActiveIndex = -1; return; }
    const i = Math.max(0, Math.min(index, rows.length - 1));
    rows[i].classList.add('bg-violet-100');
    rows[i].scrollIntoView({ block: 'nearest' });
    this._requestActiveIndex = i;
  },

  // ↓/↑ move the highlight through the filtered requests; Enter opens the
  // highlighted request — without leaving the search box.
  requestSearchKey(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this._highlightRequest((this._requestActiveIndex ?? -1) + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this._highlightRequest((this._requestActiveIndex ?? 0) - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const rows = this._requestRows();
      const el = rows[this._requestActiveIndex ?? 0] || rows[0];
      if (el) router.navigate('request-detail', { id: el.getAttribute('data-request-id') });
    }
  },

  async requestDetail(container, requestId) {
    const request = await api.get(`/api/requests/${requestId}`);

    const statusColor = { open: 'bg-emerald-100 text-emerald-800', in_progress: 'bg-blue-100 text-blue-800', filled: 'bg-violet-100 text-violet-800', closed: 'bg-slate-100 text-slate-600' }[request.status] || 'bg-slate-100 text-slate-600';
    const urgencyLabel = { urgent: 'Urgent', high: 'High', normal: 'Normal', low: 'Low' }[request.urgency] || request.urgency;

    // Background matching state: while a job runs the button row becomes a
    // progress line, and a finished job leaves a diff summary behind.
    const matchRunning = request.matchState?.status === 'running';
    // Solo users own every profile, so the owner pill would be pure noise —
    // same convention as the "Added By" column on the candidates list.
    const matchHasTeam = auth.currentUser?.role === 'owner' || auth.currentUser?.role === 'member';

    container.innerHTML = `
      <div class="mb-6">
        <a href="#" onclick="router.navigate('requests'); return false;" class="text-violet-600 hover:text-violet-700 font-medium">
          ← Back to Requests
        </a>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 mb-6 border border-slate-200">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-800">${this.escapeHtml(request.title)}</h2>
            ${request.role ? `<p class="text-slate-600">Role: ${this.escapeHtml(request.role)}</p>` : ''}
            <p class="text-sm text-slate-400">Created: ${formatDateTime(request.createdAt)}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm px-3 py-1 rounded-full ${statusColor}">${request.status}</span>
            <select onchange="views.updateRequestStatus('${request.id}', this.value)"
                    class="text-sm px-3 py-1.5 border border-slate-300 rounded-lg">
              ${['open', 'in_progress', 'filled', 'closed'].map(s =>
                `<option value="${s}" ${request.status === s ? 'selected' : ''}>${s.replace('_', ' ')}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          ${request.clientName ? `<div><span class="text-sm text-slate-500">Client:</span> <span class="text-slate-800">${this.escapeHtml(request.clientName)}</span></div>` : ''}
          ${request.clientEmail ? `<div><span class="text-sm text-slate-500">Email:</span> <a href="mailto:${this.escapeHtml(request.clientEmail)}" class="text-sky-600 hover:text-sky-700">${this.escapeHtml(request.clientEmail)}</a></div>` : ''}
          <div><span class="text-sm text-slate-500">Urgency:</span> <span class="text-slate-800">${urgencyLabel}</span></div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-600 mb-1">Required Skills <span class="text-xs text-slate-400 font-normal">(click = prioritize, double-click = edit, x = remove)</span></label>
          <div id="req-skills-tags" class="flex flex-wrap gap-2 p-2 border border-slate-300 rounded-lg min-h-[42px] bg-white">
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-600 mb-1">Description</label>
          <textarea id="req-desc-input" rows="4"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                    placeholder="Describe what's needed...">${this.escapeHtml(request.description || '')}</textarea>
          ${request.emailInboxId ? `
          <button onclick="views.showRequestSource('${request.id}')" id="show-source-btn"
                  class="mt-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium">
            Visa hela beskrivningen
          </button>
          <span class="text-xs text-slate-400 ml-1">(ursprungsmejlet — beskrivningen ovan är AI:ns sammanfattning)</span>
          ` : ''}
        </div>

        <div id="rematch-row" class="flex gap-2 mb-6 items-center">
          ${matchRunning ? this._matchProgressHtml(request.matchState, 0) : `
          <button onclick="views.saveAndRematchRequest('${request.id}')" id="rematch-btn"
                  class="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all font-medium shadow-sm text-sm">
            Save &amp; Re-match
          </button>
          <button onclick="views.fullRematchRequest('${request.id}')" id="full-rematch-btn"
                  title="Poängsätter varje CV i hela biblioteket med fullständig CV-text, utan cache och utan förfiltrering — för att verifiera att ingen kandidat fallit bort på grund av optimeringarna. Långsam och kostar mer."
                  class="border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800 px-4 py-2 rounded-lg transition-all font-medium text-sm">
            Full ommatchning (alla CV)
          </button>
          <button onclick="views.deleteRequest('${request.id}')"
                  class="text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2">Delete Request</button>
          `}
        </div>
      </div>

      ${this._matchSummaryHtml(request)}

      <div class="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-800">Matched Candidates</h3>
          ${request.matchedCandidates && request.matchedCandidates.length > 0 ? `
          <button onclick="views.sendSelectedCandidates('${request.id}')" id="send-selected-btn"
                  class="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all font-medium shadow-sm text-sm">
            Send Selected via Outlook
          </button>
          ` : ''}
        </div>
        ${request.matchedCandidates && request.matchedCandidates.length > 0 ? `
        <div class="space-y-3">
          ${request.matchedCandidates.map((m, i) => {
            const status = m.sent ? (m.status || 'sent') : null;
            const sm = status ? this._matchStatusMeta[status] : null;
            const rowCls = sm ? sm.border : (i === 0 ? 'border-violet-200 bg-violet-50/50' : 'border-slate-200 bg-slate-50/50');
            const avatarCls = sm ? sm.avatar : (i === 0 ? 'bg-violet-200 text-violet-800' : 'bg-slate-200 text-slate-600');
            return `
          <div class="flex items-start gap-3 p-4 rounded-lg border ${rowCls}">
            <input type="checkbox" class="match-select-cb mt-1 h-5 w-5 text-violet-600 rounded border-slate-300 focus:ring-violet-500 cursor-pointer"
                   data-candidate-id="${m.candidateId}" data-index="${i}">
            <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${avatarCls}">
              ${m.score}%
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <a href="#" onclick="router.navigate('candidate-detail', {id: '${m.candidateId}'}); return false;"
                   class="font-medium text-violet-600 hover:text-violet-700">${this.escapeHtml(m.candidateName || 'Unknown')}</a>
                ${m.candidateRole ? `<span class="text-sm text-slate-500">${this.escapeHtml(m.candidateRole)}</span>` : ''}
                ${m.candidateCategory ? `<span class="text-xs px-2 py-0.5 rounded-full ${
                  m.candidateCategory === 'in_progress' ? 'bg-emerald-100 text-emerald-700' :
                  m.candidateCategory === 'employed_no_assignment' ? 'bg-emerald-200 text-emerald-900' :
                  m.candidateCategory === 'contact_later' ? 'bg-red-100 text-red-600' :
                  'bg-slate-100 text-slate-600'
                }">${this.escapeHtml(this._candidateCategories[m.candidateCategory] || m.candidateCategory)}</span>` : ''}
                ${matchHasTeam && m.candidateOwner ? `<span class="text-xs px-2 py-0.5 rounded-full ${
                  m.candidateOwnerId === auth.currentUser?.id ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'
                }" title="Profilens ägare">${this.escapeHtml(m.candidateOwner)}</span>` : ''}
              </div>
              ${m.candidateSkills ? `<div class="text-sm text-slate-500 mt-0.5">${this.escapeHtml(m.candidateSkills)}</div>` : ''}
              ${m.strengths ? `<p class="text-sm text-emerald-700 mt-1">${this.escapeHtml(m.strengths)}</p>` : ''}
              ${m.gaps ? `<p class="text-sm text-red-500 mt-1">${this.escapeHtml(m.gaps)}</p>` : ''}
              ${!m.strengths && m.reasoning ? `<p class="text-sm text-slate-600 mt-1">${this.escapeHtml(m.reasoning)}</p>` : ''}
            </div>
            ${status ? `
            <div class="flex-shrink-0 self-center">
              <select onchange="views.setCandidateStatus('${request.id}', '${m.candidateId}', this.value)"
                      class="text-xs px-2 py-1 rounded-lg border font-medium cursor-pointer focus:ring-2 focus:ring-violet-400 ${sm.badge}"
                      title="Client response status">
                ${['sent','declined','interview','accepted'].map(s =>
                  `<option value="${s}" ${s === status ? 'selected' : ''}>${this._matchStatusMeta[s].label}</option>`
                ).join('')}
              </select>
            </div>` : ''}
          </div>`;
          }).join('')}
        </div>
        ` : `
        <p class="text-slate-500">No matching candidates found. Make sure candidates have uploaded resumes and click "Extract Resumes" in the Inbox tab.</p>
        `}
      </div>
    `;

    // Initialize skill tags after DOM is set
    this.initSkillTags(request.requiredSkills);

    // A job may already be running — started by this tab, another tab, or a
    // teammate. Either way the view should follow it to completion.
    if (matchRunning) this.pollRequestMatch(requestId);
  },

  async updateRequestStatus(requestId, status) {
    try {
      await api.put(`/api/requests/${requestId}`, { status });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  // Client-response status styling for sent candidates in a request's match list
  _matchStatusMeta: {
    sent:      { label: 'Sent',      border: 'border-blue-300 bg-blue-100',       avatar: 'bg-blue-300 text-blue-900',       badge: 'bg-blue-200 text-blue-800' },
    declined:  { label: 'Declined',  border: 'border-red-200 bg-red-50',          avatar: 'bg-red-200 text-red-800',         badge: 'bg-red-100 text-red-700' },
    interview: { label: 'Interview', border: 'border-amber-200 bg-amber-50',      avatar: 'bg-amber-200 text-amber-900',     badge: 'bg-amber-100 text-amber-700' },
    accepted:  { label: 'Accepted',  border: 'border-emerald-300 bg-emerald-50',  avatar: 'bg-emerald-200 text-emerald-900', badge: 'bg-emerald-100 text-emerald-700' },
  },

  async setCandidateStatus(requestId, candidateId, status) {
    try {
      await api.put(`/api/requests/${requestId}/candidates/${candidateId}/status`, { status });
      await this.requestDetail(document.getElementById('app'), requestId);
    } catch (err) {
      alert('Error: ' + (err.message || err));
    }
  },

  // Skills tag management
  _skillTags: [],

  initSkillTags(skillsString) {
    // Parse "**Angular**, C++, **Python**" into [{text, priority}]
    this._skillTags = (skillsString || '').split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        const priority = s.startsWith('**') && s.endsWith('**');
        const text = priority ? s.slice(2, -2) : s;
        return { text, priority };
      });
    this.renderSkillTags();
  },

  renderSkillTags() {
    const container = document.getElementById('req-skills-tags');
    if (!container) return;
    container.innerHTML = this._skillTags.map((tag, i) => `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm cursor-pointer select-none transition-all
        ${tag.priority ? 'bg-violet-200 text-violet-900 font-bold ring-2 ring-violet-400' : 'bg-slate-100 text-slate-700 font-normal'}"
        onclick="views.toggleSkillPriority(${i})"
        ondblclick="views.editSkillTag(${i}, event)">
        <span id="skill-text-${i}">${this.escapeHtml(tag.text)}</span>
        <button onclick="event.stopPropagation(); views.removeSkillTag(${i})"
                class="text-slate-400 hover:text-red-500 ml-0.5 text-xs leading-none">&times;</button>
      </span>
    `).join('') + `
      <button id="skill-add-btn" onclick="views.addSkillTag()"
              class="inline-flex items-center px-2 py-1 rounded-full text-sm text-violet-500 hover:text-violet-700 hover:bg-violet-50 transition-colors">
        + add
      </button>
    `;
  },

  toggleSkillPriority(index) {
    this._skillTags[index].priority = !this._skillTags[index].priority;
    this.renderSkillTags();
  },

  editSkillTag(index, event) {
    event.stopPropagation();
    const span = document.getElementById(`skill-text-${index}`);
    const tag = this._skillTags[index];
    const input = document.createElement('input');
    input.type = 'text';
    input.value = tag.text;
    input.className = 'w-24 px-1 py-0 text-sm border border-violet-300 rounded outline-none bg-white';
    input.onclick = (e) => e.stopPropagation();
    input.onblur = () => {
      const val = input.value.trim();
      if (val) {
        this._skillTags[index].text = val;
      } else {
        this._skillTags.splice(index, 1);
      }
      this.renderSkillTags();
    };
    input.onkeydown = (e) => {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') { input.value = tag.text; input.blur(); }
    };
    span.replaceWith(input);
    input.focus();
    input.select();
  },

  removeSkillTag(index) {
    this._skillTags.splice(index, 1);
    this.renderSkillTags();
  },

  addSkillTag() {
    const container = document.getElementById('req-skills-tags');
    const addBtn = document.getElementById('skill-add-btn');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'New skill...';
    input.className = 'px-2 py-1 text-sm border border-violet-300 rounded-full outline-none w-28 focus:ring-2 focus:ring-violet-500';
    input.onblur = () => {
      const val = input.value.trim();
      if (val) {
        this._skillTags.push({ text: val, priority: false });
      }
      this.renderSkillTags();
    };
    input.onkeydown = (e) => {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') { input.value = ''; input.blur(); }
    };
    addBtn.classList.add('hidden');
    container.insertBefore(input, addBtn);
    input.focus();
  },

  getSkillsString() {
    return this._skillTags.map(t => t.priority ? `**${t.text}**` : t.text).join(', ');
  },

  async saveAndRematchRequest(requestId) {
    await this._startRematch(requestId, 'fast', 'rematch-btn', 'Save & Re-match');
  },

  // The expensive verification run: scores the entire CV library with full
  // resume text and no cache, to prove nothing was lost to the prefilter or the
  // distilled profiles. Confirmed first — it costs real money.
  async fullRematchRequest(requestId) {
    const ok = confirm(
      'Full ommatchning poängsätter ALLA CV:n i biblioteket med fullständig CV-text, ' +
      'utan cache och utan förfiltrering.\n\n' +
      'Det tar flera minuter och kostar betydligt mer än en vanlig ommatchning. ' +
      'Resultatet visas som en jämförelse mot nuvarande träfflista.\n\nKör ändå?'
    );
    if (!ok) return;
    await this._startRematch(requestId, 'full', 'full-rematch-btn', 'Full ommatchning (alla CV)');
  },

  // The `description` on a request is the AI's summary of an email. This shows
  // the email itself, so you can check what the summary left out without
  // leaving the page.
  async showRequestSource(requestId) {
    const btn = document.getElementById('show-source-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Hämtar…'; }
    try {
      // Fetched directly rather than via api.get: that helper collapses every
      // failure to "HTTP 404", and here the server's message is the useful part
      // ("the source email was deleted from the inbox" vs "there is none").
      const res = await fetch(`/api/requests/${requestId}/source`);
      if (res.status === 401) { auth.showLoginModal(); return; }
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
      const src = payload;

      const meta = [
        src.fromName || src.fromEmail
          ? `Från: ${[src.fromName, src.fromEmail && `<${src.fromEmail}>`].filter(Boolean).join(' ')}`
          : null,
        src.subject ? `Ämne: ${src.subject}` : null,
        src.receivedAt ? `Mottaget: ${new Date(src.receivedAt).toLocaleString('sv-SE')}` : null
      ].filter(Boolean);

      modal.show(`
        <div class="flex items-start justify-between gap-4 mb-3">
          <h3 class="text-lg font-semibold text-slate-800">Ursprunglig beskrivning</h3>
          <button onclick="modal.hide()" aria-label="Stäng"
                  class="text-slate-400 hover:text-slate-600 text-2xl leading-none px-1 -mt-1">&times;</button>
        </div>
        ${meta.length ? `
        <div class="text-xs text-slate-500 border-b border-slate-200 pb-3 mb-3 space-y-0.5">
          ${meta.map(l => `<div>${this.escapeHtml(l)}</div>`).join('')}
        </div>` : ''}
        <div class="max-h-[60vh] overflow-y-auto text-sm text-slate-700 whitespace-pre-wrap break-words font-mono leading-relaxed">${
          this.escapeHtml(src.body || '(Tom text)')
        }</div>
        <div class="flex justify-end mt-4 pt-3 border-t border-slate-200">
          <button onclick="modal.hide()"
                  class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Stäng</button>
        </div>
      `, { size: 'lg' });
    } catch (err) {
      // 404 covers both "no source email" and "the email was deleted from the
      // inbox" — the endpoint's message says which.
      alert(err.message || 'Kunde inte hämta ursprungstexten.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Visa hela beskrivningen'; }
    }
  },

  // Save the on-screen criteria, start the background job, then let the view
  // re-render — requestDetail picks up the running state and starts polling.
  // Both modes save first: matching against criteria the user can no longer see
  // would make the diff meaningless.
  async _startRematch(requestId, mode, btnId, btnLabel) {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.disabled = true;
      btn.textContent = mode === 'full' ? 'Startar full ommatchning...' : 'Saving & matching...';
    }
    try {
      await api.put(`/api/requests/${requestId}`, {
        requiredSkills: this.getSkillsString(),
        description: document.getElementById('req-desc-input').value.trim()
      });
      await this._postRematch(requestId, mode);
      await this.requestDetail(document.getElementById('app'), requestId);
    } catch (err) {
      alert('Error: ' + err.message);
      if (btn) {
        btn.disabled = false;
        btn.textContent = btnLabel;
      }
    }
  },

  // POST the job. A 409 means someone (another tab, a teammate, a double-click)
  // already owns this match — that is not an error, we just watch theirs.
  async _postRematch(requestId, mode) {
    const res = await fetch(`/api/requests/${requestId}/rematch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    if (res.status === 401) {
      auth.showLoginModal();
      throw new Error('Authentication required');
    }
    if (res.status === 409) return { alreadyRunning: true };
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body && body.error) message = body.error;
      } catch (_) { /* non-JSON error body */ }
      throw new Error(message);
    }
    return res.json();
  },

  // Token identifying the poll loop that currently "owns" the request detail
  // view, so a stale loop exits instead of racing a newer one for the same DOM.
  _requestMatchPollToken: 0,

  // Poll a request's matching job until it leaves 'running'. Same shape as the
  // inbox poller: no attempt cap (a full rematch over the whole library is
  // genuinely slow), backoff to keep the request rate low, stop when the user
  // navigates away, and a hard safety stop so a lost job can't spin forever.
  async pollRequestMatch(requestId) {
    const token = ++this._requestMatchPollToken;
    const startedAt = Date.now();
    const MAX_WAIT_MS = 15 * 60 * 1000;

    const delayFor = (elapsed) => {
      if (elapsed < 30000) return 2000;   // first 30s — user is watching
      if (elapsed < 120000) return 4000;  // next 90s
      return 8000;                        // long tail
    };

    const poll = async () => {
      // Stale loop, or the user left this request's detail view.
      if (token !== this._requestMatchPollToken) return;
      if (router.currentRoute?.route !== 'request-detail' ||
          router.currentRoute?.params?.id !== requestId) return;

      const elapsed = Date.now() - startedAt;
      if (elapsed > MAX_WAIT_MS) {
        this._renderMatchStalled(requestId);
        return;
      }

      try {
        const request = await api.get(`/api/requests/${requestId}`);
        if (token !== this._requestMatchPollToken) return;

        if (request.matchState?.status !== 'running') {
          // done or failed — full re-render shows the new list and the diff.
          await this.requestDetail(document.getElementById('app'), requestId);
          return;
        }
        // Still running — refresh just the progress line, not the whole view,
        // so we don't fight the user's scroll position every few seconds.
        this._renderMatchProgress(request.matchState, elapsed);
        setTimeout(poll, delayFor(elapsed));
      } catch (err) {
        if (token !== this._requestMatchPollToken) return;
        // Transient (429, blip, server restart) — keep waiting, slower.
        setTimeout(poll, Math.max(4000, delayFor(elapsed)));
      }
    };

    setTimeout(poll, 1500);
  },

  _matchProgressHtml(matchState, elapsedMs) {
    const stage = (matchState && matchState.stage) || 'Matchar…';
    const secs = Math.round((elapsedMs || 0) / 1000);
    const elapsedText = secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
    return `
      <div class="flex items-center gap-3">
        <span class="inline-block w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin shrink-0"></span>
        <div>
          <div class="text-sm font-medium text-violet-800">${this.escapeHtml(stage)}</div>
          <div class="text-xs text-violet-500 mt-0.5">
            ${secs > 0 ? `Pågår i ${elapsedText}. ` : ''}En full ommatchning kan ta flera minuter — du kan lämna sidan, arbetet fortsätter.
          </div>
        </div>
      </div>`;
  },

  _renderMatchProgress(matchState, elapsedMs) {
    const el = document.getElementById('rematch-row');
    if (!el) return;
    el.innerHTML = this._matchProgressHtml(matchState, elapsedMs);
  },

  _renderMatchStalled(requestId) {
    const el = document.getElementById('rematch-row');
    if (!el) return;
    el.innerHTML = `
      <div class="text-sm text-amber-700">
        Matchningen svarar inte längre. Den kan fortfarande köra i bakgrunden —
        <a href="#" onclick="views.requestDetail(document.getElementById('app'), '${requestId}'); return false;"
           class="text-violet-600 hover:text-violet-700 font-medium">uppdatera sidan</a>.
      </div>`;
  },

  // Summaries the user has clicked away, keyed by request + finish time so a
  // later run shows its own result again.
  _dismissedMatchSummaries: {},

  dismissMatchSummary(key) {
    this._dismissedMatchSummaries[key] = true;
    const el = document.getElementById('match-summary-panel');
    if (el) el.remove();
  },

  // The diff panel: what a re-match actually changed. For a full rematch an
  // empty diff is the whole point, so say so plainly instead of showing nothing.
  _matchSummaryHtml(request) {
    const state = request.matchState;
    if (!state || state.status === 'running' || !state.status) return '';

    const s = state.summary || {};
    // Sanitized: this key is interpolated into an inline onclick string.
    const key = `${request.id}:${s.finishedAt || state.status}`.replace(/[^\w:.-]/g, '');
    if (this._dismissedMatchSummaries[key]) return '';

    const dismissBtn = `
      <button onclick="views.dismissMatchSummary('${this.escapeHtml(key)}')"
              class="text-slate-400 hover:text-slate-600 text-lg leading-none px-2" title="Dölj">&times;</button>`;

    if (state.status === 'failed') {
      return `
      <div id="match-summary-panel" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-sm font-semibold text-red-800">Matchningen misslyckades</div>
            <div class="text-sm text-red-600 mt-1">${this.escapeHtml(s.error || 'Okänt fel')}</div>
          </div>
          ${dismissBtn}
        </div>
      </div>`;
    }

    const added = s.added || [];
    const removed = s.removed || [];
    const scoreChanged = s.scoreChanged || [];
    const stats = s.stats || {};
    const isFull = s.mode === 'full';
    const label = isFull ? 'Full ommatchning' : 'Ommatchning';
    const scored = stats.scored != null ? stats.scored : (stats.selected != null ? stats.selected : 0);
    const hasDiff = added.length > 0 || removed.length > 0 || scoreChanged.length > 0;

    // A partial failure means we did not actually compare everything — say so,
    // otherwise "inga skillnader" reads as a guarantee it isn't.
    const warnings = [];
    if (stats.failedChunks) {
      warnings.push(`${stats.failedChunks} delkörning(ar) misslyckades — jämförelsen är ofullständig och kan sakna kandidater.`);
    }
    if (s.noMatchesReturned) {
      warnings.push('AI:n returnerade inga träffar alls. Den befintliga träfflistan har lämnats orörd — kör gärna igen.');
    }
    const warningHtml = warnings.length === 0 ? '' : `
      <div class="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
        ${warnings.map(w => `<div>⚠ ${this.escapeHtml(w)}</div>`).join('')}
      </div>`;

    const nameList = (items, cls) => items.map(i => `
      <a href="#" onclick="router.navigate('candidate-detail', {id: '${i.candidateId}'}); return false;"
         class="inline-block ${cls} text-xs px-2 py-0.5 rounded-full mr-1 mb-1 hover:underline">
        ${this.escapeHtml(i.name || 'Unknown')}${Number.isFinite(Number(i.score)) ? ` ${Number(i.score)}%` : ''}
      </a>`).join('');

    const statsLine = [
      stats.pool != null ? `${stats.pool} i poolen` : null,
      `${scored} poängsatta`,
      stats.cacheHits ? `${stats.cacheHits} från cache` : null,
      stats.dropped ? `${stats.dropped} bortfiltrerade` : null,
      stats.pinned ? `${stats.pinned} fastnålade` : null
    ].filter(Boolean).join(' · ');

    const body = !hasDiff ? `
      <div class="text-sm text-emerald-700 mt-1">
        ${this.escapeHtml(`${label}: inga skillnader — ${scored} kandidater poängsatta.`)}
        ${isFull ? ' Träfflistan är alltså komplett; ingen kandidat har fallit bort.' : ''}
      </div>` : `
      <div class="mt-2 space-y-2">
        ${added.length ? `<div class="text-sm"><span class="font-medium text-emerald-700">Tillkomna (${added.length}):</span><div class="mt-1">${nameList(added, 'bg-emerald-100 text-emerald-800')}</div></div>` : ''}
        ${removed.length ? `<div class="text-sm"><span class="font-medium text-red-700">Borttagna (${removed.length}):</span><div class="mt-1">${nameList(removed, 'bg-red-100 text-red-700')}</div></div>` : ''}
        ${scoreChanged.length ? `<div class="text-sm"><span class="font-medium text-slate-700">Ändrad poäng (${scoreChanged.length}):</span>
          <div class="mt-1 text-slate-600">${scoreChanged.map(c => `
            <span class="inline-block bg-slate-100 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">
              ${this.escapeHtml(c.name || 'Unknown')} ${c.from}% → ${c.to}%
            </span>`).join('')}</div></div>` : ''}
      </div>`;

    const panelCls = hasDiff
      ? 'bg-violet-50 border-violet-200'
      : 'bg-emerald-50 border-emerald-200';

    return `
      <div id="match-summary-panel" class="${panelCls} border rounded-xl p-4 mb-6">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-800">
              ${this.escapeHtml(label)}${hasDiff ? ' — resultat' : ' klar'}
            </div>
            ${body}
            ${statsLine ? `<div class="text-xs text-slate-400 mt-2">${this.escapeHtml(statsLine)}</div>` : ''}
            ${warningHtml}
          </div>
          ${dismissBtn}
        </div>
      </div>`;
  },

  async sendSelectedCandidates(requestId) {
    const checkboxes = document.querySelectorAll('.match-select-cb:checked');
    if (checkboxes.length === 0) {
      alert('Select at least one candidate to send.');
      return;
    }
    const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
    const btn = document.getElementById('send-selected-btn');
    btn.disabled = true;
    btn.textContent = 'Generating...';
    try {
      const res = await fetch(`/api/requests/${requestId}/send-eml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIndices })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate email');
      }
      // Download the .eml file
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'candidate-proposal.eml';
      a.click();
      URL.revokeObjectURL(url);
      // Refresh to show sent markers
      await this.requestDetail(document.getElementById('app'), requestId);
    } catch (err) {
      alert('Error: ' + err.message);
      btn.disabled = false;
      btn.textContent = 'Send Selected via Outlook';
    }
  },

  async deleteRequest(requestId) {
    if (!confirm('Delete this request?')) return;
    try {
      await api.delete(`/api/requests/${requestId}`);
      router.navigate('requests');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  // Utility
  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }
};

// Initialize app - check auth first
// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
  if (!auth.currentUser) return; // not logged in, ignore
  const { route, params } = e.state || router._fromHash(location.hash);
  router._skipPush = true;
  router.navigate(route || 'contacts', params || {});
  router._skipPush = false;
});

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n for landing page
  i18n.init();

  const isAuthenticated = await auth.checkAuth();
  if (isAuthenticated) {
    // Restore route from URL hash if present, otherwise default to contacts
    const { route, params } = router._fromHash(location.hash);
    router.navigate(route, params);
  }
});
