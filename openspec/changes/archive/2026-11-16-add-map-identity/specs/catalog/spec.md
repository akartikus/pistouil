# Spec Delta

## ADDED Requirements

### Requirement: Les types de lieux portent une icône et un libellé pour la carte
Chaque `PlaceType` du catalogue de départ SHALL porter une famille d’icône (`icon`) et un libellé français (`label`), que la carte utilise pour l’icône et le type affichés. Le moteur n’en dépend pas : ces champs sont facultatifs dans le modèle et leur absence n’invalide pas un catalogue.

#### Scenario: Catalogue de départ complet
- **WHEN** on lit les types de lieux de `catalog/place-types.json`
- **THEN** chacun a une famille d’icône et un libellé non vide

#### Scenario: Type sans icône
- **WHEN** un catalogue contient un type sans `icon` ni `label`
- **THEN** le chargement l’accepte et le moteur fonctionne comme avant
