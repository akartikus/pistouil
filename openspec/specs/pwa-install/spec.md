# pwa-install Specification

## Purpose
Permettre d’installer le jeu web sur l’écran d’accueil et de le lancer sans connexion.

## Requirements

### Requirement: Application web installable
La version web SHALL déclarer un manifeste d’application (nom, icônes, couleurs, affichage plein écran) et SHALL pouvoir être installée sur l’écran d’accueil.

#### Scenario: Installation
- **WHEN** le joueur ouvre le jeu dans un navigateur compatible
- **THEN** le navigateur propose d’installer l’application, qui s’ouvre ensuite comme une application

### Requirement: Application disponible hors connexion
Un Service Worker SHALL garder les fichiers de l’application elle-même, y compris les données et le fichier de tuiles de Fuveau, pour qu’elle démarre et se joue sans connexion après une première visite.

#### Scenario: Démarrage en mode avion
- **WHEN** le joueur a déjà ouvert le jeu puis le lance en mode avion
- **THEN** l’application démarre et affiche l’écran de départ

#### Scenario: Partie en mode avion
- **WHEN** le joueur a déjà ouvert le jeu puis lance une enquête à Fuveau en mode avion
- **THEN** il la joue et la termine, carte comprise

### Requirement: Une base de code
Le même code SvelteKit SHALL produire la PWA et les applications Android et iOS.

#### Scenario: Deux sorties
- **WHEN** l’application est construite
- **THEN** le même dossier de build sert la PWA et alimente les applications natives
