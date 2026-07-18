import { AdminLayout } from '../components/admin/AdminLayout.js';

const MOCK_MAX_CAPACITY = 30;

// Ces informations fictives seront remplacées par les réservations réelles de l’API Symfony.
const MOCK_TODAY_RESERVATIONS = [
  { id: 201, time: '12:15', client: 'Client Démo A', guests: 2, service: 'Midi', status: 'Confirmée', allergies: '' },
  { id: 202, time: '12:45', client: 'Client Démo B', guests: 4, service: 'Midi', status: 'Confirmée', allergies: 'Fruits à coque' },
  { id: 203, time: '19:30', client: 'Client Démo C', guests: 3, service: 'Soir', status: 'En attente', allergies: '' },
  { id: 204, time: '20:15', client: 'Client Démo D', guests: 5, service: 'Soir', status: 'Confirmée', allergies: 'Lactose' },
];

// Ces horaires et cette capacité seront administrables ultérieurement via l’API Symfony.
const MOCK_OPENING_HOURS = {
  0: [{ name: 'Midi', start: '12:00', end: '15:00' }, { name: 'Soir', isClosed: true }],
  1: [{ name: 'Midi', isClosed: true }, { name: 'Soir', isClosed: true }],
  2: [{ name: 'Midi', start: '12:00', end: '14:00' }, { name: 'Soir', start: '19:00', end: '22:30' }],
  3: [{ name: 'Midi', start: '12:00', end: '14:00' }, { name: 'Soir', start: '19:00', end: '22:30' }],
  4: [{ name: 'Midi', start: '12:00', end: '14:00' }, { name: 'Soir', start: '19:00', end: '22:30' }],
  5: [{ name: 'Midi', start: '12:00', end: '14:00' }, { name: 'Soir', start: '19:00', end: '22:30' }],
  6: [{ name: 'Midi', start: '12:00', end: '15:00' }, { name: 'Soir', start: '19:00', end: '23:00' }],
};

const currentDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

function formatTime(time) {
  return time.replace(':', ' h ');
}

function getDashboardStatistics() {
  const guests = MOCK_TODAY_RESERVATIONS.reduce((total, reservation) => total + reservation.guests, 0);
  return [
    { label: 'Réservations du jour', value: MOCK_TODAY_RESERVATIONS.length, detail: 'Demandes simulées enregistrées aujourd’hui' },
    { label: 'Couverts prévus', value: guests, detail: 'Total calculé depuis les réservations simulées' },
    { label: 'Places encore disponibles', value: Math.max(0, MOCK_MAX_CAPACITY - guests), detail: 'Estimation locale sur la capacité maximale' },
    { label: 'Capacité maximale', value: MOCK_MAX_CAPACITY, detail: 'Valeur provisoire du restaurant' },
  ];
}

function createIndicatorCards() {
  return getDashboardStatistics().map((indicator) => `
    <article class="admin-indicator">
      <p class="admin-indicator__label">${indicator.label}</p>
      <p class="admin-indicator__value">${indicator.value}</p>
      <p class="admin-indicator__detail">${indicator.detail}</p>
    </article>
  `).join('');
}

function createServices() {
  const today = new Date();
  const services = MOCK_OPENING_HOURS[today.getDay()] ?? [];

  return services.map((service) => {
    if (service.isClosed) {
      return `
        <article class="admin-service admin-service--closed">
          <h3>${service.name}</h3>
          <p><strong>Service fermé</strong></p>
        </article>
      `;
    }

    const reservedGuests = MOCK_TODAY_RESERVATIONS
      .filter((reservation) => reservation.service === service.name)
      .reduce((total, reservation) => total + reservation.guests, 0);
    const remaining = Math.max(0, MOCK_MAX_CAPACITY - reservedGuests);

    return `
      <article class="admin-service">
        <div><h3>${service.name}</h3><p>${formatTime(service.start)} – ${formatTime(service.end)}</p></div>
        <dl><div><dt>Couverts réservés</dt><dd>${reservedGuests}</dd></div><div><dt>Capacité restante</dt><dd>${remaining}</dd></div></dl>
      </article>
    `;
  }).join('');
}

