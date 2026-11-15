# Spec Delta

## MODIFIED Requirements

### Requirement: Mensonge démasquable et contradiction
Le solveur SHALL pouvoir indiquer si un témoignage est contredit, corroboré ou non vérifié par rapport aux faits fiables en fin de résolution ; deux faits sur le même personnage se contredisent si leurs lieux sont différents et l’écart de temps inférieur au trajet, ou s’ils sont au même lieu et qu’un `departure` interrompt une présence continue, ou s’ils sont deux `departure` au même lieu à des heures différentes.

#### Scenario: Départ contre présence continue
- **WHEN** Inès (fiable) témoigne du départ de Lucie du café à 20h50 et Lucie dit être au café de 20h30 à 21h00
- **THEN** le témoignage de Lucie est contredit

#### Scenario: Lieux incompatibles
- **WHEN** deux faits placent le même personnage à deux lieux dont le trajet dépasse l’écart de temps
- **THEN** ils se contredisent

#### Scenario: Deux départs différents
- **WHEN** deux faits annoncent que le même personnage a quitté le même lieu à 18h28 et à 18h50
- **THEN** ils se contredisent

#### Scenario: Deux départs identiques
- **WHEN** deux faits annoncent que le même personnage a quitté le même lieu à la même heure
- **THEN** ils ne se contredisent pas
