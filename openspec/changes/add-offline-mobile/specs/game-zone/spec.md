# Spec Delta

## MODIFIED Requirements

### Requirement: Données de la zone chargées avant la partie
Avant de générer, le jeu SHALL charger l’index, le manifeste, les cases de lieux et les cases de graphe couvrant la zone et une marge de 1 km. Avec le mode hors ligne activé, il les lit depuis la zone téléchargée sur l’appareil, jamais depuis le réseau ; sans ce mode, il les lit depuis l’adresse des données configurée. Une case sans fichier dans les données SHALL être traitée comme vide ; en mode hors ligne, une case hors de la zone téléchargée SHALL NOT être traitée comme vide et la zone est refusée. Une fois la zone chargée, la partie ne fait plus aucune requête réseau pour les données.

#### Scenario: Cases voisines
- **WHEN** la zone est chargée
- **THEN** toutes les cases touchant le rectangle de la zone élargi de 1 km sont lues, et une case sans fichier ne provoque pas d’erreur

#### Scenario: Mode hors ligne
- **WHEN** le mode hors ligne est activé et la zone téléchargée
- **THEN** les cases sont lues sur l’appareil, sans requête réseau

#### Scenario: Case hors de la zone téléchargée
- **WHEN** le mode hors ligne est activé et une case demandée n’appartient pas à la zone téléchargée
- **THEN** la zone est refusée au lieu de générer une enquête avec moins de lieux

### Requirement: Rayon adaptatif
Le jeu SHALL partir d’un rayon de 500 m autour du centre et l’élargir par paliers (1 km, 2 km, 4 km) jusqu’à réunir au moins 6 lieux utilisables, dont au moins 2 de rôle `scene`. Avec le mode hors ligne activé, le dernier palier SHALL être 2 km. Un lieu utilisable est un lieu non retiré de rôle `scene` ou `alibi`.

#### Scenario: Village
- **WHEN** 500 m ne contiennent que 3 lieux utilisables
- **THEN** le rayon passe à 1 km, puis plus loin si besoin, et s’arrête dès que la condition est remplie

#### Scenario: Ville dense
- **WHEN** 500 m contiennent déjà assez de lieux utilisables
- **THEN** le rayon reste à 500 m

#### Scenario: Mode hors ligne
- **WHEN** le mode hors ligne est activé et que 2 km ne suffisent pas
- **THEN** le rayon ne passe pas à 4 km et la zone est déclarée insuffisante
