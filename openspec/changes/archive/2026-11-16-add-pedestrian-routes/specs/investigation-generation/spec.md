# Spec Delta

## ADDED Requirements

### Requirement: Les trajets approximatifs ne fondent pas de déduction
Un `Route` peut porter `approximate: true` (trajet à vol d’oiseau, voir `docs/reference/DATA-MODEL.md` §5) ; son absence signifie un trajet réel. Une fois la scène choisie, la génération SHALL ne retenir aucun lieu dont le trajet vers la scène est approximatif ; la scène elle-même reste retenue. Quand tous les trajets sont réels, la génération SHALL se comporter exactement comme avant.

#### Scenario: Lieu relié à la scène par un trajet approximatif
- **WHEN** le trajet entre un lieu et la scène est approximatif
- **THEN** ce lieu n’apparaît dans aucun segment ni fait de l’enquête

#### Scenario: Aucun trajet approximatif
- **WHEN** aucun `Route` fourni n’est approximatif
- **THEN** pour les mêmes entrées, l’enquête générée est identique à celle d’avant ce changement

#### Scenario: Scène isolée
- **WHEN** tous les trajets vers une scène sont approximatifs
- **THEN** cette scène ne permet pas d’enquête et la génération essaie une autre scène ou échoue avec sa raison habituelle
