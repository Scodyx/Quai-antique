import { GalleryPage } from '../pages/GalleryPage.js';
import { HomePage } from '../pages/HomePage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { MenuPage } from '../pages/MenuPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
import { initReservationPage, ReservationPage } from '../pages/ReservationPage.js';
import { SignupPage } from '../pages/SignupPage.js';
import { Route } from './Route.js';

export const allRoutes = [
  new Route('/', HomePage),
  new Route('/galerie', GalleryPage),
  new Route('/carte-et-menus', MenuPage),
  new Route('/reservation', ReservationPage, initReservationPage),
  new Route('/connexion', LoginPage),
  new Route('/inscription', SignupPage),
  new Route('*', NotFoundPage),
];
