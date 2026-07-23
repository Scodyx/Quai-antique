import { AdminLayout, initAdminLayout } from '../components/admin/AdminLayout.js';
import {
  createCategory, createFood, createMenu,
  deleteCategory, deleteFood, deleteMenu,
  updateCategory, updateFood, updateMenu,
} from '../api/adminApi.js';
import { getCategories, getFoods, getMenus, getRestaurant } from '../api/publicApi.js';
import { apiErrorMessage, clearFormErrors, showFormErrors } from '../utils/formErrors.js';
import { centsToEurosInput, eurosInputToCents, formatPrice } from '../utils/formatters.js';

const error = (name) => `<p class="text-danger" data-error-for="${name}"></p>`;

export function AdminMenuManagementPage() {
  return AdminLayout(`
    <header class="admin-menu-intro"><p class="admin-eyebrow">Offre du restaurant</p><h1>Catégories, plats et menus</h1></header>
    <div class="alert d-none" data-catalog-message role="status" aria-live="polite"></div>
    <section class="admin-menu-section"><h2>Catégories</h2>
      <form data-category-form novalidate><input type="hidden" name="id"><label>Titre<input class="form-control" name="title" maxlength="64" required></label>${error('title')}<button class="btn btn-primary" type="submit">Enregistrer</button><button class="btn btn-secondary" type="reset">Nouveau</button></form>
      <div data-category-list><p>Chargement…</p></div>
    </section>
    <section class="admin-menu-section"><h2>Plats</h2>
      <form data-food-form novalidate><input type="hidden" name="id"><label>Titre<input class="form-control" name="title" maxlength="64" required></label>${error('title')}<label>Description<textarea class="form-control" name="description" required></textarea></label>${error('description')}<label>Prix en euros<input class="form-control" name="priceEuros" inputmode="decimal" required></label>${error('price')}<label>Catégories<select class="form-select" name="categoryIds" multiple></select></label>${error('categoryIds')}<button class="btn btn-primary" type="submit">Enregistrer</button><button class="btn btn-secondary" type="reset">Nouveau</button></form>
      <div data-food-list><p>Chargement…</p></div>
    </section>
    <section class="admin-menu-section"><h2>Menus</h2>
      <form data-menu-form novalidate><input type="hidden" name="id"><label>Titre<input class="form-control" name="title" maxlength="64" required></label>${error('title')}<label>Description<textarea class="form-control" name="description" required></textarea></label>${error('description')}<label>Prix en euros<input class="form-control" name="priceEuros" inputmode="decimal" required></label>${error('price')}<label>Catégories<select class="form-select" name="categoryIds" multiple required></select></label>${error('categoryIds')}<button class="btn btn-primary" type="submit">Enregistrer</button><button class="btn btn-secondary" type="reset">Nouveau</button></form>
      <div data-menu-list><p>Chargement…</p></div>
    </section>
  `);
}

