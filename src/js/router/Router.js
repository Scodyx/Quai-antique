import {
  AUTH_CHANGED_EVENT,
  hasRole,
  isAuthenticated,
  RETURN_PATH_KEY,
  whenAuthReady,
} from '../auth/authService.js';

export class Router {
  constructor(routes, appSelector) {
    this.routes = routes;
    this.app = document.querySelector(appSelector);
    this.cleanupCurrentPage = null;
    this.renderVersion = 0;
  }

  async start() {
    if (!this.app) {
      throw new Error("L’élément racine de l’application est introuvable.");
    }

    this.bindNavigation();
    window.addEventListener('popstate', () => this.render());
    window.addEventListener(AUTH_CHANGED_EVENT, () => {
      if (!isAuthenticated()) this.render();
    });
    await this.render();
  }

  bindNavigation() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-link]');

      if (!link) {
        return;
      }

      const url = new URL(link.href, window.location.origin);

      if (url.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      this.navigate(url.pathname);
    });
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.render();
  }

  findRoute(pathname) {
    return (
      this.routes.find((route) => route.matches(pathname))
      ?? this.routes.find((route) => route.path === '*')
    );
  }

  async render() {
    const renderVersion = ++this.renderVersion;
    const route = this.findRoute(window.location.pathname);

    if (!route) {
      throw new Error('Aucune route de secours n’est définie.');
    }

    if (route.meta.auth || route.meta.role) {
      this.app.innerHTML = '<main class="container py-5"><p role="status">Chargement…</p></main>';
      await whenAuthReady();
      if (renderVersion !== this.renderVersion) return;
      if (!isAuthenticated()) {
        sessionStorage.setItem(RETURN_PATH_KEY, window.location.pathname);
        this.navigate('/connexion');
        return;
      }
      if (route.meta.role && !hasRole(route.meta.role)) {
        this.app.innerHTML = '<main class="container py-5"><h1>Accès interdit</h1><p>Vous n’avez pas l’autorisation d’effectuer cette action.</p><a href="/" data-link>Retour à l’accueil</a></main>';
        return;
      }
    }

    if (this.cleanupCurrentPage) {
      this.cleanupCurrentPage();
      this.cleanupCurrentPage = null;
    }

    const params = route.params(window.location.pathname);
    this.app.innerHTML = route.page(params);

    if (typeof route.onMount === 'function') {
      const cleanup = route.onMount(params);

      if (typeof cleanup === 'function') {
        this.cleanupCurrentPage = cleanup;
      }
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
