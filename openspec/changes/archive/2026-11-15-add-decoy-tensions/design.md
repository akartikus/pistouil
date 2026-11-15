# Design

## Context

`addDistantProofs` (`src/lib/engine/generate.ts`) ajoute, pour environ un suspect sur trois (difficulté 2) ou sur deux (difficulté 3), un séjour plus ancien avec une preuve datée du départ, au moins `trajet + 10` minutes avant le premier séjour et assez loin de l'heure du mystère pour ne pas disculper. Aujourd'hui toutes ces preuves ont de la marge : le joueur n'y voit jamais de tension. La contradiction (`contradicts` dans `solver.ts`) est stricte : deux lieux différents se contredisent si l'écart est inférieur au trajet ; un écart égal ou supérieur est possible. Voir `proposal.md` pour la motivation.

## Goals / Non-Goals

**Goals:**
- Ajouter des paires de faits vrais qui ressemblent à une contradiction sans en être une.
- Garder `alibi`/`framing`/`closed`, le solveur, la difficulté et la difficulté 1 inchangés.

**Non-Goals:**
- Faire se tromper les innocents (toucherait à « seul l'auteur ment », décision de cap).
- Rendre le vrai mensonge moins visible une fois découvert.

## Decisions

**Séjour tendu.** Dans `addDistantProofs`, un suspect qui reçoit un séjour plus ancien (même répartition par difficulté) l'a « tendu » avec une probabilité de un demi quand c'est possible, sinon lointain. Pour un séjour tendu, le départ est à `e = entrée − trajet(lieu, premier séjour) − marge`, avec une marge tirée entre 0 et 3 minutes, et toujours `e ≤ T − trajet(lieu, scène) − 15` pour que la preuve ne disculpe pas (sinon retour au séjour lointain). La durée, les horaires d'ouverture (`fitsInHours`) et l'absence de contradiction avec les autres faits de la personne (mensonge compris) sont vérifiés comme aujourd'hui.

**Fait d'arrivée.** Pour qu'il y ait deux faits visibles à écart serré, un séjour tendu ajoute un témoignage vrai de la personne sur elle-même, de précision `instant`, à l'heure d'entrée du séjour suivant (`from` du premier séjour). Son gabarit existe déjà (`instant`, `self`). Il est visible d'emblée comme les autres témoignages de soi ; il n'est fiable qu'une fois la personne innocentée, comme tout témoignage.

**Pas de nouvelle règle.** Une tension n'est pas reconnaissable après coup (rien ne distingue une paire voulue d'une paire tendue par hasard), donc le plafond de 3 minutes ne peut pas se contrôler dans `rules.ts`. Ce qui doit rester vrai l'est déjà : `truths-uncontradicted` (aucun fait fiable ne contredit un fait vrai, donc l'écart est au moins le trajet), `realistic-routes` (séjours enchaînables), `true-facts-derived` (la preuve et le témoignage dérivent de séjours). Le plafond est testé dans `generate.spec.ts` sur les enquêtes générées.
*Alternative écartée* : une règle `tension-feasible` : non vérifiable, et une marge négative serait une vraie contradiction.

**Mesure.** Sur 300 seeds par difficulté (jeu riche), compter les paires de faits d'une même personne qui sont soit contredites (`contradicts`), soit des tensions (lieux différents, écart entre le trajet et le trajet + 3 min) ; la part de vraies contradictions doit être de 100 % à 1 (aucune tension) et plus basse à 2 et à 3. Même fuzz que `harder-enquiries` (jeu de 8 lieux) : mêmes chiffres de réussite (6 336 valides, 576 `no-scene`, 2 304 `difficulty-unreachable`) ou meilleurs.

## Risks / Trade-offs

- [Le vrai mensonge reste évident s'il est direct (même lieu, départ contre présence)] → la tension ne le cache pas, elle ajoute des fausses pistes ; une piste plus forte (déblocage, innocents qui se trompent) est à décider à part.
- [Le joueur peut résoudre les tensions avec la matrice des trajets en quelques secondes] → c'est le but : il faut lire la matrice. À mesurer au playground avec la part de paires.
- [Le test « aucune tension à la difficulté 1 » peut échouer par hasard si une paire de faits vrais est naturellement serrée] → à vérifier à l'implémentation ; le cas échéant, ne compter que les paires de faits d'un séjour plus ancien.
- [Plus de faits par enquête] → le test de performance reste (moins de 200 ms).
- [Un séjour tendu est impossible si le premier séjour est trop proche de la scène] → repli sur le séjour lointain, puis sur aucun séjour, comme aujourd'hui.
