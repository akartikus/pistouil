# Spec Delta

## MODIFIED Requirements

### Requirement: Attribution toujours visible
Sur les écrans qui montrent la carte du jeu (Carte et Révélation), l’en-tête SHALL afficher en permanence, à côté du titre, un bouton « i » qui déplie l’attribution (« © OpenStreetMap contributors · Protomaps »). Elle SHALL être dépliée à l’ouverture de l’écran, puis se replier après quelques secondes ou au toucher ailleurs. Le texte complet figure aussi dans À propos. La page `/map`, réservée au développement, garde le contrôle de la carte.

#### Scenario: Mentions visibles
- **WHEN** l’écran Carte ou Révélation est affiché, quel que soit le thème
- **THEN** le bouton « i » est visible dans l’en-tête, à côté du titre, et la carte n’affiche pas de second « i »

#### Scenario: Attribution dépliée à l’affichage
- **WHEN** l’écran Carte ou Révélation s’affiche
- **THEN** l’attribution est lisible, puis se replie après quelques secondes ou au toucher ailleurs

#### Scenario: Retrouver l’attribution
- **WHEN** le joueur touche « i » après le repli
- **THEN** l’attribution se déplie à nouveau

#### Scenario: Écrans sans carte
- **WHEN** l’écran Carnet ou Suspects est affiché
- **THEN** l’en-tête n’affiche pas de bouton « i »
