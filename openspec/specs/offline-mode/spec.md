# offline-mode Specification

## Purpose
Laisser le joueur choisir de jouer sans connexion : la zone de sa commune est téléchargée une seule fois, puis jouable sans réseau ; sans ce choix, rien ne change.

## Requirements

### Requirement: Mode hors ligne choisi par le joueur
Le jeu SHALL proposer un réglage « mode hors ligne », désactivé par défaut. Tant qu’il est désactivé, le jeu SHALL charger les données et la carte par le réseau et SHALL NOT garder sur l’appareil ni cases, ni tuiles, ni index des communes (la sauvegarde et les réglages restent gardés comme aujourd’hui).

#### Scenario: Mode normal
- **WHEN** le mode hors ligne n’est pas activé
- **THEN** les données et la carte sont chargées par le réseau et aucune zone n’est téléchargée

### Requirement: Téléchargement d’une zone une seule fois
Avec le mode hors ligne activé, le jeu SHALL télécharger, en une action, la zone d’environ 2 km autour du centre de la commune : le manifeste des données, les cases de lieux et de graphe nécessaires et les tuiles de la carte. La taille SHALL être affichée avant le téléchargement et une progression pendant. Une zone déjà téléchargée SHALL NOT être retéléchargée. Une interruption ou une annulation SHALL ne laisser aucune zone partielle.

#### Scenario: Activation pour Fuveau
- **WHEN** le joueur active le mode hors ligne pour Fuveau
- **THEN** la taille est affichée, puis après confirmation une progression s’affiche et Fuveau figure parmi les zones téléchargées

#### Scenario: Zone déjà téléchargée
- **WHEN** le joueur lance une enquête à Fuveau, déjà téléchargée, avec le mode activé
- **THEN** rien n’est retéléchargé

#### Scenario: Interruption
- **WHEN** la connexion tombe ou le joueur annule avant la fin
- **THEN** aucune zone partielle n’est proposée comme téléchargée et le joueur peut recommencer

### Requirement: Index des communes gardé une fois
Au premier téléchargement d’une zone, le jeu SHALL garder l’index des communes, une seule fois pour toutes les zones, pour que la recherche de commune et le contour de la commune fonctionnent sans connexion.

#### Scenario: Recherche hors connexion
- **WHEN** le mode est activé, une zone téléchargée, et le joueur cherche « Fuveau » en mode avion
- **THEN** la commune est proposée

### Requirement: Jouer hors connexion
Avec le mode activé et une zone téléchargée, le joueur SHALL pouvoir, sans connexion, lancer une nouvelle enquête dans cette zone, la jouer et la terminer, carte comprise, et reprendre une enquête en cours après avoir fermé l’application.

#### Scenario: Mode avion à Fuveau
- **WHEN** le joueur a activé le mode hors ligne, téléchargé Fuveau puis passe en mode avion
- **THEN** il lance une nouvelle enquête à Fuveau, la joue et la termine, carte comprise

### Requirement: Centre de l’enquête en mode hors ligne
Avec le mode activé, l’enquête SHALL être centrée sur le centre d’une commune téléchargée : la commune choisie, ou, pour « Je me localise », la zone téléchargée qui contient la position. Quand la commune choisie n’est pas téléchargée ou que la position n’est dans aucune zone téléchargée, le jeu SHALL le dire simplement et proposer de télécharger la commune (la plus proche pour une position) ou d’en chercher une autre, sans générer d’enquête.

#### Scenario: Position dans une zone téléchargée
- **WHEN** le mode est activé et le joueur se localise à 1 km du centre de Fuveau, téléchargée
- **THEN** l’enquête est centrée sur le centre de Fuveau

#### Scenario: Commune non téléchargée
- **WHEN** le mode est activé et le joueur choisit une commune non téléchargée
- **THEN** le jeu propose de la télécharger, avec sa taille

### Requirement: Reprise fidèle ou refusée
Une enquête SHALL être reprise à l’identique ou pas du tout : avec le mode activé, si l’enquête sauvegardée demande des données hors des zones téléchargées (par exemple un rayon de 4 km commencé en mode normal), le jeu SHALL le dire et proposer de désactiver le mode ou de commencer une autre enquête, plutôt que de régénérer une enquête différente.

#### Scenario: Enquête de 4 km reprise en mode hors ligne
- **WHEN** une enquête commencée en mode normal avec un rayon de 4 km est reprise après activation du mode
- **THEN** le jeu explique qu’elle demande une connexion et ne la régénère pas avec moins de lieux

### Requirement: Gestion des zones téléchargées
Le jeu SHALL lister les zones téléchargées avec leur taille et permettre de supprimer chacune ; la suppression SHALL libérer l’espace qu’elle occupait.

#### Scenario: Suppression
- **WHEN** le joueur supprime Fuveau
- **THEN** la zone disparaît de la liste et l’espace utilisé par le jeu diminue de sa taille
