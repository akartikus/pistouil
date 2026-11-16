# Spec Delta

## ADDED Requirements

### Requirement: Source des lieux au choix
La page SHALL permettre d’exécuter le moteur soit sur le jeu de lieux de test, soit sur de vrais lieux lus dans les fichiers produits par la préparation des données OSM. Le jeu de test SHALL rester la source par défaut.

#### Scenario: Source par défaut
- **WHEN** on ouvre la page
- **THEN** elle utilise le jeu de lieux de test

#### Scenario: Passage aux vrais lieux
- **WHEN** on choisit les vrais lieux et que les fichiers sont disponibles
- **THEN** la page génère et affiche les enquêtes à partir de ces lieux, avec les mêmes vues que pour le jeu de test

#### Scenario: Lieux réels activables
- **WHEN** la page utilise de vrais lieux
- **THEN** chacun peut être activé ou désactivé, comme un lieu du jeu de test

### Requirement: Quelques dizaines de lieux autour d’un centre
Pour les vrais lieux, la page SHALL retenir, parmi les lieux des cases voisines du centre donné (latitude, longitude), les plus proches du centre, jusqu’au nombre demandé. Les lieux sont ceux des fichiers, avec leur type et leur identifiant OSM.

#### Scenario: Les plus proches
- **WHEN** on donne un centre et un nombre de 40 lieux
- **THEN** la page utilise au plus 40 lieux, tous plus proches du centre que chaque lieu non retenu

#### Scenario: Moins de lieux que demandé
- **WHEN** les cases voisines contiennent moins de lieux que le nombre demandé
- **THEN** la page utilise tous ces lieux sans erreur

### Requirement: Conversion en lieux du modèle
Chaque lieu d’un fichier SHALL devenir un `Place` du modèle : `type` devient `typeId`, `removed` vaut `false` quand il est absent, et `openingHours` n’est pas utilisé, de sorte que les horaires typiques du catalogue s’appliquent. Un lieu dont le type est inconnu du catalogue SHALL être ignoré.

#### Scenario: Lieu ordinaire
- **WHEN** un fichier contient `{ osmId, name, type: "bakery", lat, lon }`
- **THEN** le lieu est un `Place` de `typeId` `bakery`, non retiré

#### Scenario: Lieu retiré
- **WHEN** un lieu du fichier porte `removed: true`
- **THEN** le `Place` obtenu est retiré et aucune enquête ne le retient

#### Scenario: Type inconnu
- **WHEN** un lieu a un type absent du catalogue
- **THEN** il est ignoré

### Requirement: Trajets estimés à vol d’oiseau
Pour les vrais lieux, la page SHALL fournir au moteur une matrice complète de trajets estimés à partir de la distance à vol d’oiseau, selon la même formule que le jeu de test riche. Ces trajets SHALL être présentés comme des estimations.

#### Scenario: Matrice complète
- **WHEN** la page retient N vrais lieux
- **THEN** il existe un trajet pour chaque paire de ces lieux, de distance et de durée strictement positives

#### Scenario: Estimation signalée
- **WHEN** la page utilise de vrais lieux
- **THEN** elle indique que les durées sont des estimations à vol d’oiseau

### Requirement: Fichiers absents signalés
Quand les fichiers de lieux ne sont pas disponibles, la page SHALL le dire et indiquer comment les fournir, sans planter, et le jeu de lieux de test SHALL rester utilisable.

#### Scenario: Pas de données
- **WHEN** on choisit les vrais lieux et que les fichiers sont absents
- **THEN** la page affiche un message expliquant comment les fournir
- **AND** on peut revenir au jeu de lieux de test
