export function Footer() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="site-footer">
      <div class="container site-container site-footer__content">
        <div class="site-footer__identity">
          <p class="site-footer__name">Quai Antique</p>
          <p class="site-footer__caption">Restaurant</p>
          <address>12 rue des Saveurs<br>73000 Chambéry</address>
        </div>

        <div class="site-footer__hours">
          <h2 class="site-footer__title">Horaires</h2>
          <p>Mardi–vendredi : 12 h–14 h / 19 h–22 h 30</p>
          <p>Samedi : 12 h–15 h / 19 h–23 h</p>
          <p>Dimanche midi : 12 h–15 h</p>
        </div>

        <div class="site-footer__legal">
          <h2 class="site-footer__title">Informations</h2>
          <a href="#">Mentions légales</a>
          <a href="#">Politique de confidentialité</a>
        </div>
      </div>
      <p class="site-footer__copyright">
        &copy; ${currentYear} Quai Antique. Tous droits réservés.
      </p>
    </footer>
  `;
}
