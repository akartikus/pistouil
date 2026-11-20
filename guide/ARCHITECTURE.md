# Architecture et structures de données

Ce guide décrit comment le projet est construit : les couches du code, les données qu'il lit, ce qui circule entre le Worker et l'interface, et la chaîne de livraison. Il ne parle pas du gameplay (voir `docs/VISION.md`) ni du moteur en détail (voir `guide/ENGINE.md`). Le modèle de données complet est dans `docs/reference/DATA-MODEL.md`.

## 1. Vue d'ensemble

```
  OSM (Geofabrik) + Protomaps          catalog/*.json (écrit à la main)
        |  (hors ligne, outils Python et shell)       |
        v                                             v
  tools/data-preparation/  -> fichiers par case    src/lib/engine/   (code PUR)
  tools/map-tiles/         -> zone.pmtiles         génération, solveur, trajets
        |                                             ^
        |  lus par fetch (VITE_DATA_URL)              |
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
  MapLibre + PMTiles (carte)           Preferences Capacitor (sauvegarde)
```

Une seule base de code SvelteKit statique (`adapter-static`, `ssr = false`) alimente le web (PWA) et les applications Capacitor (`android/` et `ios/` sont commités).

## 2. Les couches du code

| Couche | Dossier | Règle |
| --- | --- | --- |
| Moteur | `src/lib/engine` | Code pur : ni Svelte, ni DOM, ni carte, ni réseau, ni `Math.random` (générateur `mulberry32` à graine) |
| Données | `src/lib/data` | Chargement des fichiers, des cases et des tuiles, stockage des zones téléchargées |
| Jeu | `src/lib/game` | Session dans un Worker, progression, déduction, révélation, sauvegarde, écrans |
| Carte | `src/lib/map` | Composant MapLibre, fonctions pures qui produisent les entités de la carte |
| Outils | `tools/` | Préparation OSM (Python), extraction des tuiles (shell) ; jamais lancés par l'application |
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

Produits par les outils de `tools/`, lus par le jeu :

```
  manifest.json          source, date d'extraction, grille, nombre de cases, licence ODbL
  communes.json          par commune : nom, INSEE, centre, rectangle, contour simplifié
  places/{i}_{j}.json    lieux d'une case : osmId, nom, type, lat, lon
  graph/{i}_{j}.json     réseau piéton d'une case : nodes, edges, access
  zone.pmtiles           tuiles vectorielles Protomaps (schéma v4), du zoom 0 au zoom 15
```

- **Grille fixe de 2 km** : pas de 0,018° en latitude et de 0,025° en longitude, calcul sur entiers. Les cases se calculent sans table et la sortie est déterministe (aucune date d'exécution).
- **Graphe piéton contracté par case** : coordonnées en entiers (degrés × 100 000) ; seuls les carrefours et les extrémités sont des nœuds ; chaque lieu est rattaché au segment de rue le plus proche (300 m au plus). Un trajet que le réseau ne relie pas est estimé à vol d'oiseau × 1,3 et marqué `approximate`.
- **Une case sans fichier** est traitée comme vide.

## 5. Ce qui traverse les frontières

- **Interface vers Worker** (`src/lib/game/protocol.ts`) : `start`, `resume`, `open`, `measure`, `accuse`.
- **Worker vers interface** : une **projection** (`projection.ts`). Ni l'auteur, ni le mensonge, ni la vraie soirée, ni le texte de révélation ne sortent avant l'accusation : c'est ce qui garde la déduction au joueur.
- **Sauvegarde** (`save.ts`) : seulement la graine, la difficulté, la zone (centre, rayon, nom), la version des données et la progression, dans Capacitor Preferences. L'enquête est **régénérée à l'identique** à la reprise ; si la version des données a changé, la reprise est refusée plutôt que régénérée autrement.
- **Génération** : la zone compte au plus 40 lieux utilisables, les plus proches du centre ; le rayon grandit par paliers jusqu'à réunir assez de lieux ; le solveur rejette toute enquête dont la solution n'est pas unique ou pas atteignable.

## 6. Chaîne de livraison

- `.github/workflows/test.yml` : `check`, `lint`, `test` et `build` sur chaque pull request et sur chaque push sur `master` (1 à 2 minutes).
- `.github/workflows/build-android.yml` : lancement manuel, `master` seulement, tests puis APK debug en artefact (environ 2 minutes). Le build iOS est reporté : pas de compte Apple Developer.
- Les changements passent par OpenSpec (proposer, appliquer, archiver), et les décisions d'orientation vivent dans `docs/VISION.md` (voir `guide/OPENSPEC.md`).

## 7. Évolution en cours

Le changement `embed-fuveau-data` (`openspec/changes/`) remplace la lecture des données par réseau ou par zones téléchargées par un jeu de données de Fuveau embarqué dans l'application : plus de mode hors ligne par téléchargement, deux boutons de départ, rayon maximal de 2 km. Quand il sera archivé, mettre à jour les parties 1, 2, 4 et 5 de ce guide.
