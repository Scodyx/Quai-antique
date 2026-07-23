import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/main.scss';

import { Router } from './router/Router.js';
import { allRoutes } from './router/allRoutes.js';
import { restoreSession } from './auth/authService.js';

const router = new Router(allRoutes, '#app');

router.start();
restoreSession();
