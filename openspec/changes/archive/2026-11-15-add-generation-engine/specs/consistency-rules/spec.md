# Spec Delta

## Purpose

Vérifie, sur toute enquête générée, les règles de cohérence du modèle (`docs/reference/DATA-MODEL.md` §6) : une enquête qui en viole une est réparée ou rejetée, jamais livrée.

## ADDED Requirements

### Requirement: Toutes les règles sont vérifiées avant livraison
Le moteur SHALL vérifier les règles de cohérence du modèle sur chaque enquête avant de la retourner et SHALL rejeter toute enquête qui en viole une, en nommant la règle.

#### Scenario: Enquête invalide
- **WHEN** une enquête viole une règle de cohérence
- **THEN** la vérification échoue en nommant la règle violée

#### Scenario: 500 graines
- **WHEN** on génère des enquêtes sur 500 graines avec un jeu de 8 lieux (4 `scene`, 2 `alibi`, 1 `excluded`, 1 `removed`) et à chaque difficulté de 1 à 3
- **THEN** 100 % des enquêtes produites respectent toutes les règles

### Requirement: Mensonge démasquable
Le témoignage mensonger SHALL être contredit par au moins un fait fiable à la fin de la résolution, qui n’est pas de l’auteur, et aucun fait vrai SHALL être contredit par un fait fiable.

#### Scenario: Mensonge sans contradiction
- **WHEN** le témoignage mensonger n’est contredit par aucun fait fiable
- **THEN** l’enquête est rejetée

#### Scenario: Vérité contredite
- **WHEN** un fait vrai est contredit par un fait fiable
- **THEN** l’enquête est rejetée

### Requirement: Déblocage sans cycle et solution atteignable
Le graphe « débloqué par » SHALL être sans cycle, toute chaîne finissant par un fait visible dès le départ, et le solveur appliqué aux seuls faits atteignables SHALL trouver l’auteur comme seul suspect.

#### Scenario: Cycle de déblocage
- **WHEN** deux faits se débloquent l’un l’autre
- **THEN** l’enquête est rejetée

#### Scenario: Fait nécessaire inaccessible
- **WHEN** le seul fait qui innocente un suspect n’est jamais atteignable
- **THEN** l’enquête est rejetée

### Requirement: Cohérence des personnages et des textes
Une enquête SHALL avoir `difficulty + 2` personnages aux prénoms distincts, un seul menteur (l’auteur), et un `renderedText` sans variable non résolue pour chaque source.

#### Scenario: Menteur multiple
- **WHEN** un témoignage mensonger est prononcé par un autre suspect que l’auteur
- **THEN** l’enquête est rejetée

#### Scenario: Prénom en double
- **WHEN** deux personnages ont le même prénom
- **THEN** l’enquête est rejetée

### Requirement: Lieux et trajets
Une enquête SHALL avoir une scène de rôle `scene`, aucun lieu `excluded` ou `removed`, des indices compatibles avec leur lieu et pendant ses horaires, et une matrice de trajets complète.

#### Scenario: Indice incompatible
- **WHEN** un indice n’est pas dans la table de compatibilité du type de son lieu
- **THEN** l’enquête est rejetée
