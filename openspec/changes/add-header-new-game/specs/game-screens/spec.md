# Spec Delta

## MODIFIED Requirements

### Requirement: Navigation et réglages
Pendant une enquête, une barre en bas SHALL donner accès aux écrans Carte, Carnet et Suspects, avec le nombre de faits et de suspects. L’en-tête SHALL porter une roue crantée qui ouvre les Réglages et, à côté, un bouton qui mène à l’écran de départ pour commencer une nouvelle enquête, sans rien supprimer.

#### Scenario: Changer d’écran
- **WHEN** le joueur touche « Carnet »
- **THEN** le Carnet s’affiche et son onglet est marqué actif

#### Scenario: Nouvelle enquête depuis l’en-tête
- **WHEN** le joueur touche le bouton de nouvelle enquête de l’en-tête, en cours de partie ou après l’accusation
- **THEN** l’écran de départ s’affiche, qui propose de reprendre l’enquête ou d’en commencer une nouvelle, et l’enquête enregistrée reste intacte tant que le joueur n’en commence pas une autre
