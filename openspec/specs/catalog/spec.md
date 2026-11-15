# catalog Specification

## Purpose

Définit le catalogue de contenu du jeu (types de lieux, indices, scénarios, prénoms, gabarits) comme données JSON versionnées, et garantit qu’il est cohérent avant que le moteur ne l’utilise. Les types et règles sont ceux de `docs/reference/DATA-MODEL.md`.

## Requirements

### Requirement: Le catalogue de départ est fourni en JSON
Le dépôt SHALL contenir, dans `catalog/`, les types de lieux avec leur rôle, les types d’indices avec leurs gabarits, les compatibilités lieu/indice, au moins 3 modèles de scénario avec leurs révélations par motif, au moins 12 prénoms et les gabarits de témoignage.

#### Scenario: Contenu minimal présent
- **WHEN** on charge le catalogue de départ
- **THEN** il contient au moins 3 modèles de scénario et au moins 12 prénoms
- **AND** chaque `PlaceType` a un rôle `scene`, `alibi` ou `excluded`

#### Scenario: Ajout d’une ligne sans toucher au code
- **WHEN** on ajoute un type de lieu valide au catalogue
- **THEN** le moteur l’utilise dans les enquêtes suivantes sans modification du code

### Requirement: Le catalogue est validé à la frontière
Le chargement du catalogue SHALL rejeter, avec une erreur explicite, tout catalogue incohérent : référence inconnue, motif sans texte de révélation, scène d’un scénario qui n’est pas de rôle `scene`, moins de 12 prénoms, ou variable inconnue dans un gabarit.

#### Scenario: Motif sans révélation
- **WHEN** un `ScenarioModel` déclare un motif dans `lieMotives` sans texte dans `revelations`
- **THEN** le chargement échoue en nommant le scénario et le motif

#### Scenario: Scène de rôle non valide
- **WHEN** un `ScenarioModel` liste une scène dont le `PlaceType` est de rôle `alibi` ou `excluded`
- **THEN** le chargement échoue en nommant le scénario et le type

#### Scenario: Compatibilité vers un type inconnu
- **WHEN** une compatibilité cite un `ClueType` ou un `PlaceType` qui n’existe pas
- **THEN** le chargement échoue en nommant la référence

### Requirement: Les rôles des lieux suivent le cap
Le catalogue SHALL classer les lieux publics non sensibles en `scene`, les lieux sensibles (école, lieu de culte, hôpital, cimetière, monument aux morts) en `alibi`, et l’aire de jeux et l’habitation en `excluded`.

#### Scenario: Lieu sensible
- **WHEN** on consulte le rôle d’une école, d’un lieu de culte, d’un hôpital ou d’un cimetière
- **THEN** il vaut `alibi` et aucun scénario ne les liste comme scène
