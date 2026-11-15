# Spec Delta

## ADDED Requirements

### Requirement: L’heure du mystère est ronde
Le moteur SHALL choisir l’heure du mystère parmi les multiples de 5 minutes compris dans la plage horaire du scénario et dans les horaires de la scène, et SHALL écarter un couple scénario/scène qui n’en contient aucun.

#### Scenario: Heures rondes
- **WHEN** des enquêtes sont générées sur de nombreuses seeds
- **THEN** l’heure du mystère de chacune est un multiple de 5 minutes, comme 10h15 ou 8h05, jamais 7h57 ni 18h13

#### Scenario: Dans la plage et les horaires
- **WHEN** une enquête est générée
- **THEN** l’heure du mystère est dans la plage du scénario et dans les horaires de la scène

#### Scenario: Aucun multiple de 5 minutes
- **WHEN** la plage d’un couple scénario/scène ne contient aucun multiple de 5 minutes
- **THEN** ce couple n’est pas utilisé et la génération choisit un autre couple
