# Proposal

## Why

Le catalogue de départ ne couvre que 17 types de lieux publics et le jeu de lieux de test seulement 8 lieux : on ne peut pas bien juger le moteur. Il faut plus de variété (commerces, bar, bureau de poste, école de musique, cinéma, salle de spectacle…) pour trouver les cas limites avant d’attaquer les vraies données OSM (brief 02). Source : demande directe, hors brief ; ajustements du moteur au fil des tests.

## What Changes

- Nouveaux types de lieux dans `catalog/` : bar, bureau de poste, cinéma, salle de spectacle, musée, mairie, salle de sport, boucherie, primeur, fleuriste, librairie, magasin de vêtements, coiffeur, tabac, supermarché ; école de musique en lieu sensible (`alibi`).
- Nouveaux types d’indices : un reçu de dépôt (preuve) et deux indices PNJ (guichet, personnel de salle) ; compatibilités des nouveaux lieux.
- Les scènes possibles de certains scénarios s’élargissent aux nouveaux lieux (le tapis rouge peut tomber devant un cinéma, une librairie…).
- Un second jeu de lieux de test, riche, avec des positions réalistes et une matrice de trajets déduite des distances, qui couvre tous les types du catalogue ; le jeu de 8 lieux des tests existants est conservé.
- Le playground utilise le jeu riche ; un test de charge vérifie le moteur sur ce jeu.

Hors périmètre : nouveaux scénarios, changement du moteur, vrais lieux OSM (brief 02). Les ajustements du moteur viendront des tests.

## Capabilities

### New Capabilities
<!-- Aucune. -->

### Modified Capabilities
<!-- Aucune : aucune exigence ne change, seul le contenu du catalogue et les données de test grandissent (skip_specs). -->

## Impact

- Données : `catalog/place-types.json`, `catalog/clue-types.json`, `catalog/compatibilities.json`, `catalog/scenarios.json`.
- Code de test : `src/lib/engine/fixtures.ts`, `catalog.spec.ts`, `generate.spec.ts`.
- Page `src/routes/playground/+page.svelte` (jeu de lieux).
