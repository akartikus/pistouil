# Tasks

## 1. Script

- [x] 1.1 Écrire `tools/android/build-apk.sh` (valeurs par défaut de `JAVA_HOME` et `ANDROID_HOME`, vérification du JDK 21 et de la plateforme 36 avec un message clair, puis `npm run build`, `npx cap sync android`, `./gradlew assembleDebug`, chemin de l'APK affiché) et le script `apk` de `package.json` ; vérifier avec `bash -n` puis en lançant `npm run apk` jusqu'au bout : l'APK existe
- [x] 1.2 Vérifier les messages d'erreur : `JAVA_HOME=/inexistant npm run apk` et `ANDROID_HOME=/inexistant npm run apk` s'arrêtent tout de suite, avec ce qui manque

## 2. Documentation et cap

- [x] 2.1 Ajouter au `README.md` (section « Build Android ») la construction locale : prérequis, `npm run apk`, installation avec `adb` ; vérifier par relecture que chaque commande citée existe
- [x] 2.2 Relire `docs/VISION.md` : aucune décision n'est contredite ni ajoutée ; vérifier par relecture
