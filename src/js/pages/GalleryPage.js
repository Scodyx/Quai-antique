import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';

// Ces données locales seront remplacées plus tard par un appel à l’API Symfony.
const galleryItems = [
  {
    id: 1,
    title: 'Salle du restaurant',
    category: 'Restaurant',
    description: 'Salle élégante du Quai Antique préparée pour accueillir les convives.',
    variant: 'gallery-visual--forest',
  },
  {
    id: 2,
    title: 'Entrée raffinée',
    category: 'Plats',
    description: 'Entrée gastronomique dressée avec des produits frais et colorés.',
    variant: 'gallery-visual--copper',
  },
  {
    id: 3,
    title: 'Dessert du chef',
    category: 'Plats',
    description: 'Dessert du chef présenté avec une finition délicate.',
    variant: 'gallery-visual--berry',
  },
  {
    id: 4,
    title: 'Terrasse au bord de l’eau',
    category: 'Restaurant',
    description: 'Terrasse paisible du restaurant installée au bord de l’eau.',
    variant: 'gallery-visual--water',
  },
  {
    id: 5,
    title: 'Plat de saison',
    category: 'Plats',
    description: 'Assiette de saison composée autour de légumes et herbes aromatiques.',
    variant: 'gallery-visual--sage',
  },
  {
    id: 6,
    title: 'Équipe en cuisine',
    category: 'Équipe',
    description: 'Équipe du Quai Antique réunie pendant la préparation du service.',
    variant: 'gallery-visual--kitchen',
  },
  {
    id: 7,
    title: 'Vue sur le quai',
    category: 'Ambiance',
    description: 'Vue apaisante sur le quai depuis les abords du restaurant.',
    variant: 'gallery-visual--quay',
  },
  {
    id: 8,
    title: 'Menu découverte',
    category: 'Plats',
    description: 'Sélection gastronomique illustrant le menu découverte du chef.',
    variant: 'gallery-visual--gold',
  },
  {
    id: 9,
    title: 'Dressage d’une assiette',
    category: 'Équipe',
    description: 'Geste précis du chef pendant le dressage final d’une assiette.',
    variant: 'gallery-visual--copper',
  },
  {
    id: 10,
    title: 'Cuisine du chef',
    category: 'Équipe',
    description: 'Cuisine du restaurant organisée avant le début du service.',
    variant: 'gallery-visual--forest',
  },
  {
    id: 11,
    title: 'Service en salle',
    category: 'Restaurant',
    description: 'Service attentif réalisé auprès des tables du restaurant.',
    variant: 'gallery-visual--sage',
  },
  {
    id: 12,
    title: 'Ambiance du soir',
    category: 'Ambiance',
    description: 'Atmosphère chaleureuse du Quai Antique à la tombée de la nuit.',
    variant: 'gallery-visual--evening',
  },
];

function createGalleryCard(item) {
  return `
    <article class="gallery-card">
      <div
        class="image-placeholder gallery-card__visual ${item.variant}"
        role="img"
        aria-label="${item.description}"
      ></div>
      <div class="gallery-card__content">
        <span class="gallery-card__category">${item.category}</span>
        <h2>${item.title}</h2>
        <button
          class="btn btn-secondary gallery-card__button"
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#gallery-modal"
          data-gallery-id="${item.id}"
          aria-label="Agrandir : ${item.title}"
        >
          Agrandir
        </button>
      </div>
    </article>
  `;
}

document.addEventListener('show.bs.modal', (event) => {
  const modal = event.target;

  if (!(modal instanceof HTMLElement) || modal.id !== 'gallery-modal') {
    return;
  }

  const itemId = Number(event.relatedTarget?.dataset.galleryId);
  const item = galleryItems.find((galleryItem) => galleryItem.id === itemId);

  if (!item) {
    return;
  }

  const modalTitle = modal.querySelector('#gallery-modal-title');
  const modalCategory = modal.querySelector('[data-gallery-modal-category]');
  const modalVisual = modal.querySelector('[data-gallery-modal-visual]');

  modalTitle.textContent = item.title;
  modalCategory.textContent = item.category;
  modalVisual.className = `image-placeholder gallery-modal__visual ${item.variant}`;
  modalVisual.setAttribute('aria-label', item.description);
});

export function GalleryPage() {
  const galleryCards = galleryItems.map(createGalleryCard).join('');

  return `
    ${Header()}
    <div class="gallery-page">
      <section class="gallery-intro section" aria-labelledby="gallery-page-title">
        <div class="container site-container gallery-intro__content">
          <p class="section-eyebrow">Quai Antique en images</p>
          <h1 id="gallery-page-title">Galerie</h1>
          <p>
            Découvrez l’univers du restaurant, le travail de notre équipe et
            quelques inspirations culinaires dans une atmosphère chaleureuse.
          </p>
        </div>
      </section>

      <section class="gallery-collection section" aria-label="Photographies du Quai Antique">
        <div class="container site-container">
          <div class="gallery-grid">
            ${galleryCards}
          </div>
        </div>
      </section>

      <section class="gallery-cta" aria-labelledby="gallery-cta-title">
        <div class="container site-container gallery-cta__content">
          <div>
            <p class="section-eyebrow">Votre expérience au Quai Antique</p>
            <h2 id="gallery-cta-title">Une table vous attend</h2>
            <p>Venez découvrir notre cuisine de saison dans un cadre accueillant.</p>
          </div>
          <a class="btn btn-light" href="/reservation" data-link>Réserver une table</a>
        </div>
      </section>
    </div>

    <div
      class="modal fade gallery-modal"
      id="gallery-modal"
      tabindex="-1"
      aria-labelledby="gallery-modal-title"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <p class="gallery-modal__category" data-gallery-modal-category></p>
              <h2 class="modal-title" id="gallery-modal-title">Galerie</h2>
            </div>
            <button
              class="btn-close"
              type="button"
              data-bs-dismiss="modal"
              aria-label="Fermer"
            ></button>
          </div>
          <div class="modal-body">
            <div
              class="image-placeholder gallery-modal__visual"
              role="img"
              aria-label="Élément agrandi de la galerie"
              data-gallery-modal-visual
            ></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
    ${Footer()}
  `;
}
