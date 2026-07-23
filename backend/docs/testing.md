# Tests du backend

La base de développement `quai_antique` et la base de tests `quai_antique_test` sont strictement séparées. PHPUnit utilise `APP_ENV=test` et lit la connexion locale depuis `.env.test.local`. Il ne faut jamais faire pointer cette variable vers `quai_antique`.

Configuration locale attendue :

```dotenv
DATABASE_URL="mysql://root:@127.0.0.1:3306/quai_antique_test?serverVersion=mariadb-10.4.32&charset=utf8mb4"
```

Préparation initiale :

```bash
php bin/console doctrine:database:create --env=test --if-not-exists
php bin/console doctrine:migrations:migrate --env=test --no-interaction
php bin/console doctrine:fixtures:load --env=test --no-interaction
php bin/phpunit
```

Exécuter une classe ou un test précis :

```bash
php bin/phpunit tests/Entity/UserTest.php
php bin/phpunit --filter testUserAlwaysHasRoleUser
```

Réinitialisation complète :

```bash
php bin/console doctrine:database:drop --env=test --force --if-exists
php bin/console doctrine:database:create --env=test
php bin/console doctrine:migrations:migrate --env=test --no-interaction
php bin/console doctrine:fixtures:load --env=test --no-interaction
php bin/phpunit
```

La commande de chargement des fixtures purge les données présentes dans `quai_antique_test`. Elle ne doit jamais être lancée avec une configuration de test pointant vers la base de développement.
