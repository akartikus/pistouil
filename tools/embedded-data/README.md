# Données embarquées d'une commune

Produit le dossier `static/data/<commune>/` que l'application embarque : manifeste, entrée de la commune, cases de lieux, cases de graphe piéton et tuiles de la carte. Il enchaîne les outils existants (`osmium`, `tools/data-preparation/prepare.py`, `pmtiles extract`) et ne fait rien de plus. À lancer à la main quand les données changent. Spec : `openspec/changes/embed-fuveau-data` (capability `embedded-zone-data`). Pour une autre commune, voir `guide/ADD-COMMUNE.md`.

## Prérequis

- L'installation de `tools/data-preparation/` (`.venv`, voir son README) et `osmium-tool`.
- Le CLI `pmtiles` (voir `tools/map-tiles/README.md`) et l'accès à `build.protomaps.com`.
- Un extrait Geofabrik **régional** (par exemple `provence-alpes-cote-d-azur-latest.osm.pbf`) et son index des communes, produit par `prepare.py` sur cet extrait (`tools/data-preparation/out/communes.json`).

## Utilisation

```bash
tools/embedded-data/build.sh tools/data-preparation/data/provence-alpes-cote-d-azur-latest.osm.pbf 20261115
```

Arguments : l'extrait régional, la date du build Protomaps (`AAAAMMJJ`, voir `tools/map-tiles/README.md`), puis en option le code INSEE (défaut `13040`, Fuveau) et le nom du dossier (défaut `fuveau`). Variables : `INDEX` (index des communes), `PYTHON`, `PMTILES`.

## Ce que fait le script

1. Lit l'entrée de la commune dans l'index (nom, INSEE, centre, rectangle, contour).
2. Découpe l'extrait régional au rectangle de la commune élargi de 4 km, puis lance `prepare.py` dessus : la grille est fixe, les cases sont les mêmes qu'avec l'extrait régional.
3. Garde les cases du rectangle élargi de **3 km** (rayon de l'enquête de 2 km plus marge de lecture de 1 km de `game-zone`) et écrit un manifeste qui les compte.
4. Extrait du build Protomaps les tuiles du rectangle élargi de **3,3 km**, jusqu'au zoom 15.

La sortie est déterministe : aucune date d'exécution n'est écrite. `src/lib/data/embedded.spec.ts` vérifie le dossier produit (couverture, tuiles, taille sous 50 Mo).

## Taille mesurée (Fuveau, build Protomaps du 2026-11-15)

| Contenu | Taille |
| --- | --- |
| Tuiles (`fuveau.pmtiles`, zoom 0 à 15) | 6,9 Mo |
| Cases de graphe (56 fichiers) | 4,7 Mo |
| Cases de lieux (47 fichiers, 1 042 lieux) | 0,1 Mo |
| **Total** | **12 Mo** |

La production dure environ 35 secondes (la découpe de l'extrait régional et l'extraction des tuiles par le réseau en font l'essentiel).
