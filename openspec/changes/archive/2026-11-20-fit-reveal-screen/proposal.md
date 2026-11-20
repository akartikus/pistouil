# Proposal

## Why

Sur un écran haut, l’écran de révélation laisse un grand espace vide entre ses boutons et les onglets Carte, Carnet et Suspects : la carte a une hauteur fixe. Correction hors brief, demandée en jouant.

## What Changes

- L’écran de révélation occupe toute la hauteur entre l’en-tête et les onglets : la carte prend la place libre.
- Sur un petit écran, la carte garde une hauteur minimale et la page défile, sans débordement horizontal.

## Capabilities

### New Capabilities

### Modified Capabilities
- `game-reveal`: la révélation remplit la hauteur de l’écran.

## Impact

- `src/routes/play/reveal/+page.svelte` (styles seulement).
