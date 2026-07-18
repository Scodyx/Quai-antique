# Plan des wireframes

## Objectif du document

Ce document prépare les wireframes du projet Quai Antique. Il définit douze planches principales et les règles de réutilisation permettant de limiter le nombre d’écrans à dessiner.

Les wireframes resteront fonctionnels et sans choix graphique définitif. Les couleurs, les typographies et les détails visuels seront traités pendant les phases de maquettes et de design system.

## Principes communs

### Navigation publique

- Sur ordinateur, le logo est placé à gauche et les liens de navigation à droite.
- Sur mobile, les liens sont accessibles depuis un menu burger.
- Les actions principales, notamment « Réserver », restent faciles à repérer.

### Responsive

Une version mobile et une version ordinateur seront créées pour les huit planches publiques et clientes :

- Accueil ;
- Galerie ;
- Carte et menus ;
- Réservation ;
- Connexion ;
- Inscription ;
- Mon compte ;
- Mes réservations.

Les quatre planches administratives auront une version ordinateur. Le Tableau de bord administrateur et la Gestion administrative des réservations auront également une version mobile représentative. Les Paramètres du restaurant et le Gabarit CRUD administrateur réutiliseront les mêmes principes responsive.

### États secondaires

Les confirmations, suppressions, succès, erreurs, chargements, listes vides et indisponibilités seront représentés par des annotations ou de petites variantes. Ils ne feront pas l’objet de pages complètes.

## 1. Accueil

### Objectif

Présenter le restaurant, mettre en valeur son univers et orienter rapidement vers la carte, la galerie et la réservation.

### Principaux blocs visibles

- en-tête avec logo et navigation ;
- zone de présentation principale ;
- courte présentation du restaurant ;
- sélection de plats ou aperçu de la carte ;
- aperçu de la galerie ;
- horaires du restaurant ;
- appel à réserver ;
- pied de page.

### Actions disponibles

- consulter la galerie ;
- consulter la carte et les menus ;
- réserver une table ;
- se connecter ou accéder à son compte.

### Liens de navigation

- vers Galerie ;
- vers Carte et menus ;
- vers Réservation ;
- vers Connexion ou Mon compte selon l’état d’authentification.

### Version mobile

- menu burger ;
- blocs empilés sur une colonne ;
- appels à l’action suffisamment larges ;
- contenus secondaires raccourcis si nécessaire.

### Version ordinateur

- logo à gauche et liens à droite ;
- alternance possible de blocs texte et image ;
- aperçus de contenus disposés sur plusieurs colonnes.

### États secondaires à annoter

- navigation d’un utilisateur connecté ;
- absence temporaire d’images mises en avant ;
- erreur de chargement d’un contenu dynamique.

## 2. Galerie

### Objectif

Présenter les plats et l’univers du restaurant dans une galerie facile à parcourir.

### Principaux blocs visibles

- en-tête et navigation ;
- titre et courte introduction ;
- grille responsive d’images ;
- titre associé à chaque image ;
- éventuelle fenêtre modale d’agrandissement ;
- pied de page.

### Actions disponibles

- parcourir la galerie ;
- agrandir éventuellement une image ;
- fermer l’agrandissement ;
- accéder à la réservation.

### Liens de navigation

- retour vers Accueil ;
- vers Carte et menus ;
- vers Réservation.

### Version mobile

- grille sur une ou deux colonnes selon la largeur ;
- titre toujours visible sous chaque image ;
- fenêtre d’agrandissement adaptée à la hauteur disponible.

### Version ordinateur

- grille sur plusieurs colonnes ;
- titre affiché au survol de l’image ;
- agrandissement éventuel dans une fenêtre modale.

### États secondaires à annoter

- galerie vide ;
- image indisponible ;
- ouverture et fermeture de la fenêtre modale.

## 3. Carte et menus

### Objectif

Présenter clairement les plats et les menus proposés par le restaurant sur une seule page.

### Principaux blocs visibles

- en-tête et navigation ;
- titre de page ;
- section Carte avec catégories, plats, descriptions et prix ;
- section Menus avec intitulés, compositions et prix ;
- appel à réserver ;
- pied de page.

Les sections Carte et Menus se suivent verticalement. Aucun système d’onglets n’est utilisé.

### Actions disponibles

- parcourir les catégories et les plats ;
- consulter les menus ;
- réserver une table.

### Liens de navigation

- retour vers Accueil ;
- vers Galerie ;
- vers Réservation.

### Version mobile

- sections et éléments empilés ;
- prix toujours associés visuellement au bon plat ou menu ;
- textes lisibles sans défilement horizontal.

### Version ordinateur

- largeur de lecture limitée ;
- catégories clairement séparées ;
- présentation possible en plusieurs colonnes lorsque le contenu le permet.

