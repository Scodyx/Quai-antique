import Modal from 'bootstrap/js/dist/modal';

import { AdminLayout, initAdminLayout } from '../components/admin/AdminLayout.js';
import { cleanupBootstrapOverlayState } from '../utils/bootstrapCleanup.js';

const DAY_DEFINITIONS = [
  { id: 'monday', label: 'Lundi' },
  { id: 'tuesday', label: 'Mardi' },
  { id: 'wednesday', label: 'Mercredi' },
  { id: 'thursday', label: 'Jeudi' },
  { id: 'friday', label: 'Vendredi' },
  { id: 'saturday', label: 'Samedi' },
  { id: 'sunday', label: 'Dimanche' },
];

const WEEKDAY_SERVICES = {
  lunch: { enabled: true, start: '12:00', end: '14:00' },
  dinner: { enabled: true, start: '19:00', end: '22:30' },
};

// Cette configuration provisoire sera remplacée par les horaires et la capacité administrables de l’API Symfony.
const DEFAULT_HOURS_CAPACITY = {
  maxCapacity: 30,
  schedule: [
    { day: 'monday', isOpen: false, services: { lunch: { enabled: false, start: null, end: null }, dinner: { enabled: false, start: null, end: null } } },
    { day: 'tuesday', isOpen: true, services: structuredClone(WEEKDAY_SERVICES) },
    { day: 'wednesday', isOpen: true, services: structuredClone(WEEKDAY_SERVICES) },
    { day: 'thursday', isOpen: true, services: structuredClone(WEEKDAY_SERVICES) },
    { day: 'friday', isOpen: true, services: structuredClone(WEEKDAY_SERVICES) },
    { day: 'saturday', isOpen: true, services: { lunch: { enabled: true, start: '12:00', end: '15:00' }, dinner: { enabled: true, start: '19:00', end: '23:00' } } },
    { day: 'sunday', isOpen: true, services: { lunch: { enabled: true, start: '12:00', end: '15:00' }, dinner: { enabled: false, start: null, end: null } } },
  ],
};

function cloneConfiguration(configuration) {
  return structuredClone(configuration);
}

function formatTime(time) {
  return /^\d{2}:\d{2}$/.test(time ?? '') ? time.replace(':', ' h ') : 'horaire à compléter';
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60) + minutes;
}

function isQuarterHour(time) {
  return /^([01]\d|2[0-3]):(00|15|30|45)$/.test(time);
}

function getDayLabel(dayId) {
  return DAY_DEFINITIONS.find((day) => day.id === dayId)?.label ?? dayId;
}

function createServiceFields(day, serviceKey, serviceLabel) {
  const service = day.services[serviceKey];
  const dayLabel = getDayLabel(day.day).toLowerCase();
  const serviceId = `${day.day}-${serviceKey}`;
  return `
    <fieldset class="admin-hours-service" data-service="${serviceKey}">
      <legend>Service du ${serviceLabel}</legend>
      <div class="form-check form-switch admin-hours-switch">
        <input class="form-check-input" id="${serviceId}-enabled" type="checkbox" data-service-enabled="${serviceKey}" aria-describedby="${day.day}-error ${serviceId}-error" ${service.enabled ? 'checked' : ''}>
        <label class="form-check-label" for="${serviceId}-enabled">Service du ${serviceLabel} ouvert le ${dayLabel}</label>
      </div>
      <div class="admin-hours-time-grid">
        <div class="admin-hours-field">
          <label for="${serviceId}-start">Début du service du ${serviceLabel} du ${dayLabel}</label>
          <input class="form-control" id="${serviceId}-start" type="time" step="900" value="${service.start ?? ''}" data-service-time="${serviceKey}" data-time-kind="start" aria-describedby="${serviceId}-error">
        </div>
        <div class="admin-hours-field">
          <label for="${serviceId}-end">Fin du service du ${serviceLabel} du ${dayLabel}</label>
          <input class="form-control" id="${serviceId}-end" type="time" step="900" value="${service.end ?? ''}" data-service-time="${serviceKey}" data-time-kind="end" aria-describedby="${serviceId}-error">
        </div>
      </div>
      <p class="admin-hours-error" id="${serviceId}-error" data-service-error="${serviceKey}"></p>
    </fieldset>
  `;
}

