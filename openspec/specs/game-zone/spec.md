# game-zone Specification

## Purpose
Choix de la zone de jeu autour d'un point : rayons croissants, seuil de lieux exploitables, scènes obligatoires, plafond de 40 lieux et propositions de communes voisines quand la zone est trop vide.

## Requirements

### Requirement: Au plus 40 lieux dans le moteur
Le moteur SHALL recevoir au plus 40 lieux utilisables : les plus proches du centre, départagés par identifiant OSM. Les autres lieux reconnus de la zone ne servent qu’au décor de la carte.

#### Scenario: Zone dense
- **WHEN** la zone compte 300 lieux utilisables
- **THEN** le moteur reçoit les 40 plus proches du centre

### Requirement: Zone insuffisante
Quand le rayon maximal (2 km) ne réunit pas assez de lieux, le jeu SHALL l’expliquer simplement et ne générer aucune enquête.

#### Scenario: Zone presque vide
- **WHEN** 2 km autour du centre contiennent moins de 6 lieux utilisables
- **THEN** le jeu explique le problème et ne génère aucune enquête

### Requirement: Trajets de la zone sur le réseau piéton
Le jeu SHALL calculer les trajets entre les lieux retenus avec le calcul de la capability `pedestrian-routing` et les cases de graphe chargées. Un lieu sans rattachement ou une paire non reliée reste un trajet approximatif, que le générateur évite.

#### Scenario: Matrice complète
- **WHEN** 40 lieux sont retenus
- **THEN** il existe un trajet pour chacune de leurs paires, accepté par le générateur

### Requirement: Centre de l’enquête : Fuveau ou position
Le jeu SHALL permettre de choisir le centre de l’enquête soit avec le bouton « Fuveau », qui donne le centre de la commune, soit par la position de l’appareil, acceptée seulement à l’intérieur du contour de Fuveau. Une position hors du contour SHALL être refusée avec un message disant que seule Fuveau est disponible pour le moment, sans générer d’enquête.

#### Scenario: Bouton Fuveau
- **WHEN** le joueur choisit « Fuveau »
- **THEN** le centre de l’enquête est le centre de Fuveau

#### Scenario: Position dans Fuveau
- **WHEN** le joueur se localise à l’intérieur du contour de Fuveau
- **THEN** le centre de l’enquête est sa position

#### Scenario: Position hors de Fuveau
- **WHEN** le joueur se localise hors du contour de Fuveau
- **THEN** le jeu dit simplement que seule Fuveau est disponible pour le moment et ne génère aucune enquête

#### Scenario: Position refusée
- **WHEN** le joueur refuse de partager sa position
- **THEN** le jeu le dit simplement et propose le bouton « Fuveau »

### Requirement: Données de la zone lues dans l’application
Avant de générer, le jeu SHALL lire, dans les fichiers de l’application, l’entrée de Fuveau, le manifeste, les cases de lieux et les cases de graphe couvrant la zone et une marge de 1 km, sans aucune requête réseau. Une case sans fichier dans les données de Fuveau SHALL être traitée comme vide.

#### Scenario: Cases voisines
- **WHEN** la zone est chargée
- **THEN** toutes les cases touchant le rectangle de la zone élargi de 1 km sont lues, et une case sans fichier ne provoque pas d’erreur

#### Scenario: Aucune requête réseau
- **WHEN** le jeu charge la zone puis joue la partie
- **THEN** aucune requête réseau n’est faite pour les données

### Requirement: Rayon adaptatif jusqu’à 2 km
Le jeu SHALL partir d’un rayon de 500 m autour du centre et l’élargir par paliers (1 km, 2 km) jusqu’à réunir au moins 6 lieux utilisables, dont au moins 2 de rôle `scene`. Le rayon maximal est 2 km. Un lieu utilisable est un lieu non retiré de rôle `scene` ou `alibi`.

#### Scenario: Village
- **WHEN** 500 m ne contiennent que 3 lieux utilisables
- **THEN** le rayon passe à 1 km, puis à 2 km si besoin, et s’arrête dès que la condition est remplie

#### Scenario: Ville dense
- **WHEN** 500 m contiennent déjà assez de lieux utilisables
- **THEN** le rayon reste à 500 m

#### Scenario: Rayon maximal
- **WHEN** 2 km ne suffisent pas
- **THEN** le rayon ne dépasse pas 2 km et la zone est déclarée insuffisante
