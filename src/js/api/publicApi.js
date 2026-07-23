import { apiGet } from './apiClient.js';

function readCollection(payload, key) {
  return Array.isArray(payload?.[key]) ? payload[key] : [];
}

export async function getRestaurants(options) {
  return readCollection(await apiGet('/api/restaurant', options), 'restaurants');
}

export async function getRestaurant(options) {
  return (await getRestaurants(options))[0] ?? null;
}

export async function getCategories(options) {
  return readCollection(await apiGet('/api/category', options), 'categories');
}

export async function getFoods(options) {
  return readCollection(await apiGet('/api/food', options), 'foods');
}

export async function getMenus(options) {
  return readCollection(await apiGet('/api/menu', options), 'menus');
}

export async function getPictures(options) {
  return readCollection(await apiGet('/api/picture', options), 'pictures');
}
