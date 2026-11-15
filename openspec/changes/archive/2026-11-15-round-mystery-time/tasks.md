# Tasks

## 1. Règle de cohérence

- [x] 1.1 Écrire le test de `mystery-time-rounded` dans `rules.spec.ts` (10h15 accepté, 7h57 rejeté en nommant la règle), puis ajouter la règle à `rules.ts` et vérifier que le test passe
- [x] 1.2 Documenter la convention et la règle dans `docs/reference/DATA-MODEL.md` (conventions et §6) et vérifier que l’exemple de référence (21h05) la respecte

## 2. Génération

- [x] 2.1 Écrire les tests dans `generate.spec.ts` : l’heure du mystère est un multiple de 5 minutes et reste dans la plage du scénario et les horaires de la scène (sur 100 seeds, jeu de 8 lieux et jeu riche) ; un couple scénario/scène sans multiple de 5 est écarté
- [x] 2.2 Adapter `chooseSetting` dans `generate.ts` (tirage sur la grille de 5 minutes) et vérifier que 2.1 et les tests existants passent, dont les 500 seeds

## 3. Finition

- [x] 3.1 Vérifier `npm run test`, `npm run check`, `npm run lint` et `npm run build`, et que le playground affiche des heures de mystère rondes (par exemple « À 16h40 »)
- [x] 3.2 Vérifier que `src/lib/engine/solver.ts` n’a pas été modifié (`git diff --stat`)

## Workflow follow-up

- Archiver le changement une fois la revue terminée.
