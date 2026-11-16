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
L’auteur SHALL faire exactement un témoignage mensonger, d’un genre permis par la difficulté (`alibi` sur lui-même au moment du mystère, `framing` sur un autre suspect, `closed` dans un lieu fermé), et ce témoignage SHALL porter un motif parmi `surprise`, `modesty`, `clumsiness`, `misunderstanding`, `mistake`, pris parmi les motifs du scénario retenu.

#### Scenario: Un mensonge, un motif
- **WHEN** une enquête est générée
- **THEN** exactement un témoignage est mensonger, prononcé par l’auteur, avec un motif présent dans `lieMotives` du scénario

#### Scenario: Genre de mensonge
- **WHEN** une enquête est générée
- **THEN** le mensonge est de genre `alibi`, `framing` ou `closed`, et l’enquête retient ce genre

### Requirement: Les rôles des lieux sont respectés
La scène SHALL être choisie parmi les lieux de rôle `scene` compatibles avec le scénario et ouverts ce jour-là ; aucun lieu `excluded` ou `removed` n’est retenu ; les lieux d’alibi ne reçoivent que des indices de la table de compatibilité, à une heure d’ouverture du jour de l’enquête (sans horaires, toujours ouvert), et un lieu de rôle `alibi` ne reçoit que des faits neutres ou positifs.

#### Scenario: Scène valide
- **WHEN** une enquête est générée
- **THEN** la scène est de rôle `scene`, son type figure dans les scènes possibles du scénario et elle est ouverte à l’heure du mystère ce jour-là

#### Scenario: Lieux exclus
- **WHEN** les lieux fournis contiennent un lieu `excluded` ou `removed`
- **THEN** il n’apparaît dans aucun segment ni fait de l’enquête

#### Scenario: Indice pendant les horaires
- **WHEN** un indice est placé dans un lieu ayant des horaires
- **THEN** l’heure du fait tombe dans les horaires de ce lieu pour le jour de l’enquête

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

### Requirement: Le jour de l’enquête
La génération SHALL tirer avec la seed un jour d’enquête, `weekday` ou `weekend`, le conserver dans l’enquête, et appliquer partout les horaires de ce jour.

#### Scenario: Les deux jours apparaissent
- **WHEN** on génère des enquêtes sur de nombreuses seeds
- **THEN** des enquêtes tombent en semaine et d’autres le week-end

#### Scenario: Scène fermée le week-end
- **WHEN** un lieu est fermé le week-end
- **THEN** il n’est jamais la scène d’une enquête de week-end, ni le lieu d’un indice

#### Scenario: Même seed, même jour
- **WHEN** on génère deux fois avec les mêmes entrées
- **THEN** le jour de l’enquête est identique

### Requirement: Genres de mensonge selon la difficulté
La génération SHALL tirer le genre du mensonge parmi ceux que la difficulté permet : `alibi` (faux alibi sur lui-même contredit par un témoin) à toute difficulté, `framing` (mensonge sur un autre suspect contredit par un fait fiable sur celui-ci) à partir de la difficulté 2, `closed` (alibi dans un lieu fermé que seuls les horaires démentent) à la difficulté 3 seulement ; un genre impossible avec les lieux fournis SHALL être remplacé par un autre genre permis.

#### Scenario: Difficulté facile
- **WHEN** une enquête est générée à la difficulté 1
- **THEN** le mensonge est de genre `alibi`, contredit par un témoin, comme avant

#### Scenario: Accusation d’un autre
- **WHEN** le mensonge est de genre `framing`
- **THEN** la difficulté est d’au moins 2, il porte sur un suspect innocent différent de l’auteur, et un fait fiable sur ce suspect le contredit

#### Scenario: Lieu fermé
- **WHEN** le mensonge est de genre `closed`
- **THEN** la difficulté est 3, il place l’auteur dans un lieu fermé à l’heure et au jour annoncés, et aucun témoignage fiable ne le contredit

#### Scenario: Variété selon la difficulté
- **WHEN** on génère des enquêtes sur de nombreuses seeds avec assez de lieux
- **THEN** la difficulté 1 ne donne que `alibi`, la difficulté 2 donne `alibi` et `framing`, la difficulté 3 donne les trois genres

