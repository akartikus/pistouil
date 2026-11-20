# Design

## Context

Les dossiers `android/` sont commités (brief 06) : Gradle 8.14.3 par le wrapper, compilation en Java 21 (`capacitor.build.gradle`), `compileSdk` 36, `applicationId` `dev.sitraka.pistouil`, aucune config de signature. `capacitor.config.ts` utilise `webDir: build`. Le dépôt est privé : les minutes Linux comptent. Voir `proposal.md` (Why), `docs/briefs/07-ci-cd.md` (partie B). Aucune capability existante de `openspec/specs/` n'est concernée ; `add-ci-tests` (en cours) a un workflow distinct.

## Goals / Non-Goals

**Goals:**
- Un seul fichier `.github/workflows/build-android.yml`, court, lisible de haut en bas.

**Non-Goals:**
- Signature release, publication, iOS, factorisation avec `test.yml`.

## Decisions

- **Déclencheur** : `workflow_dispatch` seul, sans entrée. Alternative : un workflow commun avec choix de plateforme, écartée (voir `docs/briefs/07-ci-cd.md`).
- **Garde `master`** : première étape du job, `if: github.ref != 'refs/heads/master'`, qui affiche un message et fait `exit 1`. Alternative : `if` sur le job, rejetée car le job serait « ignoré » sans message ni échec visible.
- **Tests avant build** : un seul job, étapes dans l'ordre `npm ci`, `npm run test`, `npm run build`, `npx cap sync android`, Gradle. Un job séparé pour les tests obligerait à réinstaller les dépendances et coûterait plus de minutes. `npm run test` seul, comme le demande le brief ; `check` et `lint` sont déjà portés par `test.yml` sur chaque pull request.
- **APK** : `./gradlew assembleDebug` dans `android/` ; sortie `android/app/build/outputs/apk/debug/*.apk`, déposée avec `actions/upload-artifact`.
- **Environnement** : Node 22 (`actions/setup-node`, cache npm), JDK 21 Temurin (`actions/setup-java`). Le SDK Android est préinstallé sur les runners `ubuntu-latest` : pas d'action supplémentaire.
- **Actions** : `actions/checkout`, `actions/setup-node`, `actions/setup-java`, `actions/upload-artifact`, versions précises vérifiées dans leur documentation à l'implémentation. Pas de `gradle/actions` (tierce) : le cache Gradle est laissé de côté ; à ajouter via `setup-java` `cache: gradle` si la durée le justifie.
- **Coût** : `concurrency` à groupe fixe sans annulation (le second lancement attend), `timeout-minutes` fixé après une mesure réelle, `retention-days` court (ex. 7), `permissions: contents: read`, aucun `secrets.*`.
- **`versionCode`** reste à 1 : pas de versions numérotées automatiques (exclu du brief).

## Risks / Trade-offs

- [Le téléchargement de Gradle et des dépendances rend le premier build long] → mesurer, noter la durée dans le README ; ajouter un cache seulement si nécessaire.
- [`npx cap sync` échoue en CI parce que `@capacitor/cli` est une devDependency] → `npm ci` installe les devDependencies ; vérifier au premier essai.
- [APK debug non signé pour la distribution] → assumé : sert aux tests ; le release signé fera un autre changement.

## Open Questions

Aucune.
