# Design system

## Objectif

Ce design system définit les règles visuelles et fonctionnelles communes du projet Quai Antique. Il servira de référence pour les futures maquettes Figma, les personnalisations Sass et Bootstrap, ainsi que les états interactifs gérés en JavaScript Vanilla.

Les composants doivent rester simples, cohérents et réutilisables dans la partie publique, l’espace client et l’administration.

## 1. Principes généraux de l’identité visuelle

L’identité de Quai Antique repose sur cinq qualités :

- **élégante** : composition aérée, typographie de titre raffinée et détails discrets ;
- **chaleureuse** : fond ivoire, accent cuivré et photographies culinaires accueillantes ;
- **gastronomique** : hiérarchie éditoriale soignée et images de qualité ;
- **naturelle** : verts profonds, matières visuelles sobres et espaces généreux ;
- **savoyarde contemporaine** : évocation du territoire par les images et l’atmosphère, sans codes rustiques, folkloriques ou décoratifs excessifs.

Les pages publiques peuvent utiliser davantage la typographie de titre, les images et l’accent cuivré. L’espace client conserve la même identité avec une présentation plus fonctionnelle. L’administration est plus sobre : priorité à Inter, aux surfaces blanches, aux bordures et à une hiérarchie très lisible.

Principes à respecter :

- favoriser les compositions aérées ;
- utiliser le vert comme couleur principale d’action ;
- réserver le cuivre aux accents visuels ;
- employer des ombres très discrètes ;
- utiliser un rayon principal de 8 px et un petit rayon de 4 px ;
- maintenir des états interactifs visibles et cohérents ;
- ne pas ajouter de décoration qui gêne la lecture ou l’utilisation.

## 2. Palette de couleurs

| Nom | Code | Usage principal |
|---|---|---|
| Ivoire — fond principal | `#F7F3EC` | Fond général des pages publiques et clientes |
| Blanc — surface | `#FFFFFF` | Cartes, formulaires, modales et surfaces administratives |
| Vert principal | `#2F4A3A` | Boutons principaux, liens importants, navigation et éléments actifs |
| Vert foncé | `#22372B` | Survol et état actif des éléments verts |
| Cuivre — accent | `#B7793E` | Icônes, filets, détails décoratifs et accents gastronomiques |
| Texte principal | `#1F2321` | Titres, paragraphes et informations importantes |
| Texte secondaire | `#6B716D` | Aides, métadonnées et informations secondaires |
| Bordures | `#D8D3CA` | Séparateurs, contours de champs et cartes |
| Succès | `#2E7D4F` | Confirmation et validation réussie |
| Erreur | `#B42318` | Erreur, validation invalide et action dangereuse |
| Avertissement | `#B7793E` | Avertissement et information nécessitant l’attention |

### Règles d’utilisation

- Le texte courant utilise `#1F2321` sur fond ivoire ou blanc.
- Le texte secondaire utilise `#6B716D` uniquement pour des contenus non essentiels et avec une taille suffisante.
- Le cuivre ne doit pas être utilisé pour de longs textes sur fond clair. Il sert principalement aux accents, aux icônes et aux éléments décoratifs.
- Les messages fonctionnels associent toujours la couleur à une icône, un titre ou un libellé explicite.
- Les états indisponibles ne reposent jamais uniquement sur une baisse d’opacité.
- Les contrastes devront être vérifiés dans Figma puis avec un outil adapté pendant l’intégration.

## 3. Typographies et hiérarchie

### Familles

- **Titres publics et titres principaux** : Cormorant Garamond, avec une police serif générique en solution de secours.
- **Textes, formulaires, boutons, navigation et administration** : Inter, avec une police sans-serif générique en solution de secours.

L’administration utilise principalement Inter. Cormorant Garamond peut être conservée pour le titre principal de la page, mais ne doit pas réduire la lisibilité des outils de gestion.

### Échelle typographique recommandée

