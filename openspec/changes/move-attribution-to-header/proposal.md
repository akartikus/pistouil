# Proposal

## Why

Sur la carte, le bouton « i » et son texte « © OpenStreetMap contributors · Protomaps » flottent en bas à droite, au-dessus du panneau d'un lieu et de la bulle d'aide, dont ils masquent une partie (le bas du bouton « Vers un autre lieu », le bouton « Passer »). Le déplacer dans l'en-tête, à côté du titre, libère la carte et le garde toujours visible. Correction d'interface hors brief, donc changement OpenSpec (`AGENTS.md`). La mention reste obligatoire (licence ODbL) : seul son emplacement change.

## What Changes

- Sur les écrans qui montrent la carte du jeu (Carte et Révélation), l'en-tête affiche, à côté du titre, un bouton « i » qui déplie l'attribution. Elle est dépliée à l'ouverture de l'écran, puis se replie après quelques secondes ou au toucher ailleurs ; le joueur la rouvre en touchant « i ».
- La carte du jeu n'affiche plus son propre « i ». La page de validation `/map` (développement) garde le contrôle de MapLibre.
- Le texte complet reste dans À propos (inchangé).

**Exclu** : la formule de l'attribution et sa licence, l'écran À propos, le style du contrôle de la page `/map`.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `map-display`: l'exigence « Attribution toujours visible » décrit l'attribution dans l'en-tête des écrans de carte.

## Impact

- `src/lib/game/ui/Attribution.svelte` (nouveau), `src/routes/play/+layout.svelte` (en-tête), `src/lib/map/Map.svelte` (propriété pour retirer le contrôle intégré), `src/routes/play/carte/+page.svelte` et `src/routes/play/reveal/+page.svelte` (désactivent ce contrôle), `src/lib/game/texts.ts` et `texts.spec.ts`.
- `docs/VISION.md` (principe 7). Aucune dépendance ajoutée.
