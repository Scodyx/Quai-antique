import { GalleryPage } from '../pages/GalleryPage.js';
import { AccountPage, initAccountPage } from '../pages/AccountPage.js';
import { initAdminLayout } from '../components/admin/AdminLayout.js';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';
import { AdminHoursCapacityPage, initAdminHoursCapacityPage } from '../pages/AdminHoursCapacityPage.js';
import { AdminReservationsPage, initAdminReservationsPage } from '../pages/AdminReservationsPage.js';
import { createAdminPlaceholderPage } from '../pages/AdminPlaceholderPage.js';
import { HomePage } from '../pages/HomePage.js';
import { initLoginPage, LoginPage } from '../pages/LoginPage.js';
import { MenuPage } from '../pages/MenuPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
import { initReservationPage, ReservationPage } from '../pages/ReservationPage.js';
import { initSignupPage, SignupPage } from '../pages/SignupPage.js';
import { Route } from './Route.js';

export const allRoutes = [
  new Route('/', HomePage),
  new Route('/galerie', GalleryPage),
  new Route('/carte-et-menus', MenuPage),
  new Route('/reservation', ReservationPage, initReservationPage),
  new Route('/connexion', LoginPage, initLoginPage),
  new Route('/inscription', SignupPage, initSignupPage),
  new Route('/mon-compte', AccountPage, initAccountPage),
  new Route('/administration', AdminDashboardPage, initAdminLayout),
  new Route('/administration/reservations', AdminReservationsPage, initAdminReservationsPage),
  new Route('/administration/horaires-capacite', AdminHoursCapacityPage, initAdminHoursCapacityPage),
  new Route('/administration/galerie', createAdminPlaceholderPage('Gestion de la galerie'), initAdminLayout),
  new Route('/administration/carte-et-menus', createAdminPlaceholderPage('Gestion de la carte et des menus'), initAdminLayout),
  new Route('*', NotFoundPage),
];