### États secondaires à annoter

- catégorie sans plat ;
- absence temporaire de menu ;
- erreur de chargement.

## 4. Réservation

### Objectif

Permettre à un visiteur ou à un client de rechercher un créneau et de réserver une table dans le respect des disponibilités et de la capacité maximale.

### Principaux blocs visibles

- en-tête et navigation ;
- formulaire avec nombre de couverts, date et allergies éventuelles ;
- grille de boutons représentant les créneaux par tranches de quinze minutes ;
- indication claire de la disponibilité des créneaux ;
- récapitulatif ;
- action de confirmation.

Pour un client connecté, le nombre de convives par défaut et les allergies renseignées dans son profil sont proposés automatiquement.

### Actions disponibles

- choisir le nombre de couverts ;
- choisir une date ;
- sélectionner un créneau disponible ;
- renseigner ou modifier les allergies ;
- confirmer la réservation ;
- se connecter ou créer un compte lorsque cela est nécessaire.

### Liens de navigation

- retour vers Accueil ;
- vers Connexion ou Inscription si le visiteur tente de confirmer ;
- vers Mes réservations après confirmation par un client.

### Version mobile

- formulaire sur une colonne ;
- grille de créneaux adaptée à la largeur ;
- récapitulatif placé avant le bouton de confirmation ;
- boutons faciles à sélectionner au toucher.

### Version ordinateur

- formulaire et récapitulatif éventuellement répartis en deux zones ;
- grille de créneaux plus large ;
- disponibilité identifiable sans dépendre uniquement de la couleur.

### États secondaires à annoter

- données préremplies pour le client connecté ;
- créneau disponible, sélectionné ou indisponible ;
- chargement des disponibilités sans rechargement de la page ;
- refus lorsque la capacité maximale serait dépassée ;
- visiteur invité à se connecter ou à créer un compte ;
- conservation temporaire des données saisies ;
- reprise du parcours après authentification ;
- confirmation réussie ou erreur.

### Réutilisation

La modification d’une réservation client réutilise ce gabarit avec les données existantes préremplies, un titre adapté et des actions « Enregistrer les modifications » et « Annuler ».

## 5. Connexion

### Objectif

Permettre au client et à l’administrateur de s’authentifier depuis le même formulaire.

### Principaux blocs visibles

- en-tête simplifié ;
- titre ;
- champ d’adresse e-mail ;
- champ de mot de passe ;
- bouton de connexion ;
- lien vers l’inscription pour le visiteur ;
- zone de message.

### Actions disponibles

- saisir les identifiants ;
- se connecter ;
- accéder à l’inscription.

### Liens de navigation

- retour vers Accueil ;
- vers Inscription ;
- vers Mon compte après connexion d’un client ;
- vers Tableau de bord administrateur après connexion d’un administrateur ;
- reprise de la Réservation si l’authentification a interrompu ce parcours.

### Version mobile

- formulaire sur toute la largeur utile ;
- champs et bouton empilés ;
- messages placés près des champs concernés.

### Version ordinateur

- formulaire centré dans un bloc de largeur limitée ;
- hiérarchie claire entre connexion et inscription.

### États secondaires à annoter

- identifiants invalides ;
- champs obligatoires manquants ;
- chargement de la connexion ;
- connexion réussie ;
- reprise d’une réservation conservée temporairement.

## 6. Inscription

### Objectif

Permettre au visiteur de créer un compte client.

### Principaux blocs visibles

- en-tête simplifié ;
- champs prénom, nom, adresse e-mail et mot de passe ;
- nombre de convives par défaut ;
- allergies éventuelles ;
- bouton de création du compte ;
- lien vers Connexion.

### Actions disponibles

- renseigner les informations ;
- créer le compte ;
- revenir à la connexion.

### Liens de navigation

- retour vers Accueil ;
- vers Connexion ;
- reprise de la Réservation après création du compte et authentification.

### Version mobile

- tous les champs empilés ;
- libellés toujours visibles ;
- bouton principal sur toute la largeur utile.

### Version ordinateur

- formulaire centré ;
- regroupement logique des informations sans multiplier les colonnes.

### États secondaires à annoter

- validation des champs ;
- adresse e-mail déjà utilisée ;
- création réussie ;
- erreur de création ;
- conservation des données d’une réservation commencée.

## 7. Mon compte

### Objectif

Permettre au client authentifié de consulter et de modifier ses informations personnelles.

### Principaux blocs visibles

- navigation du compte ;
- prénom, nom et adresse e-mail ;
- nombre de convives par défaut ;
- allergies renseignées dans le profil ;
- bouton d’enregistrement ;
- zone distincte pour supprimer le compte ;
- action de déconnexion.

### Actions disponibles

