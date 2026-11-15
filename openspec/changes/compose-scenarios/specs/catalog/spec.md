# Spec Delta

## ADDED Requirements

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
