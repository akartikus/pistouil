# Tasks

## 1. En-tête

- [x] 1.1 Ajouter le bouton « Nouvelle » (libellé accessible « Nouvelle enquête ») à côté de la roue crantée dans `src/routes/play/+layout.svelte`, qui mène à `/` sans appeler `game.forget()` ; texte dans `texts.ts` ; vérif : Chromium headless, partie en cours puis accusée, 375 × 667 et 390 × 844 : le bouton tient dans l’en-tête avec les titres Carte, Carnet, Suspects et Révélation, la sauvegarde reste, l’écran de départ propose de reprendre ou de commencer
- [x] 1.2 `npm run lint`, `npm run check`, `npm run test`, `openspec validate add-header-new-game --strict` ; vérif : tout vert
