import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';
import { initializePasswordToggles } from '../utils/passwordVisibility.js';
import { register } from '../auth/authService.js';
import { ApiError } from '../api/ApiError.js';

const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;
const PASSWORD_RULES = [
  { key: 'length', label: 'Au moins 8 caractères', test: (value) => value.length >= 8 },
  { key: 'uppercase', label: 'Au moins une lettre majuscule', test: (value) => /\p{Lu}/u.test(value) },
  { key: 'lowercase', label: 'Au moins une lettre minuscule', test: (value) => /\p{Ll}/u.test(value) },
  { key: 'number', label: 'Au moins un chiffre', test: (value) => /\d/.test(value) },
  { key: 'special', label: 'Au moins un caractère spécial', test: (value) => /[^\p{L}\p{M}\d\s]/u.test(value) },
];

function normalizeName(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function prepareSignupData(inputs) {
  return {
    firstName: normalizeName(inputs.firstName.value),
    lastName: normalizeName(inputs.lastName.value),
    email: inputs.email.value.trim(),
    password: inputs.password.value,
    passwordConfirmation: inputs.passwordConfirmation.value,
    guestNumber: Number(inputs.defaultGuests.value),
    allergy: inputs.allergies.value.trim() || null,
  };
}

export function SignupPage() {
  const passwordCriteria = PASSWORD_RULES
    .map((rule) => `<li data-password-rule="${rule.key}"><span aria-hidden="true">○</span> ${rule.label}</li>`)
    .join('');

  return `
    ${Header()}
    <div class="auth-page">
      <section class="auth-intro section" aria-labelledby="signup-page-title">
        <div class="container auth-intro__content text-center">
          <p class="section-eyebrow">Votre espace client</p>
          <h1 id="signup-page-title">Créer un compte</h1>
          <p>Créez votre compte client pour confirmer et retrouver vos réservations.</p>
        </div>
      </section>

      <section class="auth-section section" aria-label="Formulaire d’inscription">
        <div class="container auth-container auth-container--wide">
          <div class="auth-card">
            <form class="auth-form" id="signup-form" novalidate>
              <div class="auth-form__grid">
                <div class="auth-field">
                  <label for="signup-first-name">Prénom</label>
                  <input class="form-control" id="signup-first-name" name="firstName" type="text" autocomplete="given-name" aria-describedby="signup-first-name-error" required>
                  <p class="auth-error" id="signup-first-name-error"></p>
                </div>

                <div class="auth-field">
                  <label for="signup-last-name">Nom</label>
                  <input class="form-control" id="signup-last-name" name="lastName" type="text" autocomplete="family-name" aria-describedby="signup-last-name-error" required>
                  <p class="auth-error" id="signup-last-name-error"></p>
                </div>

                <div class="auth-field auth-field--full">
                  <label for="signup-email">Adresse e-mail</label>
                  <input class="form-control" id="signup-email" name="email" type="email" autocomplete="email" aria-describedby="signup-email-error" required>
                  <p class="auth-error" id="signup-email-error"></p>
                </div>

                <div class="auth-field">
                  <label for="signup-password">Mot de passe</label>
                  <div class="auth-password">
                    <input class="form-control" id="signup-password" name="password" type="password" autocomplete="new-password" aria-describedby="signup-password-criteria signup-password-error" required>
                    <button class="auth-password__toggle" type="button" data-password-toggle data-password-target="signup-password" data-password-label="le mot de passe" aria-label="Afficher le mot de passe" aria-pressed="false">Afficher</button>
                  </div>
                  <ul class="auth-password-criteria" id="signup-password-criteria">
                    ${passwordCriteria}
                  </ul>
                  <p class="auth-error" id="signup-password-error"></p>
                </div>

                <div class="auth-field">
                  <label for="signup-password-confirmation">Confirmation du mot de passe</label>
                  <div class="auth-password">
                    <input class="form-control" id="signup-password-confirmation" name="passwordConfirmation" type="password" autocomplete="new-password" aria-describedby="signup-password-confirmation-error" required>
                    <button class="auth-password__toggle" type="button" data-password-toggle data-password-target="signup-password-confirmation" data-password-label="la confirmation du mot de passe" aria-label="Afficher la confirmation du mot de passe" aria-pressed="false">Afficher</button>
                  </div>
                  <p class="auth-error" id="signup-password-confirmation-error"></p>
                </div>

                <div class="auth-field">
                  <label for="signup-default-guests">Nombre de convives par défaut</label>
                  <input class="form-control" id="signup-default-guests" name="defaultGuests" type="number" min="1" max="12" value="2" aria-describedby="signup-default-guests-help signup-default-guests-error" required>
                  <p class="auth-help" id="signup-default-guests-help">Cette valeur sera proposée lors de vos réservations.</p>
                  <p class="auth-error" id="signup-default-guests-error"></p>
                </div>

                <div class="auth-field auth-field--full">
                  <label for="signup-allergies">Allergies éventuelles <span class="auth-optional">(facultatif)</span></label>
                  <textarea class="form-control" id="signup-allergies" name="allergies" rows="4" aria-describedby="signup-allergies-help"></textarea>
                  <p class="auth-help" id="signup-allergies-help">Elles serviront à préremplir vos futures réservations et resteront modifiables.</p>
                </div>
              </div>

              <button class="btn btn-primary auth-submit" type="submit">Créer mon compte</button>
              <div class="auth-feedback alert alert-success d-none" id="signup-feedback" role="status" aria-live="polite"></div>
            </form>

            <p class="auth-switch">
              Déjà un compte ? <a href="/connexion" data-link>Se connecter</a>
            </p>
          </div>
        </div>
      </section>
    </div>
    ${Footer()}
  `;
}

export function initSignupPage() {
  const form = document.querySelector('#signup-form');

  if (!form) {
    return undefined;
  }

  const inputs = {
    firstName: form.querySelector('#signup-first-name'),
    lastName: form.querySelector('#signup-last-name'),
    email: form.querySelector('#signup-email'),
    password: form.querySelector('#signup-password'),
    passwordConfirmation: form.querySelector('#signup-password-confirmation'),
    defaultGuests: form.querySelector('#signup-default-guests'),
    allergies: form.querySelector('#signup-allergies'),
  };
  const errors = {
    firstName: form.querySelector('#signup-first-name-error'),
    lastName: form.querySelector('#signup-last-name-error'),
    email: form.querySelector('#signup-email-error'),
    password: form.querySelector('#signup-password-error'),
    passwordConfirmation: form.querySelector('#signup-password-confirmation-error'),
    defaultGuests: form.querySelector('#signup-default-guests-error'),
  };
  const feedback = form.querySelector('#signup-feedback');

  if (Object.values(inputs).some((input) => !input)
    || Object.values(errors).some((error) => !error)
    || !feedback) {
    return undefined;
  }

  const listeners = [];
  const cleanupPasswordToggles = initializePasswordToggles(form);

  function addListener(element, eventName, handler) {
    element.addEventListener(eventName, handler);
    listeners.push(() => element.removeEventListener(eventName, handler));
  }

  function setFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    input.classList.toggle('is-invalid', Boolean(message));
    input.classList.toggle('is-valid', !message && Boolean(input.value));
    input.setAttribute('aria-invalid', String(Boolean(message)));
  }

  function validateName(key, label) {
    const input = inputs[key];
    input.value = normalizeName(input.value);
    let message = '';

    if (!input.value) {
      message = `Saisissez votre ${label}.`;
    } else if (input.value.length < 2) {
      message = `Votre ${label} doit contenir au moins 2 caractères.`;
    } else if (!NAME_PATTERN.test(input.value)) {
      message = `Votre ${label} peut contenir des lettres, espaces, apostrophes et traits d’union.`;
    }

    setFieldError(input, errors[key], message);
    return !message;
  }

  function validateEmail() {
    inputs.email.value = inputs.email.value.trim();
    let message = '';

    if (!inputs.email.value) {
      message = 'Saisissez votre adresse e-mail.';
    } else if (!inputs.email.validity.valid) {
      message = 'Saisissez une adresse e-mail valide.';
    }

    setFieldError(inputs.email, errors.email, message);
    return !message;
  }

  function updatePasswordCriteria() {
    PASSWORD_RULES.forEach((rule) => {
      const item = form.querySelector(`[data-password-rule="${rule.key}"]`);
      const isMet = rule.test(inputs.password.value);

      if (item) {
        item.classList.toggle('auth-password-criteria__item--met', isMet);
        item.querySelector('span').textContent = isMet ? '✓' : '○';
      }
    });
  }

  function validatePassword() {
    const failedRules = PASSWORD_RULES.filter((rule) => !rule.test(inputs.password.value));
    let message = '';

    if (!inputs.password.value) {
      message = 'Saisissez un mot de passe.';
    } else if (failedRules.length) {
      message = 'Le mot de passe ne respecte pas encore toutes les exigences.';
    }

    setFieldError(inputs.password, errors.password, message);
    return !message;
  }

  function validatePasswordConfirmation() {
    let message = '';

    if (!inputs.passwordConfirmation.value) {
      message = 'Confirmez votre mot de passe.';
    } else if (inputs.passwordConfirmation.value !== inputs.password.value) {
      message = 'Les deux mots de passe doivent être identiques.';
    }

    setFieldError(inputs.passwordConfirmation, errors.passwordConfirmation, message);
    return !message;
  }

  function validateGuests() {
    const guests = Number(inputs.defaultGuests.value);
    const isValid = Number.isInteger(guests) && guests >= 1 && guests <= 12;
    setFieldError(
      inputs.defaultGuests,
      errors.defaultGuests,
      isValid ? '' : 'Choisissez un nombre de convives compris entre 1 et 12.',
    );
    return isValid;
  }

  function hideFeedback() {
    feedback.classList.add('d-none');
    feedback.textContent = '';
  }

  function handlePasswordInput() {
    updatePasswordCriteria();
    hideFeedback();

    if (inputs.passwordConfirmation.value) {
      validatePasswordConfirmation();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    hideFeedback();

    const results = [
      validateName('firstName', 'prénom'),
      validateName('lastName', 'nom'),
      validateEmail(),
      validatePassword(),
      validatePasswordConfirmation(),
      validateGuests(),
    ];

    if (results.includes(false)) {
      form.querySelector('.is-invalid')?.focus();
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Création…';

    try {
      await register(prepareSignupData(inputs));
      feedback.className = 'auth-feedback alert alert-success';
      feedback.textContent = 'Votre compte a été créé.';
      window.setTimeout(() => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 350);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.data?.fields) {
        const fieldMap = { guestNumber: 'defaultGuests', allergy: 'allergies' };
        Object.entries(error.data.fields).forEach(([field, message]) => {
          const key = fieldMap[field] ?? field;
          if (inputs[key] && errors[key]) setFieldError(inputs[key], errors[key], message);
        });
      }
      feedback.className = 'auth-feedback alert alert-danger';
      feedback.textContent = error instanceof ApiError && error.status === 409
        ? 'Cette adresse e-mail est déjà utilisée.'
        : (error instanceof ApiError && error.status === 422
          ? 'Veuillez corriger les champs signalés.'
          : 'Impossible de créer le compte pour le moment.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Créer mon compte';
    }
  }

  addListener(form, 'submit', handleSubmit);
  addListener(inputs.firstName, 'blur', () => validateName('firstName', 'prénom'));
  addListener(inputs.lastName, 'blur', () => validateName('lastName', 'nom'));
  addListener(inputs.email, 'blur', validateEmail);
  addListener(inputs.password, 'input', handlePasswordInput);
  addListener(inputs.password, 'blur', validatePassword);
  addListener(inputs.passwordConfirmation, 'input', hideFeedback);
  addListener(inputs.passwordConfirmation, 'blur', validatePasswordConfirmation);
  addListener(inputs.defaultGuests, 'change', validateGuests);
  [inputs.firstName, inputs.lastName, inputs.email, inputs.defaultGuests, inputs.allergies]
    .forEach((input) => addListener(input, 'input', hideFeedback));

  updatePasswordCriteria();

  return () => {
    listeners.forEach((removeListener) => removeListener());
    cleanupPasswordToggles();
  };
}
