# investigation-generation Specification

## Purpose

Génère une enquête valide à partir de lieux, d’une matrice de trajets, du catalogue, d’une seed et d’une difficulté. La vérité est simulée d’abord, témoignages et indices en sont dérivés. Types et règles : `docs/reference/DATA-MODEL.md`.

## Requirements

### Requirement: Le moteur est pur et reproductible
Appelée deux fois avec les mêmes entrées, la génération SHALL produire deux enquêtes strictement identiques. Le moteur MUST NOT utiliser `Math.random`, l’horloge, le réseau ni le DOM.

#### Scenario: Même seed, même enquête
- **WHEN** on appelle `generateInvestigation(places, routes, catalog, { seed, difficulty })` deux fois avec les mêmes entrées
- **THEN** les deux enquêtes sont strictement identiques

#### Scenario: Seeds différentes
- **WHEN** on appelle la génération avec deux seeds différentes
- **THEN** les enquêtes peuvent différer, mais chacune est valide

### Requirement: Les entrées sont validées
Le moteur SHALL exiger une `Route` pour chaque paire de lieux fournis, symétrique et de `minutes ≥ 1`, et rejeter l’entrée avec une erreur explicite sinon.

#### Scenario: Matrice incomplète
- **WHEN** il manque la `Route` entre deux lieux fournis
- **THEN** le moteur refuse de générer et nomme les deux lieux

### Requirement: La vérité d’abord
La génération SHALL créer `difficulty + 2` suspects, simuler pour chacun une vraie soirée en segments consécutifs dont les enchaînements respectent les temps de marche, placer l’auteur sur la scène à l’heure du mystère, et inclure chaque fait non mensonger dans un segment.

#### Scenario: Soirée réaliste
- **WHEN** une enquête est générée
- **THEN** pour deux segments consécutifs d’un suspect, le temps écoulé couvre le trajet entre leurs lieux

#### Scenario: Auteur à la scène
- **WHEN** une enquête est générée
- **THEN** un segment de l’auteur est sur la scène à l’heure du mystère

#### Scenario: Faits vrais dérivés
- **WHEN** une enquête est générée
- **THEN** tout fait autre que le mensonge de l’auteur pointe vers un segment

### Requirement: Un seul mensonge, avec un motif
L’auteur SHALL faire exactement un témoignage mensonger, sur l’heure ou le lieu où il se trouvait au moment du mystère, et ce témoignage SHALL porter un motif parmi `surprise`, `modesty`, `clumsiness`, `misunderstanding`, `mistake`, pris parmi les motifs du scénario retenu.

#### Scenario: Un mensonge, un motif
- **WHEN** une enquête est générée
- **THEN** exactement un témoignage est mensonger, prononcé par l’auteur, avec un motif présent dans `lieMotives` du scénario

### Requirement: Les rôles des lieux sont respectés
La scène SHALL être choisie parmi les lieux de rôle `scene` compatibles avec le scénario ; aucun lieu `excluded` ou `removed` n’est retenu ; les lieux d’alibi ne reçoivent que des indices de la table de compatibilité, à une heure d’ouverture (sans horaires, toujours ouvert), et un lieu de rôle `alibi` ne reçoit que des faits neutres ou positifs.

#### Scenario: Scène valide
- **WHEN** une enquête est générée
- **THEN** la scène est de rôle `scene` et son type figure dans les scènes possibles du scénario

#### Scenario: Lieux exclus
- **WHEN** les lieux fournis contiennent un lieu `excluded` ou `removed`
- **THEN** il n’apparaît dans aucun segment ni fait de l’enquête

#### Scenario: Indice pendant les horaires
- **WHEN** un indice est placé dans un lieu ayant des horaires
- **THEN** l’heure du fait tombe dans ces horaires

### Requirement: La difficulté est exacte ou signalée
L’enquête produite SHALL avoir exactement la difficulté demandée (de 1 à 3) selon le solveur, ou la génération SHALL signaler qu’elle ne peut pas l’atteindre avec les lieux fournis, sans lever d’exception pour ce cas.

#### Scenario: Difficulté atteinte
- **WHEN** on demande la difficulté 2 avec assez de lieux
- **THEN** le solveur trouve exactement 2 tours d’innocentage

#### Scenario: Difficulté inatteignable
- **WHEN** les lieux fournis ne permettent pas la difficulté demandée
- **THEN** la génération retourne un résultat d’échec avec la raison

