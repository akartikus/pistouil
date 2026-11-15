# Spec Delta

## Purpose

Résout une enquête par déduction à partir de ce que le joueur peut voir, pour valider qu’un seul suspect est possible et mesurer la difficulté. Algorithme : `docs/reference/DATA-MODEL.md` §7.

## ADDED Requirements

### Requirement: Le solveur ne lit que les données visibles
Le solveur SHALL ne lire que les faits atteignables et leurs sources, et MUST NOT lire `author`, `lie` ni `motive`.

#### Scenario: Attributs privés ignorés
- **WHEN** on modifie `author`, `lie` ou `motive` d’une enquête sans toucher aux faits
- **THEN** le résultat du solveur est identique

### Requirement: Faits atteignables
Le solveur SHALL ne considérer que les faits sans lien « débloqué par », puis, à répétition, ceux dont le fait qui les débloque est atteignable.

#### Scenario: Fait jamais débloqué
- **WHEN** le fait qui en débloque un autre n’est lui-même jamais atteignable
- **THEN** le fait n’est pas lu par le solveur

### Requirement: Innocentage par alibi et temps de marche
Un suspect non innocenté SHALL être innocenté s’il existe un fait fiable le concernant, à un lieu `L` différent de la scène, tel que `écart < temps(L, scène)`, où `écart = max(fait.from − T, T − fait.to, 0)`. Les témoignages des suspects innocentés deviennent fiables ; le calcul se répète jusqu’à stabilité.

#### Scenario: Exemple de référence
- **WHEN** le solveur analyse l’exemple de référence (`DATA-MODEL.md` §8)
- **THEN** Paul et Inès sont innocentés au tour 1, Lucie reste seule possible, et la difficulté vaut 1

#### Scenario: Variante sans le ticket
- **WHEN** on retire le ticket de caisse de l’exemple de référence
- **THEN** deux suspects restent possibles et l’enquête est invalide

#### Scenario: Fait à la scène
- **WHEN** un fait fiable place un suspect à la scène
- **THEN** il ne l’innocente pas

### Requirement: Validité et difficulté
L’enquête SHALL être valide si exactement un suspect reste possible et que c’est l’auteur ; la difficulté SHALL être le nombre de tours au cours desquels au moins un suspect est innocenté.

#### Scenario: Chaîne de deux tours
- **WHEN** un suspect n’est innocenté que grâce au témoignage d’un innocent du tour précédent
- **THEN** la difficulté vaut 2 ou plus

### Requirement: Mensonge démasquable et contradiction
Le solveur SHALL pouvoir indiquer si un témoignage est contredit, corroboré ou non vérifié par rapport aux faits fiables en fin de résolution ; deux faits sur le même personnage se contredisent si leurs lieux sont différents et l’écart de temps inférieur au trajet, ou s’ils sont au même lieu et qu’un `departure` interrompt une présence continue.

#### Scenario: Départ contre présence continue
- **WHEN** Inès (fiable) témoigne du départ de Lucie du café à 20h50 et Lucie dit être au café de 20h30 à 21h00
- **THEN** le témoignage de Lucie est contredit

#### Scenario: Lieux incompatibles
- **WHEN** deux faits placent le même personnage à deux lieux dont le trajet dépasse l’écart de temps
- **THEN** ils se contredisent
