import Offcanvas from 'bootstrap/js/dist/offcanvas';

import { AdminHeader } from './AdminHeader.js';
import { AdminNavigation } from './AdminNavigation.js';
import { cleanupBootstrapOverlayState } from '../../utils/bootstrapCleanup.js';

export function AdminLayout(content) {
  const currentPath = window.location.pathname;

  return `
    <a class="admin-skip-link" href="#admin-main-content">Aller au contenu principal</a>
    <div class="admin-shell">
      ${AdminHeader(currentPath)}
      <div class="admin-shell__body">
        <aside class="admin-sidebar">
          ${AdminNavigation(currentPath, 'admin-nav--desktop')}
        </aside>
        <div class="admin-main" id="admin-main-content" tabindex="-1">
          ${content}
        </div>
      </div>
    </div>
  `;
}

export function initAdminLayout() {
  const menuButton = document.querySelector('#admin-menu-button');
  const menuElement = document.querySelector('#admin-mobile-menu');

  if (!menuButton || !menuElement) {
    return undefined;
  }

  const offcanvas = Offcanvas.getOrCreateInstance(menuElement);
  const mobileLinks = [...menuElement.querySelectorAll('a[data-link]')];

  const handleMenuClick = () => offcanvas.show();
  const handleShown = () => menuButton.setAttribute('aria-expanded', 'true');
  const handleHidden = () => menuButton.setAttribute('aria-expanded', 'false');
  const handleLinkClick = () => offcanvas.hide();

  menuButton.addEventListener('click', handleMenuClick);
  menuElement.addEventListener('shown.bs.offcanvas', handleShown);
  menuElement.addEventListener('hidden.bs.offcanvas', handleHidden);
  mobileLinks.forEach((link) => link.addEventListener('click', handleLinkClick));

  return () => {
    menuButton.removeEventListener('click', handleMenuClick);
    menuElement.removeEventListener('shown.bs.offcanvas', handleShown);
    menuElement.removeEventListener('hidden.bs.offcanvas', handleHidden);
    mobileLinks.forEach((link) => link.removeEventListener('click', handleLinkClick));
    offcanvas.hide();
    offcanvas.dispose();
    cleanupBootstrapOverlayState();
  };
}
