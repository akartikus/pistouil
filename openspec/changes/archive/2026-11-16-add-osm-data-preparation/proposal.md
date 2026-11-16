# Proposal

## Why

Le moteur ne tourne aujourd'hui que sur des lieux de test écrits à la main. Pour jouer sur de vrais lieux, sans aucune API externe pendant la partie, il faut transformer un extrait OpenStreetMap en petits fichiers statiques de lieux, plus un index des communes. Source : `docs/briefs/02-osm-data.md`.

## What Changes

- Un script Python lancé à la main, une fois par mois, qui lit un extrait Geofabrik `.osm.pbf` (d'abord Provence-Alpes-Côte d'Azur) et le filtre avec osmium.
- La correspondance tags OSM → `PlaceType` est lue dans `osmTags` du catalogue, jamais codée en dur.
- Seuls les objets nommés et correspondant à un `PlaceType` sont gardés ; les lieux de rôle `excluded` nommés sont conservés et marqués pour le décor. Les adresses ne sont pas extraites.
- Les surfaces et les lignes deviennent un point représentatif (centroïde, ou point intérieur si le centroïde sort du polygone) ; un objet OSM donne un seul lieu.
- `opening_hours` est conservé en texte brut quand il existe, sans analyse.
- Une liste de retrait `catalog/removed-places.json` (identifiants OSM) marque les lieux `removed`.
- Sortie : un fichier JSON par case de grille de 2 km (deux pas fixes en degrés), un index des communes (nom, code INSEE, centre, rectangle englobant, contour simplifié), un manifeste (date, source, licence ODbL, pas de la grille) et un rapport par commune (nombre de lieux `scene`, `alibi`, `excluded`).
- Sortie déterministe à l'octet près.
- Premier passage sur un petit extrait autour de Fuveau, puis sur l'extrait régional.

**Exclu** (repris du brief) : réseau de rues et trajets (brief 03), fond de carte (brief 04), hébergement et chargement dans l'application (briefs 05 et 06), analyse des horaires réels.

## Capabilities

### New Capabilities
- `osm-place-extraction`: extraction des lieux d'un extrait OSM selon le catalogue, rangés dans exactement une case de grille, avec retrait, manifeste, rapport et sortie déterministe.
- `commune-index`: index des communes permettant de retrouver une commune par son nom (centre, rectangle englobant, contour simplifié).

### Modified Capabilities
<!-- Aucune : le catalogue et le moteur ne changent pas. -->

## Impact

- Nouveau : `tools/data-preparation/` (script Python, dépendances, tests du script, extrait de test autour de Fuveau).
- Nouveau : `catalog/removed-places.json`.
- Sorties générées : dossier de données de lieux (emplacement à fixer dans le design) ; non chargées par l'application dans ce changement.
- Lecture seule : `catalog/place-types.json` (champs `osmTags`, `role`).
- Documentation : `docs/VISION.md` (décisions, feuille de route).
