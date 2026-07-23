import { GalleryPage, initGalleryPage } from '../pages/GalleryPage.js';
import { AccountPage, initAccountPage } from '../pages/AccountPage.js';
import { initAdminLayout } from '../components/admin/AdminLayout.js';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';
import { AdminHoursCapacityPage, initAdminHoursCapacityPage } from '../pages/AdminHoursCapacityPage.js';
import { AdminGalleryPage, initAdminGalleryPage } from '../pages/AdminGalleryPage.js';
import { AdminMenuManagementPage, initAdminMenuManagementPage } from '../pages/AdminMenuManagementPage.js';
import { AdminReservationsPage, initAdminReservationsPage } from '../pages/AdminReservationsPage.js';
import { HomePage, initHomePage } from '../pages/HomePage.js';
import { initLoginPage, LoginPage } from '../pages/LoginPage.js';
import { initMenuPage, MenuPage } from '../pages/MenuPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
import { initReservationPage, ReservationPage } from '../pages/ReservationPage.js';
import { initSignupPage, SignupPage } from '../pages/SignupPage.js';
import { Route } from './Route.js';

export const allRoutes = [
  new Route('/', HomePage, initHomePage),
  new Route('/galerie', GalleryPage, initGalleryPage),
  new Route('/carte-et-menus', MenuPage, initMenuPage),
  new Route('/reservation', ReservationPage, initReservationPage),
  new Route('/connexion', LoginPage, initLoginPage),
  new Route('/inscription', SignupPage, initSignupPage),
  new Route('/mon-compte', AccountPage, initAccountPage),
  new Route('/administration', AdminDashboardPage, initAdminLayout),
  new Route('/administration/reservations', AdminReservationsPage, initAdminReservationsPage),
  new Route('/administration/horaires-capacite', AdminHoursCapacityPage, initAdminHoursCapacityPage),
  new Route('/administration/galerie', AdminGalleryPage, initAdminGalleryPage),
  new Route('/administration/carte-et-menus', AdminMenuManagementPage, initAdminMenuManagementPage),
  new Route('*', NotFoundPage),
];
