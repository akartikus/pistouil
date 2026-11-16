# Spec Delta

## ADDED Requirements

### Requirement: Positions au curseur horaire
Pour une heure donnée, le jeu SHALL placer chaque suspect au lieu des faits découverts qui le concernent et qui couvrent cette heure (intervalle contenant l’heure, ou instant égal à l’heure). Un suspect sans fait à cette heure est « inconnu ».

#### Scenario: Suspect localisé
- **WHEN** un fait découvert dit que Léa est à la mairie de 20:15 à 20:50
- **THEN** à 20:30 Léa est placée à la mairie

#### Scenario: Suspect inconnu
- **WHEN** aucun fait découvert ne couvre l’heure choisie pour un suspect
- **THEN** il est indiqué comme inconnu à cette heure

### Requirement: Aucune conclusion pendant la partie
Pendant la partie, le jeu SHALL ne signaler aucune incohérence entre des faits et ne donner aucun verdict d’alibi : le joueur fait lui-même la déduction. Mesurer un trajet lui donne seulement sa durée et son tracé.

#### Scenario: Trajet mesuré
- **WHEN** le joueur mesure le trajet entre deux lieux dont deux faits d’un suspect sont incompatibles
- **THEN** le jeu affiche la durée du trajet et ne signale aucune incohérence

### Requirement: Incohérences expliquées à la fin de la partie
Après l’accusation, le jeu SHALL signaler les paires de faits découverts d’un même suspect, dans deux lieux différents, dont l’écart est inférieur au trajet entre ces lieux (écart nul compris), calculé avec les trajets de la révélation. Le signalement donne le trajet et l’écart et ne dit pas lequel des deux faits est faux ; deux faits dans un même lieu ne sont pas signalés.

#### Scenario: Après l’accusation
- **WHEN** l’accusation est faite et que deux faits découverts de Maël sont à 10 minutes de trajet avec 0 minute d’écart
- **THEN** le jeu signale l’incohérence avec 10 minutes de trajet et 0 minute d’écart

#### Scenario: Même lieu
- **WHEN** deux faits d’un même suspect dans un même lieu se contredisent
- **THEN** le jeu ne les signale pas

### Requirement: Alibis expliqués à la fin de la partie
Après l’accusation, pour chaque fait découvert d’un suspect dans un lieu autre que la scène, le jeu SHALL dire si ce fait, supposé vrai, laisse au suspect le temps d’être à la scène à l’heure du mystère. La formulation SHALL être conditionnelle (« si ce fait est vrai »).

#### Scenario: Trop loin
- **WHEN** un fait place Léa à la poste jusqu’à 20:50, que la scène est à 12 minutes et que le mystère est à 21:00, la partie étant terminée
- **THEN** le jeu dit que, si ce fait est vrai, Léa ne peut pas être à la scène

### Requirement: Déduction par des fonctions pures
Les positions, incohérences et alibis suffisants SHALL être calculés par des fonctions pures et testées, à partir des faits découverts, des trajets connus et de l’heure du mystère, en réutilisant les règles du solveur.

#### Scenario: Mêmes entrées, mêmes verdicts
- **WHEN** on calcule deux fois avec les mêmes faits et les mêmes trajets
- **THEN** les verdicts sont identiques