function createReservationList() {
  return MOCK_TODAY_RESERVATIONS.map((reservation) => `
    <li class="admin-reservation">
      <div class="admin-reservation__primary"><strong>${formatTime(reservation.time)}</strong><span>${reservation.client}</span></div>
      <dl class="admin-reservation__details">
        <div><dt>Service</dt><dd>${reservation.service}</dd></div>
        <div><dt>Couverts</dt><dd>${reservation.guests}</dd></div>
        <div><dt>Allergies</dt><dd>${reservation.allergies || 'Aucune allergie renseignée'}</dd></div>
        <div><dt>Statut</dt><dd><span class="admin-status admin-status--${reservation.status === 'Confirmée' ? 'confirmed' : 'pending'}">${reservation.status}</span></dd></div>
      </dl>
    </li>
  `).join('');
}

const ADMIN_SHORTCUTS = [
  { label: 'Gérer les réservations', path: '/administration/reservations', detail: 'Consulter et filtrer les demandes.' },
  { label: 'Modifier les horaires et la capacité', path: '/administration/horaires-capacite', detail: 'Préparer les paramètres du restaurant.' },
  { label: 'Gérer la galerie', path: '/administration/galerie', detail: 'Administrer les futurs visuels.' },
  { label: 'Gérer la carte et les menus', path: '/administration/carte-et-menus', detail: 'Préparer les catégories, plats et menus.' },
];

function createShortcuts() {
  return ADMIN_SHORTCUTS.map((shortcut) => `
    <a class="admin-shortcut" href="${shortcut.path}" data-link>
      <strong>${shortcut.label}</strong><span>${shortcut.detail}</span>
    </a>
  `).join('');
}

export function AdminDashboardPage() {
  // L’accès à cette page sera protégé selon le rôle retourné par l’API Symfony.
  // Le nom réel sera fourni ultérieurement par l’utilisateur administrateur authentifié.
  // Les statistiques seront recalculées à partir des données réelles de l’API.
  const todayLabel = currentDateFormatter.format(new Date());

  return AdminLayout(`
    <header class="admin-page-heading">
      <p class="admin-eyebrow">Vue d’ensemble</p>
      <h1>Tableau de bord</h1>
      <p>Suivez l’activité du restaurant pour le ${todayLabel}. Toutes les données affichées sont simulées.</p>
    </header>

    <section class="admin-dashboard-section" aria-labelledby="indicators-title">
      <h2 id="indicators-title">Indicateurs principaux</h2>
      <div class="admin-indicator-grid">${createIndicatorCards()}</div>
    </section>

    <section class="admin-dashboard-section" aria-labelledby="services-title">
      <div class="admin-section-heading"><div><h2 id="services-title">Services du jour</h2><p>${todayLabel}</p></div><a href="/administration/horaires-capacite" data-link>Voir les horaires et la capacité</a></div>
      <div class="admin-service-grid">${createServices()}</div>
    </section>

    <section class="admin-dashboard-section" aria-labelledby="next-reservations-title">
      <div class="admin-section-heading"><div><h2 id="next-reservations-title">Prochaines réservations</h2><p>Aucune action de gestion n’est disponible depuis ce tableau de bord.</p></div><a href="/administration/reservations" data-link>Voir toutes les réservations</a></div>
      <ul class="admin-reservation-list">${createReservationList()}</ul>
    </section>

    <section class="admin-dashboard-section" aria-labelledby="shortcuts-title">
      <h2 id="shortcuts-title">Raccourcis de gestion</h2>
      <div class="admin-shortcut-grid">${createShortcuts()}</div>
    </section>
  `);
}
