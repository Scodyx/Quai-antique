import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';
import { deleteAccount, getAccount, updateAccount, updatePassword } from '../api/accountApi.js';
import { deleteBooking, getBookings } from '../api/bookingApi.js';
import { clearSession, getStoredUser, storeSession, TOKEN_STORAGE_KEY } from '../auth/authService.js';
import { apiErrorMessage, showFormErrors } from '../utils/formErrors.js';
import { formatDate } from '../utils/formatters.js';

function field(name, label, type = 'text', attributes = '') {
  return `<div class="account-field"><label for="account-${name}">${label}</label><input class="form-control" id="account-${name}" name="${name}" type="${type}" ${attributes} aria-describedby="account-${name}-error"><p class="account-error" id="account-${name}-error" data-error-for="${name}"></p></div>`;
}

export function AccountPage() {
  return `
    ${Header()}
    <main class="account-page section">
      <div class="container site-container">
        <header class="section-heading"><p class="section-eyebrow">Espace client</p><h1>Mon compte</h1></header>
        <div class="alert d-none" data-account-message role="status" aria-live="polite"></div>
        <p data-account-loading>Chargement…</p>
        <section class="account-card" aria-labelledby="profile-title">
          <h2 id="profile-title">Informations personnelles</h2>
          <form class="account-form" data-profile-form novalidate>
            <div class="account-form__grid">
              ${field('firstName', 'Prénom', 'text', 'required maxlength="32"')}
              ${field('lastName', 'Nom', 'text', 'required maxlength="64"')}
              ${field('email', 'Adresse e-mail', 'email', 'readonly')}
              ${field('guestNumber', 'Nombre habituel de convives', 'number', 'required min="1" max="32767"')}
              <div class="account-field account-field--full"><label for="account-allergy">Allergies</label><textarea class="form-control" id="account-allergy" name="allergy" maxlength="255" aria-describedby="account-allergy-error"></textarea><p class="account-error" id="account-allergy-error" data-error-for="allergy"></p></div>
            </div>
            <button class="btn btn-primary" type="submit">Enregistrer le profil</button>
          </form>
        </section>
        <section class="account-card" aria-labelledby="password-title">
          <h2 id="password-title">Modifier le mot de passe</h2>
          <form class="account-form" data-password-form novalidate>
            ${field('currentPassword', 'Mot de passe actuel', 'password', 'required autocomplete="current-password"')}
            ${field('newPassword', 'Nouveau mot de passe', 'password', 'required autocomplete="new-password"')}
            ${field('newPasswordConfirmation', 'Confirmation', 'password', 'required autocomplete="new-password"')}
            <button class="btn btn-primary" type="submit">Modifier le mot de passe</button>
          </form>
        </section>
        <section class="account-card" id="mes-reservations" aria-labelledby="bookings-title">
          <div class="section-heading section-heading--row"><h2 id="bookings-title">Mes réservations</h2><a class="btn btn-secondary" href="/reservation" data-link>Réserver une table</a></div>
          <div data-bookings-list><p>Chargement…</p></div>
        </section>
        <section class="account-card account-danger-zone" aria-labelledby="delete-title">
          <h2 id="delete-title">Supprimer mon compte</h2>
          <p>Le compte et ses réservations seront supprimés définitivement. Cette action est irréversible.</p>
          <button class="btn btn-danger" type="button" data-delete-account>Supprimer mon compte</button>
        </section>
      </div>
    </main>
    ${Footer()}
  `;
}

