# Préparation des données OSM

Transforme un extrait Geofabrik `.osm.pbf` en fichiers de lieux par case de 2 km, plus un index des communes, un manifeste et un rapport. À lancer à la main, une fois par mois. Spec : `openspec/specs/osm-place-extraction` et `commune-index` (ou le changement `add-osm-data-preparation`).

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
| `communes.json` | Nom, code INSEE, centre, rectangle englobant, contour simplifié (`[lon, lat]`, comme GeoJSON) |
| `manifest.json` | Source, date de l'extrait, licence ODbL, pas de la grille |
| `report.json` | Lieux `scene`, `alibi`, `excluded` par commune ; identifiants de retrait inconnus |

Case : `ligne = floor(lat × 100000 / 1800)`, `colonne = floor(lon × 100000 / 2500)` (coordonnées arrondies à 5 décimales).

## Essayer les lieux dans le playground

Pour voir le moteur sur de vrais lieux (`npm run dev`, page `/playground`, source « Vrais lieux »), copier une sortie du script dans `static/dev-data/` (ignoré par git) :

```bash
mkdir -p static/dev-data && cp -r tools/data-preparation/out/manifest.json tools/data-preparation/out/places static/dev-data/
```

## Tests

```bash
.venv/bin/pytest
```
