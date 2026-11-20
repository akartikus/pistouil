# Spec Delta

## Purpose
Utiliser la position du joueur pour choisir le centre de l’enquête, en la demandant clairement et sans jamais la quitter l’appareil.

## ADDED Requirements

### Requirement: Permission demandée avec une explication
Quand le joueur choisit « Je me localise », le jeu SHALL expliquer en français simple, sans jargon, pourquoi la position est demandée, puis demander la permission, sur le web comme dans les applications.

#### Scenario: Première demande
- **WHEN** le joueur choisit « Je me localise » sans avoir encore donné la permission
- **THEN** une explication claire s’affiche et la permission du système est demandée

### Requirement: Position gardée sur l’appareil
La position SHALL être utilisée uniquement sur l’appareil, pour choisir le centre de l’enquête ; elle SHALL NOT être envoyée à un service, ni enregistrée au-delà du centre de la zone dans la sauvegarde.

#### Scenario: Aucune requête avec la position
- **WHEN** le joueur se localise
- **THEN** aucune requête réseau ne contient sa position

### Requirement: Recherche de commune toujours disponible
Quand la permission est refusée ou indisponible, la recherche de commune SHALL rester utilisable.

#### Scenario: Permission refusée
- **WHEN** le joueur refuse la permission
- **THEN** le jeu le dit simplement et la recherche de commune reste disponible
