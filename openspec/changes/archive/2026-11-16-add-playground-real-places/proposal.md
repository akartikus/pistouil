# Proposal

## Why

Le moteur n'a été essayé que sur des lieux fictifs. Les données OSM sont prêtes (changement `add-osm-data-preparation`) et le `Place` du modèle accepte déjà de vrais lieux : il manque seulement un moyen de les essayer dans le playground, avant le chargement réel des cases du brief 05 et les trajets du brief 03. Source : demande directe, hors brief.

## What Changes

- Le playground peut utiliser, au choix, le jeu de lieux de test ou quelques dizaines de vrais lieux issus des fichiers de `tools/data-preparation/`.
- Les vrais lieux sont choisis autour d'un centre (latitude, longitude) : les plus proches, jusqu'à un nombre donné (quelques dizaines).
- Une petite conversion transforme un lieu des fichiers en `Place` du modèle ; `openingHours` est ignoré, donc les horaires typiques du catalogue s'appliquent.
- Les trajets entre ces lieux sont des estimations à vol d'oiseau (même formule que le jeu de test riche), en attendant le réseau piéton du brief 03.
- Les fichiers sont lus depuis `static/dev-data/` (copie de la sortie du script, ignorée par git) ; leur absence est signalée dans la page, sans erreur.

**Exclu** : chargement réel des cases et construction de la zone (brief 05), trajets sur le réseau piéton (brief 03), horaires réels, tout changement du moteur ou du modèle, toute utilisation en production (la page reste réservée au développement).

## Capabilities

### New Capabilities
<!-- Aucune. -->

### Modified Capabilities
- `engine-playground`: la page peut aussi s'exécuter sur de vrais lieux (nouvelles exigences uniquement, les existantes ne changent pas).

## Impact

- `src/lib/playground/` : logique pure (conversion, sélection autour d'un centre, trajets à vol d'oiseau) et ses tests.
- `src/routes/playground/+page.svelte` : choix de la source de lieux, centre et nombre de lieux, lecture des fichiers.
- `.gitignore` (`static/dev-data`), `tools/data-preparation/README.md` (comment copier la sortie).
- `docs/VISION.md` : une décision au §6.
- Aucun changement dans `src/lib/engine` ni dans `catalog/`.