function createDayCard(day) {
  const label = getDayLabel(day.day);
  return `
    <fieldset class="admin-hours-day" data-day="${day.day}">
      <legend>${label}</legend>
      <div class="form-check form-switch admin-hours-switch admin-hours-switch--day">
        <input class="form-check-input" id="${day.day}-open" type="checkbox" data-day-open ${day.isOpen ? 'checked' : ''} aria-describedby="${day.day}-error">
        <label class="form-check-label" for="${day.day}-open">Restaurant ouvert le ${label.toLowerCase()}</label>
      </div>
      <p class="admin-hours-day__state" data-day-state></p>
      <p class="admin-hours-error" id="${day.day}-error" data-day-error></p>
      <div class="admin-hours-services">
        ${createServiceFields(day, 'lunch', 'midi')}
        ${createServiceFields(day, 'dinner', 'soir')}
      </div>
      <div class="admin-hours-day__summary" data-day-summary></div>
    </fieldset>
  `;
}

function createWeekSummary(configuration) {
  const days = configuration.schedule.map((day) => {
    const label = getDayLabel(day.day);
    if (!day.isOpen) return `<li><strong>${label}</strong><span>Fermé</span></li>`;
    const lunch = day.services.lunch.enabled
      ? `Midi : ${formatTime(day.services.lunch.start)} à ${formatTime(day.services.lunch.end)}`
      : 'Midi : fermé';
    const dinner = day.services.dinner.enabled
      ? `Soir : ${formatTime(day.services.dinner.start)} à ${formatTime(day.services.dinner.end)}`
      : 'Soir : fermé';
    return `<li><strong>${label}</strong><span>${lunch}</span><span>${dinner}</span></li>`;
  }).join('');
  return `<p class="admin-hours-summary__capacity"><strong>Capacité maximale :</strong> ${configuration.maxCapacity || 'à compléter'} places</p><ul>${days}</ul>`;
}

function prepareApiConfiguration(rawConfiguration) {
  return {
    maxCapacity: Number(rawConfiguration.maxCapacity),
    schedule: rawConfiguration.schedule.map((day) => ({
      day: day.day,
      isOpen: day.isOpen,
      services: {
        lunch: day.isOpen && day.services.lunch.enabled
          ? { enabled: true, start: day.services.lunch.start, end: day.services.lunch.end }
          : { enabled: false, start: null, end: null },
        dinner: day.isOpen && day.services.dinner.enabled
          ? { enabled: true, start: day.services.dinner.start, end: day.services.dinner.end }
          : { enabled: false, start: null, end: null },
      },
    })),
  };
}

function configurationsMatch(first, second) {
  return JSON.stringify(first) === JSON.stringify(second);
}

function createResetModal() {
  return `
    <div class="modal fade admin-hours-modal" id="admin-hours-reset-modal" tabindex="-1" aria-labelledby="admin-hours-reset-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
        <div class="modal-header"><h2 class="modal-title" id="admin-hours-reset-title">Rétablir les horaires provisoires</h2><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Fermer"></button></div>
        <div class="modal-body"><p>Les champs seront remplacés par la configuration provisoire initiale. Aucune donnée ne sera envoyée à un serveur et vous devrez encore enregistrer les modifications.</p></div>
        <div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Conserver mes modifications</button><button class="btn btn-danger" id="admin-hours-confirm-reset" type="button">Rétablir les horaires</button></div>
      </div></div>
    </div>
  `;
}

