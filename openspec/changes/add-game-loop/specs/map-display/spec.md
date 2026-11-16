# Spec Delta

## MODIFIED Requirements

### Requirement: Attribution toujours visible
La carte SHALL afficher en permanence un bouton « i » qui déplie l’attribution (« © OpenStreetMap contributors » et schéma de tuiles). L’attribution SHALL être dépliée à l’affichage de la carte, puis se replier après quelques secondes ou au premier déplacement. Le texte complet figure aussi dans À propos.

#### Scenario: Mentions visibles
- **WHEN** la carte est affichée, quel que soit le thème
- **THEN** le bouton « i » est visible

#### Scenario: Attribution dépliée à l’affichage
- **WHEN** la carte s’affiche pour la première fois
- **THEN** l’attribution est lisible, puis se replie après quelques secondes ou au premier déplacement

#### Scenario: Retrouver l’attribution
- **WHEN** le joueur touche « i » après le repli
- **THEN** l’attribution se déplie à nouveau

## ADDED Requirements

### Requirement: Lieux et pastilles de suspects cliquables
La carte SHALL signaler au code le toucher d’un lieu de l’enquête, du lieu du mystère ou d’une pastille de suspect, avec son identifiant, et afficher des pastilles à initiale pour les suspects à une position donnée, et le toucher de la carte nue, sans décider elle-même de ce qui s’ouvre.

#### Scenario: Toucher un lieu de l’enquête
- **WHEN** le joueur touche le marqueur d’un lieu de l’enquête
- **THEN** le composant signale l’identifiant de ce lieu

#### Scenario: Toucher la carte nue
- **WHEN** le joueur touche la carte ailleurs que sur un lieu de l’enquête, une pastille de suspect ou un lieu de décor
- **THEN** le composant signale un toucher de la carte

#### Scenario: Toucher une pastille
- **WHEN** le joueur touche la pastille d’un suspect
- **THEN** le composant signale l’identifiant de ce suspect