export function initAccountPage() {
  const profileForm = document.querySelector('[data-profile-form]');
  const passwordForm = document.querySelector('[data-password-form]');
  const list = document.querySelector('[data-bookings-list]');
  const message = document.querySelector('[data-account-message]');
  const loading = document.querySelector('[data-account-loading]');
  const controller = new AbortController();
  let bookings = [];

  const announce = (text, type = 'success') => {
    message.className = `alert alert-${type}`;
    message.textContent = text;
  };
  const globalMessage = sessionStorage.getItem('quai_antique_global_message');
  if (globalMessage) {
    announce(globalMessage);
    sessionStorage.removeItem('quai_antique_global_message');
  }

  const renderBookings = () => {
    list.replaceChildren();
    if (!bookings.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Aucune réservation disponible.';
      list.append(empty);
      return;
    }
    bookings.forEach((booking) => {
      const card = document.createElement('article');
      card.className = 'account-reservation-card';
      const title = document.createElement('h3');
      title.textContent = `${formatDate(booking.orderDate)} à ${booking.orderHour}`;
      const details = document.createElement('p');
      details.textContent = `${booking.guestNumber} convive(s) · ${booking.restaurant?.name ?? 'Restaurant'} · ${booking.allergy || 'Aucune allergie renseignée'}`;
      const edit = document.createElement('a');
      edit.className = 'btn btn-secondary';
      edit.href = `/reservation/${booking.id}`;
      edit.dataset.link = '';
      edit.textContent = 'Modifier';
      const remove = document.createElement('button');
      remove.className = 'btn btn-danger';
      remove.type = 'button';
      remove.textContent = 'Annuler';
      remove.addEventListener('click', async () => {
        if (!window.confirm(`Annuler la réservation du ${formatDate(booking.orderDate)} ?`)) return;
        remove.disabled = true;
        try {
          await deleteBooking(booking.id);
          bookings = bookings.filter((item) => item.id !== booking.id);
          renderBookings();
          announce('Réservation annulée.');
        } catch (error) {
          remove.disabled = false;
          announce(apiErrorMessage(error), 'danger');
        }
      });
      card.append(title, details, edit, document.createTextNode(' '), remove);
      list.append(card);
    });
  };

  Promise.all([getAccount({ signal: controller.signal }), getBookings(null, { signal: controller.signal })])
    .then(([user, loadedBookings]) => {
      loading.remove();
      for (const name of ['firstName', 'lastName', 'email', 'guestNumber']) profileForm.elements[name].value = user[name] ?? '';
      profileForm.elements.allergy.value = user.allergy ?? '';
      bookings = loadedBookings;
      renderBookings();
      if (window.location.pathname === '/mes-reservations') document.querySelector('#mes-reservations')?.scrollIntoView();
    })
    .catch((error) => {
      if (error.code !== 'REQUEST_ABORTED') announce(apiErrorMessage(error), 'danger');
    });

  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = profileForm.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const payload = {
        firstName: profileForm.elements.firstName.value.trim(),
        lastName: profileForm.elements.lastName.value.trim(),
        guestNumber: Number(profileForm.elements.guestNumber.value),
        allergy: profileForm.elements.allergy.value.trim() || null,
      };
      const result = await updateAccount(payload);
      storeSession(localStorage.getItem(TOKEN_STORAGE_KEY), result.user);
      announce('Informations personnelles enregistrées.');
    } catch (error) {
      if (error.status === 422) showFormErrors(profileForm, error.data?.fields);
      announce(apiErrorMessage(error), 'danger');
    } finally {
      button.disabled = false;
    }
  });

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = passwordForm.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const result = await updatePassword(Object.fromEntries(new FormData(passwordForm)));
      storeSession(result.apiToken, getStoredUser());
      passwordForm.reset();
      announce('Mot de passe modifié. Votre session reste active.');
    } catch (error) {
      if (error.status === 422) showFormErrors(passwordForm, error.data?.fields);
      announce(apiErrorMessage(error), 'danger');
    } finally {
      button.disabled = false;
    }
  });

  document.querySelector('[data-delete-account]').addEventListener('click', async (event) => {
    if (!window.confirm('Supprimer définitivement votre compte et toutes ses réservations ?')) return;
    event.currentTarget.disabled = true;
    try {
      await deleteAccount();
      clearSession();
      sessionStorage.setItem('quai_antique_global_message', 'Votre compte a été supprimé.');
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      event.currentTarget.disabled = false;
      announce(apiErrorMessage(error), 'danger');
    }
  });

  return () => controller.abort();
}
