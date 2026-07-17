# Brief du projet Quai Antique

## Contexte du restaurant

Quai Antique est un restaurant situé à Chambéry. Le projet consiste à concevoir son application web front-end afin de présenter son univers, ses plats et ses menus, puis de faciliter les réservations et la gestion quotidienne du restaurant.

## Objectifs de l’application

- Présenter clairement le restaurant et son offre.
- Valoriser les réalisations culinaires grâce à une galerie.
- Permettre aux visiteurs de consulter la carte et les menus.
- Proposer un parcours de réservation fluide et sans rechargement de page.
- Offrir aux clients un espace de gestion de leur compte et de leurs réservations.
- Fournir à l’administrateur les outils nécessaires à la gestion des contenus, des paramètres et des réservations.
- Préparer la future communication avec une API Symfony.

## Périmètre fonctionnel

L’application comprendra :

- une partie publique avec l’accueil, la galerie, la carte, les menus et le début du parcours de réservation ;
- l’inscription, la connexion et la déconnexion ;
- un espace client consacré aux informations personnelles et aux réservations ;
- un espace administrateur pour gérer les horaires, la capacité, la galerie, les catégories, les plats, les menus et les réservations ;
- des interactions dynamiques en JavaScript ;
- une future consommation des données fournies par une API Symfony.

## Contraintes techniques

- Utiliser HTML, CSS, Sass, Bootstrap et JavaScript Vanilla.
- Mettre en place un routage JavaScript personnalisé.
- Utiliser `fetch` lors de la future connexion à l’API Symfony.
- Suivre les versions avec Git.
- Concevoir une interface responsive et accessible.
- Ne pas utiliser Angular, React, Vue ni un autre framework JavaScript.

## Règles métier importantes

- Une réservation contient un nombre de couverts, une date, une heure et d’éventuelles allergies.
- Les horaires disponibles sont proposés par intervalles de quinze minutes.
- Les disponibilités sont vérifiées sans rechargement de la page.
- La réservation est refusée si son ajout fait dépasser la capacité maximale du restaurant.
- Un visiteur peut commencer une réservation, mais doit être connecté pour la confirmer.
- Lors de son inscription, le client renseigne son prénom, son nom, son adresse e-mail, son mot de passe, un nombre de convives par défaut et ses allergies éventuelles.
- Le nombre de convives par défaut et les allergies font partie des réglages du compte client et peuvent être modifiés depuis son espace personnel.
- Lorsque le client est connecté, le nombre de convives par défaut et les allergies renseignées dans son profil préremplissent le formulaire de réservation.
- Le client et l’administrateur utilisent le même formulaire de connexion avec une adresse e-mail et un mot de passe sécurisé.
- Le compte administrateur est le seul compte créé directement dans la base de données.
- Le client peut consulter, modifier et supprimer ses réservations.
- L’administrateur peut consulter toutes les réservations, les filtrer par jour, les modifier et les supprimer.

## Types d’utilisateurs

### Visiteur non connecté

Il consulte les contenus publics, commence une réservation, crée un compte ou se connecte. Il ne peut pas confirmer une réservation sans authentification.

### Client connecté

Il gère ses informations personnelles, notamment son nombre de convives par défaut et ses allergies éventuelles, son compte et l’ensemble du cycle de vie de ses propres réservations. Les réglages concernés sont proposés automatiquement dans le formulaire de réservation lorsqu’il est connecté.

### Administrateur

Son compte est créé directement dans la base de données. Il utilise le même formulaire de connexion que le client, avec une adresse e-mail et un mot de passe sécurisé. Il configure le fonctionnement du restaurant, administre les contenus présentés au public et gère toutes les réservations.
