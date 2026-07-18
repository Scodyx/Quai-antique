export function Header() {
  const currentPath = window.location.pathname;
  const navigationLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Galerie', path: '/galerie' },
    { label: 'Carte et menus', path: '/carte-et-menus' },
    { label: 'Réservation', path: '/reservation' },
    { label: 'Connexion', path: '/connexion' },
    // Ce lien temporaire dépendra plus tard de l’état d’authentification réel.
    { label: 'Mon compte', path: '/mon-compte' },
  ];

  const navigationItems = navigationLinks
    .map(({ label, path }) => {
      const isActive = currentPath === path;
      const activeClass = isActive ? ' active' : '';
      const ariaCurrent = isActive ? ' aria-current="page"' : '';

      return `
        <li class="nav-item">
          <a class="nav-link${activeClass}" href="${path}" data-link${ariaCurrent}>${label}</a>
        </li>
      `;
    })
    .join('');

  return `
    <header class="site-header">
      <nav class="navbar navbar-expand-lg" aria-label="Navigation principale">
        <div class="container site-container">
          <a class="navbar-brand site-header__brand" href="/" data-link>
            <span class="site-header__brand-name">Quai Antique</span>
            <span class="site-header__brand-caption">Restaurant</span>
          </a>

          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#main-navigation"
            aria-controls="main-navigation"
            aria-expanded="false"
            aria-label="Afficher ou masquer la navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="main-navigation">
            <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              ${navigationItems}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  `;
}
