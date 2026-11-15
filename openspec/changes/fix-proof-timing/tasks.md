# Tasks

## 1. Règle de cohérence

- [ ] 1.1 Mettre à jour l’exemple de référence dans `docs/reference/DATA-MODEL.md` (Paul quitte la boulangerie à 21h03 ; ticket = départ) et dans `solver.spec.ts` / `rules.spec.ts`, puis vérifier que le solveur donne toujours Lucie seule, difficulté 1
- [ ] 1.2 Écrire le test de `proof-at-departure` dans `rules.spec.ts` (preuve conforme acceptée, preuve au milieu du séjour rejetée, indice PNJ non concerné), puis ajouter la règle à `rules.ts` et vérifier que le test passe
- [ ] 1.3 Documenter la règle et le sens de `departure` pour une preuve dans `DATA-MODEL.md` (§4 et §6)

## 2. Génération

- [ ] 2.1 Écrire les tests dans `generate.spec.ts` : toute preuve est un départ daté de la fin de son séjour ; le test de 500 seeds vérifie aussi la règle ; la réparation utilise un indice PNJ quand la fin du séjour est trop loin de `T`, et renonce sans indice possible
- [ ] 2.2 Adapter `generate.ts` : fin de séjour des innocents du tour 1 dans la fenêtre de `T`, `clueFact` qui choisit parmi les types faisables et date une preuve du départ, réparation qui s’en sert ; vérifier que 2.1 passe
- [ ] 2.3 Lancer le fuzz sur toutes les combinaisons de lieux du playground (script temporaire) et vérifier qu’il n’y a ni plantage, ni règle violée, ni difficulté fausse

## 3. Finition

- [ ] 3.1 Vérifier `npm run test`, `npm run check`, `npm run lint`, et que le playground affiche une preuve datée du départ pour une enquête générée
- [ ] 3.2 Vérifier que `src/lib/engine/solver.ts` n’a pas été modifié (`git diff --stat`)

## Workflow follow-up

- Archiver le changement une fois la revue terminée.
