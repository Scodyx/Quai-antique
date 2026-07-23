import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';
import { getFoods, getPictures, getRestaurant } from '../api/publicApi.js';
import { formatOpeningHours, formatPrice } from '../utils/formatters.js';

export function HomePage() {
  return `
    ${Header()}
    <div class="home-page">
      <section class="home-hero section" aria-labelledby="home-title">
        <div class="container site-container home-hero__layout">
          <div class="home-hero__content">
            <p class="section-eyebrow">Restaurant gastronomique à Chambéry</p>
            <h1 id="home-title" data-restaurant-name>Une table au bord de l’eau</h1>
            <p class="home-hero__intro" data-restaurant-description>
              Une cuisine de saison, généreuse et précise, inspirée par les
              produits de Savoie et servie dans un cadre chaleureux.
            </p>
            <a class="btn btn-primary" href="/reservation" data-link>
              Réserver une table
            </a>
          </div>
          <div
            class="image-placeholder image-placeholder--hero"
            role="img"
            aria-label="Vue évocatrice du restaurant Quai Antique au bord de l’eau"
          >
            <span class="image-placeholder__label">Vue du restaurant</span>
          </div>
        </div>
      </section>

      <section class="section section--surface" aria-labelledby="house-title">
        <div class="container site-container home-house">
          <div
            class="image-placeholder image-placeholder--portrait"
            role="img"
            aria-label="Portrait temporaire du chef dans la salle du restaurant"
          >
            <span class="image-placeholder__label">Notre maison</span>
          </div>
          <div class="home-house__content">
            <p class="section-eyebrow">Quai Antique</p>
            <h2 id="house-title">Notre maison</h2>
            <p class="visually-hidden" data-restaurant-status role="status" aria-live="polite">Chargement…</p>
            <p>
              À Chambéry, Quai Antique propose une cuisine gastronomique
              accessible, guidée par les saisons et le respect du produit.
              Le chef imagine chaque assiette comme une rencontre entre le
              terroir savoyard et une approche contemporaine.
            </p>
            <button class="btn btn-secondary" type="button">
              Découvrir notre univers
            </button>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="season-title">
        <div class="container site-container">
          <div class="section-heading">
            <p class="section-eyebrow">La carte</p>
            <h2 id="season-title">Plats de saison</h2>
            <p>Une sélection provisoire qui illustre l’esprit de notre future carte.</p>
          </div>

          <div class="dish-grid" data-home-foods>
            <article class="dish-card">
              <div class="image-placeholder image-placeholder--dish image-placeholder--salmon" role="img" aria-label="Présentation temporaire d’un saumon rôti"></div>
              <div class="dish-card__body">
                <div class="dish-card__heading">
                  <h3>Saumon rôti</h3>
                  <p class="dish-card__price">27 €</p>
                </div>
                <p>Écrasé de pommes de terre, légumes de saison et jus aux herbes.</p>
              </div>
            </article>

            <article class="dish-card">
              <div class="image-placeholder image-placeholder--dish image-placeholder--risotto" role="img" aria-label="Présentation temporaire d’un risotto forestier"></div>
              <div class="dish-card__body">
                <div class="dish-card__heading">
                  <h3>Risotto forestier</h3>
                  <p class="dish-card__price">24 €</p>
                </div>
                <p>Champignons, vieux parmesan et jeunes pousses parfumées.</p>
              </div>
            </article>

            <article class="dish-card">
              <div class="image-placeholder image-placeholder--dish image-placeholder--dessert" role="img" aria-label="Présentation temporaire du dessert du chef"></div>
              <div class="dish-card__body">
                <div class="dish-card__heading">
                  <h3>Dessert du chef</h3>
                  <p class="dish-card__price">12 €</p>
                </div>
                <p>Création gourmande selon les fruits et les inspirations du moment.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="section section--surface" aria-labelledby="gallery-title">
        <div class="container site-container">
          <div class="section-heading section-heading--row">
            <div>
              <p class="section-eyebrow">En images</p>
              <h2 id="gallery-title">Un aperçu de notre galerie</h2>
            </div>
            <a class="btn btn-secondary" href="/galerie" data-link>Voir toute la galerie</a>
          </div>

          <div class="gallery-preview" data-home-pictures>
            <div class="image-placeholder image-placeholder--gallery image-placeholder--gallery-one" role="img" aria-label="Dressage temporaire d’une entrée de saison"></div>
            <div class="image-placeholder image-placeholder--gallery image-placeholder--gallery-two" role="img" aria-label="Vue temporaire d’une table dressée"></div>
            <div class="image-placeholder image-placeholder--gallery image-placeholder--gallery-three" role="img" aria-label="Dressage temporaire d’un plat gastronomique"></div>
            <div class="image-placeholder image-placeholder--gallery image-placeholder--gallery-four" role="img" aria-label="Vue temporaire d’un dessert raffiné"></div>
          </div>
        </div>
      </section>

      <section class="home-cta" aria-labelledby="cta-title">
        <div class="container site-container home-cta__content">
          <h2 id="cta-title">Prêt à réserver votre table ?</h2>
          <a class="btn btn-light" href="/reservation" data-link>Réserver une table</a>
        </div>
      </section>

      <section class="section" aria-labelledby="hours-title">
        <div class="container site-container home-hours">
          <div class="home-hours__intro">
            <p class="section-eyebrow">Nous rendre visite</p>
            <h2 id="hours-title">Horaires</h2>
            <p>
              Horaires provisoires : ces informations deviendront administrables
              depuis l’espace dédié.
            </p>
          </div>
          <dl class="hours-list" data-restaurant-hours>
            <div class="hours-list__row">
              <dt>Lundi</dt>
              <dd>Fermé</dd>
            </div>
            <div class="hours-list__row">
              <dt>Mardi à vendredi</dt>
              <dd>12 h 00–14 h 00<br>19 h 00–22 h 30</dd>
            </div>
            <div class="hours-list__row">
              <dt>Samedi</dt>
              <dd>12 h 00–15 h 00<br>19 h 00–23 h 00</dd>
            </div>
            <div class="hours-list__row">
              <dt>Dimanche</dt>
              <dd>12 h 00–15 h 00<br>Soir fermé</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
    ${Footer()}
  `;
}

