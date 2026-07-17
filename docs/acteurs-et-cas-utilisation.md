# Acteurs et cas d’utilisation

## Acteurs

Le futur diagramme présente exactement trois acteurs :

### Visiteur

Le visiteur utilise l’application sans être authentifié. Il peut consulter les contenus publics, remplir le formulaire de réservation, consulter les disponibilités, créer un compte et se connecter.

### Client

Le client utilise le même formulaire de connexion que l’administrateur. Ses fonctionnalités privées nécessitent son authentification. Il peut gérer son profil et ses propres réservations.

### Administrateur

L’administrateur utilise le même formulaire de connexion que le client. Son compte est le seul à être créé directement dans la base de données. Une fois authentifié, il dispose des fonctionnalités de gestion du restaurant.

## Cas d’utilisation publics

Cas d’utilisation associés au Visiteur :

- consulter l’accueil ;
- consulter la galerie ;
- consulter la carte et les menus ;
- réserver une table ;
- créer un compte ;
- se connecter.

Une note pourra préciser que les contenus publics restent accessibles aux utilisateurs connectés, sans ajouter toutes les associations correspondantes si elles surchargent le diagramme.

## Cas d’utilisation du Client

Cas d’utilisation associés au Client :

- se connecter ;
- se déconnecter ;
- gérer son profil ;
- réserver une table ;
- consulter ses réservations ;
- modifier une réservation ;
- supprimer une réservation ;
- supprimer son compte.

« Gérer son profil » comprend notamment la consultation et la modification du nombre de convives par défaut et des allergies éventuelles.

## Cas d’utilisation de l’Administrateur

Cas d’utilisation associés à l’Administrateur :

- se connecter ;
- se déconnecter ;
- gérer les horaires ;
- gérer la capacité maximale ;
- gérer la galerie ;
- gérer les catégories de plats ;
- gérer les plats ;
- gérer les menus ;
- gérer les réservations ;
- filtrer les réservations par jour.

Les opérations de création, de consultation, de modification et de suppression restent regroupées dans les cas « Gérer... » afin de préserver la lisibilité du diagramme.

## Associations acteur–cas d’utilisation

| Acteur | Cas d’utilisation associés |
|---|---|
| Visiteur | Consulter l’accueil ; Consulter la galerie ; Consulter la carte et les menus ; Réserver une table ; Créer un compte ; Se connecter |
| Client | Se connecter ; Se déconnecter ; Gérer son profil ; Réserver une table ; Consulter ses réservations ; Modifier une réservation ; Supprimer une réservation ; Supprimer son compte |
| Administrateur | Se connecter ; Se déconnecter ; Gérer les horaires ; Gérer la capacité maximale ; Gérer la galerie ; Gérer les catégories de plats ; Gérer les plats ; Gérer les menus ; Gérer les réservations ; Filtrer les réservations par jour |

Les cas « Se connecter » et « Se déconnecter » sont communs au Client et à l’Administrateur. Aucune relation `<<extend>>` ne relie « Se connecter » ou « Créer un compte » à « Réserver une table ».

## Relations `<<include>>`

Les vérifications suivantes sont obligatoires :

- « Réserver une table » `<<include>>` « Vérifier les disponibilités » ;
- « Réserver une table » `<<include>>` « Vérifier la capacité maximale » ;
- « Modifier une réservation » `<<include>>` « Vérifier les disponibilités » ;
- « Modifier une réservation » `<<include>>` « Vérifier la capacité maximale ».

La flèche en pointillés part du cas principal vers le cas inclus, car la vérification fait obligatoirement partie du comportement du cas principal.

## Relations `<<extend>>`

Aucune relation `<<extend>>` n’est nécessaire dans cette version simplifiée du diagramme.

En particulier, « Se connecter » et « Créer un compte » ne sont pas des extensions de « Réserver une table » : ils restent des cas d’utilisation indépendants.

## Notes UML et règles métier

Les notes suivantes devront accompagner le cas « Réserver une table » et ses vérifications :

- « Le visiteur peut remplir le formulaire et consulter les disponibilités, mais il doit se connecter ou créer un compte avant de confirmer la réservation. »
- « Pour un client connecté, le nombre de convives par défaut et les allergies renseignées dans le profil sont proposés automatiquement. »
- « Les horaires sont proposés par tranches de quinze minutes. »
- « Les disponibilités sont actualisées sans rechargement de la page. »
- « Une réservation dépassant la capacité maximale est refusée. »

Le préremplissage depuis le profil est un comportement automatique et non un cas d’utilisation indépendant.

## Organisation recommandée du futur diagramme

Le diagramme pourra être organisé en quatre zones à l’intérieur de la frontière « Application Quai Antique » :

1. consultation publique ;
2. compte et authentification ;
3. réservations ;
4. administration.

Le Visiteur et le Client pourront être placés à gauche du système, près des cas publics et des réservations. L’Administrateur pourra être placé à droite, près des cas de gestion. Les cas inclus « Vérifier les disponibilités » et « Vérifier la capacité maximale » devront rester proches des cas liés aux réservations pour limiter les croisements.

Les détails techniques et les opérations CRUD individuelles ne seront pas représentés afin de conserver un diagramme lisible.
