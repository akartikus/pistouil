# Proposal

## Why

Les trajets du moteur sont aujourd’hui fournis à la main ou estimés à vol d’oiseau, ce qui ne dit rien de la vraie marche entre deux lieux : or le jeu se joue sur « alibi contre temps de marche ». Il faut calculer sur l’appareil de vrais trajets à pied, à partir du réseau de rues OSM préparé hors ligne. Source : `docs/briefs/03-routes.md`.

## What Changes

- **Préparation (Python, `tools/data-preparation/`)** : le script produit, par case de 2 km, un graphe piéton compact (nœuds à coordonnées entières, arêtes de longueur entière en mètres, formes pour le tracé) et rattache chaque lieu au segment de rue le plus proche. Voies écartées : autoroutes, voies rapides, `foot=no`, `access=private` ; sens uniques ignorés.
- **Calcul (TypeScript pur, `src/lib/engine/`)** : assemblage du graphe de la zone à partir des cases, puis Dijkstra depuis chaque lieu de l’enquête, arrêté quand tous les autres lieux sont atteints. Sortie : un `Route` par paire (`distanceM`, `minutes` à 5 km/h, `geometry`).
- **Secours** : deux lieux non reliés par le réseau (ou un lieu sans rattachement) reçoivent une approximation à vol d’oiseau × 1,3, marquée `approximate`.
- **Générateur** : une fois la scène choisie, il écarte les lieux dont le trajet vers la scène est approximatif.
- **Playground** : la source « Vrais lieux » utilise le graphe quand ses fichiers sont dans `static/dev-data/graph/`, sinon l’estimation actuelle.

**Exclu** (comme le brief) : trajets vers un point libre, pentes, feux et traversées, affichage (brief 04). Hors de ce changement : chargement des cases et branchement dans un Web Worker (brief 05).

## Capabilities

### New Capabilities
- `pedestrian-graph-preparation` : graphe piéton par case et rattachement des lieux, produits par le script Python.
- `pedestrian-routing` : assemblage du graphe, trajets par les rues, secours, déterminisme (module pur du moteur).

### Modified Capabilities
- `investigation-generation` : les lieux à trajet approximatif vers la scène ne sont pas retenus.
- `engine-playground` : les vrais lieux peuvent utiliser le réseau piéton (l’exigence sur les trajets estimés est précisée).

## Impact

- `tools/data-preparation/` : nouveau module de graphe appelé par `prepare.py`, tests, `README.md`, `requirements.txt` si besoin.
- `src/lib/engine/` : nouveau module de trajets et ses tests ; `types.ts` (`Route.approximate?`) ; `generate.ts` (filtre des lieux) et ses tests.
- `src/lib/playground/` et `src/routes/playground/+page.svelte` : lecture des fichiers de graphe, trajets réels.
- `docs/reference/DATA-MODEL.md` §5 (`approximate`, ordre de `geometry`), `docs/VISION.md` (§6 et étape 3).
