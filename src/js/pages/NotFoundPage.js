import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';

export function NotFoundPage() {
  return `
    ${Header()}
    <section class="not-found" aria-labelledby="not-found-title">
      <div class="container site-container text-center">
        <p class="not-found__code" aria-hidden="true">404</p>
        <h1 id="not-found-title">Page introuvable</h1>
        <p>La page demandée n’existe pas ou n’est plus disponible.</p>
        <a class="btn btn-primary" href="/" data-link>Revenir à l’accueil</a>
      </div>
    </section>
    ${Footer()}
  `;
}
