# Design

## Context

Le générateur (`src/lib/engine/generate.ts`) choisit l’heure d’un indice instantané n’importe où dans le séjour, près de l’heure du mystère `T`. Les specs concernées sont `investigation-generation` et `consistency-rules` (`openspec/specs/`). Le modèle définit déjà `departure` : la personne était là à cet instant et l’a quitté juste après (`from = to`). Voir `proposal.md` pour la motivation.

## Goals / Non-Goals

**Goals:**
- Une preuve date toujours le départ, donc l’histoire est crédible.
- Rester simple : pas de nouvelle donnée de catalogue.

**Non-Goals:**
- Durées de séjour par type de lieu.
- Changer le solveur ou les indices PNJ.

## Decisions

**Réutiliser `departure`.** Une preuve est un fait `departure: true` avec `from = to` = fin du segment. C’est le sens du mot : on était là, on est parti juste après. *Alternative écartée* : un champ `timing` sur `ClueType` (donnée de catalogue en plus, alors que `nature: proof` suffit à déclencher la règle).

**Séjours qui finissent près de `T`.** Pour les innocents du tour 1, la fin du séjour est tirée dans `[T − trajet + 1, T + trajet − 1]`, la fenêtre où un fait ponctuel innocente (`écart < trajet`). Ainsi toute preuve, datée de cette fin, innocente, quel que soit le type d’indice choisi. Pour le témoin de l’auteur, la fin reste au moins une minute après le départ de l’auteur (déjà garanti : cette borne basse dépasse son départ). Les innocents suivants de la chaîne restent des sous-séjours du séjour de leur témoin, sans changement.

**Réparation.** La fonction `clueFact` choisit parmi les types compatibles ceux dont l’heure innocente : une preuve seulement si `|fin − T| < trajet`, un indice PNJ sinon ; elle retourne rien s’il n’y en a pas. La réparation s’en sert telle quelle.

**Règle `proof-at-departure`.** Pour chaque fait dont la source est un indice de nature `proof` : `departure` vrai, `from = to`, égal à la fin du segment référencé. Vérifiée dans `rules.ts` avec le catalogue, testée par une violation provoquée.

**Exemple de référence.** Paul quitte la boulangerie à 21h03 (heure de son ticket) au lieu de 21h15 : l’écart reste 2 < 4, le solveur donne le même résultat. Le modèle (§8) et les tests sont mis à jour.

## Risks / Trade-offs

- [Moins de variété : tous les innocents du tour 1 finissent près de `T`] → acceptable ; les innocents de la chaîne gardent des séjours variés.
- [Séjours plus contraints, risque d’échec de génération avec peu de lieux] → vérifié par le test sur 500 seeds et le fuzz du playground.
- [Une preuve au café reste jugée « possible » mais datée du départ] → règle uniforme, plus simple.
