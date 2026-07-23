import { AdminLayout, initAdminLayout } from '../components/admin/AdminLayout.js';
import { updateRestaurant } from '../api/adminApi.js';
import { getRestaurant } from '../api/publicApi.js';
import { apiErrorMessage, showFormErrors } from '../utils/formErrors.js';

export function AdminHoursCapacityPage() {
  return AdminLayout(`
    <header class="admin-hours-intro"><p class="admin-eyebrow">Paramètres</p><h1>Informations du restaurant</h1></header>
    <div class="alert d-none" data-restaurant-message role="status" aria-live="polite"></div>
    <form class="admin-hours-form" data-restaurant-form novalidate>
      <div class="mb-3"><label for="admin-restaurant-name">Nom</label><input class="form-control" id="admin-restaurant-name" name="name" maxlength="32" required><p class="text-danger" data-error-for="name"></p></div>
      <div class="mb-3"><label for="admin-restaurant-description">Description</label><textarea class="form-control" id="admin-restaurant-description" name="description" required></textarea><p class="text-danger" data-error-for="description"></p></div>
      <fieldset><legend>Service du midi</legend><input class="form-control" name="amOpen" type="time" step="900" required><input class="form-control" name="amClose" type="time" step="900" required><p class="text-danger" data-error-for="amOpeningTime"></p></fieldset>
      <fieldset><legend>Service du soir</legend><input class="form-control" name="pmOpen" type="time" step="900" required><input class="form-control" name="pmClose" type="time" step="900" required><p class="text-danger" data-error-for="pmOpeningTime"></p></fieldset>
      <div class="mb-3"><label for="admin-maxGuest">Capacité maximale</label><input class="form-control" id="admin-maxGuest" name="maxGuest" type="number" min="1" max="32767" required><p class="text-danger" data-error-for="maxGuest"></p></div>
      <button class="btn btn-primary" type="submit">Enregistrer</button>
    </form>
  `);
}

export function initAdminHoursCapacityPage() {
  const cleanup = initAdminLayout();
  const form = document.querySelector('[data-restaurant-form]');
  const message = document.querySelector('[data-restaurant-message]');
  const controller = new AbortController();
  let restaurant = null;
  const announce = (text, type = 'success') => { message.className = `alert alert-${type}`; message.textContent = text; };

  getRestaurant({ signal: controller.signal }).then((data) => {
    restaurant = data;
    form.elements.name.value = data.name;
    form.elements.description.value = data.description;
    form.elements.amOpen.value = data.amOpeningTime.open;
    form.elements.amClose.value = data.amOpeningTime.close;
    form.elements.pmOpen.value = data.pmOpeningTime.open;
    form.elements.pmClose.value = data.pmOpeningTime.close;
    form.elements.maxGuest.value = data.maxGuest;
  }).catch((error) => announce(apiErrorMessage(error), 'danger'));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    const data = {
      name: form.elements.name.value.trim(),
      description: form.elements.description.value.trim(),
      amOpeningTime: { open: form.elements.amOpen.value, close: form.elements.amClose.value },
      pmOpeningTime: { open: form.elements.pmOpen.value, close: form.elements.pmClose.value },
      maxGuest: Number(form.elements.maxGuest.value),
    };
    const errors = {};
    if (!data.name) errors.name = 'Le nom est obligatoire.';
    if (!data.description) errors.description = 'La description est obligatoire.';
    if (data.maxGuest < 1) errors.maxGuest = 'La capacité doit être supérieure à zéro.';
    if (!data.amOpeningTime.open || !data.amOpeningTime.close) errors.amOpeningTime = 'Les horaires du midi sont obligatoires.';
    if (!data.pmOpeningTime.open || !data.pmOpeningTime.close) errors.pmOpeningTime = 'Les horaires du soir sont obligatoires.';
    if (data.amOpeningTime.close >= data.pmOpeningTime.open) errors.amOpeningTime = 'Le service du midi doit finir avant celui du soir.';
    if (Object.keys(errors).length) { showFormErrors(form, errors); return; }
    button.disabled = true;
    try {
      const result = await updateRestaurant(restaurant.id, data);
      restaurant = result.restaurant;
      announce('Informations du restaurant enregistrées.');
    } catch (error) {
      if (error.status === 422) showFormErrors(form, error.data?.fields);
      announce(apiErrorMessage(error), 'danger');
    } finally { button.disabled = false; }
  });
  return () => { controller.abort(); cleanup?.(); };
}
