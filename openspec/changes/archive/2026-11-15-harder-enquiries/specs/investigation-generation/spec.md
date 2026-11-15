# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