| Usage | Mobile | Ordinateur | Graisse | Interligne |
|---|---:|---:|---:|---:|
| Titre principal | 40 px | 56 px | 600 | 1,05 à 1,1 |
| Titre de section | 32 px | 40 px | 600 | 1,15 |
| Sous-titre | 22 px | 24 px | 600 | 1,25 |
| Texte courant | 16 px | 16 px | 400 | 1,5 |
| Petit texte | 14 px | 14 px | 400 | 1,4 |
| Libellé de formulaire | 14 px | 14 px | 600 | 1,4 |
| Bouton | 16 px | 16 px | 600 | 1,2 |

### Règles typographiques

- Limiter les lignes de texte courant à environ 65 à 75 caractères.
- Ne pas utiliser une taille inférieure à 14 px pour une information utile.
- Éviter les paragraphes longs en Cormorant Garamond.
- Conserver une hiérarchie de titres logique sans choisir un niveau selon son apparence visuelle.
- Éviter les textes entièrement en majuscules, sauf pour un libellé très court et non essentiel.

## 4. Grille d’espacement

L’espacement repose sur une unité de 8 px. Une demi-unité de 4 px est autorisée pour les petits ajustements internes.

| Nom indicatif | Valeur | Usage recommandé |
|---|---:|---|
| `space-0-5` | 4 px | Écart entre une icône et un libellé court |
| `space-1` | 8 px | Écart interne minimal |
| `space-2` | 16 px | Espacement courant entre éléments liés |
| `space-3` | 24 px | Remplissage de carte et séparation de groupes |
| `space-4` | 32 px | Séparation de blocs |
| `space-5` | 40 px | Espacement intermédiaire |
| `space-6` | 48 px | Espacement entre sections sur mobile |
| `space-8` | 64 px | Espacement entre sections sur ordinateur |
| `space-10` | 80 px | Grande respiration éditoriale |

Règles :

- espacement horizontal minimal des pages mobiles : 16 px ;
- espacement horizontal conseillé sur tablette : 24 px ;
- espacement horizontal conseillé sur ordinateur : 32 px ;
- remplissage courant d’une carte : 16 px sur mobile et 24 px sur ordinateur ;
- conserver les mêmes espacements pour des composants de même niveau.

## 5. Conteneurs et largeurs maximales

Le projet utilise les conteneurs Bootstrap comme base, avec des largeurs maximales cohérentes avec ses points de rupture.

| Contexte | Largeur maximale recommandée |
|---|---:|
| Conteneur général très large | 1320 px |
| Contenu public principal | 1140 px |
| Texte éditorial | 760 px |
| Formulaire simple | 640 px |
| Formulaire de connexion | 480 px |
| Administration | 1320 px, hors largeur du menu latéral |

Sur mobile, le conteneur occupe toute la largeur disponible avec une marge intérieure de 16 px.

## 6. Responsive et points de rupture

L’approche est mobile d’abord. Les points de rupture suivent ceux de Bootstrap :

| Nom Bootstrap | Début du palier | Usage indicatif |
|---|---:|---|
| `xs` | moins de 576 px | Mobile |
| `sm` | 576 px | Grand mobile |
| `md` | 768 px | Tablette |
| `lg` | 992 px | Petit ordinateur |
| `xl` | 1200 px | Ordinateur |
| `xxl` | 1400 px | Grand écran |

Règles :

- ne pas concevoir uniquement pour une largeur mobile et une largeur ordinateur fixes ;
- laisser les grilles s’adapter entre les points de rupture ;
- afficher le menu burger avant le palier `lg` si la navigation complète manque d’espace ;
- privilégier les cartes empilées plutôt que les tableaux horizontaux sur petit écran ;
- conserver une taille minimale confortable pour les zones interactives, idéalement 44 × 44 px.

## 7. Boutons

### Structure commune

