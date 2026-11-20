# Spec Delta

## MODIFIED Requirements

### Requirement: Écran de départ
L’écran de départ SHALL proposer « Je me localise » ou la recherche d’une commune, le choix de la difficulté (1 à 3) et la mention de fiction : les lieux sont réels, les personnages et les faits sont imaginaires. Quand une enquête est sauvegardée, il SHALL indiquer son état et proposer de la reprendre ou d’en revoir la révélation. Il SHALL toujours proposer une nouvelle enquête, rappeler si le mode hors ligne est activé et, dans ce mode, proposer le téléchargement de la commune choisie quand elle n’est pas téléchargée.

#### Scenario: Reprise proposée
- **WHEN** une enquête sauvegardée est en cours
- **THEN** l’écran de départ indique qu’elle est en cours et propose de la reprendre, et propose aussi une nouvelle enquête

#### Scenario: Enquête terminée
- **WHEN** l’enquête sauvegardée a déjà une accusation
- **THEN** l’écran de départ indique qu’elle est terminée, propose d’en revoir la révélation et non de la reprendre, et propose aussi une nouvelle enquête

#### Scenario: Nouvelle enquête avec une sauvegarde
- **WHEN** le joueur commence une nouvelle enquête alors qu’une autre est sauvegardée
- **THEN** la nouvelle remplace la sauvegarde, et l’écran l’avait annoncé

#### Scenario: Commune à télécharger
- **WHEN** le mode hors ligne est activé et le joueur choisit une commune non téléchargée
- **THEN** l’écran lui propose de la télécharger, avec sa taille

### Requirement: Réglages et À propos
L’écran Réglages SHALL permettre de choisir le thème clair ou sombre, d’activer ou non le mode hors ligne, de gérer les zones téléchargées (liste, taille, suppression), rappeler l’enquête (commune, difficulté, graine, version des données, état en cours ou terminée), proposer une nouvelle enquête, et afficher À propos : la mention de fiction, « © OpenStreetMap contributors » (licence ODbL), le fond de carte Protomaps et la police IBM Plex Mono (licence OFL).

#### Scenario: Crédits
- **WHEN** le joueur ouvre À propos
- **THEN** il y lit la mention de fiction et les crédits des données, du fond de carte et de la police

#### Scenario: Zones téléchargées
- **WHEN** le joueur ouvre les Réglages
- **THEN** il voit le réglage du mode hors ligne et ses zones téléchargées avec leur taille, et peut en supprimer une

#### Scenario: État de l’enquête
- **WHEN** le joueur ouvre les Réglages après avoir accusé
- **THEN** le rappel de l’enquête indique qu’elle est terminée
