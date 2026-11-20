# Spec Delta

## MODIFIED Requirements

### Requirement: Écran de départ
L’écran de départ SHALL proposer « Je me localise » ou la recherche d’une commune, le choix de la difficulté (1 à 3) et la mention de fiction : les lieux sont réels, les personnages et les faits sont imaginaires. Il SHALL proposer de reprendre une enquête sauvegardée, rappeler si le mode hors ligne est activé, et, dans ce mode, proposer le téléchargement de la commune choisie quand elle n’est pas téléchargée.

#### Scenario: Reprise proposée
- **WHEN** une enquête sauvegardée existe
- **THEN** l’écran de départ propose de la reprendre ou d’en commencer une autre

#### Scenario: Commune à télécharger
- **WHEN** le mode hors ligne est activé et le joueur choisit une commune non téléchargée
- **THEN** l’écran lui propose de la télécharger, avec sa taille

### Requirement: Réglages et À propos
L’écran Réglages SHALL permettre de choisir le thème clair ou sombre, d’activer ou non le mode hors ligne, de gérer les zones téléchargées (liste, taille, suppression), rappeler l’enquête (commune, difficulté, graine, version des données), proposer une nouvelle enquête, et afficher À propos : la mention de fiction, « © OpenStreetMap contributors » (licence ODbL), le fond de carte Protomaps et la police IBM Plex Mono (licence OFL).

#### Scenario: Crédits
- **WHEN** le joueur ouvre À propos
- **THEN** il y lit la mention de fiction et les crédits des données, du fond de carte et de la police

#### Scenario: Zones téléchargées
- **WHEN** le joueur ouvre les Réglages
- **THEN** il voit le réglage du mode hors ligne et ses zones téléchargées avec leur taille, et peut en supprimer une
