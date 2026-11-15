# consistency-rules Specification

## Purpose

Vérifie, sur toute enquête générée, les règles de cohérence du modèle (`docs/reference/DATA-MODEL.md` §6) : une enquête qui en viole une est réparée ou rejetée, jamais livrée.

## Requirements

### Requirement: Toutes les règles sont vérifiées avant livraison
Le moteur SHALL vérifier les règles de cohérence du modèle sur chaque enquête avant de la retourner et SHALL rejeter toute enquête qui en viole une, en nommant la règle.

#### Scenario: Enquête invalide
- **WHEN** une enquête viole une règle de cohérence
- **THEN** la vérification échoue en nommant la règle violée

#### Scenario: 500 seeds
- **WHEN** on génère des enquêtes sur 500 seeds avec un jeu de 8 lieux (4 `scene`, 2 `alibi`, 1 `excluded`, 1 `removed`) et à chaque difficulté de 1 à 3
- **THEN** 100 % des enquêtes produites respectent toutes les règles

### Requirement: Mensonge démasquable
Le témoignage mensonger SHALL être démasquable : contredit par au moins un fait fiable à la fin de la résolution, qui n’est pas de l’auteur, ou impossible selon les horaires d’ouverture du lieu pour le jour de l’enquête ; et aucun fait vrai SHALL être contredit par un fait fiable.

#### Scenario: Mensonge sans contradiction
- **WHEN** le témoignage mensonger n’est contredit par aucun fait fiable et tombe dans les horaires du lieu
- **THEN** l’enquête est rejetée

#### Scenario: Mensonge révélé par les horaires
- **WHEN** le témoignage mensonger place l’auteur dans un lieu fermé à cette heure ce jour-là
- **THEN** la règle est respectée même sans fait fiable qui le contredise

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
Une enquête SHALL avoir une scène de rôle `scene`, aucun lieu `excluded` ou `removed`, des indices compatibles avec leur lieu et pendant ses horaires du jour de l’enquête, et une matrice de trajets complète.

#### Scenario: Indice incompatible
- **WHEN** un indice n’est pas dans la table de compatibilité du type de son lieu
- **THEN** l’enquête est rejetée

#### Scenario: Indice un jour de fermeture
- **WHEN** un indice est daté d’une heure où son lieu est fermé le jour de l’enquête
- **THEN** l’enquête est rejetée

### Requirement: Preuve datée du départ
Toute preuve (indice de nature `proof`) SHALL être un fait de départ daté de la fin du segment du personnage qu’elle concerne (`departure` vrai, `from = to` = fin du segment), car elle prouve un achat ou un passage après lequel la personne part.

#### Scenario: Preuve conforme
- **WHEN** un ticket de caisse concerne un séjour qui finit à 21h03
- **THEN** le fait est un départ daté de 21h03 et la règle est respectée

#### Scenario: Preuve au milieu du séjour
- **WHEN** une addition est datée de 16h56 alors que le séjour du personnage finit à 17h59
- **THEN** l’enquête est rejetée en nommant la règle « preuve datée du départ »

#### Scenario: Indice PNJ non concerné
- **WHEN** un indice PNJ place un personnage au lieu pendant son séjour
- **THEN** la règle n’est pas appliquée à cet indice

### Requirement: Heure du mystère ronde
L’heure du mystère d’une enquête SHALL être un multiple de 5 minutes.

#### Scenario: Heure ronde
- **WHEN** l’heure du mystère est 10h15
- **THEN** la règle est respectée

#### Scenario: Heure précise
- **WHEN** l’heure du mystère est 7h57
- **THEN** l’enquête est rejetée en nommant la règle « heure du mystère ronde »

### Requirement: Objets compatibles avec le scénario
Les objets d’une enquête SHALL exister dans le catalogue, être tous différents, porter chacun une étiquette acceptée par le scénario de l’enquête, et leur nombre SHALL être compris entre le minimum et le maximum de ce scénario.

#### Scenario: Objets conformes
- **WHEN** une enquête contient deux objets différents acceptés par son scénario, qui en demande 1 à 2
- **THEN** la règle est respectée

#### Scenario: Objet étranger au scénario
- **WHEN** une enquête contient un objet dont aucune étiquette n’est acceptée par son scénario
- **THEN** l’enquête est rejetée en nommant la règle

#### Scenario: Mauvais nombre d’objets
- **WHEN** une enquête contient plus d’objets que le maximum de son scénario, ou un objet en double
- **THEN** l’enquête est rejetée en nommant la règle

### Requirement: Faits vrais dans les horaires
Tout fait vrai SHALL tomber dans les horaires d’ouverture de son lieu pour le jour de l’enquête ; seul le mensonge de l’auteur peut y échapper.

#### Scenario: Témoignage vrai dans un lieu fermé
- **WHEN** un témoignage non mensonger place quelqu’un dans un lieu fermé à cette heure
- **THEN** l’enquête est rejetée

#### Scenario: Faits conformes
- **WHEN** tous les faits vrais tombent dans les horaires de leur lieu
- **THEN** la règle est respectée
