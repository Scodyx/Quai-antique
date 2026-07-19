export const API_ERROR_MESSAGES = Object.freeze({
  network: 'La communication avec l’API a échoué.',
  invalidJson: 'La réponse reçue depuis l’API contient un JSON invalide.',
  http: 'La requête API a échoué.',
  missingConfiguration: 'L’adresse de l’API Symfony n’est pas configurée.',
  aborted: 'La requête API a été annulée.',
});

export class ApiError extends Error {
  constructor(message, {
    status = null,
    statusText = '',
    code = '',
    data = null,
    url = '',
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.code = code;
    this.data = data;
    this.url = url;
  }
}
