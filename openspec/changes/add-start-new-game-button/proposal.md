# Proposal

## Why

Quand une enquête est sauvegardée, l’écran de départ propose « Reprendre » ou « Revoir la révélation », mais « Nouvelle enquête » n’y est qu’un titre de section, pas un bouton. Correction hors brief, demandée en jouant.

## What Changes

- Avec une enquête sauvegardée, l’écran de départ montre deux boutons côte à côte : « Reprendre l’enquête » (ou « Revoir la révélation ») et « Nouvelle enquête ».
- « Nouvelle enquête » ouvre les choix d’une nouvelle enquête (difficulté, position ou commune) et rappelle qu’elle remplace l’enquête enregistrée ; sans enquête sauvegardée, ces choix sont affichés d’emblée.

## Capabilities

### New Capabilities

### Modified Capabilities
- `game-screens`: écran de départ.

## Impact

- `src/routes/+page.svelte`, `src/lib/game/texts.ts` (aucun texte nouveau attendu).
