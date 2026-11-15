# Proposal

## Why

Le moteur tire l’heure du mystère à la minute près : on voit « À 16h39 » ou « À 9h56 ». Une heure aussi précise paraît artificielle, alors qu’un mystère se situe naturellement à 10h15, 8h05 ou 18h30. Source : demande directe, hors brief (ajustement de la génération du changement archivé `add-generation-engine`).

## What Changes

- L’heure du mystère est toujours un multiple de 5 minutes (10h15, 8h05, 18h30 ; jamais 7h57 ni 18h13).
- La génération choisit cette heure dans la plage du scénario et les horaires de la scène, arrondie à 5 minutes ; un couple scénario/scène sans multiple de 5 minutes possible est écarté.
- Nouvelle règle de cohérence « heure du mystère ronde » dans la vérification du moteur.
- Le modèle de données le documente (convention et règle de cohérence).

Hors périmètre : les autres heures (faits, séjours, départs) gardent leur précision à la minute ; le solveur est inchangé.

## Capabilities

### New Capabilities
<!-- Aucune. -->

### Modified Capabilities
- `investigation-generation`: l’heure du mystère est un multiple de 5 minutes.
- `consistency-rules`: nouvelle règle « heure du mystère ronde ».

## Impact

- Code : `src/lib/engine/generate.ts` (choix de l’heure), `src/lib/engine/rules.ts` et leurs tests.
- Docs : `docs/reference/DATA-MODEL.md` (conventions, §6).
- Catalogue et solveur inchangés ; les plages horaires des scénarios et les horaires des lieux sont déjà en multiples de 5 minutes.