- police Inter, 16 px, graisse 600 ;
- hauteur minimale : 44 px ;
- remplissage horizontal : 24 px ;
- rayon : 8 px ;
- transition courte et discrète ;
- libellé explicite, éventuellement accompagné d’une icône.

### Bouton principal

- fond `#2F4A3A` ;
- texte blanc ;
- survol et état actif : `#22372B` ;
- utilisé pour l’action prioritaire d’une zone, par exemple « Réserver » ou « Enregistrer ».

### Bouton secondaire

- fond transparent ;
- texte et contour `#2F4A3A` ;
- survol : fond vert très discret ou fond `#2F4A3A` avec texte blanc si le contraste reste cohérent ;
- utilisé pour une action alternative.

### Bouton discret

- fond transparent ;
- sans contour permanent ;
- texte `#2F4A3A` ;
- soulignement ou fond discret au survol ;
- utilisé pour les actions de faible priorité.

### Bouton dangereux

- fond `#B42318` ;
- texte blanc ;
- libellé précis, par exemple « Supprimer la réservation » ;
- toujours associé à une confirmation lorsque l’action est difficilement réversible.

### Bouton désactivé

- fond ou contour `#D8D3CA` ;
- texte `#6B716D` ;
- curseur et attribut désactivé adaptés ;
- aucune interaction au survol ;
- l’état doit rester compréhensible sans dépendre uniquement de la couleur.

### Focus

Tous les boutons affichent un contour de focus visible de 3 px, en vert principal, avec un décalage de 2 px. Le focus ne doit jamais être supprimé sans remplacement accessible.

## 8. Champs de formulaire

### Structure commune

- libellé visible au-dessus du champ ;
- texte Inter 16 px ;
- hauteur minimale de 44 px ;
- fond blanc ;
- bordure de 1 px ;
- rayon de 4 px ;
- aide ou erreur placée sous le champ ;
- indication explicite des champs obligatoires.

Le texte indicatif ne remplace jamais le libellé.

### État normal

- bordure `#D8D3CA` ;
- texte `#1F2321` ;
- texte indicatif `#6B716D`.

### État de focus

- bordure `#2F4A3A` ;
- contour visible de 3 px autour du champ ;
- maintien du libellé et de l’aide.

### État d’erreur

- bordure `#B42318` ;
- icône ou indication textuelle ;
- message précis sous le champ ;
- association technique future entre le champ et son message.

### État désactivé

- fond ivoire ;
- bordure `#D8D3CA` ;
- texte secondaire ;
- état désactivé identifiable autrement que par la couleur seule.

### Formulaire de réservation

- créneaux présentés dans une grille de boutons ;
- états disponible, sélectionné et indisponible accompagnés de textes, icônes ou conventions explicites ;
- changements de disponibilité annoncés clairement ;
- valeurs issues du profil modifiables avant confirmation.

## 9. Cartes

### Règles communes

- fond blanc ;
- bordure `#D8D3CA` ;
- rayon de 8 px ;
- ombre très discrète ;
- remplissage de 16 à 24 px ;
- titre, contenu et actions disposés dans un ordre constant.

### Carte de plat

- image de qualité avec proportions cohérentes ;
- nom du plat ;
- description courte ;
- prix clairement associé ;
- catégorie si elle aide la compréhension.

L’image ne doit pas repousser les informations essentielles hors de l’écran.

### Carte de réservation

- date et heure mises en avant ;
- nombre de couverts ;
- allergies éventuelles ;
- statut textuel si nécessaire ;
- actions « Modifier » et « Supprimer » clairement séparées.

Les cartes s’affichent sur une colonne en mobile et sur une ou deux colonnes en ordinateur selon l’espace disponible.

### Carte d’administration

- présentation plus sobre ;
- titre et informations essentielles en Inter ;
- actions cohérentes et alignées ;
- peu ou pas d’ombre ;
- bordure privilégiée pour structurer les contenus.

Sur mobile, les cartes remplacent les grands tableaux lorsque ceux-ci nécessiteraient un défilement horizontal.

