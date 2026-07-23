import { GalleryPage, initGalleryPage } from '../pages/GalleryPage.js';
import { AccountPage, initAccountPage } from '../pages/AccountPage.js';
import { initAdminLayout } from '../components/admin/AdminLayout.js';
import { AdminDashboardPage, initAdminDashboardPage } from '../pages/AdminDashboardPage.js';
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
  new Route('/reservation', ReservationPage, initReservationPage, { auth: true }),
  new Route('/reservation/:id', ReservationPage, initReservationPage, { auth: true }),
  new Route('/connexion', LoginPage, initLoginPage),
  new Route('/inscription', SignupPage, initSignupPage),
  new Route('/mon-compte', AccountPage, initAccountPage, { auth: true }),
  new Route('/mes-reservations', AccountPage, initAccountPage, { auth: true }),
  new Route('/administration', AdminDashboardPage, initAdminDashboardPage, { role: 'ROLE_ADMIN' }),
  new Route('/administration/reservations', AdminReservationsPage, initAdminReservationsPage, { role: 'ROLE_ADMIN' }),
  new Route('/administration/horaires-capacite', AdminHoursCapacityPage, initAdminHoursCapacityPage, { role: 'ROLE_ADMIN' }),
  new Route('/administration/galerie', AdminGalleryPage, initAdminGalleryPage, { role: 'ROLE_ADMIN' }),
  new Route('/administration/carte-et-menus', AdminMenuManagementPage, initAdminMenuManagementPage, { role: 'ROLE_ADMIN' }),
  new Route('*', NotFoundPage),
];
