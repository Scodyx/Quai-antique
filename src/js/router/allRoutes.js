import { GalleryPage } from '../pages/GalleryPage.js';
import { HomePage } from '../pages/HomePage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { MenuPage } from '../pages/MenuPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
import { ReservationPage } from '../pages/ReservationPage.js';
import { Route } from './Route.js';

export const allRoutes = [
  new Route('/', HomePage),
  new Route('/galerie', GalleryPage),
  new Route('/carte-et-menus', MenuPage),
  new Route('/reservation', ReservationPage),
  new Route('/connexion', LoginPage),
  new Route('*', NotFoundPage),
];
