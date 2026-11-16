# Spec Delta

## ADDED Requirements

### Requirement: Voies retenues et écartées
Le script SHALL retenir comme voies piétonnes les `highway` suivants : `residential`, `service`, `pedestrian`, `footway`, `path`, `steps`, `track`, `cycleway`, `living_street`, `unclassified`, `tertiary`, `secondary` et `primary`. Il SHALL écarter les autres (dont `motorway` et `trunk`), toute voie portant `foot=no` et toute voie portant `access=private`. Les sens uniques SHALL être ignorés : toute arête se parcourt dans les deux sens.

#### Scenario: Rue retenue
- **WHEN** une voie `highway=residential` n’a ni `foot=no` ni `access=private`
- **THEN** elle apparaît dans le graphe

#### Scenario: Voie écartée
- **WHEN** une voie est `highway=motorway`, ou porte `foot=no`, ou `access=private`
- **THEN** elle n’apparaît dans aucun fichier de graphe

#### Scenario: Sens unique
- **WHEN** une rue porte `oneway=yes`
- **THEN** elle donne une arête parcourable dans les deux sens

### Requirement: Un fichier de graphe par case
Le script SHALL écrire, pour chaque case de la grille qui contient des nœuds de voie ou des lieux rattachés, un fichier `graph/{ligne}_{colonne}.json` (même grille que les lieux) contenant les nœuds de la case, les arêtes et le rattachement des lieux de la case. Un nœud porte son identifiant OSM et ses coordonnées entières (degrés × 100 000, arrondis).

#### Scenario: Case avec des rues
- **WHEN** une case contient des nœuds de voie retenus
- **THEN** le fichier `graph/{ligne}_{colonne}.json` existe et ses nœuds ont un identifiant OSM et des coordonnées entières

#### Scenario: Case sans voie
- **WHEN** une case ne contient aucun nœud de voie retenu ni lieu rattaché
- **THEN** aucun fichier de graphe n’est écrit pour elle

### Requirement: Nœuds contractés et arêtes à longueur entière
Seuls les carrefours, les extrémités de voie et les nœuds communs à plusieurs voies SHALL être des nœuds du graphe ; les autres points de la voie SHALL devenir la forme de l’arête. Une arête porte ses deux nœuds, sa longueur en mètres entiers (somme des segments de sa forme, arrondie une seule fois) et sa forme.

#### Scenario: Rue droite sans carrefour
- **WHEN** une voie compte dix points intermédiaires sans croisement
- **THEN** elle donne une seule arête entre ses deux extrémités, dont la forme garde les dix points

#### Scenario: Longueur entière
- **WHEN** une arête est écrite
- **THEN** sa longueur est un entier de mètres, calculé à partir de sa forme

### Requirement: Arêtes à cheval sur deux cases
Une arête dont les deux nœuds sont dans des cases différentes SHALL être écrite, identique, dans le fichier de chacune de ces cases. Un nœud n’est décrit (coordonnées) que dans le fichier de sa propre case.

#### Scenario: Rue qui franchit une limite de case
- **WHEN** une arête relie un nœud de la case A à un nœud de la case B
- **THEN** les fichiers de A et de B contiennent cette arête avec les mêmes valeurs

### Requirement: Rattachement des lieux au segment de rue le plus proche
Pour chaque lieu écrit dans les fichiers de lieux, le script SHALL chercher le point le plus proche d’une arête du graphe et écrire, dans le fichier de graphe de la case du lieu, ses deux nœuds d’extrémité, la distance d’accès (du lieu à ce point, en mètres entiers) et la position du point sur l’arête (mètres depuis le premier nœud, avec la longueur de l’arête). Un lieu à plus de 300 m de toute arête SHALL ne recevoir aucun rattachement.

#### Scenario: Boutique au milieu d’une rue
- **WHEN** un lieu se trouve à 12 m du milieu d’une arête de 200 m
- **THEN** son rattachement donne les deux nœuds de l’arête, une distance d’accès de 12 et une position d’environ 100

#### Scenario: Lieu isolé
- **WHEN** aucun segment de voie n’est à moins de 300 m d’un lieu
- **THEN** le lieu n’a pas de rattachement

### Requirement: Sortie déterministe et mesurée
Deux exécutions sur le même extrait SHALL produire des fichiers de graphe identiques à l’octet près. `report.json` SHALL indiquer le nombre de nœuds, d’arêtes et de cases de graphe, le nombre de lieux sans rattachement et la taille de la plus grosse case.

#### Scenario: Deux exécutions
- **WHEN** le script tourne deux fois sur le même extrait
- **THEN** les dossiers `graph/` sont identiques

#### Scenario: Rapport
- **WHEN** le script se termine
- **THEN** `report.json` contient les comptes du graphe et le nombre de lieux sans rattachement
