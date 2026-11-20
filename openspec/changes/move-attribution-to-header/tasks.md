# Tasks

## 1. Attribution dans l'en-tête

- [x] 1.1 Ajouter à `src/lib/game/texts.spec.ts` un test : `texts.map.attribution` contient « © OpenStreetMap contributors » et « Protomaps » ; vérifier qu'il échoue avant le texte
- [x] 1.2 Ajouter `texts.map.attribution` et `texts.map.attributionLabel` dans `texts.ts`, créer `src/lib/game/ui/Attribution.svelte` (bouton « i », texte déplié 5 s puis replié, repli au toucher ailleurs), le placer à côté du titre dans `src/routes/play/+layout.svelte` pour les écrans Carte et Révélation, et ajouter à `Map.svelte` une propriété `attribution` (vrai par défaut) que Carte et Révélation passent à faux ; vérifier avec `npm run check` et `npm run test`
- [x] 1.3 Vérifier dans Chromium (375 × 667), en clair et en sombre : « i » dans l'en-tête à côté du titre sur Carte et Révélation, texte déplié puis replié, rouvert au toucher, aucun second « i » sur la carte, aucun « i » sur Carnet et Suspects, plus de recouvrement du panneau d'un lieu

## 2. Documentation et cap

- [x] 2.1 Mettre à jour `docs/VISION.md` (principe 7 et décision sur la carte), `docs/design/direction.md` et `guide/ADD-COMMUNE.md` : l'attribution est dans l'en-tête des écrans de carte ; vérifier par relecture du diff
- [x] 2.2 `npm run lint`, `npm run check`, `npm run test`, `npm run build`, `openspec validate move-attribution-to-header --strict` ; vérifier que tout passe
