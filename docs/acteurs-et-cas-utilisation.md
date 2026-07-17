# Acteurs et cas d’utilisation

## Acteurs

### Visiteur non connecté

Le visiteur découvre le restaurant sans disposer d’une session authentifiée.

Cas d’utilisation :

- consulter l’accueil ;
- consulter la galerie ;
- consulter la carte et les menus ;
- commencer une réservation ;
- créer un compte ;
- se connecter.

### Client connecté

Le client est un utilisateur authentifié qui accède à ses informations et à ses propres réservations.

Cas d’utilisation :

- se connecter ;
- se déconnecter ;
- consulter et gérer ses informations personnelles, dont son nombre de convives par défaut et ses allergies éventuelles ;
- créer et confirmer une réservation ;
- consulter ses réservations ;
- modifier une réservation ;
- supprimer une réservation ;
- supprimer son compte.

### Administrateur

L’administrateur est un utilisateur authentifié disposant de droits de gestion étendus. Son compte est le seul à être créé directement dans la base de données. Il utilise le même formulaire de connexion que le client, avec une adresse e-mail et un mot de passe sécurisé.

Cas d’utilisation :

- se connecter ;
- se déconnecter ;
- gérer les horaires du restaurant ;
- gérer la capacité maximale ;
- gérer la galerie ;
- gérer les catégories de plats ;
- gérer les plats ;
- gérer les menus ;
- consulter toutes les réservations ;
- filtrer les réservations par jour ;
- modifier une réservation ;
- supprimer une réservation.

## Relations importantes entre les cas d’utilisation

- « Confirmer une réservation » nécessite « Être authentifié ».
- « Créer une réservation » inclut la saisie du nombre de couverts, de la date, de l’heure et des allergies éventuelles.
- Lorsqu’un client est connecté, son nombre de convives par défaut et les allergies renseignées dans son profil préremplissent le formulaire de réservation.
- « Gérer ses informations personnelles » inclut la modification du nombre de convives par défaut et des allergies éventuelles du client.
- « Se connecter » utilise le même formulaire pour le client et l’administrateur.
- « Créer une réservation » et « Modifier une réservation » incluent la vérification des disponibilités et de la capacité maximale.
- « Choisir une heure » dépend de la génération de créneaux par intervalles de quinze minutes.
- « Gérer la galerie », « Gérer les catégories », « Gérer les plats » et « Gérer les menus » regroupent les opérations de consultation, création, modification et suppression adaptées à chaque ressource.
- « Filtrer les réservations par jour » complète la consultation de toutes les réservations par l’administrateur.
- Les actions portant sur les données personnelles et les réservations d’un client sont limitées à ce client.

## Proposition pour le futur diagramme UML

Le futur diagramme de cas d’utilisation pourra être structuré ainsi :

1. Placer les trois acteurs à l’extérieur de la frontière du système : visiteur, client et administrateur.
2. Regrouper les cas publics dans un ensemble « Consulter le site ».
3. Regrouper l’inscription et l’authentification dans un ensemble « Accès au compte ».
4. Regrouper le parcours de réservation dans un ensemble « Réservations ».
5. Regrouper les informations personnelles dans un ensemble « Espace client ».
6. Regrouper les fonctions de gestion dans un ensemble « Administration ».
7. Représenter l’authentification obligatoire pour la confirmation d’une réservation.
8. Représenter la vérification des disponibilités et de la capacité comme une inclusion de la création et de la modification d’une réservation.

Le diagramme graphique sera réalisé lors de la phase dédiée.