export function initAdminMenuManagementPage() {
  const cleanup = initAdminLayout();
  const message = document.querySelector('[data-catalog-message]');
  const forms = {
    category: document.querySelector('[data-category-form]'),
    food: document.querySelector('[data-food-form]'),
    menu: document.querySelector('[data-menu-form]'),
  };
  let categories = [];
  let foods = [];
  let menus = [];
  let restaurant = null;
  let controller = new AbortController();
  const announce = (text, type = 'success') => { message.className = `alert alert-${type}`; message.textContent = text; };

  const fillCategorySelects = () => {
    [forms.food.elements.categoryIds, forms.menu.elements.categoryIds].forEach((select) => {
      const selected = [...select.selectedOptions].map((option) => Number(option.value));
      select.replaceChildren();
      categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.title;
        option.selected = selected.includes(category.id);
        select.append(option);
      });
    });
  };

  const actionButtons = (item, editHandler, deleteHandler) => {
    const wrapper = document.createElement('span');
    const edit = document.createElement('button');
    edit.className = 'btn btn-sm btn-secondary';
    edit.type = 'button';
    edit.textContent = 'Modifier';
    edit.addEventListener('click', () => editHandler(item));
    const remove = document.createElement('button');
    remove.className = 'btn btn-sm btn-danger ms-2';
    remove.type = 'button';
    remove.textContent = 'Supprimer';
    remove.addEventListener('click', async () => {
      if (!window.confirm(`Supprimer « ${item.title} » ? Les relations associées peuvent être affectées.`)) return;
      remove.disabled = true;
      try { await deleteHandler(item.id); await load(); announce('Élément supprimé.'); } catch (requestError) { announce(apiErrorMessage(requestError), 'danger'); remove.disabled = false; }
    });
    wrapper.append(edit, remove);
    return wrapper;
  };

  const renderList = (selector, items, editHandler, deleteHandler, details) => {
    const target = document.querySelector(selector);
    target.replaceChildren();
    if (!items.length) { target.textContent = 'Aucun élément disponible.'; return; }
    items.forEach((item) => {
      const article = document.createElement('article');
      article.className = 'admin-menu-item';
      const title = document.createElement('h3');
      title.textContent = item.title;
      article.append(title);
      if (details) {
        const text = document.createElement('p');
        text.textContent = details(item);
        article.append(text);
      }
      article.append(actionButtons(item, editHandler, deleteHandler));
      target.append(article);
    });
  };

  const render = () => {
    fillCategorySelects();
    renderList('[data-category-list]', categories, (item) => {
      forms.category.elements.id.value = item.id;
      forms.category.elements.title.value = item.title;
    }, deleteCategory);
    renderList('[data-food-list]', foods, (item) => {
      forms.food.elements.id.value = item.id;
      forms.food.elements.title.value = item.title;
      forms.food.elements.description.value = item.description;
      forms.food.elements.priceEuros.value = centsToEurosInput(item.price);
      [...forms.food.elements.categoryIds.options].forEach((option) => { option.selected = item.categories.some((category) => category.id === Number(option.value)); });
    }, deleteFood, (item) => `${item.description} · ${formatPrice(item.price)}`);
    renderList('[data-menu-list]', menus, (item) => {
      forms.menu.elements.id.value = item.id;
      forms.menu.elements.title.value = item.title;
      forms.menu.elements.description.value = item.description;
      forms.menu.elements.priceEuros.value = centsToEurosInput(item.price);
      [...forms.menu.elements.categoryIds.options].forEach((option) => { option.selected = item.categories.some((category) => category.id === Number(option.value)); });
    }, deleteMenu, (item) => `${item.description} · ${formatPrice(item.price)}`);
  };

  const load = async () => {
    [categories, foods, menus, restaurant] = await Promise.all([
      getCategories({ signal: controller.signal }),
      getFoods({ signal: controller.signal }),
      getMenus({ signal: controller.signal }),
      getRestaurant({ signal: controller.signal }),
    ]);
    render();
  };

  forms.category.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const id = Number(form.elements.id.value);
    const payload = { title: form.elements.title.value.trim() };
    try {
      await (id ? updateCategory(id, payload) : createCategory(payload));
      form.reset(); await load(); announce(id ? 'Catégorie modifiée.' : 'Catégorie créée.');
    } catch (requestError) { if (requestError.status === 422) showFormErrors(form, requestError.data?.fields); announce(apiErrorMessage(requestError), 'danger'); }
  });

  const bindProductForm = (form, create, update, label, includeRestaurant) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFormErrors(form);
      const id = Number(form.elements.id.value);
      const price = eurosInputToCents(form.elements.priceEuros.value);
      const payload = {
        title: form.elements.title.value.trim(),
        description: form.elements.description.value.trim(),
        price,
        categoryIds: [...form.elements.categoryIds.selectedOptions].map((option) => Number(option.value)),
      };
      if (includeRestaurant) payload.restaurantId = restaurant.id;
      if (price === null) { showFormErrors(form, { price: 'Saisissez un prix valide et positif.' }); return; }
      if (includeRestaurant && !payload.categoryIds.length) { showFormErrors(form, { categoryIds: 'Sélectionnez au moins une catégorie.' }); return; }
      try {
        await (id ? update(id, payload) : create(payload));
        form.reset(); await load(); announce(`${label} ${id ? 'modifié' : 'créé'}.`);
      } catch (requestError) { if (requestError.status === 422) showFormErrors(form, requestError.data?.fields); announce(apiErrorMessage(requestError), 'danger'); }
    });
  };
  bindProductForm(forms.food, createFood, updateFood, 'Plat', false);
  bindProductForm(forms.menu, createMenu, updateMenu, 'Menu', true);
  Object.values(forms).forEach((form) => form.addEventListener('reset', () => { form.elements.id.value = ''; clearFormErrors(form); }));
  load().catch((requestError) => announce(apiErrorMessage(requestError), 'danger'));
  return () => { controller.abort(); cleanup?.(); };
}
