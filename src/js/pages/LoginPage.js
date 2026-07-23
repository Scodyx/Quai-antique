import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';
import { initializePasswordToggles } from '../utils/passwordVisibility.js';
import { login } from '../auth/authService.js';
import { ApiError } from '../api/ApiError.js';
import { AUTH_MESSAGE_KEY, RETURN_PATH_KEY } from '../auth/authService.js';

const PENDING_RESERVATION_KEY = 'quaiAntique.pendingReservation';

function hasPendingReservation() {
  try {
    return Boolean(sessionStorage.getItem(PENDING_RESERVATION_KEY));
  } catch {
    return false;
  }
}

function prepareLoginData(emailInput) {
  return {
    email: emailInput.value.trim(),
  };
}

export function LoginPage() {
  const pendingReservationMessage = hasPendingReservation()
    ? `
      <aside class="auth-pending" aria-labelledby="pending-reservation-title">
        <h2 id="pending-reservation-title">Réservation en attente</h2>
        <p>Votre demande est conservée et pourra être reprise après votre connexion.</p>
        <a href="/reservation" data-link>Revenir à la réservation</a>
      </aside>
    `
    : '';

  return `
    ${Header()}
    <div class="auth-page">
      <section class="auth-intro section" aria-labelledby="login-page-title">
        <div class="container auth-intro__content text-center">
          <p class="section-eyebrow">Espace sécurisé</p>
        <h1 id="login-page-title">Connexion</h1>
          <p>Accédez à votre espace client ou administrateur depuis ce formulaire commun.</p>
        </div>
      </section>

      <section class="auth-section section" aria-label="Formulaire de connexion">
        <div class="container auth-container">
          ${pendingReservationMessage}

          <div class="auth-card">
            <form class="auth-form" id="login-form" novalidate>
              <div class="auth-field">
                <label for="login-email">Adresse e-mail</label>
                <input
                  class="form-control"
                  id="login-email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  aria-describedby="login-email-error"
                  required
                >
                <p class="auth-error" id="login-email-error"></p>
              </div>

              <div class="auth-field">
                <label for="login-password">Mot de passe</label>
                <div class="auth-password">
                  <input
                    class="form-control"
                    id="login-password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    minlength="8"
                    aria-describedby="login-password-error"
                    required
                  >
                  <button
                    class="auth-password__toggle"
                    type="button"
                    data-password-toggle
                    data-password-target="login-password"
                    data-password-label="le mot de passe"
                    aria-label="Afficher le mot de passe"
                    aria-pressed="false"
                  >Afficher</button>
                </div>
                <p class="auth-error" id="login-password-error"></p>
              </div>

              <button class="btn btn-primary auth-submit" type="submit">Se connecter</button>
              <div class="auth-feedback alert alert-success d-none" id="login-feedback" role="status" aria-live="polite"></div>
            </form>

            <p class="auth-switch">
              Pas encore de compte ? <a href="/inscription" data-link>Créer un compte</a>
            </p>
          </div>
        </div>
      </section>
    </div>
    ${Footer()}
  `;
}

export function initLoginPage() {
  const form = document.querySelector('#login-form');

  if (!form) {
    return undefined;
  }

  const emailInput = form.querySelector('#login-email');
  const passwordInput = form.querySelector('#login-password');
  const emailError = form.querySelector('#login-email-error');
  const passwordError = form.querySelector('#login-password-error');
  const feedback = form.querySelector('#login-feedback');

  if (!emailInput || !passwordInput || !emailError || !passwordError || !feedback) {
    return undefined;
  }
  const authMessage = sessionStorage.getItem(AUTH_MESSAGE_KEY);
  if (authMessage) {
    feedback.className = 'auth-feedback alert alert-warning';
    feedback.textContent = authMessage;
    sessionStorage.removeItem(AUTH_MESSAGE_KEY);
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

  function validateEmail() {
    emailInput.value = emailInput.value.trim();
    let message = '';

    if (!emailInput.value) {
      message = 'Saisissez votre adresse e-mail.';
    } else if (!emailInput.validity.valid) {
      message = 'Saisissez une adresse e-mail valide.';
    }

    setFieldError(emailInput, emailError, message);
    return !message;
  }

  function validatePassword() {
    let message = '';

    if (!passwordInput.value) {
      message = 'Saisissez votre mot de passe.';
    } else if (passwordInput.value.length < 8) {
      message = 'Le mot de passe doit contenir au moins 8 caractères.';
    }

    setFieldError(passwordInput, passwordError, message);
    return !message;
  }

  function hideFeedback() {
    feedback.classList.add('d-none');
    feedback.textContent = '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    hideFeedback();

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      form.querySelector('.is-invalid')?.focus();
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Connexion…';

    try {
      const data = prepareLoginData(emailInput);
      await login(data.email, passwordInput.value);
      feedback.className = 'auth-feedback alert alert-success';
      feedback.textContent = 'Connexion réussie.';
      window.setTimeout(() => {
        const returnPath = sessionStorage.getItem(RETURN_PATH_KEY) || '/';
        sessionStorage.removeItem(RETURN_PATH_KEY);
        window.history.pushState({}, '', returnPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 350);
    } catch (error) {
      feedback.className = 'auth-feedback alert alert-danger';
      feedback.textContent = error instanceof ApiError && error.status === 401
        ? 'Adresse e-mail ou mot de passe incorrect'
        : 'Impossible de vous connecter pour le moment.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Se connecter';
    }
  }

  addListener(form, 'submit', handleSubmit);
  addListener(emailInput, 'blur', validateEmail);
  addListener(passwordInput, 'blur', validatePassword);
  addListener(emailInput, 'input', hideFeedback);
  addListener(passwordInput, 'input', hideFeedback);

  return () => {
    listeners.forEach((removeListener) => removeListener());
    cleanupPasswordToggles();
  };
}
