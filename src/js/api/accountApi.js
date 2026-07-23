import { apiDelete, apiGet, apiPut } from './apiClient.js';

export async function getAccount(options) {
  return (await apiGet('/api/account/me', options)).user;
}

export async function updateAccount(data) {
  return apiPut('/api/account/edit', data);
}

export async function updatePassword(data) {
  return apiPut('/api/account/password', data);
}

export function deleteAccount() {
  return apiDelete('/api/account');
}
