import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';
import { getCategories, getFoods, getMenus } from '../api/publicApi.js';
import { formatPrice } from '../utils/formatters.js';

const CATEGORY_ORDER = ['Entrées', 'Plats', 'Desserts', 'Boissons'];

function createFoodCard(food) {
  const card = document.createElement('article');
  card.className = 'menu-dish-card';
  const content = document.createElement('div');
  content.className = 'menu-dish-card__content';
  const heading = document.createElement('div');
  heading.className = 'menu-dish-card__heading';
  const title = document.createElement('h4');
  const price = document.createElement('p');
  const description = document.createElement('p');
  title.textContent = food.title;
  price.className = 'menu-dish-card__price';
  price.textContent = formatPrice(food.price);
  description.className = 'menu-dish-card__description';
  description.textContent = food.description;
  heading.append(title, price);
  content.append(heading, description);
  card.append(content);
  return card;
}

function createCategorySection(category, foods) {
  const section = document.createElement('section');
  section.className = 'menu-category';
  section.id = `categorie-${category.id}`;
  const heading = document.createElement('div');
  heading.className = 'menu-category__heading';
  const title = document.createElement('h3');
  title.textContent = category.title;
  heading.append(title);
  const grid = document.createElement('div');
  grid.className = 'menu-dish-grid';
  foods
    .filter((food) => food.categories?.some((item) => item.id === category.id))
    .forEach((food) => grid.append(createFoodCard(food)));
  if (!grid.children.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Aucun élément disponible';
    grid.append(empty);
  }
  section.append(heading, grid);
  return section;
}

function createMenuCard(menu) {
  const card = document.createElement('article');
  card.className = 'restaurant-menu-card';
  const title = document.createElement('h3');
  const description = document.createElement('p');
  const categories = document.createElement('p');
  const price = document.createElement('p');
  title.textContent = menu.title;
  description.className = 'restaurant-menu-card__description';
  description.textContent = menu.description;
  categories.textContent = menu.categories?.map((item) => item.title).join(' • ') || '';
  price.className = 'restaurant-menu-card__price';
  price.textContent = formatPrice(menu.price);
  card.append(title, description, categories, price);
  return card;
}

export function MenuPage() {
  return `
    ${Header()}
    <div class="menu-page">
      <section class="menu-intro section" aria-labelledby="menu-page-title">
        <div class="container site-container menu-intro__content">
          <p class="section-eyebrow">La cuisine du Quai Antique</p>
          <h1 id="menu-page-title">Carte et menus</h1>
          <p>Notre cuisine se laisse guider par les saisons et les produits du territoire.</p>
        </div>
      </section>
      <section class="menu-card-section section" aria-labelledby="card-title">
        <div class="container site-container">
          <div class="menu-section-heading"><p class="section-eyebrow">Au fil des saisons</p><h2 id="card-title">La carte</h2></div>
          <p data-food-status role="status" aria-live="polite">Chargement…</p>
          <div data-food-sections></div>
        </div>
      </section>
      <section class="restaurant-menus section" id="menus" aria-labelledby="menus-title">
        <div class="container site-container">
          <div class="menu-section-heading"><p class="section-eyebrow">Nos expériences</p><h2 id="menus-title">Nos menus</h2></div>
          <p data-menu-status role="status" aria-live="polite">Chargement…</p>
          <div class="restaurant-menu-grid" data-menu-grid></div>
        </div>
      </section>
    </div>
    ${Footer()}
  `;
}

export function initMenuPage() {
  const controller = new AbortController();
  const foodStatus = document.querySelector('[data-food-status]');
  const menuStatus = document.querySelector('[data-menu-status]');
  const sections = document.querySelector('[data-food-sections]');
  const menuGrid = document.querySelector('[data-menu-grid]');

  Promise.all([
    getCategories({ signal: controller.signal }),
    getFoods({ signal: controller.signal }),
    getMenus({ signal: controller.signal }),
  ]).then(([categories, foods, menus]) => {
    categories.sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a.title);
      const bIndex = CATEGORY_ORDER.indexOf(b.title);
      return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
    });
    foodStatus.textContent = foods.length ? '' : 'Aucun élément disponible';
    categories.forEach((category) => sections.append(createCategorySection(category, foods)));
    menuStatus.textContent = menus.length ? '' : 'Aucun élément disponible';
    menus.forEach((menu) => menuGrid.append(createMenuCard(menu)));
  }).catch((error) => {
    if (error.code === 'REQUEST_ABORTED') return;
    console.error('Chargement de la carte impossible.', error);
    foodStatus.textContent = 'Impossible de charger les données pour le moment';
    menuStatus.textContent = 'Impossible de charger les données pour le moment';
  });

  return () => controller.abort();
}
