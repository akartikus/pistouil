# Ajouter une commune

Aujourd'hui le jeu ne couvre que **Fuveau**, avec ses données dans l'application. Ce guide dit comment préparer les données d'une autre commune, ce que le code suppose encore d'une seule commune, et ce qui devra changer quand il y en aura plusieurs. Le fonctionnement général est dans `guide/ARCHITECTURE.md`.

## 1. Préparer les données de la commune

Prérequis : `tools/data-preparation/` installé (voir son README), `osmium-tool`, le CLI `pmtiles` et un extrait Geofabrik **régional** qui contient la commune. L'index des communes de cet extrait (`tools/data-preparation/out/communes.json`) doit exister : lancer `prepare.py` sur l'extrait régional si besoin.

```bash
tools/embedded-data/build.sh tools/data-preparation/data/<region>-latest.osm.pbf <AAAAMMJJ> <insee> <dossier>
```

La commande écrit `static/data/<dossier>/` : manifeste, entrée de la commune (`commune.json`), cases de lieux, cases de graphe et `<dossier>.pmtiles`. Le détail de ce qu'elle fait et les tailles mesurées sont dans `tools/embedded-data/README.md`. La sortie est déterministe : relancée sur les mêmes sources, elle donne les mêmes fichiers.

## 2. Ce que le code suppose encore d'une seule commune

La commande ne suffit pas : l'application lit une seule commune.

| Où | Hypothèse |
| --- | --- |
| `src/lib/data/files.ts` | `DATA_BASE` (`/data/fuveau`) et `TILES_URL` fixent le seul dossier lu |
| `src/lib/game/shipped.ts` | lit l'entrée et les tuiles de ce dossier |
| `src/routes/+page.svelte` | deux boutons : « Je me localise » (accepté dans le contour de la commune) et « Fuveau » |
| `src/lib/data/embedded.spec.ts` | contrôle le dossier `static/data/fuveau` |
| `docs/VISION.md`, specs `game-zone`, `game-screens`, `embedded-zone-data` | décrivent Fuveau comme seule commune |

Pour plusieurs communes : un dossier par commune, un choix de commune à l'écran de départ, une adresse de données qui dépend de la commune, le test de couverture paramétré par commune, et les specs mises à jour par un changement OpenSpec.

## 3. Ce qui devrait passer en ligne

Fuveau pèse environ 12 Mo (tuiles 6,9 Mo, graphe 4,7 Mo, lieux 0,1 Mo). Avec une limite de 50 Mo pour l'application, trois ou quatre communes de cette taille au plus peuvent encore être embarquées. Au-delà, les données doivent venir d'un hébergement. Ce que cela impliquerait :

- **Hébergement statique** des dossiers de communes, avec CORS et requêtes à plages d'octets pour les tuiles (le PMTiles se lit alors par plages d'octets, pas en entier en mémoire).
- **Index des communes** (`communes.json`) pour retrouver une commune par son nom, que l'application n'embarque plus.
- **Téléchargement d'une zone** pour jouer hors ligne : une zone de 2 km autour du centre, téléchargée une seule fois, avec un stockage de fichiers sur l'appareil (`@capacitor/filesystem` en natif, IndexedDB sur le web). Cette logique a été écrite, puis retirée par le changement `embed-fuveau-data` ; elle se retrouve dans l'historique git (commit `020ed56`) et dans le changement archivé `add-offline-mobile` (`design.md`).
- **Règle sur le réseau** : « aucune requête réseau pendant une partie » (`AGENTS.md`, principe 6 de `docs/VISION.md`) deviendrait « seulement hors du mode hors ligne » ; à rediscuter dans `VISION.md` avant de coder.

## 4. Attribution

Les données sont dérivées d'OpenStreetMap (licence ODbL) et le fond de carte de Protomaps. L'attribution reste visible dans l'application (bouton « i » de l’en-tête des écrans de carte et écran À propos). Le dépôt et l'APK redistribuent une base dérivée : à revoir avant d'ouvrir le dépôt au public.
