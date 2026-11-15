# Proposal

## Why

Le moteur du brief 01 n’a pas encore d’interface : on ne peut juger ni les scénarios, ni la qualité des enquêtes générées, ni les textes qu’en lisant des tests. Une page de test permet d’essayer le moteur à la main, de résoudre soi-même l’enquête comme un joueur pour juger sa cohérence, de comparer scénarios et motifs, et de comprendre pourquoi une enquête est valide, avant d’enchaîner sur les données OSM (brief 02). Source : demande directe, hors brief ; changement outil de développement, sans impact sur le jeu.

## What Changes

- Une route `/playground`, réservée au développement, qui génère une enquête avec le catalogue de départ et les lieux fictifs.
- Contrôles : seed (avec tirage aléatoire), difficulté 1 à 3, scénario (ou « n’importe lequel »), motif (ou « n’importe lequel »), lieux actifs.
- Résultat : situation du mystère, heure et scène, suspects, règles de cohérence et difficulté mesurée, échec de génération le cas échéant.
- La matrice des distances (minutes et mètres) entre les lieux actifs.
- Un mode « enquêteur » : ouvrir un lieu révèle ses faits (selon les liens « débloqué par »), puis accuser un suspect ; la page dit si c’est le bon.
- Une case pour révéler la solution et le détail du moteur : auteur, mensonge, vraie soirée, révélation, étapes du solveur, statut des faits et liens de déblocage ; cachés par défaut.
- La liste des scénarios du catalogue, par titre seulement.
- Deux onglets : « Simulation » (résoudre l’enquête) et « Snapshot » (ce que le moteur a choisi : variables, suspects avec leur vraie soirée, faits bruts).
- Logique d’affichage dans `src/lib/playground`, testée ; aucune modification du moteur.

Hors périmètre : interface de jeu, carte, stockage, édition du catalogue, lieux réels (briefs 02 à 05).

## Capabilities

### New Capabilities
- `engine-playground`: page de développement pour générer, inspecter et comparer des enquêtes et parcourir les scénarios du catalogue.

### Modified Capabilities
<!-- Aucune : le moteur et ses specs ne changent pas. -->

## Impact

- Code : `src/routes/playground/` (nouveau), `src/lib/playground/` (nouveau).
- Docs : ligne `src/lib/playground` dans `AGENTS.md`.
- Aucune dépendance ajoutée. La page n’est pas accessible en production.
