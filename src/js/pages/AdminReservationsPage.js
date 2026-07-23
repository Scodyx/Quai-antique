import { AdminLayout, initAdminLayout } from '../components/admin/AdminLayout.js';
import { deleteBooking, getBookings } from '../api/bookingApi.js';
import { apiErrorMessage } from '../utils/formErrors.js';
import { formatDate } from '../utils/formatters.js';

export function AdminReservationsPage() {
  return AdminLayout(`
    <header class="admin-reservations-intro"><p class="admin-eyebrow">Administration</p><h1>Gestion des réservations</h1></header>
    <div class="admin-reservations-toolbar"><label for="admin-booking-date">Filtrer par date</label><input class="form-control" id="admin-booking-date" type="date"><button class="btn btn-secondary" data-clear-date type="button">Toutes les dates</button></div>
    <p data-admin-booking-status role="status" aria-live="polite">Chargement…</p>
    <div class="table-responsive"><table class="table"><thead><tr><th>Client</th><th>Date</th><th>Heure</th><th>Convives</th><th>Allergies</th><th>Restaurant</th><th>Actions</th></tr></thead><tbody data-admin-bookings></tbody></table></div>
  `);
}

export function initAdminReservationsPage() {
  const cleanup = initAdminLayout();
  const target = document.querySelector('[data-admin-bookings]');
  const status = document.querySelector('[data-admin-booking-status]');
  const dateInput = document.querySelector('#admin-booking-date');
  let controller = null;

  const load = async () => {
    controller?.abort();
    controller = new AbortController();
    target.replaceChildren();
    status.textContent = 'Chargement…';
    try {
      const bookings = await getBookings(dateInput.value || null, { signal: controller.signal });
      status.textContent = bookings.length ? `${bookings.length} réservation(s)` : 'Aucune réservation disponible.';
      bookings.forEach((booking) => {
        const row = document.createElement('tr');
        const values = [
          `${booking.user?.firstName ?? ''} ${booking.user?.lastName ?? ''}`.trim(),
          formatDate(booking.orderDate),
          booking.orderHour,
          booking.guestNumber,
          booking.allergy || 'Aucune allergie renseignée',
          booking.restaurant?.name ?? '',
        ];
        values.forEach((value) => {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.append(cell);
        });
        const actions = document.createElement('td');
        const edit = document.createElement('a');
        edit.className = 'btn btn-sm btn-secondary';
        edit.href = `/reservation/${booking.id}`;
        edit.dataset.link = '';
        edit.textContent = 'Modifier';
        const remove = document.createElement('button');
        remove.className = 'btn btn-sm btn-danger ms-2';
        remove.textContent = 'Supprimer';
        remove.addEventListener('click', async () => {
          if (!window.confirm(`Supprimer la réservation de ${values[0]} ?`)) return;
          remove.disabled = true;
          try { await deleteBooking(booking.id); await load(); } catch (error) { status.textContent = apiErrorMessage(error); remove.disabled = false; }
        });
        actions.append(edit, remove);
        row.append(actions);
        target.append(row);
      });
    } catch (error) {
      if (error.code !== 'REQUEST_ABORTED') status.textContent = apiErrorMessage(error);
    }
  };

  dateInput.addEventListener('change', load);
  document.querySelector('[data-clear-date]').addEventListener('click', () => { dateInput.value = ''; load(); });
  load();
  return () => { controller?.abort(); cleanup?.(); };
}
