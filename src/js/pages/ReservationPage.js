import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';

export function ReservationPage() {
  return `
    ${Header()}
    <section class="temporary-page" aria-labelledby="reservation-page-title">
      <div class="container site-container text-center">
        <h1 id="reservation-page-title">Réservation</h1>
        <p>Cette page sera développée prochainement.</p>
      </div>
    </section>
    ${Footer()}
  `;
}
