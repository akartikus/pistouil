# Spec Delta

## MODIFIED Requirements

### Requirement: Données durables dans l’application native
Dans l’application native, la partie en cours SHALL rester présente même si l’application n’a pas été ouverte depuis plusieurs semaines.

#### Scenario: Retour après des semaines
- **WHEN** le joueur rouvre l’application après plusieurs semaines
- **THEN** sa partie en cours est toujours là

## REMOVED Requirements

### Requirement: Une interface de stockage, deux implémentations
**Reason**: Elle servait à garder les zones téléchargées, qui n’existent plus ; la partie sauvegardée est gardée par les préférences de l’appareil.
**Migration**: Aucune ; si des zones téléchargées reviennent avec d’autres communes, le guide `guide/ADD-COMMUNE.md` décrit ce qu’il faudra recréer.

### Requirement: Stockage persistant sur le web
**Reason**: La demande de stockage persistant accompagnait le téléchargement d’une zone, qui n’existe plus.
**Migration**: Aucune.
