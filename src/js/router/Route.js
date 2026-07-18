export class Route {
  constructor(path, page, onMount = null) {
    this.path = path;
    this.page = page;
    this.onMount = onMount;
  }

  matches(pathname) {
    return this.path === pathname;
  }
}
