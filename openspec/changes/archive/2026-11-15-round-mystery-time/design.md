# Design

## Context

`chooseSetting` (`src/lib/engine/generate.ts`) tire l’heure du mystère `T` à la minute dans la fenêtre « plage du scénario ∩ horaires de la scène ». Les plages des scénarios (`catalog/scenarios.json`) et les horaires des lieux sont déjà en multiples de 5 minutes. Les specs concernées sont `investigation-generation` et `consistency-rules`. Voir `proposal.md`.

## Goals / Non-Goals

**Goals:**
- `T` toujours multiple de 5 minutes, sans nouvelle donnée de catalogue.

**Non-Goals:**
- Arrondir les autres heures ; changer le solveur ; changer les plages du catalogue.

## Decisions

**Tirage sur une grille de 5 minutes.** Dans chaque fenêtre `[from, to]`, on prend les bornes arrondies vers l’intérieur (`ceil(from / 5) × 5`, `floor(to / 5) × 5`) ; si elles se croisent, la fenêtre est écartée ; sinon on tire un entier `k` entre elles et `T = 5k`. *Alternative écartée* : arrondir `T` après un tirage à la minute (peut sortir de la fenêtre et casse l’équilibre des tirages).

**Règle `mystery-time-rounded`.** `rules.ts` vérifie `T % 5 === 0`, comme les autres règles de cohérence, avec un test de violation (7h57 rejeté, 10h15 accepté).

**Effet sur le reste.** Les segments sont construits à partir de `T` avec des décalages à la minute, donc les autres heures gardent leur précision. Le tirage au sort change (autres enquêtes pour une même seed), ce qui est sans conséquence : les tests vérifient des propriétés, pas des enquêtes figées.

## Risks / Trade-offs

- [Fenêtre très courte sans multiple de 5] → le couple est écarté ; avec les données actuelles toutes les fenêtres en contiennent.
- [Heure de fin de plage exclue si elle n’est pas un multiple de 5] → sans effet : les plages du catalogue en sont.