export function AdminHoursCapacityPage() {
  return AdminLayout(`
    <header class="admin-hours-intro"><p class="admin-eyebrow">Paramètres du restaurant</p><h1>Horaires et capacité</h1><p>Configurez les services hebdomadaires et la capacité maximale. Les données affichées sont simulées et restent propres à cette page.</p></header>
    <div class="admin-hours-live alert d-none" id="admin-hours-live" role="status" aria-live="polite" tabindex="-1"></div>
    <p class="admin-hours-dirty d-none" id="admin-hours-dirty" role="status">Modifications non enregistrées</p>

    <form id="admin-hours-form" novalidate>
      <section class="admin-hours-capacity" aria-labelledby="admin-capacity-title">
        <div><p class="admin-eyebrow">Accueil simultané</p><h2 id="admin-capacity-title">Capacité maximale</h2><p>Cette valeur représente le nombre maximal de clients présents simultanément dans le restaurant.</p></div>
        <div class="admin-hours-field">
          <label for="admin-max-capacity">Capacité maximale du restaurant</label>
          <input class="form-control" id="admin-max-capacity" type="number" min="1" max="200" step="1" value="${DEFAULT_HOURS_CAPACITY.maxCapacity}" aria-describedby="admin-max-capacity-help admin-max-capacity-error" required>
          <p class="admin-hours-help" id="admin-max-capacity-help">Valeur entière comprise entre 1 et 200 places.</p>
          <p class="admin-hours-error" id="admin-max-capacity-error"></p>
        </div>
      </section>

      <section class="admin-hours-section" aria-labelledby="admin-week-title">
        <div class="admin-hours-section__heading"><div><p class="admin-eyebrow">Semaine type</p><h2 id="admin-week-title">Horaires hebdomadaires</h2></div><p>Activez au moins un service pour chaque jour ouvert.</p></div>
        <div class="admin-hours-day-grid">${DEFAULT_HOURS_CAPACITY.schedule.map(createDayCard).join('')}</div>
      </section>

      <section class="admin-hours-summary" aria-labelledby="admin-summary-title">
        <h2 id="admin-summary-title">Récapitulatif de la semaine</h2>
        <div id="admin-hours-summary">${createWeekSummary(DEFAULT_HOURS_CAPACITY)}</div>
      </section>

      <div class="admin-hours-actions"><button class="btn btn-primary" type="submit">Enregistrer les modifications</button><button class="btn btn-secondary" id="admin-hours-open-reset" type="button">Rétablir les horaires provisoires</button></div>
    </form>
    ${createResetModal()}
  `);
}