- modifier les informations ;
- enregistrer les modifications ;
- consulter ses réservations ;
- supprimer son compte ;
- se déconnecter.

### Liens de navigation

- vers Mes réservations ;
- vers Réservation ;
- vers Accueil après déconnexion.

### Version mobile

- navigation du compte compacte ;
- formulaire sur une colonne ;
- suppression du compte placée dans une zone clairement séparée.

### Version ordinateur

- navigation du compte visible ;
- formulaire de largeur limitée ;
- organisation possible en deux colonnes pour les champs courts.

### États secondaires à annoter

- modification réussie ;
- erreur de validation ou d’enregistrement ;
- fenêtre de confirmation de suppression du compte ;
- session expirée.

## 8. Mes réservations

### Objectif

Permettre au client de consulter et de gérer uniquement ses propres réservations.

### Principaux blocs visibles

- navigation du compte ;
- bouton de nouvelle réservation ;
- cartes de réservation avec date, heure, couverts et allergies ;
- actions de modification et de suppression.

### Actions disponibles

- créer une réservation ;
- modifier une réservation ;
- supprimer une réservation ;
- revenir au compte.

### Liens de navigation

- vers Réservation ;
- vers le gabarit Réservation en mode modification ;
- vers Mon compte.

### Version mobile

- une carte par ligne ;
- actions clairement accessibles dans chaque carte.

### Version ordinateur

- une ou deux colonnes de cartes selon l’espace disponible ;
- largeur homogène et informations facilement comparables.

### États secondaires à annoter

- aucune réservation ;
- chargement de la liste ;
- erreur de chargement ;
- confirmation avant suppression ;
- suppression réussie ou échouée.

## 9. Tableau de bord administrateur

### Objectif

Centraliser l’accès aux fonctions de gestion sans ajouter d’informations non prévues au cahier des charges.

### Principaux blocs visibles

- en-tête administratif ;
- menu administratif ;
- titre et identification de la section ;
- raccourcis vers les quatre domaines de gestion ;
- action de déconnexion.

### Actions disponibles

- accéder aux paramètres ;
- gérer la galerie, la carte ou les menus ;
- gérer les réservations ;
- se déconnecter.

### Liens de navigation

- vers Paramètres du restaurant ;
- vers les variantes du Gabarit CRUD administrateur ;
- vers Gestion administrative des réservations ;
- vers Connexion après déconnexion.

### Version mobile

- planche mobile représentative de l’administration ;
- menu replié ou panneau latéral ;
- raccourcis empilés sous forme de cartes ;
- aucune dépendance à un tableau horizontal.

### Version ordinateur

- menu latéral toujours visible ;
- zone principale organisée en cartes ou raccourcis ;
- contenu limité aux fonctions demandées.

### États secondaires à annoter

- menu mobile ouvert et fermé ;
- session expirée ;
- erreur de chargement d’une section.

## 10. Paramètres du restaurant

### Objectif

Permettre à l’administrateur de gérer les horaires et la capacité maximale du restaurant dans une seule interface.

### Principaux blocs visibles

- menu administratif ;
- section Horaires avec jours et services ;
- section Capacité maximale ;
- boutons d’enregistrement.

### Actions disponibles

- ajouter ou modifier un horaire ;
- supprimer un horaire lorsque nécessaire ;
- modifier la capacité maximale ;
- enregistrer les paramètres.

### Liens de navigation

- retour vers Tableau de bord administrateur ;
- vers les autres sections administratives depuis le menu latéral.

### Version mobile

- réutilisation du menu replié du tableau de bord ;
- jours et services présentés sous forme de cartes ou de blocs empilés ;
- formulaire sans tableau horizontal.

### Version ordinateur

- menu latéral ;
- horaires et capacité dans deux sections clairement séparées ;
- vue synthétique des horaires sans surcharge.

### États secondaires à annoter

- horaire invalide ;
- capacité invalide ;
- paramètres enregistrés ;
- erreur d’enregistrement ;
- confirmation avant suppression d’un horaire.

## 11. Gabarit CRUD administrateur

### Objectif

Fournir une structure commune pour gérer la galerie, les catégories et les plats, ainsi que les menus.

### Principaux blocs visibles

- menu administratif ;
- titre correspondant à la ressource ;
- action d’ajout ;
- liste des éléments ;
- actions de modification et de suppression ;
- fenêtre modale Bootstrap pour un formulaire simple.

### Actions disponibles

- créer un élément ;
- consulter la liste ;
- modifier un élément ;
- supprimer un élément.

### Liens de navigation

- retour vers Tableau de bord administrateur ;
- vers Galerie, Catégories et plats ou Menus depuis le menu ;
- vers les autres sections administratives.

### Version mobile

