# Spec Delta

## MODIFIED Requirements

### Requirement: Clic sur un lieu de décor
Au clic sur un lieu de décor, la carte SHALL afficher seulement les informations OSM disponibles : son nom, son libellé de type et ses horaires d’ouverture traduits en français. Une information absente SHALL être omise.

#### Scenario: Lieu avec horaires
- **WHEN** on touche un lieu de décor qui a des horaires
- **THEN** un panneau montre son nom, son type et ses horaires

#### Scenario: Lieu sans horaires
- **WHEN** on touche un lieu de décor sans horaires
- **THEN** le panneau n’affiche ni ligne d’horaires ni texte inventé

#### Scenario: Horaires lisibles
- **WHEN** on touche un lieu de décor dont les horaires sont `Mo-Sa 08:30-20:00; PH off`
- **THEN** le panneau montre « lun.–sam. 8h30–20h ; fermé les jours fériés »
