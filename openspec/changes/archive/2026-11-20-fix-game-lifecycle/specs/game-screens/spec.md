# Spec Delta

## MODIFIED Requirements

### Requirement: Écran de départ
L’écran de départ SHALL proposer « Je me localise » ou la recherche d’une commune, le choix de la difficulté (1 à 3) et la mention de fiction : les lieux sont réels, les personnages et les faits sont imaginaires. Quand une enquête est sauvegardée, il SHALL indiquer son état, en cours ou terminée, et proposer de la reprendre si elle est en cours ou d’en revoir la révélation si elle est terminée. Il SHALL toujours proposer de commencer une nouvelle enquête, en précisant que cela remplace l’enquête enregistrée.

#### Scenario: Reprise proposée
- **WHEN** une enquête sauvegardée est en cours
- **THEN** l’écran de départ indique qu’elle est en cours et propose de la reprendre, et propose aussi une nouvelle enquête

#### Scenario: Enquête terminée
- **WHEN** l’enquête sauvegardée a déjà une accusation
- **THEN** l’écran de départ indique qu’elle est terminée, propose d’en revoir la révélation et non de la reprendre, et propose aussi une nouvelle enquête

#### Scenario: Nouvelle enquête avec une sauvegarde
- **WHEN** le joueur commence une nouvelle enquête alors qu’une autre est sauvegardée
- **THEN** la nouvelle remplace la sauvegarde, et l’écran l’avait annoncé

### Requirement: Carnet
Le Carnet SHALL montrer la chronologie des faits découverts (heure, suspect, source), les trajets mesurés, une note libre et les annotations attachées à des lieux. Pendant la partie, il ne montre ni incohérence ni verdict. Une fois la partie terminée, il SHALL montrer tous les faits de l’enquête, y compris ceux que le joueur n’avait pas vus, ceux-ci étant marqués comme non vus, avec les incohérences reliées à leurs deux faits et, sous les faits concernés, les verdicts d’alibi suffisant. Il SHALL se mettre à jour à chaque lieu ouvert.

#### Scenario: Pendant la partie
- **WHEN** le joueur consulte le Carnet avant d’avoir accusé
- **THEN** aucune incohérence ni aucun verdict n’y figure, et seuls les faits lus y figurent

#### Scenario: Après l’accusation
- **WHEN** la partie est terminée et que deux faits sont incompatibles
- **THEN** ils apparaissent hachurés et reliés par une étiquette d’incohérence, avec le trajet et l’écart

#### Scenario: Alibis jamais vus
- **WHEN** la partie est terminée et que le joueur n’avait pas ouvert certains lieux
- **THEN** leurs faits figurent au Carnet, marqués comme non vus, avec leurs incohérences et leurs verdicts

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
