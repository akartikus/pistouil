# Proposal

## Why

Le cœur du jeu est une enquête valide, générée à la demande à partir de lieux réels, sans écrire de mystère « à l’envers ». Tout le reste (données OSM, trajets, carte, interface) consomme cette enquête : le moteur est la première brique et la seule qui détermine si le jeu est faisable. Source : `docs/briefs/01-generation-engine.md`.

## What Changes

Périmètre exact du brief 01 (Inclus / Exclu), sans extension :

- Types TypeScript du modèle (`docs/reference/DATA-MODEL.md`) : catalogue, lieux, enquête, faits, sources, segments, trajets, progression.
- Catalogue de départ en JSON (`catalog/`) : types de lieux et rôles, types d’indices, compatibilités, 7 modèles de scénario avec leurs révélations par motif, 16 prénoms, gabarits de témoignage. Contenu issu de `docs/writing/`, supprimé une fois encodé.
- Rendu des textes par le moteur (`renderedText` pour chaque indice et témoignage).
- Générateur déterministe : scène, heure, suspects, auteur, vraie soirée, témoignages, mensonge, indices, liens « débloqué par ».
- Solveur (référence §7), y compris faits atteignables et contradiction entre faits.
- Vérification des règles de cohérence (référence §6) ; une enquête qui en viole une est réparée ou rejetée.
- Générateur pseudo-aléatoire initialisé par la seed.
- Mise à jour du cap (`docs/VISION.md`) : feuille de route, suppression de `docs/writing/`.

Hors périmètre : lecture OSM (brief 02), calcul des trajets (brief 03), interface, carte, stockage, textes enrichis par IA. Le moteur reçoit lieux et matrice de trajets en entrée.

## Capabilities

### New Capabilities
- `catalog`: contenu du catalogue (types, compatibilités, scénarios, prénoms, gabarits) et sa validation.
- `text-rendering`: remplissage déterministe des gabarits en `renderedText`, sans variable non résolue ni indice du mensonge.
- `investigation-generation`: génération reproductible d’une enquête (vérité d’abord, un seul mensonge avec motif, rôles des lieux, suspects selon la difficulté, réparation ou rejet).
- `investigation-solver`: résolution par déduction à partir des seules données visibles, difficulté, faits atteignables.
- `consistency-rules`: règles de cohérence vérifiées sur toute enquête (matrice complète, mensonge démasquable, déblocage sans cycle…).

### Modified Capabilities
<!-- Aucune : le projet n’a pas encore de spec. -->

## Impact

- Code : `src/lib/engine` (nouveau), `catalog/` (nouveau JSON).
- Docs : `docs/VISION.md` (feuille de route), suppression de `docs/writing/`.
- Aucune dépendance ajoutée. Aucun accès réseau, DOM ni `Math.random` dans le moteur.
