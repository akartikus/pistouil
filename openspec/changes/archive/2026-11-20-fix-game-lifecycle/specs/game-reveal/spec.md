# Spec Delta

## ADDED Requirements

### Requirement: Tous les faits à la révélation
La révélation SHALL fournir tous les faits de l’enquête, y compris ceux des lieux que le joueur n’a pas ouverts, pour que le Carnet explique toute la partie. Ces faits n’existent côté interface qu’à partir de l’accusation.

#### Scenario: Faits de lieux jamais ouverts
- **WHEN** le joueur accuse sans avoir ouvert tous les lieux
- **THEN** la révélation contient aussi les faits des lieux non ouverts

#### Scenario: Avant l’accusation
- **WHEN** le joueur n’a pas accusé
- **THEN** l’interface ne reçoit aucun fait d’un lieu non ouvert
