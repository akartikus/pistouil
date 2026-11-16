# Spec Delta

## MODIFIED Requirements

### Requirement: Trajets estimés à vol d’oiseau
Pour les vrais lieux, la page SHALL fournir au moteur une matrice complète de trajets. Quand les fichiers de graphe des cases voisines du centre sont disponibles, les trajets SHALL être calculés sur le réseau piéton (capability `pedestrian-routing`) ; sinon, ou pour une paire non reliée, ils SHALL être estimés à partir de la distance à vol d’oiseau, selon la même formule que le jeu de test riche. La page SHALL indiquer l’origine des durées et, le cas échéant, combien de trajets sont des estimations.

#### Scenario: Matrice complète
- **WHEN** la page retient N vrais lieux
- **THEN** il existe un trajet pour chaque paire de ces lieux, de distance et de durée strictement positives

#### Scenario: Réseau piéton disponible
- **WHEN** les fichiers de graphe sont disponibles pour les cases voisines
- **THEN** la page calcule les trajets sur le réseau piéton et indique que les durées suivent les rues

#### Scenario: Estimation signalée
- **WHEN** les fichiers de graphe sont absents
- **THEN** la page utilise l’estimation à vol d’oiseau et indique que les durées sont des estimations

#### Scenario: Trajets partiellement estimés
- **WHEN** le réseau ne relie pas certaines paires de lieux
- **THEN** la page indique le nombre de trajets estimés à vol d’oiseau
