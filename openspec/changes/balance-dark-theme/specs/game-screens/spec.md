# Spec Delta

## ADDED Requirements

### Requirement: Thème sombre équilibré
Le thème sombre SHALL rester lisible sans éblouir : texte à au moins 7:1 sur les panneaux, cadres à au moins 3:1 et jamais en blanc pur, aucun grand aplat blanc (en-têtes, pastilles et onglets sont foncés ou jaunes). Le jaune SHALL être réservé à l’action, à la sélection et aux lieux de l’enquête. Le thème clair SHALL rester inchangé.

#### Scenario: Contrastes
- **WHEN** on mesure les couleurs du thème sombre
- **THEN** le texte, les textes secondaires, les cadres, le jaune et les textes sur aplats atteignent les contrastes minimaux

#### Scenario: Pas de cadre blanc
- **WHEN** un cadre, une bordure ou un aplat de grande taille s’affiche en thème sombre
- **THEN** il n’est pas en blanc pur

#### Scenario: Lien sur un en-tête
- **WHEN** le lien « Fiche ▸ » s’affiche sur l’en-tête d’une carte de suspect en thème sombre
- **THEN** il est lisible, avec un contraste d’au moins 4,5:1

#### Scenario: Thème clair inchangé
- **WHEN** le thème est clair
- **THEN** ses couleurs sont celles d’avant ce changement
