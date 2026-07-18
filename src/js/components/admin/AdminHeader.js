import { AdminNavigation } from './AdminNavigation.js';

// Le nom réel sera fourni ultérieurement par l’utilisateur administrateur authentifié.
export function AdminHeader(currentPath) {
  return `
    <header class="admin-header">
      <div class="admin-header__brand">
        <span class="admin-header__name">Quai Antique</span>
        <span class="admin-header__caption">Administration</span>
      </div>
      <div class="admin-header__actions">
        <span class="admin-header__user">Administrateur</span>
        <button
          class="admin-header__menu-button"
          id="admin-menu-button"
          type="button"
          aria-controls="admin-mobile-menu"
          aria-expanded="false"
        >Ouvrir le menu d’administration</button>
      </div>
    </header>

    <div
      class="offcanvas offcanvas-start admin-offcanvas"
      id="admin-mobile-menu"
      tabindex="-1"
      aria-labelledby="admin-mobile-menu-title"
    >
      <div class="offcanvas-header">
        <h2 class="offcanvas-title" id="admin-mobile-menu-title">Menu d’administration</h2>
        <button class="btn-close btn-close-white" type="button" data-bs-dismiss="offcanvas" aria-label="Fermer le menu"></button>
      </div>
      <div class="offcanvas-body">
        ${AdminNavigation(currentPath, 'admin-nav--mobile')}
      </div>
    </div>
  `;
}
