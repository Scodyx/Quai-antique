# Front-end et API Quai Antique

## Architecture

Le projet utilise Vite, JavaScript Vanilla, Bootstrap et Sass. Toutes les
requêtes passent par `src/js/api/apiClient.js`; les pages n'appellent jamais
directement `fetch()`.

Les services sont séparés par domaine :

- `publicApi.js` : restaurant, catégories, plats, menus et galerie en lecture;
- `accountApi.js` : profil, mot de passe et suppression du compte;
- `bookingApi.js` : disponibilités et CRUD des réservations;
- `adminApi.js` : mutations du restaurant, du catalogue et de la galerie.

## Configuration

`VITE_API_URL` contient l'adresse publique de Symfony. La valeur locale
documentée est `http://127.0.0.1:8000`. Le code possède le même fallback.
`.env.local` est ignoré par Git. Une variable Vite est publique et ne doit
jamais contenir de secret.

## Authentification et gardes

Symfony authentifie les requêtes avec `X-AUTH-TOKEN`. Le navigateur stocke :

- `quai_antique_api_token`;
- `quai_antique_user`.

Aucun mot de passe n'est stocké. Au démarrage, `/api/account/me` vérifie le
token. Une erreur 401 hors connexion nettoie la session et une page privée
revient vers `/connexion`. Une erreur 403 conserve la session et affiche un
refus d'accès.

Le routeur attend la restauration de session avant d'appliquer ses gardes :

- pages publiques : aucun rôle;
- compte, réservations : utilisateur authentifié;
- `/administration/*` : `ROLE_ADMIN`.

La destination demandée est mémorisée dans `sessionStorage` afin d'y revenir
après connexion.

## Compte et réservations

Mon compte permet de modifier le profil, le mot de passe et de supprimer le
compte. Un changement de mot de passe remplace immédiatement le token sans
enregistrer les mots de passe.

Le formulaire de réservation récupère le restaurant et le compte courants. Il
interroge `/api/booking/availability` après un court délai et annule la requête
précédente. Seuls les créneaux retournés par Symfony sont proposés. La liste
permet ensuite de modifier ou annuler ses réservations.

## Administration

Les routes administratives donnent accès :

- au tableau de bord et aux réservations filtrables par date;
- au restaurant unique et à ses horaires;
- au CRUD des catégories, plats et menus;
- au CRUD des métadonnées de galerie.

Les prix sont saisis en euros puis convertis en centimes avec
`eurosInputToCents()`. L'affichage utilise `formatPrice()`.

Le backend ne fournit aucun téléversement. Ajouter une image signifie
uniquement enregistrer son titre et son chemin. Le fichier doit déjà exister
dans `public/images/gallery`; supprimer la métadonnée ne supprime pas le
fichier.

## Erreurs

`ApiError` conserve le statut et le tableau `fields`. Les formulaires affichent
les erreurs 422 près des champs. Les messages métier 409 sont conservés. Les
pages traduisent 403 en refus d'autorisation et 404 en ressource introuvable.

Les données de l'API sont insérées avec `textContent`.

## Démarrage local

```powershell
cd backend
php -S 127.0.0.1:8000 -t public public/index.php
```

Dans un second terminal, depuis la racine :

```powershell
npm.cmd install
npm.cmd run dev
```

Comptes de démonstration :

- client : `client@quai-antique.test`;
- administrateur : `admin@quai-antique.test`.

Les mots de passe de démonstration sont réservés au développement. Ils ne
doivent jamais être réutilisés ou exposés en production.
