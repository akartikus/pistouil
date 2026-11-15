# Spec Delta

## ADDED Requirements

### Requirement: Preuve datée du départ
Toute preuve (indice de nature `proof`) SHALL être un fait de départ daté de la fin du segment du personnage qu’elle concerne (`departure` vrai, `from = to` = fin du segment), car elle prouve un achat ou un passage après lequel la personne part.

#### Scenario: Preuve conforme
- **WHEN** un ticket de caisse concerne un séjour qui finit à 21h03
- **THEN** le fait est un départ daté de 21h03 et la règle est respectée

#### Scenario: Preuve au milieu du séjour
- **WHEN** une addition est datée de 16h56 alors que le séjour du personnage finit à 17h59
- **THEN** l’enquête est rejetée en nommant la règle « preuve datée du départ »

#### Scenario: Indice PNJ non concerné
- **WHEN** un indice PNJ place un personnage au lieu pendant son séjour
- **THEN** la règle n’est pas appliquée à cet indice
