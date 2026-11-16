# Spec Delta

## ADDED Requirements

### Requirement: Choix du centre par commune ou position
Le jeu SHALL permettre de choisir le centre de l’enquête soit en cherchant une commune de l’index des communes par son nom, soit par la position de l’appareil. Le centre d’une commune est son centre dans l’index.

#### Scenario: Recherche de Fuveau
- **WHEN** le joueur tape « Fuveau »
- **THEN** la commune est proposée et la choisir donne son centre

#### Scenario: Position refusée
- **WHEN** le joueur refuse de partager sa position
- **THEN** le jeu le dit simplement et propose de chercher une commune

### Requirement: Données de la zone chargées avant la partie
Avant de générer, le jeu SHALL charger l’index, le manifeste, les cases de lieux et les cases de graphe couvrant la zone et une marge de 1 km, depuis l’adresse des données configurée. Une case absente SHALL être traitée comme vide. Une fois la zone chargée, la partie ne fait plus aucune requête réseau.

#### Scenario: Cases voisines
- **WHEN** la zone est chargée
- **THEN** toutes les cases touchant le rectangle de la zone élargi de 1 km sont lues, et une case sans fichier ne provoque pas d’erreur

### Requirement: Rayon adaptatif
Le jeu SHALL partir d’un rayon de 500 m autour du centre et l’élargir par paliers (1 km, 2 km, 4 km) jusqu’à réunir au moins 6 lieux utilisables, dont au moins 2 de rôle `scene`. Un lieu utilisable est un lieu non retiré de rôle `scene` ou `alibi`.

#### Scenario: Village
- **WHEN** 500 m ne contiennent que 3 lieux utilisables
- **THEN** le rayon passe à 1 km, puis plus loin si besoin, et s’arrête dès que la condition est remplie

#### Scenario: Ville dense
- **WHEN** 500 m contiennent déjà assez de lieux utilisables
- **THEN** le rayon reste à 500 m

### Requirement: Au plus 40 lieux dans le moteur
Le moteur SHALL recevoir au plus 40 lieux utilisables : les plus proches du centre, départagés par identifiant OSM. Les autres lieux reconnus de la zone ne servent qu’au décor de la carte.

#### Scenario: Zone dense
- **WHEN** la zone compte 300 lieux utilisables
- **THEN** le moteur reçoit les 40 plus proches du centre

### Requirement: Zone insuffisante
Quand le rayon maximal (4 km) ne réunit pas assez de lieux, le jeu SHALL l’expliquer simplement, ne générer aucune enquête et proposer jusqu’à 3 communes voisines, les plus proches du centre.

#### Scenario: Zone presque vide
- **WHEN** 4 km autour du centre contiennent moins de 6 lieux utilisables
- **THEN** le jeu explique le problème et propose des communes voisines à choisir

### Requirement: Trajets de la zone sur le réseau piéton
Le jeu SHALL calculer les trajets entre les lieux retenus avec le calcul de la capability `pedestrian-routing` et les cases de graphe chargées. Un lieu sans rattachement ou une paire non reliée reste un trajet approximatif, que le générateur évite.

#### Scenario: Matrice complète
- **WHEN** 40 lieux sont retenus
- **THEN** il existe un trajet pour chacune de leurs paires, accepté par le générateur