## 10. Navigation

### Navigation publique sur ordinateur

- logo à gauche ;
- liens à droite ;
- action « Réserver » visuellement prioritaire ;
- état actif visible par un soulignement, une graisse ou un indicateur qui ne dépend pas uniquement de la couleur ;
- hauteur stable sur toutes les pages.

### Navigation publique sur mobile

- logo et bouton de menu burger dans l’en-tête ;
- panneau de navigation lisible et refermable ;
- ordre logique des liens ;
- contrôle du menu nommé pour les technologies d’assistance ;
- focus déplacé et restitué correctement lors de l’ouverture et de la fermeture.

### Navigation de l’espace client

- accès à « Mon compte », « Mes réservations », « Réserver » et « Se déconnecter » ;
- onglet ou lien actif clairement identifiable ;
- présentation compacte sur mobile.

### Barre latérale administrateur

- menu latéral visible sur ordinateur ;
- menu replié ou panneau latéral sur mobile ;
- libellés accompagnant les icônes ;
- regroupement simple : tableau de bord, paramètres, galerie, carte, menus et réservations ;
- identité plus sobre que la navigation publique.

## 11. Tableaux et listes administratives

### Ordinateur

- en-tête de colonnes explicite ;
- lignes suffisamment espacées ;
- actions regroupées dans la dernière colonne ;
- filtre placé au-dessus de la liste ;
- alternance de fond très discrète si elle améliore la lecture ;
- aucune information transmise uniquement par la couleur.

### Mobile

- transformer les lignes en cartes ou blocs empilés ;
- afficher les libellés avec les valeurs ;
- placer les actions dans chaque carte ;
- éviter les grands tableaux et le défilement horizontal ;
- conserver le filtre au-dessus de la liste.

### États à prévoir

- chargement ;
- liste vide ;
- erreur de chargement ;
- filtre sans résultat ;
- confirmation d’une opération.

## 12. Fenêtres modales

Les modales Bootstrap sont réservées aux tâches courtes :

- ajout ou modification d’un élément simple ;
- confirmation de suppression ;
- agrandissement d’une image de galerie ;
- message nécessitant une décision immédiate.

Règles :

- titre explicite ;
- contenu concis ;
- action principale et action d’annulation clairement distinguées ;
- bouton de fermeture accessible ;
- focus placé dans la modale à l’ouverture, contenu dans celle-ci, puis rendu à l’élément déclencheur à la fermeture ;
- fermeture possible avec la touche Échap lorsque cela ne provoque pas de perte de données importante ;
- sur mobile, modale adaptée à la largeur et à la hauteur disponibles ;
- utiliser une page complète pour un formulaire long ou complexe.

## 13. Messages et retours d’état

Tous les messages associent une couleur, une icône et un texte explicite. Ils doivent être placés près de l’action concernée et être annoncés aux technologies d’assistance lorsque leur apparition est dynamique.

### Succès

- couleur principale `#2E7D4F` ;
- icône de validation ;
- confirmation courte de l’action réalisée.

### Erreur

- couleur principale `#B42318` ;
- icône d’erreur ;
- explication et solution possible ;
- conservation des données déjà saisies lorsque cela est possible.

### Avertissement

- accent `#B7793E` ;
- icône d’attention ;
- texte principal en `#1F2321` pour garantir une lecture confortable ;
- utilisé avant une situation nécessitant une vigilance particulière.

### Information

- vert principal `#2F4A3A` pour l’icône ou la bordure ;
- fond blanc ou ivoire ;
- texte principal `#1F2321` ;
- utilisé pour une aide ou une explication neutre.

## 14. Icônes et images

### Icônes

- utiliser un seul ensemble d’icônes cohérent avec Bootstrap ;
- style simple, contours homogènes et formes immédiatement reconnaissables ;
- taille courante de 20 à 24 px ;
- toujours accompagner d’un libellé lorsqu’une icône seule pourrait être ambiguë ;
- ne pas utiliser une icône comme unique moyen de signaler un succès, une erreur ou un avertissement ;
- marquer comme décoratives les icônes qui n’apportent aucune information.

