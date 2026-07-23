import { apiDelete, apiGet, apiPost, apiPut } from './apiClient.js';

export function getAvailability({ restaurantId, date, guestNumber }, options = {}) {
  const query = new URLSearchParams({ restaurantId, date, guestNumber });
  return apiGet(`/api/booking/availability?${query}`, options);
}

export async function getBookings(date = null, options = {}) {
  const query = date ? `?${new URLSearchParams({ date })}` : '';
  return (await apiGet(`/api/booking${query}`, options)).bookings ?? [];
}

export function getBooking(id, options) {
  return apiGet(`/api/booking/${id}`, options);
}

export function createBooking(data) {
  return apiPost('/api/booking', data);
}

export function updateBooking(id, data) {
  return apiPut(`/api/booking/${id}`, data);
}

export function deleteBooking(id) {
  return apiDelete(`/api/booking/${id}`);
}
