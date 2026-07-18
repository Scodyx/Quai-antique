export class Route {
  constructor(path, page) {
    this.path = path;
    this.page = page;
  }

  matches(pathname) {
    return this.path === pathname;
  }
}
