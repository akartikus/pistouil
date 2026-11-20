# Spec Delta

## ADDED Requirements

### Requirement: Révélation à la hauteur de l’écran
L’écran de révélation SHALL occuper toute la hauteur entre l’en-tête et les onglets : la carte SHALL prendre la place que laissent le verdict, le curseur et les boutons, sans espace vide sous eux. Sur un petit écran, la carte SHALL garder une hauteur minimale et la page défiler, sans débordement horizontal.

#### Scenario: Écran haut
- **WHEN** la révélation s’affiche sur un écran de 790 × 968 ou de 390 × 844
- **THEN** le dernier bouton touche presque les onglets et la carte s’agrandit d’autant

#### Scenario: Petit écran
- **WHEN** la révélation s’affiche sur un écran de 375 × 667
- **THEN** la carte garde sa hauteur minimale, la page défile jusqu’aux boutons et rien ne déborde en largeur
