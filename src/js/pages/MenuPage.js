import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';
import { escapeHtml } from '../utils/textUtils.js';

// Ces données locales seront remplacées plus tard par celles de l’API Symfony.
const menuCategories = [
  {
    id: 'entrees',
    name: 'Entrées',
    description: 'Des assiettes délicates pour ouvrir le repas au rythme des saisons.',
    dishes: [
      {
        id: 1,
        name: 'Œuf parfait, crème de champignons',
        description: 'Œuf fermier, crème de champignons, noisettes torréfiées et jeunes pousses.',
        price: 15,
        variant: 'menu-visual--mushroom',
        dietaryInfo: 'Végétarien',
      },
      {
        id: 2,
        name: 'Truite marinée aux herbes',
        description: 'Truite des Alpes marinée, herbes fraîches et condiment citronné.',
        price: 17,
        variant: 'menu-visual--trout',
        dietaryInfo: 'Poisson',
      },
      {
        id: 3,
        name: 'Velouté de légumes de saison',
        description: 'Légumes du moment, huile parfumée et graines croquantes.',
        price: 13,
        variant: 'menu-visual--vegetable',
        dietaryInfo: 'Végétarien',
      },
    ],
  },
  {
    id: 'plats',
    name: 'Plats',
    description: 'Une cuisine généreuse qui associe produits locaux et gestes contemporains.',
    dishes: [
      {
        id: 4,
        name: 'Saumon rôti, légumes de saison',
        description: 'Saumon rôti, légumes du marché, écrasé de pommes de terre et jus aux herbes.',
        price: 27,
        variant: 'menu-visual--salmon',
        dietaryInfo: 'Poisson',
      },
      {
        id: 5,
        name: 'Risotto forestier',
        description: 'Riz crémeux, champignons, vieux parmesan et jeunes pousses.',
        price: 24,
        variant: 'menu-visual--forest',
        dietaryInfo: 'Végétarien',
      },
      {
        id: 6,
        name: 'Pièce du boucher, jus réduit',
        description: 'Viande sélectionnée, garniture de saison et jus corsé longuement réduit.',
        price: 31,
        variant: 'menu-visual--butcher',
        dietaryInfo: null,
      },
    ],
  },
  {
    id: 'desserts',
    name: 'Desserts',
    description: 'Des créations gourmandes pensées comme la dernière note du repas.',
    dishes: [
      {
        id: 7,
        name: 'Dessert du chef',
        description: 'Création du moment selon les fruits et l’inspiration de la cuisine.',
        price: 12,
        variant: 'menu-visual--chef-dessert',
        dietaryInfo: null,
      },
      {
        id: 8,
        name: 'Tarte fine aux pommes',
        description: 'Pommes fondantes, pâte croustillante et glace à la vanille.',
        price: 11,
        variant: 'menu-visual--apple',
        dietaryInfo: 'Végétarien',
      },
      {
        id: 9,
        name: 'Crème brûlée à la vanille',
        description: 'Crème délicatement vanillée sous une fine croûte caramélisée.',
        price: 10,
        variant: 'menu-visual--vanilla',
        dietaryInfo: 'Végétarien',
      },
    ],
  },
];

const restaurantMenus = [
  {
    id: 1,
    name: 'Menu Découverte',
    description: 'Une première découverte de la cuisine du Quai Antique.',
    price: 42,
    composition: ['Entrée au choix', 'Plat au choix', 'Dessert au choix'],
    badge: null,
  },
  {
    id: 2,
    name: 'Menu Plaisir',
    description: 'Un parcours complet imaginé autour des produits de saison.',
    price: 56,
    composition: ['Mise en bouche', 'Entrée', 'Plat', 'Dessert'],
    badge: 'Le plus choisi',
  },
  {
    id: 3,
    name: 'Menu Prestige',
    description: 'Une expérience gastronomique qui laisse carte blanche au chef.',
    price: 78,
    composition: ['Dégustation en cinq temps'],
    badge: 'Dégustation',
  },
];

const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatPrice(price) {
  return priceFormatter.format(price);
}

