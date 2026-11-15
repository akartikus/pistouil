# Spec Delta

## ADDED Requirements

### Requirement: Horaires de semaine et de week-end
Chaque type de lieu et chaque lieu SHALL avoir des horaires pour la semaine et pour le week-end, chacun étant une liste d’intervalles, « toujours ouvert » ou « fermé toute la journée », et le catalogue de départ SHALL contenir des lieux dont les horaires diffèrent entre les deux jours.

#### Scenario: Horaires des deux jours
- **WHEN** on charge le catalogue de départ
- **THEN** chaque type de lieu donne ses horaires de semaine et de week-end

#### Scenario: Lieu fermé le week-end
- **WHEN** on consulte une mairie ou une école
- **THEN** elle est fermée le week-end

#### Scenario: Horaires du lieu
- **WHEN** un lieu fournit ses propres horaires
- **THEN** ils remplacent ceux de son type, pour la semaine comme pour le week-end

#### Scenario: Horaires invalides
- **WHEN** un type de lieu n’a pas d’horaires pour un des deux jours
- **THEN** le chargement échoue en nommant le type

### Requirement: Gabarits de témoignage naturels
Le chargement du catalogue SHALL refuser un gabarit de témoignage qui contient une tournure interdite, comme « au revoir à » (on ne dit pas au revoir à un lieu) ou « précisément » (qui désigne le témoignage), et le catalogue de départ SHALL en être exempt.

#### Scenario: Au revoir à un lieu
- **WHEN** un gabarit contient « j’ai dit au revoir à {place} »
- **THEN** le chargement échoue en nommant le gabarit

#### Scenario: Précision suspecte
- **WHEN** un gabarit contient « précisément »
- **THEN** le chargement échoue en nommant le gabarit

#### Scenario: Catalogue de départ
- **WHEN** on charge le catalogue de départ
- **THEN** aucun gabarit de témoignage ne contient de tournure interdite
