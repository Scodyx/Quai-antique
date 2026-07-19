import { ApiError, API_ERROR_MESSAGES } from './ApiError.js';
import { buildApiUrl } from './apiConfig.js';

let accessTokenProvider = null;

const SENSITIVE_KEY_PATTERN = /password|passphrase|token|authorization|secret|credential/i;

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function sanitizeErrorData(value, seen = new WeakSet()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return null;
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeErrorData(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
      .map(([key, item]) => [key, sanitizeErrorData(item, seen)]),
  );
}

function isHtmlContent(contentType, value) {
  return contentType.includes('text/html')
    || (typeof value === 'string' && /<\s*(?:!doctype|html|body)\b/i.test(value));
}

function extractErrorMessage(data) {
  if (typeof data === 'string') {
    return data.trim() && !isHtmlContent('', data) ? data.trim() : '';
  }

  if (!data || typeof data !== 'object') return '';

  for (const key of ['message', 'detail', 'title', 'error']) {
    const candidate = data[key];
    if (typeof candidate === 'string' && candidate.trim() && !isHtmlContent('', candidate)) {
      return candidate.trim();
    }
  }

  return '';
}

async function readResponseBody(response, url) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  const text = await response.text();

  if (!text.trim()) return null;

  if (contentType.includes('json')) {
    try {
      return JSON.parse(text);
    } catch (cause) {
      throw new ApiError(API_ERROR_MESSAGES.invalidJson, {
        status: response.status,
        statusText: response.statusText,
        code: 'INVALID_JSON_RESPONSE',
        url,
        cause,
      });
    }
  }

  return text;
}

async function createHeaders(initialHeaders, body) {
  const headers = new Headers(initialHeaders);
  let preparedBody = body;

  if (isPlainObject(body)) {
    try {
      preparedBody = JSON.stringify(body);
    } catch (cause) {
      throw new ApiError('Le corps de la requête ne peut pas être sérialisé en JSON.', {
        code: 'REQUEST_SERIALIZATION_ERROR',
        cause,
      });
    }
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  }

  if (accessTokenProvider && !headers.has('Authorization')) {
    const token = await accessTokenProvider();
    if (typeof token === 'string' && token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return { headers, body: preparedBody };
}

export function setAccessTokenProvider(provider = null) {
  if (provider !== null && typeof provider !== 'function') {
    throw new TypeError('Le fournisseur de jeton doit être une fonction ou null.');
  }

  accessTokenProvider = provider;
}

export function isApiAbortError(error) {
  return error instanceof ApiError && error.code === 'REQUEST_ABORTED';
}

export async function apiRequest(path, options = {}) {
  const url = buildApiUrl(path);
  const errorUrl = url.split(/[?#]/, 1)[0];
  const {
    method = 'GET',
    headers: initialHeaders,
    body,
    signal,
    credentials = 'same-origin',
    ...fetchOptions
  } = options;
  const preparedRequest = await createHeaders(initialHeaders, body);

  let response;

  try {
    response = await fetch(url, {
      ...fetchOptions,
      method: method.toUpperCase(),
      headers: preparedRequest.headers,
      body: preparedRequest.body,
      signal,
      credentials,
    });
  } catch (cause) {
    if (cause?.name === 'AbortError' || signal?.aborted) {
      throw new ApiError(API_ERROR_MESSAGES.aborted, {
        code: 'REQUEST_ABORTED',
        url: errorUrl,
        cause,
      });
    }

    throw new ApiError(API_ERROR_MESSAGES.network, {
      code: 'NETWORK_ERROR',
      url: errorUrl,
      cause,
    });
  }

  let responseData;

  try {
    responseData = await readResponseBody(response, errorUrl);
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;

    if (cause?.name === 'AbortError' || signal?.aborted) {
      throw new ApiError(API_ERROR_MESSAGES.aborted, {
        code: 'REQUEST_ABORTED',
        url: errorUrl,
        cause,
      });
    }

    throw new ApiError(API_ERROR_MESSAGES.network, {
      code: 'NETWORK_ERROR',
      url: errorUrl,
      cause,
    });
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    const safeData = isHtmlContent(contentType, responseData)
      ? null
      : sanitizeErrorData(responseData);

    throw new ApiError(
      extractErrorMessage(safeData) || API_ERROR_MESSAGES.http,
      {
        status: response.status,
        statusText: response.statusText,
        code: 'HTTP_ERROR',
        data: safeData,
        url: errorUrl,
      },
    );
  }

  return responseData;
}

export function apiGet(path, options = {}) {
  return apiRequest(path, { ...options, method: 'GET' });
}

export function apiPost(path, body, options = {}) {
  return apiRequest(path, { ...options, method: 'POST', body });
}

export function apiPut(path, body, options = {}) {
  return apiRequest(path, { ...options, method: 'PUT', body });
}

export function apiPatch(path, body, options = {}) {
  return apiRequest(path, { ...options, method: 'PATCH', body });
}

export function apiDelete(path, options = {}) {
  return apiRequest(path, { ...options, method: 'DELETE' });
}
