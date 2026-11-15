# Spec Delta

## ADDED Requirements

### Requirement: Les objets sont rendus sans accord
Le moteur SHALL rendre la liste des objets d’une enquête dans la situation avec leurs formes indéfinies, séparées par des virgules et un « et » final, et SHALL rendre l’objet cité dans la révélation avec la forme définie du premier objet tiré, sans qu’aucun mot du gabarit ait à s’accorder avec eux.

#### Scenario: Un objet
- **WHEN** l’enquête a un seul objet, « une perruque rose »
- **THEN** la situation contient « une perruque rose »

#### Scenario: Deux objets
- **WHEN** l’enquête a deux objets
- **THEN** la situation les contient reliés par « et », comme « des lunettes de soleil et une perruque rose »

#### Scenario: Trois objets
- **WHEN** l’enquête a trois objets
- **THEN** la situation les contient sous la forme « a, b et c »

#### Scenario: Objet de la révélation
- **WHEN** la révélation d’un scénario cite un objet
- **THEN** elle contient la forme définie du premier objet tiré, comme « la perruque »
