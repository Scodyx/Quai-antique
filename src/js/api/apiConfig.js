import { ApiError, API_ERROR_MESSAGES } from './ApiError.js';

function readConfiguredBaseUrl() {
  return import.meta.env?.VITE_API_URL?.trim().replace(/\/+$/, '')
    || 'http://127.0.0.1:8000';
}

export function getApiBaseUrl() {
  const baseUrl = readConfiguredBaseUrl();

  if (!baseUrl) {
    throw new ApiError(API_ERROR_MESSAGES.missingConfiguration, {
      code: 'API_CONFIGURATION_MISSING',
    });
  }

  try {
    const parsedUrl = new URL(baseUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new TypeError();
  } catch (cause) {
    throw new ApiError('L’adresse configurée pour l’API Symfony est invalide.', {
      code: 'API_CONFIGURATION_INVALID',
      cause,
    });
  }

  return baseUrl;
}

export function buildApiUrl(path) {
  if (typeof path !== 'string' || !path.trim()) {
    throw new TypeError('Le chemin de l’API doit être une chaîne relative non vide.');
  }

  const trimmedPath = path.trim();

  if (/^[a-z][a-z\d+.-]*:/i.test(trimmedPath) || trimmedPath.startsWith('//')) {
    throw new TypeError('Une URL absolue ne peut pas être utilisée comme chemin d’API.');
  }

  const normalizedPath = trimmedPath.replace(/^\/+/, '');
  const suffixIndex = normalizedPath.search(/[?#]/);
  const pathWithoutQuery = suffixIndex === -1
    ? normalizedPath
    : normalizedPath.slice(0, suffixIndex);
  const queryOrHash = suffixIndex === -1 ? '' : normalizedPath.slice(suffixIndex);

  if (pathWithoutQuery.split('/').includes('..')) {
    throw new TypeError('Le chemin de l’API ne peut pas remonter dans l’arborescence.');
  }

  return `${getApiBaseUrl()}/${pathWithoutQuery.replace(/\/{2,}/g, '/')}${queryOrHash}`;
}
