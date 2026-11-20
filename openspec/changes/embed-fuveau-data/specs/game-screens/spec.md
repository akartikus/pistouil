# Spec Delta

## ADDED Requirements

### Requirement: Écran de départ à deux boutons
L’écran de départ SHALL proposer deux boutons, « Je me localise » et « Fuveau » (la seule commune disponible pour le moment), le choix de la difficulté (1 à 3) et la mention de fiction : les lieux sont réels, les personnages et les faits sont imaginaires. Quand une enquête est sauvegardée, il SHALL indiquer son état et proposer de la reprendre ou d’en revoir la révélation. Il SHALL toujours proposer une nouvelle enquête.

#### Scenario: Deux boutons de départ
- **WHEN** le joueur ouvre l’écran de départ pour une nouvelle enquête
- **THEN** il voit « Je me localise » et « Fuveau », et aucune recherche de commune

#### Scenario: Reprise proposée
- **WHEN** une enquête sauvegardée est en cours
- **THEN** l’écran de départ indique qu’elle est en cours et propose de la reprendre, et propose aussi une nouvelle enquête

#### Scenario: Enquête terminée
- **WHEN** l’enquête sauvegardée a déjà une accusation
- **THEN** l’écran de départ indique qu’elle est terminée, propose d’en revoir la révélation et non de la reprendre, et propose aussi une nouvelle enquête

#### Scenario: Nouvelle enquête avec une sauvegarde
- **WHEN** le joueur commence une nouvelle enquête alors qu’une autre est sauvegardée
- **THEN** la nouvelle remplace la sauvegarde, et l’écran l’avait annoncé

### Requirement: Réglages sans mode hors ligne et À propos
L’écran Réglages SHALL permettre de choisir le thème clair ou sombre, rappeler l’enquête (commune, difficulté, graine, version des données, état en cours ou terminée), proposer une nouvelle enquête, et afficher À propos : la mention de fiction, « © OpenStreetMap contributors » (licence ODbL), le fond de carte Protomaps et la police IBM Plex Mono (licence OFL).

#### Scenario: Crédits
- **WHEN** le joueur ouvre À propos
- **THEN** il y lit la mention de fiction et les crédits des données, du fond de carte et de la police

#### Scenario: État de l’enquête
- **WHEN** le joueur ouvre les Réglages après avoir accusé
- **THEN** le rappel de l’enquête indique qu’elle est terminée

#### Scenario: Pas de mode hors ligne
- **WHEN** le joueur ouvre les Réglages
- **THEN** il n’y trouve ni mode hors ligne ni zones téléchargées

## REMOVED Requirements

### Requirement: Écran de départ
**Reason**: La recherche de commune et la proposition de télécharger une commune disparaissent : deux boutons, « Je me localise » et « Fuveau ».
**Migration**: Voir l’exigence « Écran de départ à deux boutons ».

### Requirement: Réglages et À propos
**Reason**: Le mode hors ligne et la gestion des zones téléchargées disparaissent des Réglages.
**Migration**: Voir l’exigence « Réglages sans mode hors ligne et À propos ».
