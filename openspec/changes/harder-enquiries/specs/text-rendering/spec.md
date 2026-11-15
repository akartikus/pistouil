# Spec Delta

## ADDED Requirements

### Requirement: Le jour est rendu dans la situation
Le moteur SHALL rendre le jour de l’enquête dans la situation du mystère : « En semaine » ou « Le week-end » en début de phrase, devant l’heure.

#### Scenario: En semaine
- **WHEN** l’enquête a lieu en semaine
- **THEN** la situation commence par « En semaine, à » suivi de l’heure

#### Scenario: Le week-end
- **WHEN** l’enquête a lieu le week-end
- **THEN** la situation commence par « Le week-end, à » suivi de l’heure