function createDishCard(dish) {
  const dietaryBadge = dish.dietaryInfo
    ? `<span class="menu-badge">${escapeHtml(dish.dietaryInfo)}</span>`
    : '';

  return `
    <article class="menu-dish-card">
      <div
        class="image-placeholder menu-dish-card__visual ${dish.variant}"
        role="img"
        aria-label="Présentation temporaire du plat ${escapeHtml(dish.name)}"
      ></div>
      <div class="menu-dish-card__content">
        ${dietaryBadge}
        <div class="menu-dish-card__heading">
          <h4>${escapeHtml(dish.name)}</h4>
          <p class="menu-dish-card__price">${formatPrice(dish.price)}</p>
        </div>
        <p class="menu-dish-card__description">${escapeHtml(dish.description)}</p>
      </div>
    </article>
  `;
}

function createCategorySection(category) {
  const dishes = category.dishes.map(createDishCard).join('');

  return `
    <section class="menu-category" id="${category.id}" aria-labelledby="${category.id}-title">
      <div class="menu-category__heading">
        <h3 id="${category.id}-title">${escapeHtml(category.name)}</h3>
        <p>${escapeHtml(category.description)}</p>
      </div>
      <div class="menu-dish-grid">
        ${dishes}
      </div>
    </section>
  `;
}

function createRestaurantMenuCard(menu) {
  const badge = menu.badge ? `<span class="menu-badge">${escapeHtml(menu.badge)}</span>` : '';
  const composition = menu.composition.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  return `
    <article class="restaurant-menu-card">
      ${badge}
      <h3>${escapeHtml(menu.name)}</h3>
      <p class="restaurant-menu-card__description">${escapeHtml(menu.description)}</p>
      <ul class="restaurant-menu-card__composition">
        ${composition}
      </ul>
      <p class="restaurant-menu-card__price">${formatPrice(menu.price)}</p>
    </article>
  `;
}

export function MenuPage() {
  const categorySections = menuCategories.map(createCategorySection).join('');
  const menuCards = restaurantMenus.map(createRestaurantMenuCard).join('');

  return `
    ${Header()}
    <div class="menu-page">
      <section class="menu-intro section" aria-labelledby="menu-page-title">
        <div class="container site-container menu-intro__content">
          <p class="section-eyebrow">La cuisine du Quai Antique</p>
          <h1 id="menu-page-title">Carte et menus</h1>
          <p>
            Notre cuisine se laisse guider par les saisons, les produits du
            territoire et l’envie de proposer une expérience généreuse.
          </p>

          <nav class="menu-anchor-nav" aria-label="Accès rapide à la carte et aux menus">
            <a href="#entrees">Entrées</a>
            <a href="#plats">Plats</a>
            <a href="#desserts">Desserts</a>
            <a href="#menus">Menus</a>
          </nav>
        </div>
      </section>

      <section class="menu-card-section section" aria-labelledby="card-title">
        <div class="container site-container">
          <div class="menu-section-heading">
            <p class="section-eyebrow">Au fil des saisons</p>
            <h2 id="card-title">La carte</h2>
          </div>
          ${categorySections}
        </div>
      </section>

      <section class="restaurant-menus section" id="menus" aria-labelledby="menus-title">
        <div class="container site-container">
          <div class="menu-section-heading">
            <p class="section-eyebrow">Nos expériences</p>
            <h2 id="menus-title">Nos menus</h2>
            <p>Des parcours imaginés par le chef pour découvrir la maison.</p>
          </div>
          <div class="restaurant-menu-grid">
            ${menuCards}
          </div>
        </div>
      </section>

      <section class="menu-cta" aria-labelledby="menu-cta-title">
        <div class="container site-container menu-cta__content">
          <div>
            <p class="section-eyebrow">Votre prochaine expérience</p>
            <h2 id="menu-cta-title">Envie de découvrir notre cuisine ?</h2>
            <p>Choisissez votre moment et laissez notre équipe prendre soin de vous.</p>
          </div>
          <a class="btn btn-light" href="/reservation" data-link>Réserver une table</a>
        </div>
      </section>
    </div>
    ${Footer()}
  `;
}
