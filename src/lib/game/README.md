# Boucle de jeu

Logique du jeu au-dessus du moteur (`src/lib/engine`) : zone, session dans un Web Worker, progression, déduction, révélation, sauvegarde. Changement : `add-game-loop`.

| Fichier | Rôle |
| --- | --- |
| `zone.ts` | Rayon adaptatif (500 m, 1, 2, 4 km), au plus 40 lieux retenus, communes voisines |
| `session.ts` | `startSession` (charge la zone, calcule les trajets, génère) et `handle` (ouvrir un lieu, mesurer un trajet, accuser) : fonctions testables sans Worker |
| `engine.worker.ts`, `client.ts` | Branchement du Worker et de son client ; seul le Worker garde l'enquête complète |
| `protocol.ts` | Messages entre l'interface et le Worker |
| `projection.ts` | Ce que l'interface peut savoir (rien de caché) ; faits d'un lieu ouvert |
| `progress.ts`, `discovery.ts` | Progression du joueur ; faits découverts, accusation |
| `deduction.ts` | Positions au curseur horaire, incohérences et alibis suffisants après mesure |
| `evening.ts` | Position d'un suspect pendant le rejeu de la vraie soirée |
| `save.ts` | Sauvegarde locale versionnée (graine, zone, version des données, progression) |
| `game.svelte.ts` | État de l'interface (runes), branché sur le Worker et la sauvegarde |

Les données viennent de `VITE_DATA_URL` (`/dev-data` par défaut en développement, voir `tools/data-preparation/README.md`).

## Mesures (Fuveau, mairie, données locales, machine de bureau)

Démarrage complet (lecture des cases, trajets sur le réseau piéton, génération), difficultés 1 à 3 : **93 à 150 ms**, 13 fichiers, **709 Ko** lus (non compressés), rayon 500 m, 84 lieux de décor. L'enquête n'utilise que 4 à 5 des lieux retenus.

## Écarts avec les croquis (`docs/design/`), relevés au premier essai complet

- Les heures s'affichent « 20h45 » (format du moteur, comme dans les textes des faits) et non « 20:45 ».
- Le panneau d'un lieu n'affiche pas « N pièces » : le jeu n'annonce jamais combien de pièces il y a (règle de la fiche).
- Une pièce ouverte est une carte rectangulaire cadrée (pas encore en forme de ticket) ; les finitions sont reportées à l'étape 8.
- Sur un petit écran, le panneau d'un lieu et le curseur horaire couvrent une grande partie de la carte.
- L'accusation se confirme dans la fiche (encart) plutôt que dans une fenêtre.
