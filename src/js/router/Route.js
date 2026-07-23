export class Route {
  constructor(path, page, onMount = null, meta = {}) {
    this.path = path;
    this.page = page;
    this.onMount = onMount;
    this.meta = meta;
    this.paramNames = [];
    const pattern = path.replace(/:([A-Za-z]+)/g, (_, name) => {
      this.paramNames.push(name);
      return '(\\d+)';
    });
    this.pattern = path === '*' ? null : new RegExp(`^${pattern}$`);
  }

  matches(pathname) {
    return this.path === '*' || this.pattern.test(pathname);
  }

  params(pathname) {
    const match = this.pattern?.exec(pathname);
    return match ? Object.fromEntries(this.paramNames.map((name, index) => [name, match[index + 1]])) : {};
  }
}
