# Tasks

## 1. Catalogue : objets et scénarios composables

- [x] 1.1 Écrire les tests dans `catalog.spec.ts` : objets du catalogue de départ complets (identifiant unique, étiquette, deux formes) ; rejet d’un minimum supérieur au maximum, de trop peu d’objets pour une étiquette, d’une variable d’objet sans objet, d’une situation sans `{items}` alors que le scénario en demande, d’un objet après « de » ou « à », d’un identifiant d’objet en double ; scénario sans objet accepté
- [x] 1.2 Ajouter `ItemType`, `Catalog.items`, `ScenarioModel.itemTags` / `itemCount` et `Investigation.itemIds` à `types.ts`, la validation à `catalog.ts`, et l’import des objets à `fixtures.ts`
- [x] 1.3 Créer `catalog/items.json` (une trentaine d’objets, étiquettes `wearable`, `linen`, `floating`, `tableware`, `welcome`) et réécrire les 7 scénarios de `catalog/scenarios.json` selon le tableau du design (identifiants `statue_makeover` et `vip_entrance`, révélations sans objet figé, `{place}` tel quel) ; vérifier que les tests de 1.1 passent

## 2. Rendu et génération

- [x] 2.1 Écrire les tests : jointure de liste dans `render.spec.ts` (un, deux, trois éléments) ; dans `generate.spec.ts`, objets tirés conformes au scénario (nombre, étiquettes, tous différents), mêmes objets pour la même seed, plusieurs combinaisons sur de nombreuses seeds, aucun objet pour `library_swap`, formes indéfinies présentes dans la situation
- [x] 2.2 Implémenter la jointure dans `render.ts` et le tirage des objets dans `generate.ts` (`itemIds`, `{items}`, `{item}`), et vérifier que 2.1 passe
- [x] 2.3 Ajouter le test exhaustif des textes (chaque scénario avec chaque objet de sa réserve, situation et révélations : aucune variable restante, aucun « de le », « de les », « à le », « à les ») et vérifier qu’il passe

## 3. Règle de cohérence

- [x] 3.1 Écrire le test de `items-match-scenario` dans `rules.spec.ts` (objets conformes acceptés ; objet étranger, objet en double et nombre hors limites rejetés), faire pointer l’enquête de référence du test vers un scénario réel sans objet, puis ajouter la règle à `rules.ts` et vérifier que les tests passent

## 4. Playground

- [x] 4.1 Écrire le test dans `playground.spec.ts` (le snapshot liste les objets tirés, et rien pour un scénario sans objet), l’implémenter dans `describeSnapshot`, et vérifier avec un navigateur sans interface que l’onglet « Snapshot » affiche les objets et que la situation affichée les contient

## 5. Documentation

- [x] 5.1 Mettre à jour `docs/reference/DATA-MODEL.md` : couche catalogue (objets), diagramme (`ItemType`, champs de `ScenarioModel`, `itemIds`), variables et règles d’écriture des gabarits, règle de cohérence, et corriger l’exemple d’accord qui contracte un article devant `{place}`
- [x] 5.2 Mettre à jour `docs/VISION.md` (décision : farces composées d’objets, glossaire) et `AGENTS.md` (contenu de `catalog/`), et vérifier qu’aucun document ne cite encore `statue_sunglasses` ou `red_carpet` hors archives (`grep`)

## 6. Non-régression du moteur

- [x] 6.1 Vérifier `npm run test` (dont les 500 seeds et le jeu de lieux riche), `npm run check`, `npm run lint` et `npm run build` sans erreur
- [x] 6.2 Lancer le fuzz du playground sur les 256 combinaisons du jeu de 8 lieux (script temporaire) : aucun plantage, aucune règle violée, aucune difficulté fausse, et des taux d’échec comparables à avant (6 336 valides, 576 `no-scene`, 2 304 `difficulty-unreachable`)
- [x] 6.3 Vérifier que `src/lib/engine/solver.ts` n’a pas été modifié (`git diff --stat`) et relire dans le playground une dizaine de situations et de révélations générées

## Workflow follow-up

- Archiver le changement une fois la revue terminée.
