const ADMIN_LINKS = [
  { label: 'Tableau de bord', path: '/administration' },
  { label: 'Réservations', path: '/administration/reservations' },
  { label: 'Horaires et capacité', path: '/administration/horaires-capacite' },
  { label: 'Galerie', path: '/administration/galerie' },
  { label: 'Carte et menus', path: '/administration/carte-et-menus' },
];

export function AdminNavigation(currentPath, className = '') {
  const links = ADMIN_LINKS.map(({ label, path }) => {
    const isActive = currentPath === path;
    return `
      <li>
        <a class="admin-nav__link${isActive ? ' admin-nav__link--active' : ''}" href="${path}" data-link${isActive ? ' aria-current="page"' : ''}>
          ${label}
        </a>
      </li>
    `;
  }).join('');

  return `
    <nav class="admin-nav ${className}" aria-label="Navigation de l’administration">
      <ul class="admin-nav__list">
        ${links}
        <li class="admin-nav__site-link"><a class="admin-nav__link" href="/" data-link>Retour au site</a></li>
      </ul>
    </nav>
  `;
}
