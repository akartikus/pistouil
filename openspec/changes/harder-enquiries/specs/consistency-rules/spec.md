# Spec Delta

## MODIFIED Requirements

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

### Requirement: Lieux et trajets
Une enquête SHALL avoir une scène de rôle `scene`, aucun lieu `excluded` ou `removed`, des indices compatibles avec leur lieu et pendant ses horaires du jour de l’enquête, et une matrice de trajets complète.

#### Scenario: Indice incompatible
- **WHEN** un indice n’est pas dans la table de compatibilité du type de son lieu
- **THEN** l’enquête est rejetée

#### Scenario: Indice un jour de fermeture
- **WHEN** un indice est daté d’une heure où son lieu est fermé le jour de l’enquête
- **THEN** l’enquête est rejetée

## ADDED Requirements

### Requirement: Faits vrais dans les horaires
Tout fait vrai SHALL tomber dans les horaires d’ouverture de son lieu pour le jour de l’enquête ; seul le mensonge de l’auteur peut y échapper.

#### Scenario: Témoignage vrai dans un lieu fermé
- **WHEN** un témoignage non mensonger place quelqu’un dans un lieu fermé à cette heure
- **THEN** l’enquête est rejetée

#### Scenario: Faits conformes
- **WHEN** tous les faits vrais tombent dans les horaires de leur lieu
- **THEN** la règle est respectée
