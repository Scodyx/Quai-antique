import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';

export function HomePage() {
  return `
    ${Header()}
    <section class="home-hero">
      <div class="container site-container home-hero__content">
        <p class="home-hero__eyebrow">Restaurant gastronomique à Chambéry</p>
        <h1>Bienvenue au Quai Antique</h1>
        <p class="home-hero__intro">
          Le développement du site commence. Cette première page permet de
          vérifier le socle technique et la navigation.
        </p>
        <button class="btn btn-primary" type="button">Réserver une table</button>
      </div>
    </section>
    ${Footer()}
  `;
}
