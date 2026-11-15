# Spec Delta

## ADDED Requirements

### Requirement: Les preuves datent du départ et innocentent
Quand la génération place une preuve, elle SHALL la dater de la fin du séjour du personnage, et ce séjour SHALL finir assez près de l’heure du mystère pour que la preuve innocente le personnage.

#### Scenario: Addition au départ
- **WHEN** une enquête est générée avec une addition comme preuve
- **THEN** l’addition est datée de l’heure à laquelle le personnage quitte le lieu

#### Scenario: Séjour proche de l’heure du mystère
- **WHEN** une preuve innocente un personnage au tour 1
- **THEN** la fin de son séjour est à moins du temps de trajet vers la scène de l’heure du mystère

### Requirement: La réparation respecte les preuves
Quand la réparation ajoute un indice à un personnage, elle SHALL n’utiliser une preuve que si la fin de son séjour est assez proche de l’heure du mystère pour l’innocenter, sinon un indice PNJ, et SHALL renoncer à réparer s’il n’y en a aucun.

#### Scenario: Séjour trop long pour une preuve
- **WHEN** la fin du séjour d’un personnage est trop éloignée de l’heure du mystère pour qu’une preuve l’innocente
- **THEN** la réparation utilise un indice PNJ compatible avec le lieu

#### Scenario: Aucun indice possible
- **WHEN** aucun indice compatible ne peut innocenter le personnage
- **THEN** la réparation n’ajoute rien
