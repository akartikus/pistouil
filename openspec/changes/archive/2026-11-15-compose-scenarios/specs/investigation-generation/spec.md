# Spec Delta

## ADDED Requirements

### Requirement: Les objets de la farce sont tirés avec la seed
Quand le scénario retenu accepte des objets, la génération SHALL en tirer un nombre compris entre son minimum et son maximum, tous différents, parmi les objets du catalogue portant une de ses étiquettes, et SHALL les conserver dans l’enquête ; un scénario sans objet n’en reçoit aucun.

#### Scenario: Objets du scénario
- **WHEN** une enquête est générée avec un scénario qui accepte 1 à 2 objets d’étiquette `wearable`
- **THEN** l’enquête contient 1 ou 2 objets différents, tous d’étiquette `wearable`

#### Scenario: Même seed, mêmes objets
- **WHEN** on génère deux fois avec les mêmes entrées
- **THEN** les objets tirés sont identiques et dans le même ordre

#### Scenario: Variété
- **WHEN** on génère des enquêtes du même scénario sur de nombreuses seeds
- **THEN** plusieurs combinaisons d’objets différentes apparaissent

#### Scenario: Scénario sans objet
- **WHEN** le scénario retenu n’accepte aucun objet
- **THEN** l’enquête ne contient aucun objet
