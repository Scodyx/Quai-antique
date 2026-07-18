import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';

export function GalleryPage() {
  return `
    ${Header()}
    <section class="temporary-page" aria-labelledby="gallery-page-title">
      <div class="container site-container text-center">
        <h1 id="gallery-page-title">Galerie</h1>
        <p>Cette page sera développée prochainement.</p>
      </div>
    </section>
    ${Footer()}
  `;
}
