# Tuiles de la carte

Extrait d'un build Protomaps un fichier PMTiles régional, lu par la carte en requêtes de plages d'octets depuis un hébergement statique. À lancer à la main, de temps en temps. Spec : changement `add-map-identity` (capability `map-style`).

Les données sont © les contributeurs OpenStreetMap (ODbL) ; le schéma de tuiles est celui de Protomaps (basemap v4) : les deux attributions restent visibles sur la carte.

## Installation

Le CLI `pmtiles` est un binaire unique (https://github.com/protomaps/go-pmtiles/releases), par exemple :

```bash
mkdir -p ~/.local/bin && cd "$(mktemp -d)"
curl -L -o pmtiles.tar.gz https://github.com/protomaps/go-pmtiles/releases/download/v1.31.2/go-pmtiles_1.31.2_Linux_x86_64.tar.gz
tar xzf pmtiles.tar.gz pmtiles && mv pmtiles ~/.local/bin/
```

## Utilisation

```bash
tools/map-tiles/extract.sh 20261115                    # PACA, zoom 15 au plus
tools/map-tiles/extract.sh 20261115 5.3,43.3,5.7,43.6 15   # autre rectangle (lon/lat), zoom maximal
```

Le build (`AAAAMMJJ`) est une date de https://maps.protomaps.com/builds/. Le fichier est écrit dans `tools/map-tiles/out/zone.pmtiles` (ignoré par git). Pour la page `/map` :

```bash
mkdir -p static/dev-data/map && cp tools/map-tiles/out/zone.pmtiles static/dev-data/map/
```

Les bâtiments individuels n'existent qu'à partir du zoom 15 (en dessous, ils sont fusionnés) : c'est ce niveau qui permet de colorer le bâtiment d'un lieu.

## Tuiles embarquées d'une commune

Le jeu ne lit plus l'extrait régional : il embarque le PMTiles d'une seule commune. `tools/embedded-data/build.sh` appelle ce script avec le rectangle de la commune élargi de 3,3 km (voir `tools/embedded-data/README.md`, Fuveau : 6,9 Mo). L'extrait régional ci-dessus ne sert plus qu'à la page de développement `/map`.

## Poids mesuré

Build Protomaps du 2026-11-16, PACA (rectangle `4.2,42.9,7.8,45.2`), zoom 15 au plus : **610 Mo** (609 895 275 octets, 128 520 tuiles). Au zoom 14 le fichier ferait 289 Mo, mais les bâtiments y sont fusionnés : on garde le zoom 15, nécessaire pour colorer le bâtiment d'un lieu. Le CLI lit l'archive source par requêtes de plages d'octets : l'extraction a transféré 640 Mo en quelques minutes.
