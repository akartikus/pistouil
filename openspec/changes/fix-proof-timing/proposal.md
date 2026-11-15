# Proposal

## Why

Le moteur date une preuve (addition, ticket de caisse, titre de transport, fiche de prêt) n’importe où dans le séjour du personnage : on a vu « Une addition réglée à 16h56 par Camille » alors que Camille ne part qu’à 17h59. Une telle preuve prouve un achat ou un passage après lequel la personne part ; dans un commerce ou un restaurant, on ne reste pas ensuite. Les enquêtes sont logiquement cohérentes mais le récit ne tient pas. Source : cas observé dans le playground, hors brief (correction du changement archivé `add-generation-engine`).

## What Changes

- Toute preuve est un fait de départ (`departure`) daté de la fin du séjour du personnage (`from = to` = fin du segment).
- Nouvelle règle de cohérence « preuve datée du départ » dans la vérification du moteur.
- La génération fait finir les séjours des innocents couverts par une preuve dans la fenêtre de l’heure du mystère, de sorte que la preuve date du départ et innocente quand même.
- La réparation n’ajoute une preuve que si le séjour finit assez près de l’heure du mystère ; sinon elle choisit un indice PNJ ou ne répare pas.
- L’exemple de référence du modèle est ajusté : Paul quitte la boulangerie à 21h03 (au lieu de 21h15), l’heure de son ticket.

Hors périmètre : le solveur (inchangé), les indices PNJ, les durées de séjour par type de lieu (idée notée pour plus tard).

## Capabilities

### New Capabilities
<!-- Aucune. -->

### Modified Capabilities
- `consistency-rules`: nouvelle règle « preuve datée du départ ».
- `investigation-generation`: les preuves sont datées du départ et innocentent ; la réparation respecte cette règle.

## Impact

- Code : `src/lib/engine/generate.ts`, `src/lib/engine/rules.ts` et leurs tests, `src/lib/engine/rules.spec.ts` et `solver.spec.ts` (exemple de référence).
- Docs : `docs/reference/DATA-MODEL.md` (§4, §6, exemple §8).
- Catalogue et solveur inchangés.
