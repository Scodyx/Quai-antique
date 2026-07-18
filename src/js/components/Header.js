export function Header() {
  return `
    <header class="site-header">
      <nav class="navbar navbar-expand-lg" aria-label="Navigation principale">
        <div class="container site-container">
          <a class="navbar-brand site-header__brand" href="/" data-link>
            Quai Antique
          </a>

          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#main-navigation"
            aria-controls="main-navigation"
            aria-expanded="false"
            aria-label="Afficher ou masquer la navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="main-navigation">
            <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <li class="nav-item">
                <a class="nav-link active" href="/" data-link aria-current="page">Accueil</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Galerie</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Carte et menus</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Réservation</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Connexion</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  `;
}
