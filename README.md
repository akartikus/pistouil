# Pistouil

Jeu d'enquête solo, mobile et web : des mystères générés à partir des vrais lieux OpenStreetMap, résolus par déduction. Cap et décisions : [`docs/VISION.md`](docs/VISION.md).

## Démarrer

```sh
npm install
npm run dev      # développement (page de test du moteur : /playground)
npm run test     # tests
npm run check    # types
npm run lint     # format + lint
npm run build    # build statique dans build/
```

Prérequis : Node.js 20+. Pour préparer les données OSM : Python 3 (et `osmium-tool` pour découper un petit extrait), voir `tools/data-preparation/README.md`. Plus tard : Android Studio / Xcode (étape 6).

## Guides

- [`guide/OPENSPEC.md`](guide/OPENSPEC.md) : la méthode de travail, pas à pas.
- [`guide/ENGINE.md`](guide/ENGINE.md) : comment fonctionne le moteur (couches, faits, solveur, règles).
- [`guide/ARCHITECTURE.md`](guide/ARCHITECTURE.md) : l'architecture et les structures de données (couches, fichiers de données, Worker, sauvegarde, livraison).
- [`guide/ADD-COMMUNE.md`](guide/ADD-COMMUNE.md) : ajouter une commune, et ce qui passerait en ligne.

## Travailler avec OpenSpec

Chaque étape de la feuille de route (`docs/VISION.md` §7) est un brief (`docs/briefs/`) traité comme **un changement** OpenSpec. On demande l'action à l'assistant en langage naturel ; il utilise les skills de `.agents/skills/`.

1. **Relire le cap** : `docs/VISION.md`, puis le brief de l'étape.
2. **Proposer** : « Crée un changement OpenSpec à partir de `docs/briefs/01-generation-engine.md`, en suivant la consigne à la fin du brief. Ne code rien. » → `openspec/changes/<nom>/`
3. **Relire la proposition** avant tout code : périmètre = celui du brief ; chaque exigence a ses scénarios ; tâches petites, tests d'abord ; rien ne contredit `VISION.md`.
4. **Appliquer** : « Implémente le changement `<nom>`, tâche par tâche. » Lancer `npm run test` après chaque groupe de tâches.
5. **Terminé quand** : tâches cochées, tests verts, critères d'acceptation du brief remplis.
6. **Archiver** : « Archive le changement `<nom>`. » → specs fusionnées dans `openspec/specs/`, changement daté dans `openspec/changes/archive/`.
7. **Mettre à jour le cap** : cocher l'étape dans `VISION.md` §7, noter les décisions au §6, puis **commit**.

Règles : un brief = un changement ; si un principe de `VISION.md` est remis en cause, trancher d'abord dans `VISION.md` ; un imprévu = un nouveau brief, pas un ajout au changement en cours. Un ajustement demandé hors brief (outil de test, correction, contenu) est aussi un changement OpenSpec, nommé d’après son objet.

## Tests automatiques

Le workflow `.github/workflows/test.yml` s'exécute sur chaque pull request (ouverte ou mise à jour) et sur chaque push sur `master`, jamais sur un push de branche sans pull request. Il lance `npm ci`, `npm run check`, `npm run lint`, `npm run test` puis `npm run build` ; l'échec d'une étape fait échouer le workflow.

- Durée mesurée : 1 à 2 minutes par exécution (runner Linux, facturé une minute entamée par minute).
- Un nouveau commit sur une pull request annule l'exécution en cours ; durée maximale : 10 minutes.
- Le workflow ne lit aucun secret et n'a que le droit de lire le dépôt.
- Protection de `master` (fusion par pull request, workflow au vert) : à activer dans les réglages GitHub (*Settings → Branches*) si le plan le permet ; sinon, vérifier que le statut est vert avant de fusionner.

## Build Android

Le workflow `.github/workflows/build-android.yml` produit un APK **debug** (sans clé de signature). Il se lance uniquement à la main, jamais sur un push ni une pull request.

1. Onglet *Actions* de GitHub, workflow « Build Android », bouton *Run workflow*, branche `master`. Depuis une autre branche, il échoue tout de suite (« Only master can be built »).
2. Il lance `npm run test`, puis `npm run build`, `npx cap sync android` et `./gradlew assembleDebug`. Si un test échoue, rien n'est construit.
3. À la fin, l'APK est dans les *Artifacts* de l'exécution (`pistouil-debug-apk`), conservé 7 jours. Le télécharger, le décompresser et l'installer sur le téléphone.

- Durée mesurée : environ 2 minutes (runner Linux, donc environ 2 minutes facturées par build). Un seul build à la fois ; durée maximale : 10 minutes.
- L'APK contient les données de Fuveau (environ 12 Mo : manifeste, lieux, graphe piéton, tuiles de la carte, dans `static/data/fuveau/`) : le jeu se joue sans connexion, aucune variable n'est à fournir au build. Elles se régénèrent avec `tools/embedded-data/build.sh` (voir son README et `guide/ADD-COMMUNE.md`). Données dérivées d'OpenStreetMap (licence ODbL), fond de carte Protomaps : l'attribution est visible dans l'application et reste à conserver.
- Le workflow ne lit aucun secret. La version de l'application reste `1.0` (`versionCode 1`).

### Construire l'APK en local

```sh
npm run apk
```

La commande construit le site, synchronise Capacitor, lance Gradle et affiche le chemin de l'APK (`android/app/build/outputs/apk/debug/app-debug.apk`). Prérequis : un **JDK 21** (`JAVA_HOME`, par défaut `~/.local/jdk21`) et le SDK Android avec la **plateforme 36** (`ANDROID_HOME`, par défaut `~/Android/Sdk`). Si l'un manque, le script le dit et s'arrête. Pour l'installer sur un téléphone branché en USB (débogage activé) :

```sh
~/Android/Sdk/platform-tools/adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Si Android refuse la mise à jour (APK signé avec une autre clé de débogage, comme celui de GitHub), désinstaller d'abord : `adb uninstall dev.sitraka.pistouil`.

## Documents

| Fichier | Rôle |
| --- | --- |
| `docs/VISION.md` | Cap, principes, décisions, feuille de route |
| `docs/reference/DATA-MODEL.md` | Modèle de données, règles de cohérence, solveur |
| `docs/briefs/` | Un brief par étape |
| `openspec/` | Specs, changements, archives, config |
| `AGENTS.md` | Règles pour les assistants de code (`CLAUDE.md` l'importe) |
