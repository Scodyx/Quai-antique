import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';
import { getAccount } from '../api/accountApi.js';
import { createBooking, getAvailability, getBooking, updateBooking } from '../api/bookingApi.js';
import { getRestaurant } from '../api/publicApi.js';
import { apiErrorMessage, showFormErrors } from '../utils/formErrors.js';

function localDate(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function ReservationPage({ id } = {}) {
  return `
    ${Header()}
    <main class="reservation-page section">
      <div class="container site-container">
        <header class="section-heading"><p class="section-eyebrow">Votre table</p><h1>${id ? 'Modifier la réservation' : 'Réserver une table'}</h1></header>
        <div class="alert d-none" data-booking-message role="status" aria-live="polite"></div>
        <form class="reservation-form" data-booking-form novalidate>
          <div class="reservation-form__fields">
            <div class="reservation-field"><label for="reservation-guests">Nombre de convives</label><input class="form-control" id="reservation-guests" name="guestNumber" type="number" min="1" max="32767" required aria-describedby="reservation-guests-error"><p class="reservation-error" data-error-for="guestNumber" id="reservation-guests-error"></p></div>
            <div class="reservation-field"><label for="reservation-date">Date</label><input class="form-control" id="reservation-date" name="orderDate" type="date" min="${localDate()}" required aria-describedby="reservation-date-error"><p class="reservation-error" data-error-for="orderDate" id="reservation-date-error"></p></div>
            <div class="reservation-field"><label for="reservation-allergy">Allergies</label><textarea class="form-control" id="reservation-allergy" name="allergy" maxlength="255"></textarea><p class="reservation-error" data-error-for="allergy"></p></div>
          </div>
          <fieldset class="reservation-services"><legend>Créneau disponible</legend><p data-availability-status>Choisissez une date et un nombre de convives.</p><div data-availability></div><p class="reservation-error" data-error-for="orderHour"></p></fieldset>
          <button class="btn btn-primary" type="submit" disabled>${id ? 'Enregistrer les modifications' : 'Confirmer la réservation'}</button>
        </form>
      </div>
    </main>
    ${Footer()}
  `;
}

export function initReservationPage({ id } = {}) {
  const form = document.querySelector('[data-booking-form]');
  const availabilityContainer = document.querySelector('[data-availability]');
  const availabilityStatus = document.querySelector('[data-availability-status]');
  const message = document.querySelector('[data-booking-message]');
  const submit = form.querySelector('[type="submit"]');
  const pageController = new AbortController();
  let availabilityController = null;
  let restaurant = null;
  let currentBooking = null;
  let debounceTimer = null;

  const announce = (text, type = 'danger') => {
    message.className = `alert alert-${type}`;
    message.textContent = text;
  };

  const renderAvailability = (payload) => {
    availabilityContainer.replaceChildren();
    if (payload.closed) {
      availabilityStatus.textContent = 'Le restaurant est fermé le lundi';
      submit.disabled = true;
      return;
    }
    availabilityStatus.textContent = '';
    payload.services.forEach((service) => {
      const section = document.createElement('section');
      const title = document.createElement('h2');
      title.textContent = `${service.name === 'am' ? 'Midi' : 'Soir'} · ${service.open} – ${service.close}`;
      const capacity = document.createElement('p');
      capacity.textContent = `${service.remainingCapacity} place(s) restante(s)`;
      const slots = document.createElement('div');
      slots.className = 'reservation-slot-list';
      service.slots.forEach((slot) => {
        const label = document.createElement('label');
        label.className = 'reservation-slot';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'orderHour';
        radio.value = slot.time;
        const isCurrentSlot = currentBooking?.orderHour === slot.time;
        radio.disabled = !slot.available && !isCurrentSlot;
        radio.checked = isCurrentSlot;
        radio.addEventListener('change', () => { submit.disabled = false; });
        label.append(radio, document.createTextNode(` ${slot.time}${slot.available ? '' : ' — indisponible'}`));
        slots.append(label);
      });
      section.append(title, capacity, slots);
      availabilityContainer.append(section);
    });
    submit.disabled = !form.elements.orderHour?.value;
  };

  const loadAvailability = () => {
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(async () => {
      const date = form.elements.orderDate.value;
      const guestNumber = Number(form.elements.guestNumber.value);
      if (!restaurant || !date || !Number.isInteger(guestNumber) || guestNumber < 1) return;
      availabilityController?.abort();
      availabilityController = new AbortController();
      availabilityStatus.textContent = 'Chargement…';
      submit.disabled = true;
      try {
        renderAvailability(await getAvailability(
          { restaurantId: restaurant.id, date, guestNumber },
          { signal: availabilityController.signal },
        ));
      } catch (error) {
        if (error.code !== 'REQUEST_ABORTED') availabilityStatus.textContent = apiErrorMessage(error);
      }
    }, 250);
  };

  Promise.all([
    getAccount({ signal: pageController.signal }),
    getRestaurant({ signal: pageController.signal }),
    id ? getBooking(id, { signal: pageController.signal }) : Promise.resolve(null),
  ]).then(([user, loadedRestaurant, booking]) => {
    restaurant = loadedRestaurant;
    currentBooking = booking;
    if (!restaurant) throw new Error('Restaurant introuvable');
    form.elements.guestNumber.value = booking?.guestNumber ?? user.guestNumber ?? 2;
    form.elements.orderDate.value = booking?.orderDate ?? localDate(1);
    form.elements.allergy.value = booking?.allergy ?? user.allergy ?? '';
    loadAvailability();
  }).catch((error) => {
    if (error.code !== 'REQUEST_ABORTED') announce(error.status === 404 ? 'Réservation introuvable.' : apiErrorMessage(error));
  });

  form.elements.orderDate.addEventListener('change', loadAvailability);
  form.elements.guestNumber.addEventListener('change', loadAvailability);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      guestNumber: Number(form.elements.guestNumber.value),
      orderDate: form.elements.orderDate.value,
      orderHour: form.elements.orderHour?.value ?? '',
      allergy: form.elements.allergy.value.trim() || null,
      restaurantId: restaurant.id,
    };
    submit.disabled = true;
    try {
      await (id ? updateBooking(id, payload) : createBooking(payload));
      sessionStorage.setItem('quai_antique_global_message', id ? 'Réservation modifiée.' : 'Réservation créée.');
      window.history.pushState({}, '', '/mes-reservations');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      if (error.status === 422) showFormErrors(form, error.data?.fields);
      announce(apiErrorMessage(error));
      submit.disabled = false;
    }
  });

  return () => {
    clearTimeout(debounceTimer);
    pageController.abort();
    availabilityController?.abort();
  };
}
