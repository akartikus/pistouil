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

### Requirement: Objets du catalogue
Le catalogue SHALL contenir des objets (`ItemType`), chacun avec un identifiant, au moins une étiquette, une forme indéfinie et une forme définie écrites en toutes lettres avec leur article, et chaque scénario SHALL déclarer les étiquettes d’objets qu’il accepte et leur nombre minimal et maximal.

#### Scenario: Objet complet
- **WHEN** on charge le catalogue de départ
- **THEN** chaque objet a un identifiant unique, au moins une étiquette, une forme indéfinie comme « une perruque rose » et une forme définie comme « la perruque »

#### Scenario: Scénario sans objet
- **WHEN** un scénario déclare un nombre d’objets de zéro
- **THEN** il est accepté tant que ses textes n’utilisent aucune variable d’objet

#### Scenario: Ajout d’un objet sans toucher au code
- **WHEN** on ajoute un objet valide portant une étiquette acceptée par un scénario
- **THEN** le moteur peut le tirer dans les enquêtes suivantes sans modification du code

### Requirement: Scénarios composables validés
Le chargement du catalogue SHALL rejeter, avec une erreur explicite, un scénario dont les objets sont incohérents : nombre minimal supérieur au maximal, trop peu d’objets portant ses étiquettes, variable d’objet utilisée sans objet, situation sans la liste d’objets alors qu’il en demande, ou objet placé juste après « de » ou « à ».

#### Scenario: Trop peu d’objets
- **WHEN** un scénario demande jusqu’à 2 objets d’une étiquette qui n’en compte qu’un
- **THEN** le chargement échoue en nommant le scénario

#### Scenario: Objet après une préposition
- **WHEN** un gabarit contient « de {item} » ou « à {items} »
- **THEN** le chargement échoue en nommant le scénario, car l’article ne se contracterait pas

#### Scenario: Liste d’objets oubliée
- **WHEN** un scénario demande au moins un objet et que sa situation ne contient pas la liste d’objets
- **THEN** le chargement échoue en nommant le scénario

#### Scenario: Variable d’objet sans objet
- **WHEN** un scénario sans objet utilise une variable d’objet dans sa situation ou une révélation
- **THEN** le chargement échoue en nommant le scénario

### Requirement: Horaires de semaine et de week-end
Chaque type de lieu et chaque lieu SHALL avoir des horaires pour la semaine et pour le week-end, chacun étant une liste d’intervalles, « toujours ouvert » ou « fermé toute la journée », et le catalogue de départ SHALL contenir des lieux dont les horaires diffèrent entre les deux jours.

#### Scenario: Horaires des deux jours
- **WHEN** on charge le catalogue de départ
- **THEN** chaque type de lieu donne ses horaires de semaine et de week-end

#### Scenario: Lieu fermé le week-end
- **WHEN** on consulte une mairie ou une école
- **THEN** elle est fermée le week-end

#### Scenario: Horaires du lieu
- **WHEN** un lieu fournit ses propres horaires
- **THEN** ils remplacent ceux de son type, pour la semaine comme pour le week-end

#### Scenario: Horaires invalides
- **WHEN** un type de lieu n’a pas d’horaires pour un des deux jours
- **THEN** le chargement échoue en nommant le type

### Requirement: Gabarits de témoignage naturels
Le chargement du catalogue SHALL refuser un gabarit de témoignage qui contient une tournure interdite, comme « au revoir à » (on ne dit pas au revoir à un lieu) ou « précisément » (qui désigne le témoignage), et le catalogue de départ SHALL en être exempt.

#### Scenario: Au revoir à un lieu
- **WHEN** un gabarit contient « j’ai dit au revoir à {place} »
- **THEN** le chargement échoue en nommant le gabarit

#### Scenario: Précision suspecte
- **WHEN** un gabarit contient « précisément »
- **THEN** le chargement échoue en nommant le gabarit

#### Scenario: Catalogue de départ
- **WHEN** on charge le catalogue de départ
- **THEN** aucun gabarit de témoignage ne contient de tournure interdite

### Requirement: Les types de lieux portent une icône et un libellé pour la carte
Chaque `PlaceType` du catalogue de départ SHALL porter une famille d’icône (`icon`) et un libellé français (`label`), que la carte utilise pour l’icône et le type affichés. Le moteur n’en dépend pas : ces champs sont facultatifs dans le modèle et leur absence n’invalide pas un catalogue.

#### Scenario: Catalogue de départ complet
- **WHEN** on lit les types de lieux de `catalog/place-types.json`
- **THEN** chacun a une famille d’icône et un libellé non vide

#### Scenario: Type sans icône
- **WHEN** un catalogue contient un type sans `icon` ni `label`
- **THEN** le chargement l’accepte et le moteur fonctionne comme avant

### Requirement: Les types d’indice portent une icône et un libellé
Chaque `ClueType` du catalogue de départ SHALL porter une icône (`icon`, un objet pour une preuve, un pictogramme pour un PNJ) et un libellé français (`label`), que l’interface utilise pour présenter les pièces. Le moteur n’en dépend pas : ces champs sont facultatifs dans le modèle.

#### Scenario: Catalogue de départ complet
- **WHEN** on lit les types d’indice de `catalog/clue-types.json`
- **THEN** chacun a une icône et un libellé non vide

#### Scenario: Type sans icône
- **WHEN** un catalogue contient un type d’indice sans `icon` ni `label`
- **THEN** le chargement l’accepte et le moteur fonctionne comme avant
