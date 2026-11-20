# Spec Delta

## MODIFIED Requirements

### Requirement: Application disponible hors connexion
Un Service Worker SHALL garder les fichiers de l’application elle-même, y compris les données et le fichier de tuiles de Fuveau, pour qu’elle démarre et se joue sans connexion après une première visite.

#### Scenario: Démarrage en mode avion
- **WHEN** le joueur a déjà ouvert le jeu puis le lance en mode avion
- **THEN** l’application démarre et affiche l’écran de départ

#### Scenario: Partie en mode avion
- **WHEN** le joueur a déjà ouvert le jeu puis lance une enquête à Fuveau en mode avion
- **THEN** il la joue et la termine, carte comprise
