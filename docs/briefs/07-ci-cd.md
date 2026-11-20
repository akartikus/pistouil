# Brief 07 — CI/CD

**Objectif** : valider automatiquement chaque changement par les tests, et pouvoir produire à la demande l'APK Android (puis le paquet iPhone) depuis `master`, sans consommer inutilement le cloud (dépôt privé, GitHub Actions).
**Dépend de** : partie A (tests) : étape 0, faisable dès maintenant. Partie B (Android) : dossier `android/` (brief 06). Partie C (iOS) : dossier `ios/` et compte Apple Developer, **reportée** tant que ce compte n'existe pas.
**À lire** : `docs/VISION.md` §6 ; `docs/briefs/06-offline-mobile.md` (périmètre Capacitor).

## Périmètre

**Inclus**

*Partie A — Tests*
- Un workflow `.github/workflows/test.yml` lancé sur chaque pull request et sur chaque push sur `master`.
- Étapes : installation propre (`npm ci`), `npm run check`, `npm run lint`, `npm run test`, `npm run build`.
- Annulation des exécutions obsolètes d'une même branche, cache npm, durée maximale.
- Protection de `master` : fusion uniquement par pull request avec le workflow de tests au vert (si le plan GitHub le permet).

*Partie B — Build Android à la demande*
- Un workflow `.github/workflows/build-android.yml`, déclenché **uniquement à la main** (`workflow_dispatch`).
- Refus de s'exécuter hors de `master`.
- Les tests passent avant le build.
- Build du web, synchronisation Capacitor, APK **debug** produit par Gradle (aucune clé), déposé en artefact.
- Garde-fous de coût : aucun déclencheur automatique ni planifié, durée maximale du job, rétention courte des artefacts, un seul build à la fois.
- Section du `README.md` : comment lancer le build, où récupérer l'APK, durée et minutes consommées.

*Partie C — Build iOS à la demande (reportée)*
- Un workflow séparé `.github/workflows/build-ios.yml`, mêmes règles que la partie B (manuel, `master` seulement, tests avant build, garde-fous de coût), sur runner macOS.
- Build du web, synchronisation Capacitor, archive Xcode signée par `xcodebuild`, déposée en artefact.
- Signature par secrets GitHub (certificat, profil de provisionnement) ; aucun secret dans le dépôt ni dans les journaux.
- Faite seulement quand un compte Apple Developer est disponible : pas de squelette non signé, qui ne s'installerait pas et consommerait des minutes macOS pour rien.

**Exclu**
- Publication sur les stores (Play Store, TestFlight, App Store) et versions numérotées automatiques.
- Hébergement du site web et des données (fichiers de lieux, PMTiles).
- Tests de bout en bout sur appareil, matrices de versions, notifications.
- Création des comptes (Apple Developer) et des clés de signature : fournis par l'équipe.

## Exigences

### Chaque changement est testé
- QUAND une pull request est ouverte ou mise à jour
- ALORS le workflow de tests s'exécute et son résultat est visible sur la pull request,
- ET un échec de `check`, `lint`, `test` ou `build` fait échouer le workflow.

### Simple et transparent
- Les workflows n'utilisent que des actions officielles de GitHub, à version fixée.
- Chaque étape est une commande `npm` ou native lisible dans le fichier ; aucune logique cachée dans des scripts tiers.

### Builds mobiles seulement à la demande
- QUAND personne ne lance un workflow de build
- ALORS aucun build mobile n'a lieu, quel que soit le nombre de pushes.

### Builds mobiles seulement sur `master`
- QUAND un workflow de build est lancé depuis une autre branche que `master`
- ALORS il s'arrête immédiatement avec un message explicite, sans consommer de minutes de build.

### Tests avant build
- QUAND un build mobile est demandé
- ALORS les tests s'exécutent d'abord,
- ET le build ne démarre que s'ils réussissent.

### Android installable
- QUAND le build Android réussit
- ALORS un APK est téléchargeable en artefact et s'installe sur un téléphone Android.

### iOS installable (partie C)
- QUAND le build iOS réussit
- ALORS un paquet signé est téléchargeable en artefact et s'installe selon le mode de distribution retenu.

### Secrets protégés
- Aucune clé ni aucun certificat n'est commité.
- Les secrets ne sont lus que par les workflows de build, jamais par celui des tests.

### Coût maîtrisé
- Le build iOS (runner macOS, facturé 10 fois plus cher qu'un runner Linux sur dépôt privé) a son propre workflow : il ne peut pas se lancer par erreur depuis celui d'Android.
- Chaque job a une durée maximale ; les artefacts sont conservés peu de temps.

## Critères d'acceptation

- [ ] Une pull request avec un test en échec est signalée en échec, une avec tests au vert est signalée au vert.
- [ ] Un push sur une branche sans pull request ne lance aucun build mobile.
- [ ] Lancer le build depuis une branche autre que `master` échoue tout de suite.
- [ ] L'APK produit s'installe et démarre sur un téléphone Android.
- [ ] Le temps d'exécution et les minutes consommées de chaque workflow sont notés dans le `README.md`.
- [ ] Le `README.md` explique comment lancer un build.
- [ ] (Partie C) Le paquet iOS produit s'installe sur un iPhone ; le `README.md` explique les secrets à configurer.

## Points à trancher pendant la proposition

- Protection de `master` : les règles de protection sur dépôt privé peuvent exiger un plan GitHub payant ; sinon, rester sur la discipline d'équipe et vérifier le statut avant de fusionner.
- Version de Node utilisée par la CI (proposition : 22, comme `@types/node`).
- Android : décidé, APK debug d'abord (aucune clé) ; le release signé (clé dans les secrets) viendra ensuite.
- iOS : décidé, workflow séparé et reporté faute de compte Apple Developer. À trancher à la reprise : mode de distribution (ad hoc, TestFlight) ; proposition : `xcodebuild` direct, sans outil supplémentaire.
- Les tests doivent-ils aussi tourner sur chaque push de branche (en plus des pull requests) ? Proposition : pull requests et `master` seulement, pour limiter les minutes.

## Consigne pour OpenSpec

> Crée deux changements OpenSpec à partir de ce brief : `add-ci-tests` (partie A, faisable maintenant) puis `add-ci-android-build` (partie B). Reprends chaque exigence comme exigence de spécification avec ses scénarios, dans la partie qui la concerne. Les workflows doivent rester courts et lisibles, avec uniquement des actions officielles à version fixée. Termine chaque `tasks.md` par la mise à jour de `docs/VISION.md` et, pour la partie B, par un build manuel réel sur Android.
>
> La partie C (`add-ci-ios-build`) sera proposée plus tard, quand un compte Apple Developer existera, avec un build manuel réel sur iOS en dernière tâche.
