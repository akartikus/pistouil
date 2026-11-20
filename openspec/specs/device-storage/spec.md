# device-storage Specification

## Purpose
Garder de façon fiable les zones téléchargées sur chaque plateforme, derrière une seule interface qui isole les différences entre web et natif.

## Requirements

### Requirement: Une interface de stockage, deux implémentations
Les zones téléchargées SHALL être lues et écrites par une même interface de stockage ; dans l’application native elles sont gardées avec le système de fichiers de l’appareil, sur le web dans IndexedDB. Aucun autre code ne SHALL dépendre de la plateforme pour ces données.

#### Scenario: Même comportement
- **WHEN** une donnée est écrite puis relue, sur l’application native ou sur le web
- **THEN** le contenu relu est identique à celui écrit

### Requirement: Données durables dans l’application native
Dans l’application native, les zones téléchargées et les parties en cours SHALL rester présentes même si l’application n’a pas été ouverte depuis plusieurs semaines.

#### Scenario: Retour après des semaines
- **WHEN** le joueur rouvre l’application après plusieurs semaines
- **THEN** ses zones téléchargées et sa partie en cours sont toujours là

### Requirement: Stockage persistant sur le web
Sur le web, le jeu SHALL demander un stockage persistant au premier téléchargement de zone quand le navigateur le permet, et SHALL prévenir que les données peuvent être effacées quand il ne l’accorde pas.

#### Scenario: Persistance refusée
- **WHEN** le navigateur refuse le stockage persistant
- **THEN** le jeu prévient que les zones et la partie peuvent être effacées par le navigateur
