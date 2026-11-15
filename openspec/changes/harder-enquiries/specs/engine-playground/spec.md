# Spec Delta

## ADDED Requirements

### Requirement: Jour et horaires visibles
La page SHALL afficher le jour de l’enquête et, pour chaque lieu de l’enquête, ses horaires ce jour-là (intervalles, « toujours ouvert » ou « fermé »), pour que l’utilisateur puisse vérifier les faits contre les horaires.

#### Scenario: Jour affiché
- **WHEN** une enquête est générée
- **THEN** la page affiche si l’enquête a lieu en semaine ou le week-end

#### Scenario: Horaires des lieux
- **WHEN** la page liste les lieux de l’enquête dans la section « Enquêter »
- **THEN** chaque lieu montre ses horaires du jour de l’enquête

### Requirement: Genre de mensonge dans le snapshot
L’onglet « Snapshot » SHALL afficher le genre du mensonge (`alibi`, `framing` ou `closed`) et le jour de l’enquête.

#### Scenario: Genre et jour
- **WHEN** on ouvre le snapshot d’une enquête
- **THEN** il liste le genre du mensonge et le jour de l’enquête
