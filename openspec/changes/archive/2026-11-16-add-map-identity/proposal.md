# Proposal

## Why

Le joueur doit voir l’enquête sur une carte, pour n’importe quelle commune, avec l’identité du jeu : lieux de l’enquête et lieu du mystère reconnaissables au premier coup d’œil, lieux de décor discrets, trajets lisibles. Les lieux (brief 02) et les trajets (brief 03) existent ; il manque le fond de carte, son style et les couches du jeu. Source : `docs/briefs/04-map.md`, avec la direction artistique validée dans `docs/design/direction.md`.

## What Changes

- **Style maison** : deux fichiers MapLibre séparés dans `static/map/` (clair et sombre) sur des tuiles vectorielles PMTiles du schéma Protomaps, avec polices (glyphes) et icônes embarquées, palette de `docs/design/direction.md`.
- **Tuiles hors ligne** : un script documenté extrait un fichier PMTiles régional (PACA) ; aucune préparation propre à une commune.
- **Composant de carte Svelte** (MapLibre GL JS, protocole `pmtiles`, sans bibliothèque Svelte) : centrage sur une commune ou sur la position du joueur, déplacement limité au rectangle de la zone, attribution toujours visible.
- **Couches du jeu ajoutées par le code** : lieux de l’enquête (bâtiment coloré quand le lieu est dans un bâtiment, carré numéroté), lieu du mystère (autre couleur), lieux de décor (pastille d’icône par famille et nom), tracé de trajet avec sa durée, masque hors commune.
- **Clic sur un lieu de décor** : nom, type et horaires OSM seulement.
- **Thème** : passage clair / sombre par `setStyle` et ajustements par `setPaintProperty`, sans recharger les tuiles.
- **Catalogue** : chaque type de lieu porte une famille d’icône (`icon`, champ déjà prévu au modèle) et un libellé français (`label`) pour la carte.
- **Page de validation** `/map` (développement seulement) pour regarder trois communes de densités différentes.

**Exclu** (comme le brief) : panneaux d’enquête, carnet, curseur horaire (brief 05) ; cache hors ligne des tuiles (brief 06). Hors de ce changement : le chargement réel des cases et la construction de la zone (brief 05), les écrans Carnet et Suspects.

## Capabilities

### New Capabilities
- `map-style` : fichiers de style, source de tuiles, polices, icônes, attribution et extraction des tuiles régionales.
- `map-display` : composant de carte, couches du jeu, interactions, thème et page de validation.

### Modified Capabilities
- `catalog` : les types de lieux portent une famille d’icône et un libellé pour la carte (nouvelle exigence uniquement).

## Impact

- `static/map/` : `style-light.json`, `style-dark.json`, `fonts/`, `icons/`.
- `src/lib/map/` : modules purs (entités GeoJSON, limites de zone, masque, tracé) et leurs tests, composant `Map.svelte`.
- `src/routes/map/` : page de validation (développement seulement).
- `catalog/place-types.json` (champs `icon` et `label`) et son test ; `src/lib/engine/types.ts` (`label?`).
- `tools/map-tiles/` : script et README d’extraction.
- `docs/VISION.md` (§6 et étape 4), `AGENTS.md` (structure).
