import {
  AUTH_CHANGED_EVENT,
  isAdmin,
  isAuthenticated,
  logout,
} from '../auth/authService.js';

function navigationLinks() {
  const links = [
    { label: 'Accueil', path: '/' },
    { label: 'Galerie', path: '/galerie' },
    { label: 'Carte et menus', path: '/carte-et-menus' },
    { label: 'Réservation', path: '/reservation' },
  ];

  if (isAuthenticated()) {
    links.push({ label: 'Mon compte', path: '/mon-compte' });
    links.push({ label: 'Mes réservations', path: '/mes-reservations' });
    if (isAdmin()) links.push({ label: 'Administration', path: '/administration' });
  } else {
    links.push({ label: 'Connexion', path: '/connexion' });
    links.push({ label: 'Inscription', path: '/inscription' });
  }

  return links;
}

export function Header() {
  const currentPath = window.location.pathname;
  const navigationItems = navigationLinks().map(({ label, path }) => {
    const isActive = currentPath === path;

    return `
      <li class="nav-item">
        <a class="nav-link${isActive ? ' active' : ''}" href="${path}" data-link${isActive ? ' aria-current="page"' : ''}>${label}</a>
      </li>
    `;
  }).join('');

  const logoutButton = isAuthenticated()
    ? '<li class="nav-item"><button class="nav-link" type="button" data-auth-logout>Déconnexion</button></li>'
    : '';

  return `
    <header class="site-header">
      <nav class="navbar navbar-expand-lg" aria-label="Navigation principale">
        <div class="container site-container">
          <a class="navbar-brand site-header__brand" href="/" data-link>
            <span class="site-header__brand-name">Quai Antique</span>
            <span class="site-header__brand-caption">Restaurant</span>
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-navigation" aria-controls="main-navigation" aria-expanded="false" aria-label="Afficher ou masquer la navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="main-navigation">
            <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              ${navigationItems}
              ${logoutButton}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  `;
}

export function updateAuthUI() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = Header();
  header.replaceWith(wrapper.firstElementChild);
}

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-auth-logout]')) return;
  logout();
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
});

window.addEventListener(AUTH_CHANGED_EVENT, updateAuthUI);
