import { apiDelete, apiPost, apiPut } from './apiClient.js';

export const updateRestaurant = (id, data) => apiPut(`/api/restaurant/${id}`, data);
export const createCategory = (data) => apiPost('/api/category', data);
export const updateCategory = (id, data) => apiPut(`/api/category/${id}`, data);
export const deleteCategory = (id) => apiDelete(`/api/category/${id}`);
export const createFood = (data) => apiPost('/api/food', data);
export const updateFood = (id, data) => apiPut(`/api/food/${id}`, data);
export const deleteFood = (id) => apiDelete(`/api/food/${id}`);
export const createMenu = (data) => apiPost('/api/menu', data);
export const updateMenu = (id, data) => apiPut(`/api/menu/${id}`, data);
export const deleteMenu = (id) => apiDelete(`/api/menu/${id}`);
export const createPicture = (data) => apiPost('/api/picture', data);
export const updatePicture = (id, data) => apiPut(`/api/picture/${id}`, data);
export const deletePicture = (id) => apiDelete(`/api/picture/${id}`);
