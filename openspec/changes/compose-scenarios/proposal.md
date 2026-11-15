# Proposal

## Why

Un scénario est aujourd’hui un bloc figé : une phrase de situation et cinq révélations qui citent chacune les détails de la farce (« La statue branchée » ne sait porter que des lunettes et un casque). Impossible de combiner : chaque variante (perruque, rouge à lèvres, écharpe…) demande de réécrire un scénario entier. On veut des farces génériques, complétées par des objets tirés d’une réserve, pour multiplier les enquêtes sans multiplier les textes. Source : demande directe après essais dans le playground, hors brief ; option 1 retenue en exploration (une farce par verbe, objets interchangeables).

## What Changes

- Nouveau contenu de catalogue : les **objets** (`ItemType`), avec des étiquettes et deux formes toutes faites, indéfinie (« une perruque rose ») et définie (« la perruque »).
- Un scénario déclare les étiquettes d’objets qu’il accepte et leur nombre (minimum et maximum) ; un scénario peut rester sans objet.
- Le moteur tire les objets avec la seed, les garde dans l’enquête (`itemIds`), et rend la situation (`{items}`) et la révélation (`{item}`, premier objet).
- Règles d’écriture vérifiées au chargement : variables connues, objets jamais placés après « de » ou « à », assez d’objets pour chaque scénario.
- Nouvelle règle de cohérence : les objets d’une enquête correspondent à son scénario.
- Les 7 scénarios actuels sont réécrits en farces composables, avec des révélations qui ne citent plus un objet figé. Deux identifiants changent : `statue_sunglasses` devient `statue_makeover`, `red_carpet` devient `vip_entrance`. Les textes n’inventent plus de phrase autour du type de lieu (« la statue de Fontaine des Lilas ») : `{place}` est utilisé tel quel.
- Le snapshot du playground affiche les objets choisis.
- Le modèle de données et le cap documentent la composition.

Hors périmètre : petit mot tiré au hasard (option 2), plusieurs verbes par farce (option 3), textes réécrits par IA, nouveaux scénarios au-delà des 7 actuels.

## Capabilities

### New Capabilities
<!-- Aucune. -->

### Modified Capabilities
- `catalog`: objets du catalogue et validation des scénarios composables.
- `investigation-generation`: tirage des objets avec la seed, conservés dans l’enquête.
- `text-rendering`: rendu de la liste d’objets et de l’objet cité dans la révélation.
- `consistency-rules`: règle « objets compatibles avec le scénario ».
- `engine-playground`: le snapshot affiche les objets choisis.

## Impact

- Données : `catalog/items.json` (nouveau), `catalog/scenarios.json` (réécrit).
- Code : `src/lib/engine/` (`types.ts`, `catalog.ts`, `render.ts`, `generate.ts`, `rules.ts`, `fixtures.ts` et leurs tests), `src/lib/playground/playground.ts` et son test, `src/routes/playground/+page.svelte` si l’affichage le demande.
- Docs : `docs/reference/DATA-MODEL.md`, `docs/VISION.md`, `AGENTS.md`.
- Solveur inchangé. Aucune dépendance ajoutée.
