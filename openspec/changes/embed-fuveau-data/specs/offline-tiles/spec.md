# Spec Delta

## ADDED Requirements

### Requirement: Tuiles lues dans le fichier embarqué
La source de tuiles SHALL lire les tuiles dans le fichier de Fuveau fourni avec l’application, sans aucune requête réseau, et SHALL NOT enregistrer de tuiles.

#### Scenario: Carte en mode avion
- **WHEN** le joueur affiche la carte de Fuveau, en mode avion
- **THEN** les rues, les bâtiments et les lieux s’affichent comme avec une connexion

#### Scenario: Aucune requête réseau pour la carte
- **WHEN** le joueur navigue sur la carte de Fuveau
- **THEN** aucune requête réseau n’est faite pour les tuiles

## REMOVED Requirements

### Requirement: Tuiles lues sur l’appareil en mode hors ligne
**Reason**: Il n’y a plus de mode hors ligne ni de zone téléchargée : la source lit le fichier de Fuveau fourni avec l’application.
**Migration**: Voir l’exigence « Tuiles lues dans le fichier embarqué ».

### Requirement: Tuiles de la zone téléchargées avec elle
**Reason**: Il n’y a plus de zone téléchargée : les tuiles de Fuveau sont fournies avec l’application.
**Migration**: Aucune ; la couverture des tuiles est décrite par la capability `embedded-zone-data`.
