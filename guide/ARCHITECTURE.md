# Architecture et structures de données

Ce guide décrit comment le projet est construit : les couches du code, les données qu'il lit, ce qui circule entre le Worker et l'interface, et la chaîne de livraison. Il ne parle pas du gameplay (voir `docs/VISION.md`) ni du moteur en détail (voir `guide/ENGINE.md`). Le modèle de données complet est dans `docs/reference/DATA-MODEL.md`. Pour ajouter une commune, voir `guide/ADD-COMMUNE.md`.

## 1. Vue d'ensemble

```
  OSM (Geofabrik) + Protomaps          catalog/*.json (écrit à la main)
        |  (hors ligne, outils Python et shell)       |
        v                                             v
  tools/data-preparation/  -> cases de lieux et     src/lib/engine/   (code PUR)
  tools/map-tiles/            de graphe, tuiles     génération, solveur, trajets
        |                                             ^
  tools/embedded-data/build.sh                        |
        |  (une commune)                              |
        v                                             |
  static/data/fuveau/  = fichiers de l'application    |
        |  lus par fetch ("/data/fuveau")             |
        v                                             |
  +----------------------- Web Worker ---------------+---+
  |  src/lib/game/engine.worker.ts + session.ts           |
  |  charge la zone, calcule les trajets, GÉNÈRE,         |
  |  garde l'enquête complète (auteur, mensonge...)       |
  +----------------------+--------------------------------+
                         |  messages (protocol.ts) : une PROJECTION seulement
                         v
  Interface Svelte (src/routes, src/lib/game/*.svelte.ts, src/lib/map/Map.svelte)
        |                                    |
        v                                    v
  MapLibre + PMTiles (carte)           Preferences Capacitor (sauvegarde, thème)
```

Une seule base de code SvelteKit statique (`adapter-static`, `ssr = false`) alimente le web (PWA) et les applications Capacitor (`android/` et `ios/` sont commités). Les données de **Fuveau**, la seule commune pour le moment, sont des fichiers de l'application : le jeu ne fait aucune requête réseau pendant une partie.

## 2. Les couches du code

| Couche | Dossier | Règle |
| --- | --- | --- |
| Moteur | `src/lib/engine` | Code pur : ni Svelte, ni DOM, ni carte, ni réseau, ni `Math.random` (générateur `mulberry32` à graine) |
| Données | `src/lib/data` | Lecture des fichiers de données (manifeste, entrée de la commune, cases de lieux et de graphe) et source de tuiles lue en entier en mémoire |
| Jeu | `src/lib/game` | Session dans un Worker, progression, déduction, révélation, sauvegarde, écrans ; `shipped.ts` donne à l'interface l'entrée de Fuveau et ses tuiles |
| Carte | `src/lib/map` | Composant MapLibre, fonctions pures qui produisent les entités de la carte (dont `insideContour`) |
| Outils | `tools/` | Préparation OSM (Python), extraction des tuiles (shell), production des données embarquées ; jamais lancés par l'application |
| Contenu | `catalog/` | JSON : types de lieux, indices, scénarios, objets, prénoms, gabarits de témoignage |

## 3. Deux couches de données

- **Catalogue** : écrit à la main, versionné ; il change quand on ajoute du contenu. Une ligne de plus enrichit toutes les enquêtes futures sans toucher au code.
- **Enquête** : produite par le générateur à partir de lieux réels et d'une graine, puis complétée par la progression du joueur.

Types centraux (`src/lib/engine/types.ts`) :

| Type | Rôle |
| --- | --- |
| `Place` | Lieu OSM avec son type et son rôle (`scene`, `alibi` ou `excluded`) |
| `Route`, `Segment` | Trajet à pied entre deux lieux |
| `Character` | Suspect fictif |
| `Clue`, `Testimony` | Les deux sortes de `Source` d'un fait |
| `Fact` | Ce que le joueur découvre en ouvrant un lieu |
| `Investigation` | L'enquête complète, solution comprise |

Conventions : heures en minutes depuis minuit (entiers), distances en mètres entiers, identifiants en chaînes.

## 4. Les fichiers de données

Les fichiers de la commune sont dans `static/data/fuveau/` (environ 12 Mo, commités), copiés dans l'application par SvelteKit, donc présents dans l'APK et dans la PWA. Ils sont produits par `tools/embedded-data/build.sh`, qui enchaîne les outils de préparation (voir son README) :

