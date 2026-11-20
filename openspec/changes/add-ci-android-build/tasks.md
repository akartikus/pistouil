# Tasks

## 1. Workflow Android

- [x] 1.1 Relever dans la documentation officielle les versions fixes actuelles de `actions/checkout`, `actions/setup-node`, `actions/setup-java` et `actions/upload-artifact` (MCP `context7`)
- [ ] 1.2 Vérifier en local que la chaîne passe : `npm run test`, `npm run build`, `npx cap sync android`, puis `./gradlew assembleDebug` dans `android/` produit un APK
- [x] 1.3 Créer `.github/workflows/build-android.yml` (`workflow_dispatch`, garde `master` en première étape, `concurrency` sans annulation, `timeout-minutes`, `permissions: contents: read`, Node 22, JDK 21, tests, build, sync, Gradle, `upload-artifact` avec `retention-days` court) ; vérifier que `npx prettier --check .github` passe
- [ ] 1.4 Lancer le workflow depuis une branche autre que `master` ; vérifier qu'il échoue tout de suite avec le message explicite
- [ ] 1.5 Lancer le workflow depuis `master` ; vérifier qu'un APK est en artefact, l'installer sur un téléphone Android et vérifier que l'application démarre
- [ ] 1.6 Vérifier qu'un push sans lancement manuel ne démarre aucun build, et noter la durée et les minutes consommées de l'exécution 1.5

## 2. Documentation

- [ ] 2.1 Ajouter au `README.md` une section « Build Android » : comment lancer le workflow, où récupérer l'APK, durée et minutes mesurées en 1.6, rétention de l'artefact ; vérifier que `npx prettier --check README.md` passe
- [ ] 2.2 Mettre à jour `docs/VISION.md` (feuille de route : partie B du brief 07 faite ; décisions si elles ont changé) et vérifier qu'aucune ligne ne contredit le workflow livré
