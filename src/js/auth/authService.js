import {
  apiDelete,
  apiGet,
  apiPost,
  setAccessTokenProvider,
  setAuthenticationFailureHandler,
} from '../api/apiClient.js';

export const TOKEN_STORAGE_KEY = 'quai_antique_api_token';
export const USER_STORAGE_KEY = 'quai_antique_user';
export const AUTH_CHANGED_EVENT = 'quai-antique:auth-changed';
export const AUTH_MESSAGE_KEY = 'quai_antique_auth_message';
export const RETURN_PATH_KEY = 'quai_antique_return_path';
let restorationPromise = null;

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storeSession(apiToken, user) {
  localStorage.setItem(TOKEN_STORAGE_KEY, apiToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

export function clearSession(message = '') {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    if (message) sessionStorage.setItem(AUTH_MESSAGE_KEY, message);
  } finally {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
  }
}

export function getStoredToken() {
  return readStorage(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(readStorage(USER_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getStoredToken() && getStoredUser());
}

export function isAdmin() {
  return getStoredUser()?.roles?.includes('ROLE_ADMIN') ?? false;
}

export function hasRole(role) {
  return getStoredUser()?.roles?.includes(role) ?? false;
}

export async function login(email, password) {
  const payload = await apiPost('/api/login', { email, password });
  storeSession(payload.apiToken, payload.user);
  return payload.user;
}

export async function register(data) {
  const payload = await apiPost('/api/registration', data);
  storeSession(payload.apiToken, payload.user);
  return payload.user;
}

export function logout() {
  clearSession();
}

export async function getCurrentUser() {
  const payload = await apiGet('/api/account/me');
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user));
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
  return payload.user;
}

export async function restoreSession() {
  if (!getStoredToken()) return null;

  try {
    return await getCurrentUser();
  } catch {
    clearSession();
    return null;
  }
}

export function whenAuthReady() {
  if (!restorationPromise) restorationPromise = restoreSession();
  return restorationPromise;
}

export async function deleteCurrentAccount() {
  await apiDelete('/api/account');
  clearSession();
}

setAccessTokenProvider(getStoredToken);
setAuthenticationFailureHandler(() => {
  clearSession('Votre session n’est plus valide. Veuillez vous reconnecter.');
});