#### Scenario: Pas de contradiction unique
- **WHEN** le mensonge est de genre `framing`
- **THEN** la contradiction entre le témoignage de l’auteur et celui du suspect accusé ne désigne pas, à elle seule, l’auteur : le suspect accusé est innocenté par un autre fait

### Requirement: Les preuves lointaines
À partir de la difficulté 2, la génération SHALL donner à certains suspects, auteur compris, un séjour plus ancien avec une vraie preuve datée de la fin de ce séjour, éloigné de l’heure du mystère de plus que le trajet vers la scène, de sorte que cette preuve ne disculpe pas ; la part de suspects concernés SHALL être d’environ un sur trois à la difficulté 2 et d’environ un sur deux à la difficulté 3, aucune à la difficulté 1 ; les trajets entre ce séjour et les suivants SHALL rester réalistes.

#### Scenario: Aucune preuve lointaine à la difficulté facile
- **WHEN** une enquête est générée à la difficulté 1
- **THEN** elle ne contient aucune preuve lointaine

#### Scenario: Preuve vraie sans disculper
- **WHEN** une enquête contient une preuve lointaine pour un suspect
- **THEN** le solveur ne l’innocente pas grâce à cette preuve

#### Scenario: Trajets réalistes
- **WHEN** un suspect a un séjour plus ancien
- **THEN** le temps entre ce séjour et le suivant couvre le trajet

#### Scenario: Fréquence selon la difficulté
- **WHEN** on génère des enquêtes sur de nombreuses seeds
- **THEN** la part de suspects ayant une preuve lointaine est notable à la difficulté 2, plus élevée à la difficulté 3, pour des innocents comme pour l’auteur

### Requirement: Les tensions apparentes
À partir de la difficulté 2, la génération SHALL donner à certains suspects, auteur compris, une tension apparente : deux faits vrais sur la même personne, à deux lieux différents, séparés d’au moins le trajet et d’au plus ce trajet plus 3 minutes, qui semblent se contredire sans que le solveur les contredise. Elle SHALL n’en produire aucune à la difficulté 1.

#### Scenario: Aucune tension à la difficulté facile
- **WHEN** une enquête est générée à la difficulté 1
- **THEN** elle ne contient aucune tension apparente

#### Scenario: Tension vraie
- **WHEN** une enquête contient une tension apparente
- **THEN** ses deux faits sont vrais, le solveur ne les contredit pas, et la preuve ne disculpe pas la personne

#### Scenario: Écart juste suffisant
- **WHEN** une enquête contient une tension apparente
- **THEN** l’écart entre ses deux faits dépasse le trajet d’au plus 3 minutes

#### Scenario: Innocents et auteur
- **WHEN** on génère des enquêtes sur de nombreuses seeds aux difficultés 2 et 3
- **THEN** des tensions apparaissent pour des innocents et pour l’auteur

#### Scenario: La vraie contradiction se noie
- **WHEN** on compte, sur de nombreuses seeds, les paires de faits qui sont soit contredites soit des tensions
- **THEN** la part de vraies contradictions est de 100 % à la difficulté 1 et baisse aux difficultés 2 et 3

#### Scenario: Construction
- **WHEN** une tension est générée
- **THEN** elle prolonge un séjour plus ancien : une preuve datée du départ, puis un témoignage vrai de la personne sur son arrivée au séjour suivant

### Requirement: Les trajets approximatifs ne fondent pas de déduction
Un `Route` peut porter `approximate: true` (trajet à vol d’oiseau, voir `docs/reference/DATA-MODEL.md` §5) ; son absence signifie un trajet réel. Une fois la scène choisie, la génération SHALL ne retenir aucun lieu dont le trajet vers la scène est approximatif ; la scène elle-même reste retenue. Quand tous les trajets sont réels, la génération SHALL se comporter exactement comme avant.

#### Scenario: Lieu relié à la scène par un trajet approximatif
- **WHEN** le trajet entre un lieu et la scène est approximatif
- **THEN** ce lieu n’apparaît dans aucun segment ni fait de l’enquête

#### Scenario: Aucun trajet approximatif
- **WHEN** aucun `Route` fourni n’est approximatif
- **THEN** pour les mêmes entrées, l’enquête générée est identique à celle d’avant ce changement

#### Scenario: Scène isolée
- **WHEN** tous les trajets vers une scène sont approximatifs
- **THEN** cette scène ne permet pas d’enquête et la génération essaie une autre scène ou échoue avec sa raison habituelle
