# Connexion du front-end à l'API

## Configuration

Le front lit `VITE_API_URL` depuis l'environnement Vite. `.env.example` documente
la valeur locale et `.env.local`, ignoré par Git, permet de la personnaliser.
Sans variable, le développement utilise `http://127.0.0.1:8000`.

Les variables préfixées par `VITE_` sont publiques. Aucun secret ne doit y être
placé.

## Client HTTP

`src/js/api/apiClient.js` expose `apiRequest()` et les raccourcis `apiGet()`,
`apiPost()`, `apiPut()`, `apiPatch()` et `apiDelete()`.

Le client :

- ajoute `Accept: application/json`;
- sérialise les objets et ajoute `Content-Type: application/json`;
- ajoute le token actif dans `X-AUTH-TOKEN`;
- accepte un `AbortSignal`;
- gère les réponses JSON et les réponses 204;
- transforme les erreurs en `ApiError` avec statut et données utiles.

## Authentification

`src/js/auth/authService.js` gère l'inscription, la connexion, la déconnexion
et la restauration de session avec `/api/account/me`.

Les clés locales sont :

- `quai_antique_api_token`;
- `quai_antique_user`.

Le mot de passe et sa confirmation ne sont jamais stockés.

## Données publiques

`src/js/api/publicApi.js` regroupe les accès en lecture aux restaurants,
catégories, plats, menus et images. Les pages n'appellent pas directement
`fetch()`.
