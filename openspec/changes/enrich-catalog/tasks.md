# Tasks

## 1. Catalogue

- [ ] 1.1 Ajouter dans `catalog.spec.ts` un test qui exige les nouveaux types (bar, bureau de poste, cinéma, salle de spectacle, école de musique en `alibi`, au moins cinq types de commerces) ; ajouter les types de lieux, d’indices et les compatibilités dans `catalog/*.json`, élargir les scènes de `red_carpet` et `library_swap`, et vérifier que la validation et tous les tests existants passent

## 2. Jeu de lieux de test riche

- [ ] 2.1 Écrire le test du jeu riche (matrice complète et symétrique, minutes d’au moins 1, un lieu de chaque type du catalogue, un lieu retiré), puis créer `richPlaces` et `richRoutes` dans `src/lib/engine/fixtures.ts` à partir de positions en mètres, et vérifier que le test passe
- [ ] 2.2 Ajouter dans `generate.spec.ts` un test de charge sur le jeu riche (100 seeds aux difficultés 1 à 3 : enquêtes valides, difficulté exacte, moins de 200 ms en moyenne) et vérifier qu’il passe ; noter les échecs de génération éventuels pour les ajustements à venir
- [ ] 2.3 Faire utiliser `richPlaces` et `richRoutes` par `src/routes/playground/+page.svelte` et vérifier avec un navigateur sans interface que la page liste les nouveaux lieux et génère une enquête

## 3. Finition

- [ ] 3.1 Vérifier `npm run test`, `npm run check`, `npm run lint` et `npm run build` sans erreur, et que `src/lib/engine` hors `fixtures.ts` et tests n’a pas changé (`git diff --stat`)

## Workflow follow-up

- Archiver le changement une fois la revue terminée.
