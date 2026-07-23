import { AdminLayout } from '../components/admin/AdminLayout.js';
import { initAdminLayout } from '../components/admin/AdminLayout.js';
import { getBookings } from '../api/bookingApi.js';
import { getRestaurant } from '../api/publicApi.js';

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function AdminDashboardPage() {
  return AdminLayout(`
    <header class="admin-dashboard-intro"><p class="admin-eyebrow">Administration</p><h1>Tableau de bord</h1><p>Vue synthétique de l’activité du restaurant.</p></header>
    <p data-dashboard-status role="status" aria-live="polite">Chargement…</p>
    <section class="admin-dashboard-kpis" data-dashboard-kpis></section>
    <section class="admin-dashboard-shortcuts"><h2>Gestion</h2><div class="admin-dashboard-shortcut-grid">
      <a href="/administration/reservations" data-link>Réservations</a>
      <a href="/administration/horaires-capacite" data-link>Restaurant</a>
      <a href="/administration/carte-et-menus" data-link>Catégories, plats et menus</a>
      <a href="/administration/galerie" data-link>Galerie</a>
    </div></section>
  `);
}

export function initAdminDashboardPage() {
  const cleanup = initAdminLayout();
  const controller = new AbortController();
  Promise.all([getBookings(today(), { signal: controller.signal }), getRestaurant({ signal: controller.signal })])
    .then(([bookings, restaurant]) => {
      document.querySelector('[data-dashboard-status]').textContent = '';
      const guests = bookings.reduce((sum, booking) => sum + booking.guestNumber, 0);
      const values = [
        ['Réservations du jour', bookings.length],
        ['Couverts prévus', guests],
        ['Capacité maximale', restaurant?.maxGuest ?? 0],
        ['Places indicatives restantes', Math.max(0, (restaurant?.maxGuest ?? 0) - guests)],
      ];
      const target = document.querySelector('[data-dashboard-kpis]');
      values.forEach(([label, value]) => {
        const article = document.createElement('article');
        article.className = 'admin-dashboard-kpi';
        const title = document.createElement('h2');
        const number = document.createElement('p');
        title.textContent = label;
        number.textContent = value;
        article.append(title, number);
        target.append(article);
      });
    })
    .catch(() => { document.querySelector('[data-dashboard-status]').textContent = 'Impossible de charger les données pour le moment'; });
  return () => { controller.abort(); cleanup?.(); };
}
