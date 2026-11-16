# game-reveal Specification

## Purpose
Accusation et révélation de fin de partie : verdict, auteur, texte de révélation, rejeu de la soirée et trajets, une seule accusation par enquête.

## Requirements

### Requirement: Révélation après l’accusation
Après l’accusation, le jeu SHALL afficher le verdict (juste ou non), le prénom de l’auteur et le texte de révélation du motif du mensonge. Ces données n’existent côté interface qu’à partir de l’accusation.

#### Scenario: Accusation juste
- **WHEN** le joueur accuse l’auteur
- **THEN** le jeu le dit, nomme l’auteur et affiche le texte de révélation

#### Scenario: Accusation fausse
- **WHEN** le joueur accuse un innocent
- **THEN** le jeu le dit, nomme le vrai auteur et affiche le texte de révélation

### Requirement: Explication de la partie
Après l’accusation, la révélation SHALL fournir les trajets entre les lieux de l’enquête, et le Carnet SHALL alors expliquer la partie : incohérences et alibis calculés avec ces trajets, selon la capability `game-deduction`. La révélation SHALL proposer d’y accéder.

#### Scenario: Accès au carnet expliqué
- **WHEN** la révélation est affichée
- **THEN** un bouton mène au Carnet, qui montre maintenant les incohérences et les alibis expliqués

### Requirement: Rejeu de la vraie soirée
La carte SHALL rejouer la vraie soirée : chaque suspect se déplace entre ses séjours le long du tracé du trajet (ligne droite si le trajet est approximatif), selon une horloge que le joueur peut lancer, mettre en pause et déplacer.

#### Scenario: Déplacement entre deux séjours
- **WHEN** l’horloge passe entre la fin d’un séjour et le début du suivant
- **THEN** le suspect se trouve sur le tracé entre les deux lieux, proportionnellement au temps écoulé

#### Scenario: Pendant un séjour
- **WHEN** l’horloge est dans un séjour
- **THEN** le suspect est au lieu du séjour

### Requirement: Révélation rejouable après reprise
Si l’enquête reprise a déjà une accusation, la révélation et le rejeu SHALL être disponibles à nouveau, régénérés à partir de la graine.

#### Scenario: Reprise après accusation
- **WHEN** le joueur rouvre une enquête déjà conclue
- **THEN** il peut relire la révélation et rejouer la soirée

### Requirement: Rejeu calculé par des fonctions pures
Les positions des suspects à une heure donnée SHALL être calculées par une fonction pure et testée, à partir des séjours et des trajets de la vraie soirée.

#### Scenario: Mêmes entrées, mêmes positions
- **WHEN** on calcule deux fois la position d’un suspect à la même heure
- **THEN** les résultats sont identiques
