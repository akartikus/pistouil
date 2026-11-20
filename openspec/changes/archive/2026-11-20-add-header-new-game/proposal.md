# Proposal

## Why

Commencer une nouvelle enquête demande aujourd’hui d’ouvrir les Réglages. Correction hors brief, demandée en jouant : un accès direct dans l’en-tête.

## What Changes

- Un bouton « Nouvelle » dans l’en-tête de l’enquête, à côté de la roue crantée des Réglages, mène à l’écran de départ où le joueur choisit de reprendre l’enquête ou d’en commencer une nouvelle.
- Il ne supprime rien : l’enquête enregistrée n’est remplacée que si le joueur en commence une autre, ce que l’écran de départ annonce.
- Le bouton des Réglages reste.

## Capabilities

### New Capabilities

### Modified Capabilities
- `game-screens`: l’en-tête porte un accès à la nouvelle enquête.

## Impact

- `src/routes/play/+layout.svelte`, `src/lib/game/texts.ts`.
