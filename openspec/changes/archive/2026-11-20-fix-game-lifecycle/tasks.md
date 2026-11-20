# Tasks

## 1. Révélation et Carnet

- [x] 1.1 Écrire les tests : la révélation contient les faits de tous les lieux, ceux des lieux non ouverts compris, et la vue avant accusation n’en contient aucun ; `explainedFacts` (faits lus, non lus, marqués) dans `derive.spec.ts` ; vérif : ils échouent avant le code
- [x] 1.2 Ajouter `facts` à la révélation (`protocol.ts`, `session.ts`) et la fonction `explainedFacts` (`derive.ts`) ; vérif : tests de 1.1 et `npm run test`
- [x] 1.3 Carnet : après la partie, afficher tous les faits avec la mention « Non vu pendant la partie », incohérences et verdicts calculés sur tous ; vérif : Chromium headless, partie accusée sans ouvrir tous les lieux, les faits non vus figurent au Carnet

## 2. État de l’enquête

- [x] 2.1 Écrire les tests de `isFinished` (sauvegarde avec ou sans accusation) dans `save.spec.ts` ; vérif : ils échouent avant le code
- [x] 2.2 Implémenter `isFinished` (`save.ts`) ; vérif : tests de 2.1
- [x] 2.3 Écran de départ : état en cours ou terminée, « Reprendre » ou « Revoir la révélation », section « Nouvelle enquête » toujours visible avec sa mention de remplacement ; vérif : Chromium headless, captures avec une enquête en cours puis terminée, en 390 × 844 et 375 × 667
- [x] 2.4 Réglages : état de l’enquête dans le rappel ; textes dans `texts.ts` ; vérif : `npm run check` et capture des Réglages

## 3. Contrôle

- [x] 3.1 `npm run lint`, `npm run check`, `npm run test`, `openspec validate fix-game-lifecycle --strict` ; vérif : tout vert