export function initAdminHoursCapacityPage() {
  const cleanupAdminLayout = initAdminLayout();
  const form = document.querySelector('#admin-hours-form');
  const capacityInput = document.querySelector('#admin-max-capacity');
  const capacityError = document.querySelector('#admin-max-capacity-error');
  const summary = document.querySelector('#admin-hours-summary');
  const dirtyIndicator = document.querySelector('#admin-hours-dirty');
  const liveRegion = document.querySelector('#admin-hours-live');
  const openResetButton = document.querySelector('#admin-hours-open-reset');
  const confirmResetButton = document.querySelector('#admin-hours-confirm-reset');
  const resetModalElement = document.querySelector('#admin-hours-reset-modal');

  if (!form || !capacityInput || !capacityError || !summary || !dirtyIndicator || !liveRegion || !openResetButton || !confirmResetButton || !resetModalElement) { cleanupAdminLayout?.(); return undefined; }

  let editableConfiguration = cloneConfiguration(DEFAULT_HOURS_CAPACITY);
  let savedConfiguration = cloneConfiguration(DEFAULT_HOURS_CAPACITY);
  let forceDirty = false;
  let focusLiveAfterModal = false;
  const listeners = [];
  const resetModal = Modal.getOrCreateInstance(resetModalElement);

  function addListener(element, eventName, handler) { element.addEventListener(eventName, handler); listeners.push(() => element.removeEventListener(eventName, handler)); }

  function readFormConfiguration() {
    return {
      maxCapacity: capacityInput.value,
      schedule: DAY_DEFINITIONS.map(({ id }) => {
        const card = form.querySelector(`[data-day="${id}"]`);
        return {
          day: id,
          isOpen: card.querySelector('[data-day-open]').checked,
          services: {
            lunch: { enabled: card.querySelector('[data-service-enabled="lunch"]').checked, start: card.querySelector('[data-service-time="lunch"][data-time-kind="start"]').value, end: card.querySelector('[data-service-time="lunch"][data-time-kind="end"]').value },
            dinner: { enabled: card.querySelector('[data-service-enabled="dinner"]').checked, start: card.querySelector('[data-service-time="dinner"][data-time-kind="start"]').value, end: card.querySelector('[data-service-time="dinner"][data-time-kind="end"]').value },
          },
        };
      }),
    };
  }

  function updateDayControls(card) {
    const isOpen = card.querySelector('[data-day-open]').checked;
    const serviceToggles = [...card.querySelectorAll('[data-service-enabled]')];
    if (!isOpen) serviceToggles.forEach((toggle) => { toggle.checked = false; });
    serviceToggles.forEach((toggle) => {
      toggle.disabled = !isOpen;
      const service = toggle.dataset.serviceEnabled;
      card.querySelectorAll(`[data-service-time="${service}"]`).forEach((input) => { input.disabled = !isOpen || !toggle.checked; });
    });
    card.classList.toggle('admin-hours-day--closed', !isOpen);
    card.querySelector('[data-day-state]').textContent = isOpen ? 'Restaurant ouvert' : 'Restaurant fermé';
  }

  function renderDaySummary(card, day) {
    const container = card.querySelector('[data-day-summary]');
    if (!day.isOpen) { container.textContent = 'Fermé'; return; }
    const lunch = day.services.lunch.enabled ? `Midi ouvert : ${formatTime(day.services.lunch.start)} à ${formatTime(day.services.lunch.end)}` : 'Midi fermé';
    const dinner = day.services.dinner.enabled ? `Soir ouvert : ${formatTime(day.services.dinner.start)} à ${formatTime(day.services.dinner.end)}` : 'Soir fermé';
    container.innerHTML = `<span>${lunch}</span><span>${dinner}</span>`;
  }

  function refreshVisuals() {
    editableConfiguration = readFormConfiguration();
    form.querySelectorAll('[data-day]').forEach((card) => {
      updateDayControls(card);
      const current = readFormConfiguration().schedule.find((day) => day.day === card.dataset.day);
      renderDaySummary(card, current);
    });
    editableConfiguration = readFormConfiguration();
    const prepared = prepareApiConfiguration(editableConfiguration);
    summary.innerHTML = createWeekSummary(prepared);
    dirtyIndicator.classList.toggle('d-none', !forceDirty && configurationsMatch(prepared, savedConfiguration));
  }

  function populateForm(configuration) {
    capacityInput.value = String(configuration.maxCapacity);
    configuration.schedule.forEach((day) => {
      const card = form.querySelector(`[data-day="${day.day}"]`);
      card.querySelector('[data-day-open]').checked = day.isOpen;
      ['lunch', 'dinner'].forEach((serviceKey) => {
        const service = day.services[serviceKey];
        card.querySelector(`[data-service-enabled="${serviceKey}"]`).checked = service.enabled;
        card.querySelector(`[data-service-time="${serviceKey}"][data-time-kind="start"]`).value = service.start ?? '';
        card.querySelector(`[data-service-time="${serviceKey}"][data-time-kind="end"]`).value = service.end ?? '';
      });
    });
    clearErrors();
    refreshVisuals();
  }

  function setError(input, error, message) { error.textContent = message; input.classList.toggle('is-invalid', Boolean(message)); input.setAttribute('aria-invalid', String(Boolean(message))); return !message; }

  function clearErrors() {
    setError(capacityInput, capacityError, '');
    form.querySelectorAll('[data-day]').forEach((card) => {
      const dayOpen = card.querySelector('[data-day-open]');
      const dayError = card.querySelector('[data-day-error]');
      setError(dayOpen, dayError, '');
      ['lunch', 'dinner'].forEach((service) => {
        const toggle = card.querySelector(`[data-service-enabled="${service}"]`);
        const error = card.querySelector(`[data-service-error="${service}"]`);
        toggle.classList.remove('is-invalid');
        toggle.setAttribute('aria-invalid', 'false');
        card.querySelectorAll(`[data-service-time="${service}"]`).forEach((input) => setError(input, error, ''));
      });
    });
  }

  function validateService(card, serviceKey, label) {
    const enabled = card.querySelector(`[data-service-enabled="${serviceKey}"]`);
    const start = card.querySelector(`[data-service-time="${serviceKey}"][data-time-kind="start"]`);
    const end = card.querySelector(`[data-service-time="${serviceKey}"][data-time-kind="end"]`);
    const error = card.querySelector(`[data-service-error="${serviceKey}"]`);
    if (!enabled.checked) { setError(start, error, ''); setError(end, error, ''); return true; }
    let message = '';
    if (!isQuarterHour(start.value) || !isQuarterHour(end.value)) message = `Les horaires du service du ${label} sont obligatoires et doivent respecter un intervalle de quinze minutes.`;
    else if (timeToMinutes(start.value) >= timeToMinutes(end.value)) message = `Le début du service du ${label} doit précéder sa fin d’au moins quinze minutes.`;
    setError(start, error, message); setError(end, error, message);
    return !message;
  }

  function validateForm() {
    clearErrors();
    const capacity = Number(capacityInput.value);
    let isValid = setError(capacityInput, capacityError, Number.isInteger(capacity) && capacity >= 1 && capacity <= 200 ? '' : 'Saisissez une capacité entière comprise entre 1 et 200.');
    form.querySelectorAll('[data-day]').forEach((card) => {
      const dayOpen = card.querySelector('[data-day-open]');
      if (!dayOpen.checked) return;
      const lunchEnabled = card.querySelector('[data-service-enabled="lunch"]');
      const dinnerEnabled = card.querySelector('[data-service-enabled="dinner"]');
      const dayError = card.querySelector('[data-day-error]');
      if (!lunchEnabled.checked && !dinnerEnabled.checked) {
        setError(lunchEnabled, dayError, 'Un jour ouvert doit comporter au moins un service actif.');
        dinnerEnabled.setAttribute('aria-invalid', 'true');
        isValid = false;
      }
      if (!validateService(card, 'lunch', 'midi')) isValid = false;
      if (!validateService(card, 'dinner', 'soir')) isValid = false;
      if (lunchEnabled.checked && dinnerEnabled.checked) {
        const lunchEnd = card.querySelector('[data-service-time="lunch"][data-time-kind="end"]');
        const dinnerStart = card.querySelector('[data-service-time="dinner"][data-time-kind="start"]');
        if (isQuarterHour(lunchEnd.value) && isQuarterHour(dinnerStart.value) && timeToMinutes(lunchEnd.value) > timeToMinutes(dinnerStart.value)) {
          const lunchError = card.querySelector('[data-service-error="lunch"]');
          const dinnerError = card.querySelector('[data-service-error="dinner"]');
          setError(lunchEnd, lunchError, 'Le service du midi doit se terminer avant ou au début du service du soir.');
          setError(dinnerStart, dinnerError, 'Le service du soir ne peut pas commencer avant la fin du service du midi.');
          isValid = false;
        }
      }
    });
    return isValid;
  }

  function announce(message) { liveRegion.textContent = message; liveRegion.className = 'admin-hours-live alert alert-success'; }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) { form.querySelector('.is-invalid')?.focus(); return; }
    const apiConfiguration = prepareApiConfiguration(readFormConfiguration());
    editableConfiguration = cloneConfiguration(apiConfiguration);
    savedConfiguration = cloneConfiguration(apiConfiguration);
    forceDirty = false;
    // Le futur appel d’enregistrement et la validation métier définitive seront réalisés par l’API Symfony ici.
    refreshVisuals();
    announce('Les horaires et la capacité sont valides. Ils seront enregistrés lors du branchement à l’API Symfony.');
    liveRegion.focus();
  }

  function handleDayChange(event) {
    const card = event.target.closest('[data-day]');
    if (!card) return;
    updateDayControls(card);
    refreshVisuals();
  }

  function handleServiceChange(event) {
    const card = event.target.closest('[data-day]');
    if (!card) return;
    updateDayControls(card);
    refreshVisuals();
  }

  function handleReset() {
    editableConfiguration = cloneConfiguration(DEFAULT_HOURS_CAPACITY);
    forceDirty = true;
    populateForm(editableConfiguration);
    focusLiveAfterModal = true;
    announce('Les horaires provisoires ont été rétablis. Enregistrez les modifications pour valider cette configuration locale.');
    resetModal.hide();
  }

  function focusAfterModal() { if (focusLiveAfterModal) { focusLiveAfterModal = false; liveRegion.focus(); } }

  addListener(form, 'submit', handleSubmit);
  addListener(capacityInput, 'input', refreshVisuals);
  form.querySelectorAll('[data-day-open]').forEach((input) => addListener(input, 'change', handleDayChange));
  form.querySelectorAll('[data-service-enabled]').forEach((input) => addListener(input, 'change', handleServiceChange));
  form.querySelectorAll('[data-service-time]').forEach((input) => addListener(input, 'change', refreshVisuals));
  addListener(openResetButton, 'click', () => resetModal.show());
  addListener(confirmResetButton, 'click', handleReset);
  addListener(resetModalElement, 'hidden.bs.modal', focusAfterModal);
  populateForm(editableConfiguration);

  return () => {
    listeners.forEach((removeListener) => removeListener());
    resetModal.hide(); resetModal.dispose();
    cleanupBootstrapOverlayState();
    cleanupAdminLayout?.();
  };
}
