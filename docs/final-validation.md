# Validation finale

Date de l'audit : 23 juillet 2026

## Perimetre

Cet audit couvre l'etat du depot Git, le backend Symfony, le frontend Vite,
les donnees de demonstration et la preparation d'un futur deploiement.
Aucun deploiement, aucune migration, aucune fixture et aucune modification de
donnee n'ont ete executes.

## Environnement controle

- PHP 8.2.12
- Composer 2.10.2
- Node.js 24.18.0
- npm 11.16.0
- Symfony 5.4
- MariaDB 10.4

## Backend

- `composer.json` valide avec `composer validate --no-check-publish`.
- Installation courante simulable sans changement avec
  `composer install --dry-run`.
- Installation de production simulable avec
  `composer install --no-dev --optimize-autoloader --dry-run`.
- Conteneur Symfony valide.
- 13 fichiers YAML valides.
- 7 entites Doctrine reconnues.
- Mapping et schema valides dans les environnements `dev` et `test`.
- 8 migrations executees sur 8, aucune migration en attente.
- 40 routes Symfony enregistrees, routes techniques comprises.
- Documentation OpenAPI accessible et composee de 37 operations.
- Suite PHPUnit reussie : 19 tests et 145 assertions.

## Frontend

- Dependances npm a jour.
- Build Vite local reussi.
- Build simule de production reussi avec
  `VITE_API_URL=https://api.exemple.fr`.
- URL de production presente dans les fichiers compiles.
- Aucun fichier source map genere.
- Le build local a ete restaure apres le controle de production.
- `dist/` reste ignore par Git.
- Les controles responsifs realises aux largeurs 390, 768 et 1440 pixels ne
  montrent pas de debordement horizontal.

## Parcours fonctionnels en lecture seule

- Pages publiques controlees : accueil, carte et menus, galerie, connexion et
  inscription.
- Connexion client valide, compte accessible avec 2 reservations.
- Formulaire de reservation accessible et 24 creneaux proposes.
- Deconnexion valide : jeton et utilisateur retires du stockage local.
- Connexion administrateur valide.
- Tableau de bord : 4 indicateurs.
- Administration : 8 reservations, 4 categories, 12 plats, 3 menus et
  8 images affiches.
- `GET /api/doc`, `GET /api/doc.json`, `GET /api/restaurant` et la disponibilite
  de reservation repondent avec HTTP 200.
- CORS accepte exactement l'origine locale `http://localhost:5173`.

## Donnees de demonstration

| Table | Lignes |
| --- | ---: |
| restaurant | 1 |
| user | 5 |
| category | 4 |
| food | 12 |
| menu | 3 |
| picture | 8 |
| booking | 8 |
| food_category | 12 |
| menu_category | 9 |

Le restaurant Quai Antique conserve une capacite de 45 couverts et les
horaires `12:00-14:00` et `19:00-22:30`.

## Preparation au deploiement

- Le fichier racine `.env.production.example` documente `VITE_API_URL`.
- `backend/.env.prod.example` documente les variables Symfony, Doctrine, CORS
  et JWT avec des valeurs fictives.
- `docs/deployment.md` decrit l'ordre de deploiement, les commandes backend,
  le build statique et la creation explicite du premier administrateur.
- Les fixtures et comptes de demonstration ne doivent jamais etre charges en
  production.
- Aucun secret de production n'a ete trouve dans les fichiers suivis.
- Aucun serveur ne reste actif apres l'audit ; les ports 8000, 5173 et 9222
  sont libres.

## Points de vigilance

- Symfony 5.4 est une base ancienne. Composer signale comme abandonnes
  `doctrine/annotations`, `doctrine/cache` et `symfony/security-guard`.
- Composer a signale un cache non inscriptible et l'indisponibilite reseau de
  Packagist pendant le dry-run ; le verrou local reste valide.
- npm signale le script d'installation de `@parcel/watcher` dans sa politique
  `allowScripts`, sans echec d'installation ni de build.
- Le bundle de production conserve l'URL locale comme valeur de repli dans le
  code compile ; `VITE_API_URL` reste prioritaire et a bien ete integree.
- Un dossier ignore nomme `backend/vendor (# Name clash 2026-07-23 9f2q6aC #)`
  provoque des avertissements de chemin trop long lors de certains parcours
  du disque. Il n'a pas ete modifie ni supprime pendant l'audit.
- Les messages USB et GCM emis par Chrome headless sont internes au navigateur
  et sans effet sur l'application.

## Conclusion

Le projet est coherent, testable localement et documente pour preparer un
deploiement futur. Les validations applicatives sont positives. Les points de
vigilance ci-dessus ne bloquent pas la livraison, mais la dette liee a Symfony
5.4 devra etre planifiee avant une exposition durable en production.