- réutilisation du menu replié ;
- liste présentée sous forme de cartes ;
- actions placées dans chaque carte ;
- formulaire simple dans une modale adaptée à l’écran ;
- aucun grand tableau avec défilement horizontal.

### Version ordinateur

- menu latéral ;
- liste structurée dans la zone principale ;
- bouton d’ajout visible ;
- formulaire simple dans une fenêtre modale Bootstrap.

### États secondaires à annoter

- liste vide ;
- formulaire d’ajout ;
- formulaire de modification ;
- erreurs de validation ;
- confirmation de suppression ;
- succès ou erreur après une opération.

### Variantes réutilisant le gabarit

#### Galerie

La liste devient une grille d’images avec leur titre et les actions associées.

#### Catégories et plats

Deux sections clairement séparées permettent de gérer les catégories et les plats liés, sans créer deux planches complètes.

#### Menus

Chaque élément présente son intitulé, sa composition et son prix.

## 12. Gestion administrative des réservations

### Objectif

Permettre à l’administrateur de consulter toutes les réservations, de les filtrer par jour, de les modifier et de les supprimer.

### Principaux blocs visibles

- menu administratif ;
- filtre par date ;
- liste des réservations ;
- informations principales de chaque réservation ;
- actions de modification et de suppression.

### Actions disponibles

- sélectionner un jour ;
- consulter les réservations correspondantes ;
- modifier une réservation ;
- supprimer une réservation.

### Liens de navigation

- retour vers Tableau de bord administrateur ;
- vers les autres sections administratives depuis le menu.

### Version mobile

- planche mobile représentative ;
- menu replié ou panneau latéral ;
- filtre placé au-dessus de la liste ;
- réservations présentées sous forme de cartes ;
- aucun tableau nécessitant un défilement horizontal.

### Version ordinateur

- menu latéral ;
- filtre visible au-dessus de la liste ;
- liste structurée permettant de comparer les réservations ;
- modification dans une fenêtre modale si le formulaire reste simple.

### États secondaires à annoter

- aucune réservation pour le jour sélectionné ;
- chargement et erreur de chargement ;
- formulaire de modification ;
- nouvelles disponibilités après modification ;
- refus en cas de dépassement de la capacité maximale ;
- confirmation de suppression ;
- succès ou erreur après une opération.

## Variantes complémentaires

### Page 404

La page 404 est une petite variante simple comportant un message d’erreur, une explication courte et un lien de retour vers l’accueil. Elle ne compte pas parmi les douze planches principales.

### Fenêtres et messages

Les fenêtres de confirmation ou de suppression et les messages de succès ou d’erreur sont ajoutés sous forme d’annotations ou de variantes sur les planches concernées. Ils ne sont pas dessinés comme des pages autonomes.

## Récapitulatif des planches à produire

| N° | Planche | Mobile | Ordinateur | Réutilisation principale |
|---:|---|:---:|:---:|---|
| 1 | Accueil | Oui | Oui | Gabarit public |
| 2 | Galerie | Oui | Oui | Grille responsive |
| 3 | Carte et menus | Oui | Oui | Deux sections successives |
| 4 | Réservation | Oui | Oui | Modification d’une réservation client |
| 5 | Connexion | Oui | Oui | Formulaire commun client et administrateur |
| 6 | Inscription | Oui | Oui | Formulaire de compte client |
| 7 | Mon compte | Oui | Oui | Profil et suppression du compte |
| 8 | Mes réservations | Oui | Oui | Cartes de réservation |
| 9 | Tableau de bord administrateur | Oui, représentative | Oui | Navigation administrative responsive |
| 10 | Paramètres du restaurant | Principes réutilisés | Oui | Horaires et capacité |
| 11 | Gabarit CRUD administrateur | Principes réutilisés | Oui | Galerie, catégories et plats, menus |
| 12 | Gestion administrative des réservations | Oui, représentative | Oui | Liste administrative en cartes sur mobile |

La production prévue conserve douze types de planches principales. Leurs versions responsive représentent huit versions mobiles publiques ou clientes, huit versions ordinateur correspondantes, quatre versions ordinateur administratives et deux versions mobiles administratives représentatives, soit vingt-deux déclinaisons au total. Les variantes et annotations ne sont pas comptées comme des planches complètes.

## Ressources Figma

- Fichier Figma en ligne :
  <https://www.figma.com/design/hMczMvggW1B7HLG5cEpOso/Quai-Antique-%E2%80%94-Wireframes?node-id=1-2588&t=2P0tthzFkwmA6xvh-1>
- Sauvegarde locale :
  `docs/wireframes/Source/quai-antique-wireframes.fig`
- Pages présentes dans Figma :
  - 01 - Public
  - 02 - Client
  - 03 - Administration
  - 04 - Variantes

Les wireframes comprennent des versions Desktop et Mobile ainsi que les principales interactions de navigation.
