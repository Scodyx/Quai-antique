# Quai Antique

## Présentation

Quai Antique est une application web pour un restaurant gastronomique savoyard
situé à Chambéry. Elle a été réalisée dans le cadre du projet fil rouge Studi.
Le projet sépare un front-end monopage (SPA) et une API REST Symfony.

## Fonctionnalités

### Visiteur

- consulter le restaurant, ses horaires, la galerie, la carte et les menus;
- créer un compte et se connecter.

### Client

- consulter et modifier son profil;
- modifier son mot de passe ou supprimer son compte;
- consulter les disponibilités;
- créer, modifier et annuler ses réservations;
- consulter uniquement ses propres réservations.

### Administrateur

- consulter toutes les réservations et les filtrer par date;
- modifier ou supprimer une réservation;
- modifier les informations du restaurant;
- gérer les catégories, plats, menus et métadonnées de galerie.

## Technologies

Front-end :

- HTML, Sass/CSS et Bootstrap 5;
- JavaScript Vanilla;
- Vite.

Backend :

- PHP 8.2 et Symfony 5.4;
- Doctrine ORM et MariaDB/MySQL;
- Symfony Security et API REST;
- NelmioApiDocBundle et NelmioCorsBundle;
- PHPUnit, DoctrineFixturesBundle et FakerPHP.

## Architecture

- `src/` : JavaScript, pages, composants, routeur, services API et styles du front;
- `public/` : fichiers statiques du front, notamment la galerie;
- `backend/src/` : contrôleurs, entités, repositories, sécurité et services Symfony;
- `backend/config/` : configuration Symfony, Doctrine, sécurité, CORS et routes;
- `backend/migrations/` : migrations Doctrine;
- `backend/tests/` : tests unitaires et fonctionnels;
- `backend/docs/` : documentation des fixtures et des tests;
- `docs/` : conception, API front, déploiement et validation finale.

## Prérequis

- PHP 8.2;
- Composer;
- MariaDB ou MySQL;
- Node.js;
- npm.

## Installation Locale Du Backend

Depuis `backend` :

```powershell
composer install
```

Créer `backend/.env.local` avec une URL de base locale adaptée :

```dotenv
DATABASE_URL="mysql://user:password@127.0.0.1:3306/quai_antique?serverVersion=mariadb-10.4.32&charset=utf8mb4"
```

Initialiser la base de développement :

```powershell
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console doctrine:fixtures:load --no-interaction
```

Les fixtures remplacent les données existantes. Ne les exécuter que sur une
base locale prévue à cet effet.

Démarrer Symfony avec le serveur PHP intégré :

```powershell
php -S 127.0.0.1:8000 -t public public/index.php
```

## Installation Locale Du Front

Depuis la racine :

```powershell
npm install
```

Créer `.env.local` :

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Puis démarrer Vite :

```powershell
npm run dev
```

Le front est alors disponible par défaut sur `http://localhost:5173`.

## Tests Backend

Créer une base isolée `quai_antique_test` et définir sa connexion dans
`backend/.env.test.local`, puis depuis `backend` :

```powershell
php bin/phpunit
```

La procédure détaillée se trouve dans `backend/docs/testing.md`.

## Build Front

```powershell
npm run build
```

Vite génère le site statique dans `dist/`.

## Documentation API

Avec le backend démarré :

- interface : `http://127.0.0.1:8000/api/doc`;
- document JSON : `http://127.0.0.1:8000/api/doc.json`.

## Comptes De Démonstration

Uniquement en développement et en test :

- administrateur : `admin@quai-antique.test` / `AdminQa2026!`;
- client : `client@quai-antique.test` / `ClientQa2026!`.

Ces mots de passe ne doivent jamais être utilisés en production. Les fixtures
ne doivent jamais être chargées sur une base de production.

## Sécurité

- mots de passe hashés par Symfony;
- authentification stateless avec `X-AUTH-TOKEN`;
- rôles et autorisations vérifiés par Symfony;
- contrôle du propriétaire des réservations;
- validation de toutes les données côté backend;
- origines CORS configurables;
- fichiers locaux et secrets exclus de Git.

Le token est conservé dans `localStorage` dans le cadre de ce projet
pédagogique. Une application exposée à davantage de risques devrait réévaluer
ce choix, notamment face aux attaques XSS.

## Limites Connues

- la galerie utilise des fichiers déjà présents dans `public/images/gallery`;
- l’administration gère leurs métadonnées mais ne téléverse aucun fichier;
- le stockage du token dans `localStorage` est un compromis pédagogique.

Le déploiement générique est documenté dans `docs/deployment.md`.
