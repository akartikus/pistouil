# Spec Delta

## ADDED Requirements

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
