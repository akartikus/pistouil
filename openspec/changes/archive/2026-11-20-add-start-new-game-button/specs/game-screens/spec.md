# Spec Delta

## MODIFIED Requirements

### Requirement: Écran de départ à deux boutons
L’écran de départ SHALL proposer deux boutons, « Je me localise » et « Fuveau » (la seule commune disponible pour le moment), le choix de la difficulté (1 à 3) et la mention de fiction : les lieux sont réels, les personnages et les faits sont imaginaires. Quand une enquête est sauvegardée, il SHALL indiquer son état et montrer côte à côte un bouton pour la reprendre ou en revoir la révélation et un bouton « Nouvelle enquête ».

#### Scenario: Deux boutons de départ
- **WHEN** le joueur ouvre l’écran de départ pour une nouvelle enquête
- **THEN** il voit « Je me localise » et « Fuveau », et aucune recherche de commune

#### Scenario: Reprise proposée
- **WHEN** une enquête sauvegardée est en cours
- **THEN** l’écran de départ indique qu’elle est en cours et montre côte à côte « Reprendre l’enquête » et « Nouvelle enquête »

#### Scenario: Enquête terminée
- **WHEN** l’enquête sauvegardée a déjà une accusation
- **THEN** l’écran de départ indique qu’elle est terminée et montre côte à côte « Revoir la révélation » et « Nouvelle enquête », sans proposer de la reprendre

#### Scenario: Nouvelle enquête avec une sauvegarde
- **WHEN** le joueur touche « Nouvelle enquête » alors qu’une enquête est sauvegardée
- **THEN** la difficulté, « Je me localise » et « Fuveau » s’affichent avec la mention qu’elles remplacent l’enquête enregistrée, et rien n’est supprimé tant que le joueur n’en commence pas une

#### Scenario: Aucune sauvegarde
- **WHEN** aucune enquête n’est sauvegardée
- **THEN** la difficulté, « Je me localise » et « Fuveau » sont affichées d’emblée
