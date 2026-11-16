# Spec Delta

## ADDED Requirements

### Requirement: Assemblage du graphe de la zone
Le moteur SHALL assembler un graphe à partir de cases de graphe données : les nœuds sont fusionnés par identifiant, les arêtes présentes dans deux cases sont comptées une seule fois, et une arête dont un nœud n’est décrit dans aucune case fournie est ignorée. L’assemblage SHALL être pur : il reçoit des données déjà lues, sans réseau ni lecture de fichier.

#### Scenario: Rue sur deux cases
- **WHEN** deux cases voisines contiennent la même arête
- **THEN** le graphe assemblé la contient une seule fois et relie les deux cases

#### Scenario: Case voisine absente
- **WHEN** une arête mène à un nœud d’une case non fournie
- **THEN** elle est ignorée sans erreur

### Requirement: Trajets par les vraies rues
Pour deux lieux reliés par le réseau, le moteur SHALL calculer la distance comme la somme de la distance d’accès de chaque lieu et du plus court chemin dans le graphe, en mètres entiers, et la durée comme `distanceM / 83,3` minutes arrondie à la minute supérieure, avec au moins 1 minute. Le tracé (`geometry`) SHALL suivre ce chemin d’un lieu à l’autre, en `[lon, lat]`.

#### Scenario: Deux lieux sur des rues reliées
- **WHEN** deux lieux sont rattachés à des rues reliées par un chemin de 500 m, avec 20 m et 30 m d’accès
- **THEN** la distance est de 550 m et la durée de 7 minutes

#### Scenario: Durée minimale
- **WHEN** deux lieux sont à quelques mètres l’un de l’autre
- **THEN** la durée est de 1 minute

### Requirement: Deux lieux sur la même arête
Quand deux lieux sont rattachés à la même arête, le moteur SHALL prendre pour distance la somme de leurs distances d’accès et de l’écart de leurs positions sur l’arête, si ce chemin est plus court que celui qui passe par les nœuds.

#### Scenario: Deux boutiques dans la même rue
- **WHEN** deux lieux sont rattachés à une arête de 400 m, à 100 m et 150 m du premier nœud
- **THEN** la distance entre eux vaut leurs accès plus 50 m, et non un détour par les carrefours

### Requirement: Calcul déterministe
Le calcul SHALL ne reposer que sur des entiers pour les longueurs. À longueur égale, le départage SHALL être fixe : le nœud d’identifiant le plus petit l’emporte. Le même calcul fait deux fois SHALL donner des durées et des tracés identiques.

#### Scenario: Deux chemins de même longueur
- **WHEN** deux chemins de même longueur relient deux lieux
- **THEN** le tracé retenu est toujours celui qui passe par le nœud d’identifiant le plus petit

### Requirement: Matrice complète et symétrique
Le moteur SHALL produire un `Route` pour chaque paire de lieux de l’enquête, avec `placeA` et `placeB` dans l’ordre des identifiants, de sorte que la matrice soit acceptée telle quelle par le générateur. Le calcul depuis un lieu SHALL s’arrêter dès que tous les lieux à atteindre depuis lui sont trouvés.

#### Scenario: Dix lieux
- **WHEN** une enquête compte 10 lieux
- **THEN** le moteur retourne 45 trajets, un par paire

### Requirement: Secours à vol d’oiseau
Pour une paire non reliée par le réseau, ou dont un lieu n’a pas de rattachement, le moteur SHALL produire un `Route` dont la distance est la distance à vol d’oiseau × 1,3 (1 m au minimum), de même durée, sans tracé, et marqué `approximate: true`. Les autres trajets n’ont pas ce marqueur.

#### Scenario: Deux composantes non reliées
- **WHEN** deux lieux sont rattachés à deux parties du réseau sans lien entre elles
- **THEN** le trajet est à vol d’oiseau × 1,3 et marqué approximatif

#### Scenario: Lieu sans rattachement
- **WHEN** un lieu n’a aucun rattachement
- **THEN** tous ses trajets sont approximatifs

### Requirement: Module pur, léger, libérable
Le calcul SHALL vivre dans `src/lib/engine/` sans Svelte, DOM, réseau ni `Math.random`. Une enquête de 10 lieux SHALL se calculer en moins d’une seconde sur un téléphone d’entrée de gamme, et le graphe SHALL pouvoir être libéré après le calcul : seuls les trajets sont conservés.

#### Scenario: Pureté
- **WHEN** on exécute le calcul dans les tests sur de petits graphes construits à la main
- **THEN** il n’utilise aucune API du navigateur ni du réseau

#### Scenario: Mesure sur la zone de Fuveau
- **WHEN** on calcule 45 trajets entre 10 lieux de Fuveau
- **THEN** la durée mesurée est inférieure à une seconde
