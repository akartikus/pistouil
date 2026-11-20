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

### Requirement: Révélation à la hauteur de l’écran
L’écran de révélation SHALL occuper toute la hauteur entre l’en-tête et les onglets : la carte SHALL prendre la place que laissent le verdict, le curseur et les boutons, sans espace vide sous eux. Sur un petit écran, la carte SHALL garder une hauteur minimale et la page défiler, sans débordement horizontal.

#### Scenario: Écran haut
- **WHEN** la révélation s’affiche sur un écran de 790 × 968 ou de 390 × 844
- **THEN** le dernier bouton touche presque les onglets et la carte s’agrandit d’autant

#### Scenario: Petit écran
- **WHEN** la révélation s’affiche sur un écran de 375 × 667
- **THEN** la carte garde sa hauteur minimale, la page défile jusqu’aux boutons et rien ne déborde en largeur

### Requirement: Tous les faits à la révélation
La révélation SHALL fournir tous les faits de l’enquête, y compris ceux des lieux que le joueur n’a pas ouverts, pour que le Carnet explique toute la partie. Ces faits n’existent côté interface qu’à partir de l’accusation.

#### Scenario: Faits de lieux jamais ouverts
- **WHEN** le joueur accuse sans avoir ouvert tous les lieux
- **THEN** la révélation contient aussi les faits des lieux non ouverts

#### Scenario: Avant l’accusation
- **WHEN** le joueur n’a pas accusé
- **THEN** l’interface ne reçoit aucun fait d’un lieu non ouvert