export function initHomePage() {
  const controller = new AbortController();
  const name = document.querySelector('[data-restaurant-name]');
  const description = document.querySelector('[data-restaurant-description]');
  const status = document.querySelector('[data-restaurant-status]');
  const hours = document.querySelector('[data-restaurant-hours]');

  getRestaurant({ signal: controller.signal })
    .then((restaurant) => {
      if (!restaurant) {
        status.textContent = 'Aucun élément disponible';
        return;
      }

      name.textContent = restaurant.name;
      description.textContent = restaurant.description;
      status.textContent = '';
      hours.replaceChildren();

      [
        ['Service du midi', formatOpeningHours(restaurant.amOpeningTime)],
        ['Service du soir', formatOpeningHours(restaurant.pmOpeningTime)],
        ['Capacité maximale', `${restaurant.maxGuest} couverts`],
      ].forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'hours-list__row';
        const term = document.createElement('dt');
        const detail = document.createElement('dd');
        term.textContent = label;
        detail.textContent = value;
        row.append(term, detail);
        hours.append(row);
      });
    })
    .catch((error) => {
      if (error.code === 'REQUEST_ABORTED') return;
      console.error('Chargement du restaurant impossible.', error);
      status.classList.remove('visually-hidden');
      status.textContent = 'Impossible de charger les données pour le moment';
    });

  getFoods({ signal: controller.signal })
    .then((foods) => {
      const grid = document.querySelector('[data-home-foods]');
      grid.replaceChildren();
      foods.slice(0, 3).forEach((food) => {
        const card = document.createElement('article');
        card.className = 'dish-card';
        const body = document.createElement('div');
        body.className = 'dish-card__body';
        const heading = document.createElement('div');
        heading.className = 'dish-card__heading';
        const title = document.createElement('h3');
        const price = document.createElement('p');
        const descriptionElement = document.createElement('p');
        title.textContent = food.title;
        price.className = 'dish-card__price';
        price.textContent = formatPrice(food.price);
        descriptionElement.textContent = food.description;
        heading.append(title, price);
        body.append(heading, descriptionElement);
        card.append(body);
        grid.append(card);
      });
    })
    .catch((error) => {
      if (error.code !== 'REQUEST_ABORTED') console.error('Chargement des plats impossible.', error);
    });

  getPictures({ signal: controller.signal })
    .then((pictures) => {
      const preview = document.querySelector('[data-home-pictures]');
      preview.replaceChildren();
      pictures.slice(0, 4).forEach((picture) => {
        const image = document.createElement('img');
        image.className = 'image-placeholder image-placeholder--gallery';
        image.src = picture.slug;
        image.alt = picture.title;
        image.loading = 'lazy';
        preview.append(image);
      });
    })
    .catch((error) => {
      if (error.code !== 'REQUEST_ABORTED') console.error('Chargement des images impossible.', error);
    });

  return () => controller.abort();
}
