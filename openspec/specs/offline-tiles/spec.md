# offline-tiles Specification

## Purpose
Fournir les tuiles de la carte depuis la zone téléchargée en mode hors ligne, depuis le réseau sinon, sans jamais laisser la carte vide.

## Requirements

### Requirement: Tuiles lues sur l’appareil en mode hors ligne
Avec le mode hors ligne activé, la source de tuiles SHALL lire sur l’appareil les tuiles de la zone téléchargée, sans requête réseau. Sans ce mode, elle SHALL lire le réseau et SHALL NOT enregistrer les tuiles lues.

#### Scenario: Carte hors connexion
- **WHEN** le joueur affiche la carte de Fuveau téléchargée, en mode avion
- **THEN** les rues, les bâtiments et les lieux s’affichent comme en ligne

#### Scenario: Mode normal
- **WHEN** le mode hors ligne n’est pas activé
- **THEN** les tuiles viennent du réseau et rien n’est gardé

### Requirement: Tuiles de la zone téléchargées avec elle
Le téléchargement d’une zone SHALL inclure les tuiles couvrant le rectangle de la carte de la zone, du zoom le plus bas au zoom maximal du fichier.

#### Scenario: Tuiles complètes
- **WHEN** une zone vient d’être téléchargée
- **THEN** toute tuile du rectangle de sa carte est sur l’appareil

### Requirement: Pas de fond vide
Quand une tuile manque hors connexion, la carte SHALL afficher le fond uni du style, et le jeu SHALL rester utilisable.

#### Scenario: Tuile manquante
- **WHEN** une tuile n’est ni sur l’appareil ni joignable
- **THEN** la carte montre le fond uni à cet endroit et aucune erreur n’interrompt le jeu
