import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';
import { getPictures } from '../api/publicApi.js';

function createGalleryCard(picture) {
  const card = document.createElement('article');
  card.className = 'gallery-card';

  const image = document.createElement('img');
  image.className = 'gallery-card__visual';
  image.src = picture.slug;
  image.alt = picture.title;
  image.loading = 'lazy';

  const content = document.createElement('div');
  content.className = 'gallery-card__content';
  const title = document.createElement('h2');
  title.textContent = picture.title;
  content.append(title);
  card.append(image, content);

  return card;
}

export function GalleryPage() {
  return `
    ${Header()}
    <div class="gallery-page">
      <section class="gallery-intro section" aria-labelledby="gallery-page-title">
        <div class="container site-container gallery-intro__content">
          <p class="section-eyebrow">Quai Antique en images</p>
          <h1 id="gallery-page-title">Galerie</h1>
          <p>Découvrez l’univers du restaurant, le travail de notre équipe et quelques inspirations culinaires.</p>
        </div>
      </section>
      <section class="gallery-collection section" aria-label="Photographies du Quai Antique">
        <div class="container site-container">
          <p data-gallery-status role="status" aria-live="polite">Chargement…</p>
          <div class="gallery-grid" data-gallery-grid></div>
        </div>
      </section>
      <section class="gallery-cta" aria-labelledby="gallery-cta-title">
        <div class="container site-container gallery-cta__content">
          <div><p class="section-eyebrow">Votre expérience au Quai Antique</p><h2 id="gallery-cta-title">Une table vous attend</h2></div>
          <a class="btn btn-light" href="/reservation" data-link>Réserver une table</a>
        </div>
      </section>
    </div>
    ${Footer()}
  `;
}

export function initGalleryPage() {
  const controller = new AbortController();
  const grid = document.querySelector('[data-gallery-grid]');
  const status = document.querySelector('[data-gallery-status]');

  getPictures({ signal: controller.signal })
    .then((pictures) => {
      status.textContent = pictures.length ? '' : 'Aucun élément disponible';
      pictures.forEach((picture) => grid.append(createGalleryCard(picture)));
    })
    .catch((error) => {
      if (error.code === 'REQUEST_ABORTED') return;
      console.error('Chargement de la galerie impossible.', error);
      status.textContent = 'Impossible de charger les données pour le moment';
    });

  return () => controller.abort();
}