### Images

- privilégier des photographies lumineuses, naturelles et gastronomiques ;
- conserver des proportions cohérentes dans les grilles et les cartes ;
- éviter les clichés folkloriques de la Savoie ;
- prévoir un texte alternatif pertinent pour les images informatives ;
- utiliser une alternative vide pour une image purement décorative ;
- ne pas intégrer de texte essentiel directement dans une image ;
- prévoir un cadrage adapté au mobile et à l’ordinateur.

## 15. Accessibilité

- viser au minimum le niveau AA des recommandations WCAG pour les contrastes de texte et les composants ;
- garantir un focus visible sur tous les éléments interactifs ;
- assurer une navigation complète au clavier ;
- utiliser des libellés visibles sur tous les formulaires ;
- relier les erreurs aux champs concernés ;
- ne pas transmettre une information uniquement par la couleur ;
- conserver une taille de texte courant de 16 px ;
- prévoir des zones interactives d’environ 44 × 44 px ;
- respecter une structure sémantique et une hiérarchie de titres logique ;
- fournir des textes alternatifs adaptés aux images ;
- rendre les menus et modales utilisables au clavier ;
- annoncer les messages dynamiques importants ;
- ne pas bloquer le zoom du navigateur ;
- vérifier l’interface avec un agrandissement de texte et à différentes largeurs ;
- limiter les animations et respecter les préférences de réduction des mouvements ;
- écrire des libellés d’action précis plutôt que des termes vagues comme « Cliquer ici ».

## 16. Futurs tokens Sass

Ces noms documentent la future organisation Sass. Aucun fichier Sass n’est créé à cette étape.

### Couleurs

```scss
$color-background: #F7F3EC;
$color-surface: #FFFFFF;
$color-primary: #2F4A3A;
$color-primary-hover: #22372B;
$color-accent: #B7793E;
$color-text: #1F2321;
$color-text-muted: #6B716D;
$color-border: #D8D3CA;
$color-success: #2E7D4F;
$color-error: #B42318;
$color-warning: #B7793E;
```

### Typographies

```scss
$font-heading: "Cormorant Garamond", Georgia, serif;
$font-body: "Inter", Arial, sans-serif;
```

### Rayons, ombre et conteneur

```scss
$radius-sm: 4px;
$radius-md: 8px;
$shadow-card: 0 2px 12px rgba(31, 35, 33, 0.08);
$container-max-width: 1320px;
```

### Espacements recommandés

```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;
$spacing-3xl: 64px;
```

### Correspondance Bootstrap future

Lors de l’initialisation technique, les variables Bootstrap pourront être rapprochées de ces tokens :

- couleur principale Bootstrap vers `$color-primary` ;
- couleur dangereuse vers `$color-error` ;
- famille de base vers `$font-body` ;
- rayon de bordure vers `$radius-md` ;
- points de rupture conservés selon la grille Bootstrap ;
- largeur des conteneurs adaptée aux valeurs définies dans ce document.

Cette correspondance devra être validée avant toute personnalisation Sass afin d’éviter les doublons entre les tokens du projet et les variables Bootstrap.

## 17. Composants Bootstrap envisagés

Les composants Bootstrap pourront fournir une base accessible et responsive, puis être personnalisés selon les tokens du projet :

- barre de navigation et menu mobile ;
- conteneurs, grille et gouttières ;
- boutons ;
- champs et validation de formulaires ;
- cartes ;
- modales ;
- messages d’alerte ;
- panneau latéral mobile ;
- listes et tableaux responsives lorsque leur usage reste lisible.

Le JavaScript associé devra rester simple et limité aux interactions nécessaires. Aucun framework JavaScript supplémentaire n’est prévu.
