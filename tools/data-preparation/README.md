# Préparation des données OSM

Transforme un extrait Geofabrik `.osm.pbf` en fichiers de lieux et de graphe piéton par case de 2 km, plus un index des communes, un manifeste et un rapport. À lancer à la main, une fois par mois. Spec : `openspec/specs/osm-place-extraction` et `commune-index` (changement `add-osm-data-preparation`) ; graphe piéton : changement `add-pedestrian-routes`.

## Installation

```bash
cd tools/data-preparation
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

`osmium-tool` (paquet `osmium-tool`) n'est utile que pour découper un petit extrait (`osmium extract`) ; le script lui-même n'en a pas besoin.

## Utilisation

```bash
.venv/bin/python prepare.py --input provence-alpes-cote-d-azur-latest.osm.pbf --out out
```

Options : `--catalog` (défaut `../../catalog/place-types.json`) et `--removed` (défaut `../../catalog/removed-places.json`).

## Sorties (dans `--out`)

| Fichier | Contenu |
| --- | --- |
| `places/{ligne}_{colonne}.json` | Lieux d'une case (`osmId`, `name`, `type`, `lat`, `lon`, `openingHours?`, `removed?`) |
| `graph/{ligne}_{colonne}.json` | Graphe piéton d'une case (voir ci-dessous) |
| `communes.json` | Nom, code INSEE, centre, rectangle englobant, contour simplifié (`[lon, lat]`, comme GeoJSON) |
| `manifest.json` | Source, date de l'extrait, licence ODbL, pas de la grille |
| `report.json` | Lieux `scene`, `alibi`, `excluded` par commune ; identifiants de retrait inconnus ; `graph` : nombre de cases, nœuds, arêtes, lieux sans rattachement, taille de la plus grosse case |

Case : `ligne = floor(lat × 100000 / 1800)`, `colonne = floor(lon × 100000 / 2500)` (coordonnées arrondies à 5 décimales).

## Graphe piéton

Voies retenues : `residential`, `service`, `pedestrian`, `footway`, `path`, `steps`, `track`, `cycleway`, `living_street`, `unclassified`, `tertiary`, `secondary`, `primary`, sauf `foot=no` et `access=private` ; sens uniques ignorés. Chaque fichier `graph/{ligne}_{colonne}.json` (même grille que les lieux) contient :

```json
{
  "nodes": [[idOsm, lat5, lon5]],
  "edges": [[nœudA, nœudB, longueurM, [[lat5, lon5]]]],
  "access": { "n123": [nœudA, nœudB, accèsM, positionM, longueurArêteM] }
}
```

- Coordonnées en entiers (degrés × 100 000). Seuls les carrefours et extrémités sont des nœuds ; les autres points forment la forme de l'arête (`[lat5, lon5]`, de A vers B). La longueur est un entier de mètres, arrondi une seule fois.
- Une arête à cheval sur deux cases est écrite dans les deux ; un nœud n'est décrit que dans sa case.
- `access` : pour chaque lieu de la case, le segment le plus proche (ses deux nœuds, distance d'accès, position depuis le nœud A, longueur de l'arête). Au-delà de 300 m, le lieu n'a pas de rattachement.

Mesures (extrait PACA complet) : 14 min et 3,9 Go de mémoire au plus ; 8 366 cases de graphe, 261 Mo (71 Mo compressés), la plus grosse 532 Ko (145 Ko compressée), 10 lieux sans rattachement. Sur une machine à moins de 4 Go, découper un extrait plus petit avec `osmium extract`.

## Essayer les lieux dans le playground

Pour voir le moteur sur de vrais lieux (`npm run dev`, page `/playground`, source « Vrais lieux »), copier une sortie du script dans `static/dev-data/` (ignoré par git ; `graph/` donne de vrais trajets, sans lui ils sont estimés à vol d'oiseau ; `communes.json` sert à la page `/map`) :

```bash
mkdir -p static/dev-data && cp -r tools/data-preparation/out/manifest.json tools/data-preparation/out/communes.json tools/data-preparation/out/places tools/data-preparation/out/graph static/dev-data/
```

## Tests

```bash
.venv/bin/pytest
```
