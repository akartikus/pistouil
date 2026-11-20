# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Recherche de commune toujours disponible`
- TO: `### Requirement: Bouton Fuveau toujours disponible`

## MODIFIED Requirements

### Requirement: Bouton Fuveau toujours disponible
Quand la permission est refusée ou indisponible, le bouton « Fuveau » SHALL rester utilisable.

#### Scenario: Permission refusée
- **WHEN** le joueur refuse la permission
- **THEN** le jeu le dit simplement et le bouton « Fuveau » reste disponible
