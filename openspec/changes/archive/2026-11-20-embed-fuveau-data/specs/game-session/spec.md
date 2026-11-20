# Spec Delta

## MODIFIED Requirements

### Requirement: Génération dans un Web Worker
Le jeu SHALL charger la zone, calculer les trajets et générer l’enquête dans un Web Worker, sans bloquer l’interface. Les données étant dans l’application, l’enquête SHALL être affichée en moins de 3 secondes sur un téléphone moyen.

#### Scenario: Démarrage à Fuveau
- **WHEN** le joueur choisit Fuveau et une difficulté
- **THEN** une enquête est affichée en moins de 3 secondes et l’interface reste réactive pendant le calcul

#### Scenario: Échec de génération
- **WHEN** le générateur ne peut pas produire d’enquête pour la zone et la difficulté
- **THEN** le jeu l’explique et propose une autre difficulté
