import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';

export function MenuPage() {
  return `
    ${Header()}
    <section class="temporary-page" aria-labelledby="menu-page-title">
      <div class="container site-container text-center">
        <h1 id="menu-page-title">Carte et menus</h1>
        <p>Cette page sera développée prochainement.</p>
      </div>
    </section>
    ${Footer()}
  `;
}
