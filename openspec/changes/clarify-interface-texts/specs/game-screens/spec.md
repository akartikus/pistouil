# Spec Delta

## ADDED Requirements

### Requirement: Textes compréhensibles
Les textes de l’interface SHALL n’employer que des mots que le joueur comprend sans connaître le jeu : un seul mot par notion, ceux du vocabulaire de `docs/design/wording.md`, et aucun terme interne du moteur (« graine », « pièce », « scène »). Les specs et le code peuvent garder ces termes internes.

#### Scenario: Aucun terme interne
- **WHEN** on lit tous les textes de l’interface
- **THEN** aucun n’emploie « graine », « pièce » ni « scène », ni le nom d’un fichier de données

#### Scenario: Messages d’erreur
- **WHEN** le jeu ne peut pas lancer ou reprendre une enquête
- **THEN** le message dit ce qui s’est passé et ce que le joueur peut faire

### Requirement: Boutons de trajet expliqués
Dans le panneau d’un lieu, les boutons « Vers le lieu du mystère » et « Trajet vers… » SHALL être précédés d’une courte étiquette qui dit à quoi ils servent : « Calculer le trajet à pied ».

#### Scenario: Étiquette au-dessus des boutons
- **WHEN** le joueur ouvre le panneau d’un lieu de l’enquête
- **THEN** l’étiquette « Calculer le trajet à pied » s’affiche juste au-dessus des boutons de trajet

#### Scenario: Lieu du mystère
- **WHEN** le joueur ouvre le panneau du lieu du mystère, où seul « Trajet vers… » est proposé
- **THEN** l’étiquette « Calculer le trajet à pied » s’affiche aussi au-dessus de ce bouton

### Requirement: Localisation grisée tant qu’elle n’est pas disponible
Tant que la localisation n’a pas été validée sur appareil, le bouton « Je me localise » SHALL être grisé et sans effet, avec la mention « Bientôt disponible » ; le bouton « Fuveau » SHALL rester utilisable.

#### Scenario: Bouton grisé
- **WHEN** le joueur ouvre l’écran de départ
- **THEN** « Je me localise » est grisé avec la mention « Bientôt disponible », et le toucher ne demande aucune permission

#### Scenario: Fuveau reste utilisable
- **WHEN** « Je me localise » est grisé
- **THEN** « Fuveau » lance une enquête normalement

## MODIFIED Requirements

### Requirement: Guide de départ
Au premier lancement, un guide en trois bulles SHALL accompagner le joueur : annoncer qu’une farce a eu lieu et inviter à toucher un lieu numéroté, puis à toucher un indice ou un témoignage pour le lire, puis à voir le temps de marche vers le lieu du mystère. Chaque bulle passe à la suivante quand le joueur fait l’action ; le guide se passe d’un toucher, ne se montre qu’une fois et se rejoue depuis les Réglages.

#### Scenario: Guide passé
- **WHEN** le joueur touche « Passer »
- **THEN** le guide disparaît et ne revient pas au lancement suivant

#### Scenario: Guide rejoué
- **WHEN** le joueur touche « Revoir le guide » dans les Réglages
- **THEN** le guide se montre à nouveau à la prochaine ouverture de la carte

### Requirement: Réglages sans mode hors ligne et À propos
L’écran Réglages SHALL permettre de choisir le thème clair ou sombre, rappeler l’enquête (commune, difficulté, numéro de l’enquête, date des données, état en cours ou terminée), proposer une nouvelle enquête, et afficher À propos : la mention de fiction, « © OpenStreetMap contributors » (licence ODbL), le fond de carte Protomaps et la police IBM Plex Mono (licence OFL).

#### Scenario: Crédits
- **WHEN** le joueur ouvre À propos
- **THEN** il y lit la mention de fiction et les crédits des données, du fond de carte et de la police

#### Scenario: État de l’enquête
- **WHEN** le joueur ouvre les Réglages après avoir accusé
- **THEN** le rappel de l’enquête indique qu’elle est terminée

#### Scenario: Pas de mode hors ligne
- **WHEN** le joueur ouvre les Réglages
- **THEN** il n’y trouve ni mode hors ligne ni zones téléchargées

#### Scenario: Date des données
- **WHEN** le joueur ouvre les Réglages avec une enquête en cours
- **THEN** la date des données s’écrit en français, comme « 15 novembre 2026 », sans nom de fichier

### Requirement: Suspects et fiches qui se remplissent
L’écran Suspects SHALL montrer une carte par suspect avec son statut d’alibi (à vérifier, douteux, vérifié) que le joueur choisit. La fiche SHALL regrouper ce que le suspect dit, ce que les autres en disent, les indices et témoignages, et ne contenir que les faits déjà découverts. Une rubrique vide SHALL afficher « RIEN POUR L’INSTANT » et la fiche « N lieux explorés sur M », sans jamais annoncer combien d’indices restent à trouver.

#### Scenario: Fiche au départ
- **WHEN** aucun lieu n’a été ouvert
- **THEN** la fiche ne montre que la tête, le nom et le statut, et ses rubriques sont vides

#### Scenario: Fiche après exploration
- **WHEN** le joueur ouvre un lieu dont un fait concerne ce suspect
- **THEN** ce fait apparaît dans la rubrique correspondante de sa fiche
