# Proposal

## Why

Aujourd'hui, rien ne vérifie automatiquement un changement : `check`, `lint`, `test` et `build` ne tournent qu'à la main. Un test cassé peut atteindre `master` sans que personne le voie. Source : `docs/briefs/07-ci-cd.md`, partie A.

## What Changes

- Ajout d'un workflow GitHub Actions `.github/workflows/test.yml`, lancé sur chaque pull request et sur chaque push sur `master` (pas sur chaque push de branche, pour limiter les minutes).
- Étapes : installation propre (`npm ci`), `npm run check`, `npm run lint`, `npm run test`, `npm run build`.
- Garde-fous de coût : annulation des exécutions obsolètes d'une même branche, cache npm, durée maximale du job.
- Actions officielles de GitHub uniquement, à version fixée ; chaque étape est une commande lisible dans le fichier.
- Aucun secret lu par ce workflow.
- Section « Tests automatiques » du `README.md` (ce que fait le workflow, durée et minutes consommées).
- Protection de `master` (fusion par pull request, workflow au vert) : à configurer dans GitHub si le plan le permet, sinon discipline d'équipe ; ce n'est pas du code du dépôt.
- Mise à jour de `docs/VISION.md` (feuille de route, décisions).

**Exclu** (brief 07) : builds mobiles (parties B et C, changements `add-ci-android-build` puis `add-ci-ios-build`), publication, hébergement, tests de bout en bout, matrices de versions, notifications. Les tests Python de `tools/data-preparation/` ne sont pas dans le périmètre du brief : non couverts.

## Capabilities

### New Capabilities

- `ci-tests`: validation automatique de chaque pull request et de `master` par les contrôles du projet (typage, lint, tests, build), avec des garde-fous de coût et sans accès aux secrets.

### Modified Capabilities

Aucune.

## Impact

- `.github/workflows/test.yml` (nouveau).
- `README.md` : nouvelle section.
- `docs/VISION.md` : feuille de route et décisions.
- Aucun changement dans `src/`, `catalog/` ni `tools/`. Aucune nouvelle dépendance.
- Réglage hors dépôt : règle de protection de `master` sur GitHub.
