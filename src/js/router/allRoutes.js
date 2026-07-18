import { HomePage } from '../pages/HomePage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
import { Route } from './Route.js';

export const allRoutes = [
  new Route('/', HomePage),
  new Route('*', NotFoundPage),
];
