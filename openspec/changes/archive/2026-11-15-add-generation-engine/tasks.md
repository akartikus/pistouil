# Tasks

## 1. Types et PRNG

- [x] 1.1 Créer `src/lib/engine/types.ts` avec tous les types du modèle (`DATA-MODEL.md`) et vérifier que `npm run check` passe en mode strict
- [x] 1.2 Écrire `random.spec.ts` (même seed, même suite ; seeds différentes, suites différentes), puis implémenter `random.ts` (mulberry32) et vérifier que le test passe

## 2. Catalogue

- [x] 2.1 Écrire `catalog.spec.ts` : rejet d’un motif sans révélation, d’une scène de rôle non valide, d’une compatibilité vers un type inconnu, de moins de 12 prénoms, d’une variable inconnue dans un gabarit ; acceptation du catalogue de départ
- [x] 2.2 Implémenter la validation dans `src/lib/engine/catalog.ts` et vérifier que 2.1 passe
- [x] 2.3 Encoder `docs/writing/` en JSON dans `catalog/` (types de lieux, types d’indices, compatibilités, scénarios, prénoms, gabarits de témoignage avec `subject`) et vérifier que le catalogue est accepté par la validation
- [x] 2.4 Supprimer `docs/writing/` et mettre à jour `docs/VISION.md` §7 ; vérifier qu’aucun lien du dépôt ne pointe plus vers ce dossier (`grep`)

## 3. Rendu des textes

- [x] 3.1 Écrire `render.spec.ts` : variable résolue, heure `1265` rendue `21h05`, aucune accolade restante, rendu identique à entrée identique, même forme de gabarit pour vrai et mensonger
- [x] 3.2 Implémenter `render.ts` (rendu pur) et vérifier que 3.1 passe

## 4. Solveur

- [x] 4.1 Écrire `solver.spec.ts` avec l’exemple de référence (§8) : Lucie seule suspecte, difficulté 1, Paul et Inès innocentés au tour 1 ; variante sans le ticket invalide ; un fait à la scène n’innocente pas ; les attributs privés sont ignorés ; fait non atteignable ignoré ; chaîne de deux tours = difficulté 2
- [x] 4.2 Écrire les tests de contradiction (départ contre présence continue, lieux incompatibles, témoignage contredit / corroboré / non vérifié)
- [x] 4.3 Implémenter `solver.ts` (faits atteignables, innocentage, fiabilité, difficulté, contradiction) et vérifier que 4.1 et 4.2 passent

## 5. Règles de cohérence

- [x] 5.1 Écrire `rules.spec.ts` : une enquête de référence passe ; chaque règle (§6) violée est détectée et nommée (scène non `scene`, lieu `excluded`/`removed`, indice incompatible ou hors horaires, trajet irréaliste, fait vrai sans segment, menteur multiple, prénom en double, texte non résolu, solution non unique, mensonge non démasquable, vérité contredite, cycle de déblocage, fait nécessaire inaccessible, matrice incomplète)
- [x] 5.2 Implémenter `rules.ts` et vérifier que 5.1 passe

## 6. Générateur

- [x] 6.1 Créer un jeu de lieux fictif de test (4 `scene`, 2 `alibi`, 1 `excluded`, 1 `removed`, matrice complète de 28 trajets) dans un fichier de fixtures du moteur
- [x] 6.2 Écrire `generate.spec.ts` : même seed, même enquête ; matrice incomplète rejetée ; auteur à la scène à `T` ; soirées réalistes ; un seul mensonge avec motif du scénario ; `difficulty + 2` suspects ; rôles respectés ; échec signalé quand la difficulté est inatteignable
- [x] 6.3 Implémenter `generate.ts` (pipeline du design, réparation, seed dérivée) et vérifier que 6.2 passe
- [x] 6.4 Ajouter le test sur 500 seeds et les difficultés 1 à 3 : 100 % valides, aucun texte non résolu, aucun prénom en double, mensonge toujours démasquable ; vérifier qu’il passe
- [x] 6.5 Mesurer la génération d’une enquête et vérifier qu’elle prend moins de 200 ms sur un ordinateur de bureau (test ou script de mesure documenté dans le test)

## 7. Finition

- [x] 7.1 Vérifier `npm run test`, `npm run check` et `npm run lint` sans erreur, et qu’aucun fichier de `src/lib/engine` n’importe Svelte, le DOM, la carte ni n’utilise `Math.random` (`grep`)
- [x] 7.2 Mettre à jour `docs/VISION.md` (feuille de route : étape 1 cochée, décisions : PRNG, résultat de génération) et vérifier que le brief 01 reste cohérent

## Workflow follow-up

- Archiver le changement une fois la revue terminée.
