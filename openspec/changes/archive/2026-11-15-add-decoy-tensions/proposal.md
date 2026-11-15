# Proposal

## Why

Même aux difficultés 2 et 3, le joueur repère l'auteur dès qu'il rapproche deux faits qui se contredisent. Exemple observé : « Sacha : Alix a quitté Primeur de la Treille à 18h32 » contre « Alix : à 18h51, j'étais à Primeur de la Treille ». Comme seul l'auteur ment et que deux faits vrais ne se contredisent jamais, toute contradiction désigne l'auteur ou son contradicteur. Il n'y a rien d'autre qui ressemble à une contradiction dans l'enquête : la seule paire qui « accroche » est la bonne. Source : retour d'essais dans le playground, hors brief ; renforce la déduction après `harder-enquiries`.

## What Changes

- **Tensions apparentes** : à partir de la difficulté 2, certains suspects (innocents et auteur) ont deux faits vrais qui semblent incompatibles sans l'être : deux lieux différents, un écart de temps à peine supérieur au trajet (de 0 à 3 minutes de marge). Le joueur doit lire la matrice des trajets pour voir que ce n'est pas une contradiction, ce qui dilue la vraie paire parmi d'autres.
- **Fait d'arrivée** : un séjour plus ancien « tendu » est fermé par une vraie preuve datée du départ et suivi d'un témoignage vrai de la personne sur son arrivée au séjour suivant (instant à l'heure d'entrée).
- **Pas de nouvelle règle** : une tension est un ensemble de faits vrais, déjà contrôlé par `truths-uncontradicted`, `realistic-routes` et `true-facts-derived` ; le plafond de 3 minutes est une propriété de la génération, testée dans `generate.spec.ts`.
- **Mesure** : part des paires « suspectes » (contradictions réelles et tensions) qui sont de vraies contradictions ; elle doit rester à 100 % à la difficulté 1 et baisser aux difficultés 2 et 3.
- **Documents** : `docs/reference/DATA-MODEL.md` (tensions apparentes), `guide/ENGINE.md`.

Hors périmètre : innocents qui se trompent de bonne foi (contredirait « seul l'auteur ment », décision de cap à prendre à part), plusieurs mensonges, changement du solveur, cacher le mensonge derrière un déblocage.

## Capabilities

### New Capabilities
<!-- Aucune. -->

### Modified Capabilities
- `investigation-generation`: tensions apparentes selon la difficulté.

## Impact

- Code : `src/lib/engine/generate.ts` (séjours plus anciens « tendus ») et ses tests.
- Docs : `docs/reference/DATA-MODEL.md`, `guide/ENGINE.md`.
- Prolonge les preuves lointaines de `harder-enquiries` (archivé) : même fonction, même répartition par difficulté.
