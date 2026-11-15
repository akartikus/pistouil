# Spec Delta

## ADDED Requirements

### Requirement: Heure du mystère ronde
L’heure du mystère d’une enquête SHALL être un multiple de 5 minutes.

#### Scenario: Heure ronde
- **WHEN** l’heure du mystère est 10h15
- **THEN** la règle est respectée

#### Scenario: Heure précise
- **WHEN** l’heure du mystère est 7h57
- **THEN** l’enquête est rejetée en nommant la règle « heure du mystère ronde »
