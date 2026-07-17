# Liste des pages

## Pages publiques

| Page | Rôle | Contenu principal | Accès |
|---|---|---|---|
| Accueil | Présenter le restaurant et orienter le visiteur | Présentation, mise en avant de la cuisine, horaires, appels à consulter les menus et à réserver | Tous |
| Galerie | Valoriser les plats et l’univers du restaurant | Images classées ou mises en avant | Tous |
| Carte et menus | Présenter l’offre culinaire | Catégories, plats, descriptions, prix et menus | Tous |
| Réservation | Recueillir les informations nécessaires et afficher les disponibilités | Nombre de couverts, date, créneaux de quinze minutes, allergies et récapitulatif ; pour un client connecté, préremplissage du nombre de convives et des allergies depuis son profil | Tous pour commencer ; utilisateur connecté pour confirmer |
| Inscription | Créer un compte client | Prénom, nom, adresse e-mail, mot de passe, nombre de convives par défaut et allergies éventuelles | Visiteur non connecté ; le compte administrateur est créé directement dans la base de données |
| Connexion | Ouvrir une session client ou administrateur depuis un formulaire commun | Adresse e-mail, mot de passe sécurisé, validation et accès adapté au rôle | Client ou administrateur non connecté |

## Pages réservées aux clients

| Page | Rôle | Contenu principal | Accès |
|---|---|---|---|
| Tableau de bord client | Donner une vue d’ensemble de l’espace personnel | Raccourcis vers le profil et les réservations | Client connecté |
| Profil | Consulter et modifier les informations personnelles | Coordonnées, nombre de convives par défaut, allergies renseignées dans le profil client et actions de mise à jour | Client connecté |
| Mes réservations | Gérer les réservations du client | Liste, détails, modification et suppression | Client connecté |
| Modification d’une réservation | Mettre à jour une réservation existante | Couverts, date, créneau, allergies et nouvelles disponibilités | Client connecté, propriétaire de la réservation |
| Suppression du compte | Confirmer une action définitive sur le compte | Avertissement et confirmation de suppression | Client connecté |

## Pages ou sections administrateur

L’administration pourra être organisée en pages distinctes ou en sections d’un tableau de bord selon les futurs wireframes.

| Page ou section | Rôle | Contenu principal | Accès |
|---|---|---|---|
| Tableau de bord administrateur | Centraliser l’accès aux fonctions de gestion | Synthèse et navigation administrative | Administrateur |
| Horaires | Gérer les heures d’ouverture | Jours, services, heures d’ouverture et de fermeture | Administrateur |
| Capacité | Définir la limite d’accueil | Capacité maximale du restaurant | Administrateur |
| Galerie | Administrer les images visibles publiquement | Liste, ajout, modification et suppression d’images | Administrateur |
| Catégories de plats | Structurer la carte | Liste et opérations CRUD sur les catégories | Administrateur |
| Plats | Administrer les plats | Nom, description, prix, catégorie et opérations CRUD | Administrateur |
| Menus | Administrer les formules | Intitulé, contenu, prix et opérations CRUD | Administrateur |
| Réservations | Superviser toutes les réservations | Liste complète, filtre par jour, détails, modification et suppression | Administrateur |
