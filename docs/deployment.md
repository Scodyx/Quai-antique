# Déploiement De Quai Antique

Ce document décrit une procédure générique, indépendante d'un hébergeur.
Aucun déploiement n'est automatisé par le dépôt.

## Architecture Recommandée

- front Vite compilé et servi comme site statique;
- API Symfony exécutée dans un environnement PHP;
- base MariaDB ou MySQL;
- HTTPS obligatoire pour le front et l'API;
- domaines front et API éventuellement distincts.

## Backend Symfony

Configurer dans l'environnement de l'hébergeur, sans commiter les valeurs :

```dotenv
APP_ENV=prod
APP_DEBUG=0
APP_SECRET=VALEUR_A_GENERER
DATABASE_URL=VALEUR_FOURNIE_PAR_HEBERGEUR
CORS_ALLOW_ORIGIN=REGEX_DU_DOMAINE_FRONT
```

Commandes générales :

```sh
composer install --no-dev --optimize-autoloader
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration
php bin/console cache:clear --env=prod
php bin/console cache:warmup --env=prod
```

Le document root doit être `backend/public` et le front controller
`backend/public/index.php`. `APP_DEBUG` doit rester à `0`. Les variables sont
configurées dans l'hébergeur et jamais enregistrées dans Git.

Ne jamais exécuter les fixtures en production.

## Front Vite

Définir la variable avant la compilation :

```dotenv
VITE_API_URL=https://api.exemple.fr
```

Puis :

```sh
npm ci
npm run build
```

Seul le contenu de `dist/` doit être servi. Le serveur statique doit renvoyer
les routes SPA inconnues vers `index.html`.

`VITE_API_URL` est intégré au JavaScript pendant le build. Tout changement
d'URL nécessite donc un nouveau build. L'API doit autoriser exactement le
domaine final du front avec `CORS_ALLOW_ORIGIN`.

## Ordre Conseillé

1. Créer la base de production.
2. Déployer le backend.
3. Configurer ses variables d'environnement.
4. Exécuter les migrations.
5. Vérifier `/api/doc.json` ou une route publique disponible.
6. Récupérer l'URL publique du backend.
7. Définir `VITE_API_URL`.
8. Compiler le front.
9. Déployer le contenu de `dist/`.
10. Configurer `CORS_ALLOW_ORIGIN` avec le domaine final.
11. Tester inscription, connexion et réservation.
12. Créer l'administrateur avec `php bin/console app:create-admin`.

## Vérifications Après Déploiement

- certificats HTTPS valides;
- `APP_DEBUG=0`;
- migrations à jour;
- aucun fichier local `.env.local` exposé;
- aucune fixture de démonstration;
- CORS limité au domaine du front;
- pages SPA rechargeables directement;
- inscription, connexion, compte et réservation fonctionnels.
