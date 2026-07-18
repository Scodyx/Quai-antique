import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';

export function SignupPage() {
  return `
    ${Header()}
    <section class="temporary-page" aria-labelledby="signup-page-title">
      <div class="container site-container text-center">
        <h1 id="signup-page-title">Créer un compte</h1>
        <p>Cette page sera développée prochainement.</p>
      </div>
    </section>
    ${Footer()}
  `;
}
