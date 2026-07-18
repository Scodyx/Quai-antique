import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';

export function LoginPage() {
  return `
    ${Header()}
    <section class="temporary-page" aria-labelledby="login-page-title">
      <div class="container site-container text-center">
        <h1 id="login-page-title">Connexion</h1>
        <p>Cette page sera développée prochainement.</p>
      </div>
    </section>
    ${Footer()}
  `;
}
