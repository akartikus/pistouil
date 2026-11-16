# Proposal

## Why

Le moteur, les données, les trajets et la carte existent, mais personne ne peut encore jouer : il manque le parcours complet, du choix du lieu à la révélation. Source : `docs/briefs/05-game-loop.md`, avec les croquis de `docs/design/` et les décisions prises en exploration (voir `docs/VISION.md` §6).

## What Changes

- **Zone** : le joueur choisit une commune ou sa position ; la zone prend un rayon adaptatif jusqu’à réunir assez de lieux, et le moteur reçoit au plus 40 lieux utilisables, les plus proches du centre. Si la zone est insuffisante, le jeu l’explique et propose des communes voisines.
- **Worker** : l’enquête est générée dans un Web Worker, qui garde l’enquête complète. L’interface ne reçoit qu’une projection sans donnée cachée (ni auteur, ni mensonge, ni vraie soirée, ni texte de révélation) ; elle n’obtient les faits d’un lieu qu’en l’ouvrant.
- **Progression** : lieux ouverts, trajets mesurés, annotations, notes, statut d’alibi de chaque suspect (choisi par le joueur), accusation unique. Sauvegarde locale, reprise par la seed, avec la version des données.
- **Déduction** : curseur horaire qui place les suspects selon les faits découverts ; aucune incohérence ni aucun verdict d’alibi pendant la partie (le joueur mesure les trajets et déduit lui-même) ; ils sont expliqués dans le Carnet à la fin de la partie.
- **Écrans** : départ, Carte (panneau d’un lieu avec ses pièces, choix du trajet parmi les lieux retenus, curseur horaire, pastilles de suspects), Carnet, Suspects et fiches qui se remplissent au fil de l’enquête, accusation, Réglages et À propos.
- **Révélation** : verdict, auteur, texte de révélation, et rejeu de la vraie soirée sur la carte le long des trajets.
- **Carte** : lieux et pastilles de suspects cliquables ; l’attribution passe à un bouton « i » (texte déplié à l’affichage), le texte complet allant dans À propos.
- **Catalogue** : les types d’indice portent une icône (objet ou pictogramme) et un libellé français pour les pièces.

**Exclu** (comme le brief) : hors-ligne complet et application native (brief 06), limite de visites, score, partage, IA. Reporté à l’étape 8 : finitions du design (orange, illustrations des têtes, police de l’interface, écrans de confirmation, de démarrage et de rejeu à finir). Aucun changement du moteur : les liens « débloqué par » restent à l’intérieur d’un lieu.

## Capabilities

### New Capabilities
- `game-zone` : choix du centre, chargement des données, rayon adaptatif, sélection des lieux, zone insuffisante.
- `game-session` : Worker, projection sans donnée cachée, ouverture de lieu, mesure de trajet, progression, accusation, sauvegarde et reprise.
- `game-deduction` : positions au curseur horaire ; incohérences et alibis expliqués à la fin de la partie.
- `game-screens` : départ, navigation, Carte, pièces, trajets, Carnet, Suspects et fiches, accusation, Réglages et À propos.
- `game-reveal` : révélation et rejeu de la vraie soirée.

### Modified Capabilities
- `map-display` : l’attribution devient un bouton « i » déplié à l’affichage ; lieux et pastilles de suspects cliquables.
- `catalog` : les types d’indice portent une icône et un libellé (nouvelle exigence).

## Impact

- `src/lib/game/` : logique pure (zone, progression, projection, déduction, soirée, stockage, textes, protocole), Worker, état de l’interface ; tests.
- `src/lib/data/` : chargement de l’index des communes et des cases (lieux, graphe).
- `src/lib/map/Map.svelte` : événements de lieu et de suspect, pastilles de suspects, attribution.
- `src/routes/` : départ, jeu (Carte, Carnet, Suspects, fiches), Réglages.
- `src/lib/playground/` : `discoveredFactIds` et `checkAccusation` passent dans `src/lib/game` et le playground les importe.
- `catalog/clue-types.json` (`icon`, `label`), `src/lib/engine/types.ts` (`ClueType`), `static/map/icons/` (pièces).
- `docs/reference/DATA-MODEL.md` §5 (`Progress`), `docs/VISION.md` (§6, §7), `AGENTS.md`.
