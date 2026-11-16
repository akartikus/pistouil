# Spec Delta

## ADDED Requirements

### Requirement: Les types d’indice portent une icône et un libellé
Chaque `ClueType` du catalogue de départ SHALL porter une icône (`icon`, un objet pour une preuve, un pictogramme pour un PNJ) et un libellé français (`label`), que l’interface utilise pour présenter les pièces. Le moteur n’en dépend pas : ces champs sont facultatifs dans le modèle.

#### Scenario: Catalogue de départ complet
- **WHEN** on lit les types d’indice de `catalog/clue-types.json`
- **THEN** chacun a une icône et un libellé non vide

#### Scenario: Type sans icône
- **WHEN** un catalogue contient un type d’indice sans `icon` ni `label`
- **THEN** le chargement l’accepte et le moteur fonctionne comme avant
