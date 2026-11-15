# Spec Delta

## ADDED Requirements

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
