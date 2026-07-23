# Fixtures de développement

Ces fixtures sont réservées aux environnements `dev` et `test`.

La commande suivante purge les données existantes avant de charger le jeu de démonstration :

```bash
php bin/console doctrine:fixtures:load --no-interaction
```

Une sauvegarde préalable de la base a été créée ici :

`var/backups/quai_antique_before_fixtures_20260723_165341.sql`

## Comptes de démonstration

Administrateur :

- E-mail : `admin@quai-antique.test`
- Mot de passe : `AdminQa2026!`

Client :

- E-mail : `client@quai-antique.test`
- Mot de passe : `ClientQa2026!`

Ces mots de passe sont uniquement destinés au développement. Ils ne doivent jamais être utilisés en production.

Les tokens API sont générés à chaque chargement et ne sont pas documentés.

Les identifiants numériques peuvent changer après chaque purge. Ils ne doivent pas être considérés comme fixes. Utilisez de préférence les UUID ou les routes de liste de l’API.

Les slugs `/images/gallery/` des images de démonstration sont prêts côté API, mais les fichiers correspondants devront être ajoutés au front-end.
