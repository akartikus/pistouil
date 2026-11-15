# Design

## Context

Aucune capability existante (`openspec/specs/` est vide). Le moteur vit dans `src/lib/engine` (code pur : pas de Svelte, DOM, carte, réseau ni `Math.random`). Types, règles et solveur sont définis dans `docs/reference/DATA-MODEL.md` et ne sont pas redéfinis ici. Le contenu du catalogue vient de `docs/writing/`. Voir `proposal.md` pour la motivation.

## Goals / Non-Goals

**Goals:**
- Une API unique `generateInvestigation(places, routes, catalog, { seed, difficulty })` pure et déterministe.
- Un solveur réutilisable seul (tests, vérification finale, plus tard l’interface).
- Une enquête sur 8 lieux en moins de 200 ms.

**Non-Goals:**
- Lecture OSM, calcul de trajets, interface, stockage (briefs 02 à 05).
- Réécriture IA des textes.
- Gestion de plusieurs scènes ou plusieurs menteurs par enquête.

## Decisions

**Organisation du code.** `src/lib/engine/` : `types.ts`, `random.ts`, `catalog.ts` (chargement et validation), `render.ts`, `solver.ts`, `rules.ts`, `generate.ts`, chacun avec son `*.spec.ts` à côté. Le catalogue est passé en argument ; le moteur n’importe pas de JSON. Les tests importent `catalog/*.json` directement. *Alternative écartée* : charger le JSON dans le moteur (couple moteur et fichiers).

**PRNG : mulberry32.** Quelques lignes, état 32 bits, rapide, suffisant pour tirer des indices et des heures. *Alternative* : xoshiro128 (meilleure qualité, inutile ici). Graine dérivée pour une nouvelle tentative : `mulberry32(seed)` consommée une fois par tentative, de façon déterministe.

**Validation du catalogue sans bibliothèque.** Les JSON sont des entrées externes (frontière) : une fonction de validation écrite à la main, avec erreurs nommant l’élément fautif. Pas de dépendance ajoutée (`zod`) pour une dizaine de contrôles.

**Résultat de génération.** `generateInvestigation` retourne `{ ok: true, investigation } | { ok: false, reason }` (difficulté inatteignable, lieux insuffisants). Les entrées invalides (matrice incomplète) lèvent une erreur : c’est un bug de l’appelant, pas un cas normal.

**Horaires.** Liste d’intervalles `{ from, to }` en minutes ; absents = toujours ouvert (référence §2).

**Pipeline de génération.**
1. Choisir le scénario, puis la scène parmi les lieux de rôle `scene` dont le type figure dans ses scènes possibles, puis l’heure `T` dans sa plage horaire.
2. Tirer `difficulty + 2` prénoms distincts ; désigner l’auteur et le motif parmi ceux du scénario.
3. Construire la vraie soirée : l’auteur quitte un lieu `A` à `t0` avec `T − t0 ≥ temps(A, scène)` puis est à la scène à `T` ; les innocents sont placés à des lieux `L` avec `écart < temps(L, scène)` à `T`.
4. Chaîne de déduction pour la difficulté `d` : les innocents du tour 1 reçoivent un indice (preuve ou PNJ) ; l’innocent du tour `k > 1` n’est couvert que par le témoignage d’un innocent du tour `k − 1`. Ce témoignage est débloqué par un fait du tour `k − 1`.
5. Dériver témoignages vrais, indices, et le mensonge de l’auteur : un intervalle ou instant faux sur son lieu `A` à `T`, tel qu’un fait fiable le contredit (départ témoigné par un innocent).
6. Rendre tous les textes (`renderedText`), puis lancer le solveur et les règles de cohérence.
7. Si invalide : ajouter un indice pour chaque suspect resté possible et revérifier ; sinon recommencer avec une graine dérivée (60 tentatives au plus) ; sinon retourner l’échec. Retirer un indice n’a jamais été nécessaire : la construction ne produit pas d’indice en trop.

**Contradiction implémentée une seule fois** (`solver.ts`) et réutilisée par les règles de cohérence.

## Risks / Trade-offs

- [Difficulté 3 inatteignable avec peu de lieux] → le générateur signale l’échec avec la raison ; le jeu de test de 8 lieux sert de référence, la plage des difficultés réalistes se confirmera à la jalon de test de jeu.
- [Performance : tentatives de réparation multiples] → plafond de tentatives, mesure dans une tâche dédiée (< 200 ms).
- [Lieux sensibles `alibi` sans indice] → ils ne reçoivent que des témoignages ; le générateur les utilise seulement quand un témoignage suffit.
- [Gabarit de témoignage choisi au hasard peut paraître répétitif] → deux variantes par couple (précision, sujet) ; enrichissement par ajout de lignes au catalogue.
