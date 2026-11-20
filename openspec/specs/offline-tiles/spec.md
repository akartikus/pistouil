# offline-tiles Specification

## Purpose
Fournir les tuiles de la carte depuis le fichier de Fuveau livré avec l’application, sans aucune requête réseau, sans jamais laisser la carte vide.

## Requirements

### Requirement: Pas de fond vide
Quand une tuile manque hors connexion, la carte SHALL afficher le fond uni du style, et le jeu SHALL rester utilisable.

#### Scenario: Tuile manquante
- **WHEN** une tuile n’est ni sur l’appareil ni joignable
- **THEN** la carte montre le fond uni à cet endroit et aucune erreur n’interrompt le jeu

### Requirement: Tuiles lues dans le fichier embarqué
La source de tuiles SHALL lire les tuiles dans le fichier de Fuveau fourni avec l’application, sans aucune requête réseau, et SHALL NOT enregistrer de tuiles.

#### Scenario: Carte en mode avion
- **WHEN** le joueur affiche la carte de Fuveau, en mode avion
- **THEN** les rues, les bâtiments et les lieux s’affichent comme avec une connexion

#### Scenario: Aucune requête réseau pour la carte
- **WHEN** le joueur navigue sur la carte de Fuveau
- **THEN** aucune requête réseau n’est faite pour les tuiles
