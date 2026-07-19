# Socle API du front-end

## Configuration locale

La variable `VITE_API_BASE_URL` indique l’adresse de base de l’API Symfony. Pour travailler localement, copier `.env.example` vers un fichier `.env`, puis adapter sa valeur si nécessaire :

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Le fichier `.env` ne doit pas être commité : il décrit une configuration propre au poste de travail. Toute variable préfixée par `VITE_` est intégrée au code envoyé au navigateur et est donc publique. Aucun mot de passe, jeton ou autre secret ne doit y être placé.

L’absence de cette variable ne bloque pas le site tant qu’aucune requête n’est lancée. Une tentative de requête sans configuration produit une `ApiError` explicite.

## Client HTTP

Le client centralisé se trouve dans `src/js/api/apiClient.js` :

```js
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from '../api/apiClient.js';
```

Les chemins transmis doivent rester relatifs à l’API. `/health` peut servir d’exemple générique dans ce document, mais ne correspond pas à un endpoint confirmé du projet.

```js
const result = await apiGet('/health');

const path = obtenirCheminDepuisLeContratSymfony();

const createdResource = await apiPost(path, {
  example: 'Donnée sérialisée en JSON',
});

await apiPatch(path, {
  example: 'Nouvelle valeur',
});

await apiDelete(path);
```

Un objet JavaScript ordinaire est sérialisé en JSON. Un `FormData`, un `Blob` ou une chaîne est transmis sans imposer de `Content-Type`, afin de laisser le navigateur ou l’appelant choisir le format adapté.

## Annulation d’une requête

Le client accepte un `AbortSignal` :

```js
import { apiGet, isApiAbortError } from '../api/apiClient.js';

const controller = new AbortController();

try {
  await apiGet('/health', { signal: controller.signal });
} catch (error) {
  if (!isApiAbortError(error)) throw error;
}

controller.abort();
```

Les futures pages pourront ainsi annuler leurs requêtes pendant leur nettoyage sans traiter l’annulation comme une erreur serveur.

## Gestion des erreurs

Toutes les erreurs du client utilisent `ApiError` :

```js
import { ApiError } from '../api/ApiError.js';
import { apiGet } from '../api/apiClient.js';

try {
  await apiGet('/health');
} catch (error) {
  if (error instanceof ApiError) {
    // Afficher ensuite un message avec textContent, jamais comme HTML non protégé.
    const message = error.message;
  }
}
```

Une `ApiError` peut fournir le statut HTTP, le statut textuel, un code interne, des données d’erreur filtrées et l’URL appelée. Le client distingue notamment la configuration absente, les erreurs réseau, les annulations, les erreurs HTTP et les réponses JSON invalides.

## Authentification future

Le client ne stocke actuellement aucun jeton et ne réalise aucune authentification. Un fournisseur facultatif pourra être enregistré plus tard :

```js
import { setAccessTokenProvider } from '../api/apiClient.js';

setAccessTokenProvider(async () => obtenirLeJetonSelonLeContratReel());
```

Lorsque ce fournisseur retournera un jeton, le client ajoutera l’en-tête `Authorization: Bearer …`. Le choix du stockage et le format d’authentification devront être confirmés par le contrat réel de l’API Symfony.

## Contrat Symfony encore nécessaire

Aucun endpoint métier suffisamment précis n’est actuellement documenté. Il reste notamment à obtenir :

- l’URL selon les environnements ;
- la liste exacte des endpoints et méthodes HTTP ;
- le format des requêtes et des réponses ;
- la stratégie d’authentification et de renouvellement de session ;
- les rôles et les règles d’autorisation ;
- la structure des erreurs et leurs codes ;
- les règles CORS et les éventuels cookies ;
- le contrat de téléversement des images ;
- les contrats des utilisateurs, réservations, horaires, capacités, galeries, catégories, plats et menus.

Les services métier seront ajoutés dans `src/js/api/services/` uniquement après confirmation de ces informations. Aucun endpoint ne doit être déduit des noms de pages du front-end.
