# Tasks

## 1. Cap et documents d'abord

- [x] 1.1 Mettre à jour `docs/VISION.md` : §1 et §2 (Fuveau seule pour le moment, deux boutons), §3 (moteur pour n'importe quel lieu, première version limitée à Fuveau), principe 6 (aucune requête réseau pendant la partie, toujours), §6 (tuiles et données embarquées, rayon 500 m à 2 km, ligne du mode hors ligne remplacée, ligne CI/CD sans hébergement à décider) ; vérifier par relecture du diff qu'aucune ligne ne parle encore de choix de commune, de zone téléchargée ou de PACA comme données du jeu
- [x] 1.2 Mettre à jour `AGENTS.md` (règle réseau : « aucune requête réseau pendant une partie, seuls les fichiers de l'application sont lus ») ; vérifier par `grep -n "zone téléchargée" AGENTS.md` sans résultat
- [x] 1.3 Reformuler directement la section Purpose de `openspec/specs/commune-index/`, `offline-tiles/` et `device-storage/` (hors delta) ; vérifier avec `openspec validate --specs`

## 2. Jeu de données de Fuveau

- [x] 2.1 Écrire `src/lib/data/embedded.spec.ts`, qui lit `static/data/fuveau/` : manifeste et entrée de Fuveau présents, toutes les cases de lieux et de graphe de la couverture (contour plus 3 km) existent ou sont absentes sans trou, tuiles présentes, taille totale sous 50 Mo ; vérifier qu'il échoue tant que le dossier n'existe pas
- [x] 2.2 Écrire `tools/embedded-data/build.sh` (extrait `osmium`, `prepare.py`, `extract.sh`, copie dans `static/data/fuveau/`) avec un README court ; vérifier avec `shellcheck` si disponible et en lançant la commande jusqu'au bout
- [x] 2.3 Produire `static/data/fuveau/`, vérifier que `embedded.spec.ts` passe, noter les tailles mesurées (données, tuiles, cases, graphe) dans `tools/embedded-data/README.md`
- [x] 2.4 Relancer la commande et vérifier que `git status` ne montre aucune différence dans `static/data/fuveau/` (sortie déterministe)

## 3. Logique pure

- [x] 3.1 Écrire les tests de `insideContour` (centre de Fuveau dedans, un point d'Aix-en-Provence dehors, un point juste hors contour) puis l'implémenter dans `src/lib/map/zone.ts` ; vérifier avec `npm run test`
- [x] 3.2 Adapter les tests de `src/lib/game/zone.spec.ts` (paliers 500 m, 1 km, 2 km, plus de voisines) puis `zone.ts` : retirer `OFFLINE_RADII_M`, le palier 4 000 et `neighborCommunes` ; vérifier avec `npm run test`
- [x] 3.3 Adapter `session.spec.ts` puis `session.ts` et `protocol.ts` : plus de source `communes`, plus de voisines dans l'échec, plus de pont `FileRequest`, `FileReply` ni `OfflineZone` ; ajouter un test de reprise d'une sauvegarde au centre hors de Fuveau, refusée sans régénération ; vérifier avec `npm run test`

## 4. Lecture des données et de la carte

- [x] 4.1 Adapter `files.spec.ts` puis `files.ts` : lecture de l'entrée de Fuveau, plus de `createZoneSource` ; adresse unique `/data/fuveau` dans `engine.worker.ts` ; vérifier avec `npm run test`
- [x] 4.2 Écrire le test de la source de tuiles lue en entier en mémoire (réponses par tranches, un seul `fetch`) puis l'implémenter dans `src/lib/data/` ; vérifier avec `npm run test`
- [x] 4.3 Brancher cette source dans `src/routes/play/carte/` et `src/routes/play/reveal/` (entrée de Fuveau pour le masque hors commune) ; les pages `/map` et `/playground` gardent `dev-data` ; vérifier avec `npm run dev` : la carte de Fuveau s'affiche sans `static/dev-data`

## 5. Interface et suppressions

- [x] 5.1 Écrire l'écran de départ à deux boutons dans `src/routes/+page.svelte` (« Je me localise » : refus avec message hors du contour, « Fuveau »), adapter `texts.ts` et `locate.ts` ; vérifier en `npm run dev` : les deux parcours, la position refusée, la position hors de Fuveau
- [x] 5.2 Retirer de `src/routes/reglages/` le mode hors ligne et les zones, le réglage et la clé `pistouil.offline` de `settings.svelte.ts` (et de `settings.spec.ts`), l'appel `offline.load()` de `+layout.ts` ; vérifier que les Réglages ne montrent plus de mode hors ligne
- [x] 5.3 Supprimer `offline.svelte.ts`, `data/zones.ts`, `data/store.ts`, `data/tiles.ts` et leurs tests, et adapter `game.svelte.ts` ; vérifier avec `npm run check`, `npm run lint` et `npm run test`
- [x] 5.4 Vérifier par recherche dans `src/` si `@capacitor/filesystem` sert encore ; sinon le retirer de `package.json`, puis `npm run build` et `npx cap sync android` ; vérifier que la liste des plugins Capacitor ne contient plus `@capacitor/filesystem`

## 6. PWA

- [x] 6.1 Ajouter `static/manifest.webmanifest`, les icônes de l'application et la balise dans `src/app.html` (reprend 7.1 de `add-offline-mobile`) ; vérifier avec l'audit installable de Chrome (DevTools, Application)
- [x] 6.2 Ajouter `src/service-worker.ts` (fichiers du build et `static/data/fuveau/`) et son enregistrement (reprend 7.2) ; vérifier avec `npm run build && npm run preview` : l'application démarre et une enquête se joue en mode avion après une première visite

## 7. Documentation et vérifications réelles

- [x] 7.1 Écrire `guide/ADD-COMMUNE.md` (ajout d'une commune, ce qui passerait en ligne, ce qu'il faudrait recréer pour le téléchargement par zone) et le lier depuis `README.md` ; vérifier par relecture que chaque commande citée existe
- [x] 7.2 Mettre à jour `README.md` (paragraphe « Build Android » : l'APK contient ses données ; rappel ODbL) et `tools/map-tiles/README.md` (exemple Fuveau) ; vérifier avec `npx prettier --check README.md tools guide`
- [x] 7.3 Vérifier sur un navigateur, en mode avion et avec l'onglet Réseau ouvert, qu'aucune requête n'est faite pendant une enquête à Fuveau, de l'écran de départ à la révélation
- [ ] 7.4 Lancer « Build Android » sur `master` après fusion, mesurer la taille de l'APK (moins de 50 Mo), l'installer, jouer une enquête en mode avion et la terminer, carte comprise ; la mesure et le résultat sont notés dans le README
- [ ] 7.5 Mettre à jour `docs/VISION.md` (feuille de route : étape 6 faite sans téléchargement de zones, étape 7 à jour ; décisions : Fuveau seule, données embarquées, rayon 2 km, retrait du mode hors ligne) ; vérifier par relecture du diff

## Workflow follow-up

- Archiver le changement après fusion : les 7 `REMOVED` d'`offline-mode` retirent la capability (marqueur `retire_capabilities` du changement).
- Les tâches 9.1 à 9.4 non faites de `add-offline-mobile` sont remplacées par 7.3 et 7.4 (iOS reste exclu, faute de compte Apple Developer).
