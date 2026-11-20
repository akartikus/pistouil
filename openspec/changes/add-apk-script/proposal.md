# Proposal

## Why

Construire l'APK en local demande trois commandes et deux variables d'environnement (`JAVA_HOME` pour le JDK 21, `ANDROID_HOME` pour le SDK), faciles à oublier : le JDK du système est trop ancien et Gradle échoue alors avec un message peu clair. Ajustement d'outillage hors brief, donc changement OpenSpec (`AGENTS.md`). Le workflow GitHub « Build Android » reste le moyen officiel (brief 07) ; ceci sert aux essais sur un appareil.

## What Changes

- `npm run apk` construit le site, synchronise Capacitor et produit l'APK debug, puis affiche son chemin.
- Le script prend `JAVA_HOME` et `ANDROID_HOME` s'ils sont définis, sinon `~/.local/jdk21` et `~/Android/Sdk`, et dit clairement ce qui manque (JDK 21, SDK, plateforme).
- Section du `README.md` : prérequis, commande, installation avec `adb`.

**Exclu** : l'installation automatique sur un appareil, un APK signé pour la publication, un build iOS.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

Aucune : outil de développement, aucun comportement du jeu ne change. Le changement déclare `skip_specs`.

## Impact

- `tools/android/build-apk.sh` (nouveau), `package.json` (script `apk`), `README.md`.
- Aucune dépendance ajoutée. `design.md` n'est pas créé : aucun critère ne s'applique.
