# Proposal

## Why

On ne peut produire l'APK Android qu'à la main, sur un poste avec Android Studio. Un workflow manuel sur GitHub permet à toute l'équipe d'obtenir un APK installable depuis `master`, sans lancer de build à chaque push. Source : `docs/briefs/07-ci-cd.md`, partie B.

## What Changes

- Ajout d'un workflow `.github/workflows/build-android.yml`, déclenché **uniquement** par `workflow_dispatch`.
- Refus de s'exécuter hors de `master`, avec un message explicite, dès la première étape.
- Les tests passent avant le build : si `npm run test` échoue, aucun build n'a lieu.
- Build du web, synchronisation Capacitor, APK **debug** produit par Gradle (aucune clé), déposé en artefact.
- Garde-fous de coût : aucun déclencheur automatique ni planifié, durée maximale du job, rétention courte de l'artefact, un seul build à la fois.
- Section « Build Android » du `README.md` : comment lancer le build, où récupérer l'APK, durée et minutes consommées.
- Mise à jour de `docs/VISION.md` (feuille de route, décisions).

**Exclu** (brief 07) : APK release signé (viendra ensuite), build iOS (partie C, `add-ci-ios-build`), publication sur les stores, versions numérotées automatiques, tests sur appareil.

## Capabilities

### New Capabilities

- `ci-android-build`: production à la demande, depuis `master`, d'un APK Android debug installable, à coût maîtrisé.

### Modified Capabilities

Aucune. Ce changement est indépendant de `add-ci-tests` (autre workflow, autre fichier).

## Impact

- `.github/workflows/build-android.yml` (nouveau).
- `README.md` : nouvelle section.
- `docs/VISION.md` : feuille de route et décisions.
- Aucun changement dans `src/`, `android/` ni `tools/`, aucune nouvelle dépendance du projet.
