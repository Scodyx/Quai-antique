export class Router {
  constructor(routes, appSelector) {
    this.routes = routes;
    this.app = document.querySelector(appSelector);
  }

  start() {
    if (!this.app) {
      throw new Error("L’élément racine de l’application est introuvable.");
    }

    this.bindNavigation();
    window.addEventListener('popstate', () => this.render());
    this.render();
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

  render() {
    const route = this.findRoute(window.location.pathname);

    if (!route) {
      throw new Error('Aucune route de secours n’est définie.');
    }

    this.app.innerHTML = route.page();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
