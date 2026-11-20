# Proposal

## Why

Trois défauts constatés en jouant (correction hors brief) :
1. L’écran de départ met « Reprendre l’enquête » en avant sans rendre explicite le choix d’une nouvelle enquête, qui remplace pourtant la sauvegarde sans le dire.
2. À la fin de la partie, le Carnet n’explique que les alibis que le joueur a ouverts : l’explication est incomplète.
3. Une enquête terminée est présentée comme « en cours » et proposée à la reprise comme si elle l’était.

## What Changes

- Écran de départ : l’enquête sauvegardée est présentée avec son état, **en cours** ou **terminée** ; on peut la reprendre (en cours) ou revoir sa révélation (terminée), et une section « Nouvelle enquête » est toujours visible et dit qu’elle remplace l’enquête enregistrée.
- Réglages : le rappel de l’enquête indique son état.
- Révélation : elle porte désormais tous les faits de l’enquête, y compris ceux des lieux jamais ouverts.
- Carnet après la partie : il explique tous les alibis (incohérences et verdicts), les faits que le joueur n’avait pas vus étant marqués comme tels.
- Format de sauvegarde inchangé : l’état « terminée » se déduit de l’accusation déjà enregistrée.

## Capabilities

### New Capabilities

### Modified Capabilities
- `game-screens`: écran de départ (état, reprise ou révélation, nouvelle enquête), Réglages (état), Carnet (tous les alibis à la fin).
- `game-reveal`: la révélation fournit tous les faits.

## Impact

- `src/lib/game/` : `protocol.ts`, `session.ts` (faits dans la révélation), `save.ts` (état), `derive.ts` (faits expliqués), `texts.ts`.
- `src/routes/` : `+page.svelte` (départ), `reglages/+page.svelte`, `play/carnet/+page.svelte`.
