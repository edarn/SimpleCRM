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

// Simple router
const router = {
  currentRoute: null,

  navigate(route, params = {}) {
    this.currentRoute = { route, params };
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
          (route === 'todos' && current?.startsWith('todo'));
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
        case 'archive':
          await views.archiveView(app);
          break;
        default:
          await views.contactList(app);
      }
    } catch (err) {
      if (err.message !== 'Authentication required') {
        app.innerHTML = `<div class="text-red-600">Error: ${err.message}</div>`;
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
const modal = {
  show(content) {
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal').classList.remove('hidden');
    focusAutofocus(document.getElementById('modal-content'));
  },
  hide() {
    document.getElementById('modal').classList.add('hidden');
  }
};

// Close modal on backdrop click
document.getElementById('modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal') modal.hide();
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

    // Update URL for bookmarking
    history.replaceState({}, '', `#contact/${id}`);

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
    history.replaceState({}, '', '#contacts');
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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" id="contact-email" value="${this.escapeHtml(contact.email || '')}"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input type="tel" id="contact-phone" value="${this.escapeHtml(contact.phone || '')}"
                     class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
            </div>
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
          <button onclick="views.navigateToLinked('${t.linkedType}', '${t.linkedId}')" class="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View</button>
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

  async toggleTodo(id, completed) {
    await api.put(`/api/todos/${id}`, { completed });
    router.navigate('todos');
  },

  navigateToLinked(type, id) {
    if (type === 'contact') {
      router.navigate('contact-detail', { id });
    } else if (type === 'candidate') {
      router.navigate('candidate-detail', { id });
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
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Link to *</label>
          <select id="todo-linked-type" onchange="views.updateLinkedOptions()"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
            <option value="contact" ${linkedType === 'contact' ? 'selected' : ''}>Contact</option>
            <option value="company" ${linkedType === 'company' ? 'selected' : ''}>Company</option>
            <option value="candidate" ${linkedType === 'candidate' ? 'selected' : ''}>Candidate</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Select *</label>
          <select id="todo-linked-id" required
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
    const select = document.getElementById('todo-linked-id');

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
    const data = {
      title: document.getElementById('todo-title').value,
      description: document.getElementById('todo-description').value,
      dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : new Date().toISOString(),
      linkedType: document.getElementById('todo-linked-type').value,
      linkedId: document.getElementById('todo-linked-id').value,
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
            <option value="contact" ${todo.linkedType === 'contact' ? 'selected' : ''}>Contact</option>
            <option value="company" ${todo.linkedType === 'company' ? 'selected' : ''}>Company</option>
            <option value="candidate" ${todo.linkedType === 'candidate' ? 'selected' : ''}>Candidate</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Select *</label>
          <select id="edit-todo-linked-id" required
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
    const select = document.getElementById('edit-todo-linked-id');

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

    const updateData = {
      title,
      description: document.getElementById('edit-todo-description').value,
      dueDate: dueDateInput ? new Date(dueDateInput).toISOString() : null,
      linkedType: document.getElementById('edit-todo-linked-type').value,
      linkedId: document.getElementById('edit-todo-linked-id').value
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
            <option value="contact" ${todo.linkedType === 'contact' ? 'selected' : ''}>Contact</option>
            <option value="company" ${todo.linkedType === 'company' ? 'selected' : ''}>Company</option>
            <option value="candidate" ${todo.linkedType === 'candidate' ? 'selected' : ''}>Candidate</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Select *</label>
          <select id="edit-todo-linked-id" required
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
    const newLinkedId = document.getElementById('edit-todo-linked-id').value;

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
    const qs = ownerParam ? `?createdBy=${encodeURIComponent(ownerParam)}` : '';
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
        <button onclick="router.navigate('candidate-form')"
                class="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-5 py-2.5 rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all font-medium shadow-sm">
          + Add Candidate
        </button>
      </div>

      <div class="mb-4 flex flex-col sm:flex-row gap-3">
        <input type="text" id="candidate-search-input" placeholder="Search candidates..." autofocus
               class="w-full sm:flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
               oninput="views.filterCandidates()">
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
          <button onclick="views.sortCandidates('skills')" class="text-xs px-2 py-1 rounded bg-slate-200 text-slate-700">Skills <span id="sort-candidate-skills-m"></span></button>
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
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onclick="views.sortCandidates('skills')">
                Skills <span id="sort-candidate-skills"></span>
              </th>
              ${hasTeam ? `<th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Added By</th>` : ''}
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Files
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

  _categoryBadgeClass(category) {
    const colors = {
      in_progress: 'bg-amber-100 text-amber-700',
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
    const colspan = hasTeam ? 6 : 5;
    if (candidates.length === 0) {
      return `<tr><td colspan="${colspan}" class="px-6 py-8 text-center text-slate-500">No candidates found</td></tr>`;
    }
    return candidates.map(c => `
      <tr class="hover:bg-rose-50/50 cursor-pointer transition-colors" onclick="router.navigate('candidate-detail', {id: '${c.id}'})">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="font-medium text-slate-800">${this.escapeHtml(c.name)}</div>
          ${c.email ? `<div class="text-sm text-slate-500">${this.escapeHtml(c.email)}</div>` : ''}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-slate-600" data-label="Role">${this.escapeHtml(c.role || '-')}</td>
        <td class="px-6 py-4 whitespace-nowrap" data-label="Category">
          ${c.category ? `<span class="px-2 py-1 rounded-full text-xs font-medium ${this._categoryBadgeClass(c.category)}">${this.escapeHtml(categoryLabels[c.category] || c.category)}</span>` : '<span class="text-slate-400">-</span>'}
        </td>
        <td class="px-6 py-4 text-slate-600" data-label="Skills">${this.escapeHtml(c.skills || '-')}</td>
        ${hasTeam ? `<td class="px-6 py-4 whitespace-nowrap text-slate-600" data-label="Added By">${this.escapeHtml(c.createdByUsername || '-')}</td>` : ''}
        <td class="px-6 py-4 whitespace-nowrap text-slate-500" data-label="Files">
          ${c.resumeFilename ? '<span class="text-emerald-600 font-medium">Uploaded</span>' : '-'}
        </td>
      </tr>
    `).join('');
  },

  async changeCandidateOwner(value) {
    this._candidateOwnerFilter = value;
    const container = document.getElementById('app');
    if (container) await this.candidateList(container);
  },

  filterCandidates() {
    const query = document.getElementById('candidate-search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('candidate-category-filter').value;
    let filtered = this._candidates;

    if (categoryFilter) {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    if (query) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.email || '').toLowerCase().includes(query) ||
        (c.phone || '').toLowerCase().includes(query) ||
        (c.role || '').toLowerCase().includes(query) ||
        (c.skills || '').toLowerCase().includes(query)
      );
    }

    document.getElementById('candidates-table').innerHTML = this.renderCandidateRows(filtered);
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

    const sorted = [...this._candidates].sort((a, b) => {
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
    document.getElementById('candidates-table').innerHTML = this.renderCandidateRows(sorted);
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
          <div class="flex gap-2">
            <button onclick="router.navigate('candidate-form', {id: '${candidate.id}'})"
                    class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm">
              Edit
            </button>
            <button onclick="views.showTransferCandidateModal('${candidate.id}')"
                    class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm">
              Transfer
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
    if (auth.currentUser.role === 'member') {
      router.navigate('contacts');
      return;
    }

    const teamData = await api.get('/api/team');
    const isSolo = auth.currentUser.role === 'solo';

    container.innerHTML = `
      <div class="mb-6">
        <a href="#" onclick="router.navigate('contacts'); return false;" class="text-sky-600 hover:text-sky-700 font-medium">
          ← Back to Contacts
        </a>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 mb-6 border border-slate-200">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">${isSolo ? 'Create a Team' : 'Team Settings'}</h2>

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

        <!-- Data Backup Section -->
        <div class="border-t border-slate-200 pt-6 mt-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Data Backup</h3>
          <p class="text-sm text-slate-600 mb-4">Export your data as a ZIP file including all uploaded files, or import a previously exported backup.</p>

          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Export -->
            <div class="flex-1 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 class="font-medium text-slate-700 mb-2">Export Data</h4>
              <p class="text-sm text-slate-500 mb-3">Download all your data and candidate files as a ZIP archive.</p>
              <button onclick="views.exportData()" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-medium shadow-sm">
                Download Backup
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
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n for landing page
  i18n.init();

  const isAuthenticated = await auth.checkAuth();
  if (isAuthenticated) {
    router.navigate('contacts');
  }
});