```
  manifest.json          source et date de l'extrait régional, grille, nombre de cases, licence ODbL
  commune.json           l'entrée de la commune : nom, INSEE, centre, rectangle, contour
  places/{i}_{j}.json    lieux d'une case : osmId, nom, type, lat, lon
  graph/{i}_{j}.json     réseau piéton d'une case : nodes, edges, access
  fuveau.pmtiles         tuiles vectorielles Protomaps (schéma v4), du zoom 0 au zoom 15
```

- **Couverture** : le contour de la commune élargi de 3 km pour les lieux et le graphe (rayon de l'enquête de 2 km plus marge de lecture de 1 km), de 3,3 km pour les tuiles.
- **Adresse unique** : `DATA_BASE` (`/data/fuveau`) et `TILES_URL` dans `src/lib/data/files.ts` ; aucune variable à fournir à la construction.
- **Tuiles** : le fichier est lu une seule fois en entier et servi depuis la mémoire (`whole-file-source.ts`), sans dépendre des requêtes de plages d'octets de l'hôte.
- **Grille fixe de 2 km** : pas de 0,018° en latitude et de 0,025° en longitude, calcul sur entiers. Les cases se calculent sans table et la sortie est déterministe (aucune date d'exécution).
- **Graphe piéton contracté par case** : coordonnées en entiers (degrés × 100 000) ; seuls les carrefours et les extrémités sont des nœuds ; chaque lieu est rattaché au segment de rue le plus proche (300 m au plus). Un trajet que le réseau ne relie pas est estimé à vol d'oiseau × 1,3 et marqué `approximate`.
- **Une case sans fichier** est traitée comme vide.
- **Données de développement** : `static/dev-data/` (non commité, extrait régional PACA de plusieurs centaines de Mo) ne sert plus qu'au `/playground` et à la page `/map`, qui ne tournent qu'en développement.

## 5. Ce qui traverse les frontières

- **Départ** : deux boutons. « Fuveau » prend le centre de la commune ; « Je me localise » prend la position de l'appareil, acceptée seulement à l'intérieur du contour de Fuveau (`insideContour`).
- **Interface vers Worker** (`src/lib/game/protocol.ts`) : `start`, `resume`, `open`, `measure`, `accuse`.
- **Worker vers interface** : une **projection** (`projection.ts`). Ni l'auteur, ni le mensonge, ni la vraie soirée, ni le texte de révélation ne sortent avant l'accusation : c'est ce qui garde la déduction au joueur.
- **Sauvegarde** (`save.ts`) : seulement la graine, la difficulté, la zone (centre, rayon, nom), la version des données et la progression, dans Capacitor Preferences. L'enquête est **régénérée à l'identique** à la reprise. Elle est refusée plutôt que régénérée autrement quand la version des données a changé, ou quand son centre n'a pas de données (une autre commune que Fuveau) : le Worker répond alors `data-changed`.
- **Génération** : la zone compte au plus 40 lieux utilisables, les plus proches du centre ; le rayon grandit de 500 m à 1 km puis 2 km jusqu'à réunir assez de lieux, sans dépasser 2 km ; le solveur rejette toute enquête dont la solution n'est pas unique ou pas atteignable.

## 6. Chaîne de livraison

- `.github/workflows/test.yml` : `check`, `lint`, `test` et `build` sur chaque pull request et sur chaque push sur `master` (1 à 2 minutes).
- `.github/workflows/build-android.yml` : lancement manuel, `master` seulement, tests puis APK debug en artefact (environ 2 minutes). L'APK contient les données de Fuveau (environ 14 Mo mesurés pour la version construite en local). Le build iOS est reporté : pas de compte Apple Developer.
- **PWA** : le Service Worker (`src/service-worker.ts`) met en cache tous les fichiers de l'application, données et tuiles de Fuveau comprises, pour jouer sans connexion après une première visite.
- Les changements passent par OpenSpec (proposer, appliquer, archiver), et les décisions d'orientation vivent dans `docs/VISION.md` (voir `guide/OPENSPEC.md`).

## 7. Limites actuelles

- **Une seule commune** : l'adresse des données, l'écran de départ et le test de couverture (`embedded.spec.ts`) supposent Fuveau. `guide/ADD-COMMUNE.md` liste ce qui change pour en ajouter, et ce qui passerait en ligne au-delà de quelques communes (hébergement, index des communes, téléchargement par zone).
- **Pas de mode hors ligne à choisir** : le jeu est hors ligne par construction. Le téléchargement de zones, étudié dans le changement archivé `add-offline-mobile`, a été retiré et reste dans l'historique git.