### Requirement: Réparation ou rejet
Quand une enquête générée n’est pas valide, le générateur SHALL ajouter un indice qui innocente un suspect resté possible et revérifier ; si la réparation échoue, il SHALL recommencer avec une seed dérivée de façon déterministe, dans une limite de tentatives.

#### Scenario: Réparation par un indice
- **WHEN** une enquête candidate a deux suspects possibles
- **THEN** le générateur ajoute un indice qui innocente l’un d’eux et revérifie

#### Scenario: Seed dérivée
- **WHEN** la réparation échoue dans la limite de tentatives
- **THEN** le générateur recommence avec une seed dérivée, de façon déterministe

### Requirement: Liens de déblocage
Le générateur SHALL produire des liens « débloqué par » entre faits ; un fait sans lien est visible dès le départ.

#### Scenario: Faits visibles au départ
- **WHEN** une enquête est générée
- **THEN** au moins un fait n’a pas de lien « débloqué par »

### Requirement: Les preuves datent du départ et innocentent
Quand la génération place une preuve, elle SHALL la dater de la fin du séjour du personnage, et ce séjour SHALL finir assez près de l’heure du mystère pour que la preuve innocente le personnage.

#### Scenario: Addition au départ
- **WHEN** une enquête est générée avec une addition comme preuve
- **THEN** l’addition est datée de l’heure à laquelle le personnage quitte le lieu

#### Scenario: Séjour proche de l’heure du mystère
- **WHEN** une preuve innocente un personnage au tour 1
- **THEN** la fin de son séjour est à moins du temps de trajet vers la scène de l’heure du mystère

### Requirement: La réparation respecte les preuves
Quand la réparation ajoute un indice à un personnage, elle SHALL n’utiliser une preuve que si la fin de son séjour est assez proche de l’heure du mystère pour l’innocenter, sinon un indice PNJ, et SHALL renoncer à réparer s’il n’y en a aucun.

#### Scenario: Séjour trop long pour une preuve
- **WHEN** la fin du séjour d’un personnage est trop éloignée de l’heure du mystère pour qu’une preuve l’innocente
- **THEN** la réparation utilise un indice PNJ compatible avec le lieu

#### Scenario: Aucun indice possible
- **WHEN** aucun indice compatible ne peut innocenter le personnage
- **THEN** la réparation n’ajoute rien

### Requirement: L’heure du mystère est ronde
Le moteur SHALL choisir l’heure du mystère parmi les multiples de 5 minutes compris dans la plage horaire du scénario et dans les horaires de la scène, et SHALL écarter un couple scénario/scène qui n’en contient aucun.

#### Scenario: Heures rondes
- **WHEN** des enquêtes sont générées sur de nombreuses seeds
- **THEN** l’heure du mystère de chacune est un multiple de 5 minutes, comme 10h15 ou 8h05, jamais 7h57 ni 18h13

#### Scenario: Dans la plage et les horaires
- **WHEN** une enquête est générée
- **THEN** l’heure du mystère est dans la plage du scénario et dans les horaires de la scène

#### Scenario: Aucun multiple de 5 minutes
- **WHEN** la plage d’un couple scénario/scène ne contient aucun multiple de 5 minutes
- **THEN** ce couple n’est pas utilisé et la génération choisit un autre couple

### Requirement: Les objets de la farce sont tirés avec la seed
Quand le scénario retenu accepte des objets, la génération SHALL en tirer un nombre compris entre son minimum et son maximum, tous différents, parmi les objets du catalogue portant une de ses étiquettes, et SHALL les conserver dans l’enquête ; un scénario sans objet n’en reçoit aucun.

#### Scenario: Objets du scénario
- **WHEN** une enquête est générée avec un scénario qui accepte 1 à 2 objets d’étiquette `wearable`
- **THEN** l’enquête contient 1 ou 2 objets différents, tous d’étiquette `wearable`

#### Scenario: Même seed, mêmes objets
- **WHEN** on génère deux fois avec les mêmes entrées
- **THEN** les objets tirés sont identiques et dans le même ordre

#### Scenario: Variété
- **WHEN** on génère des enquêtes du même scénario sur de nombreuses seeds
- **THEN** plusieurs combinaisons d’objets différentes apparaissent

#### Scenario: Scénario sans objet
- **WHEN** le scénario retenu n’accepte aucun objet
- **THEN** l’enquête ne contient aucun objet
