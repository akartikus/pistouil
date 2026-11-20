# device-storage Specification

## Purpose
Garder de façon fiable la partie en cours sur l’appareil, même quand l’application n’a pas été ouverte depuis plusieurs semaines.

## Requirements

### Requirement: Données durables dans l’application native
Dans l’application native, la partie en cours SHALL rester présente même si l’application n’a pas été ouverte depuis plusieurs semaines.

#### Scenario: Retour après des semaines
- **WHEN** le joueur rouvre l’application après plusieurs semaines
- **THEN** sa partie en cours est toujours là
