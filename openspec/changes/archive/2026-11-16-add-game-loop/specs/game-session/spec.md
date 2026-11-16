# Spec Delta

## ADDED Requirements

### Requirement: Génération dans un Web Worker
Le jeu SHALL charger la zone, calculer les trajets et générer l’enquête dans un Web Worker, sans bloquer l’interface. Une fois les données téléchargées, l’enquête SHALL être affichée en moins de 3 secondes sur un téléphone moyen.

#### Scenario: Démarrage à Fuveau
- **WHEN** le joueur choisit Fuveau et une difficulté, données déjà téléchargées
- **THEN** une enquête est affichée en moins de 3 secondes et l’interface reste réactive pendant le calcul

#### Scenario: Échec de génération
- **WHEN** le générateur ne peut pas produire d’enquête pour la zone et la difficulté
- **THEN** le jeu l’explique et propose une autre difficulté ou une autre commune

### Requirement: L’enquête complète reste dans le Worker
Le Worker SHALL garder l’enquête complète. L’interface SHALL ne recevoir qu’une projection : situation, heure et jour du mystère, lieu du mystère, lieux retenus et suspects (prénom). Elle n’apprend aucun nombre de faits et ne reçoit jamais l’auteur, un mensonge, un motif, un genre de mensonge, la vraie soirée ni le texte de révélation avant l’accusation.

#### Scenario: Aucune donnée cachée
- **WHEN** on sérialise tout ce que l’interface a reçu avant l’accusation
- **THEN** on n’y trouve ni l’auteur, ni `lie`, `motive`, `lieKind`, `segments`, `author`, ni `revelationText`

### Requirement: Ouvrir un lieu révèle ses faits
Quand le joueur ouvre un lieu retenu, le Worker SHALL renvoyer tous ses faits (texte, suspect concerné, source, horaires) et les marquer découverts, y compris ceux débloqués par un autre fait du même lieu. Ouvrir deux fois un lieu ne change rien.

#### Scenario: Lieu avec un fait enchaîné
- **WHEN** un lieu contient un indice et un témoignage débloqué par cet indice
- **THEN** l’ouverture renvoie les deux faits

### Requirement: Mesurer un trajet entre lieux retenus
Le Worker SHALL fournir, à la demande, le trajet entre deux lieux retenus (durée, distance, tracé, approximatif ou non) et l’enregistrer comme mesuré, dans les deux sens. Il SHALL refuser un lieu qui n’est pas retenu.

#### Scenario: Mesure
- **WHEN** le joueur demande le trajet entre deux lieux retenus
- **THEN** la durée et le tracé sont renvoyés et la paire est notée comme mesurée

#### Scenario: Lieu non retenu
- **WHEN** on demande un trajet vers un lieu hors de l’enquête
- **THEN** la demande est refusée

### Requirement: Progression du joueur
La progression SHALL contenir les lieux ouverts, les faits lus (dont la pièce a été touchée), les trajets mesurés, les annotations de lieux, les notes libres, le statut d’alibi de chaque suspect et l’accusation. Le statut d’alibi (à vérifier, douteux, vérifié) SHALL être choisi par le joueur ; le jeu ne le change jamais à sa place. Il vaut « à vérifier » au départ.

#### Scenario: Statut d’alibi
- **WHEN** un fait découvert innocente un suspect selon les règles du solveur
- **THEN** son statut reste inchangé tant que le joueur ne le change pas

### Requirement: Accusation unique et définitive
Le Worker SHALL accepter une seule accusation. Elle est définitive, qu’elle soit juste ou non, et ouvre la révélation. Une seconde accusation SHALL être refusée.

#### Scenario: Seconde accusation
- **WHEN** le joueur a déjà accusé un suspect et en accuse un autre
- **THEN** la demande est refusée et la première accusation reste

### Requirement: Sauvegarde et reprise
Le jeu SHALL sauvegarder localement, après chaque action, la graine, la difficulté, la zone (centre, rayon), la version des données et la progression. À la réouverture, l’enquête SHALL être régénérée à l’identique à partir de la graine et la progression restaurée. Si la version des données a changé, le jeu le dit et propose une nouvelle enquête.

#### Scenario: Reprise
- **WHEN** le joueur ferme puis rouvre l’application en cours d’enquête
- **THEN** il retrouve ses lieux ouverts, ses mesures, ses notes, ses statuts d’alibi et son accusation éventuelle

#### Scenario: Données mises à jour
- **WHEN** la version des données a changé depuis la sauvegarde
- **THEN** le jeu explique que l’enquête ne peut plus être rejouée à l’identique et propose d’en démarrer une autre

### Requirement: Sauvegarde sans donnée cachée
La sauvegarde SHALL ne contenir que des données déjà connues du joueur ou nécessaires à régénérer l’enquête (la graine) : jamais l’auteur, un mensonge ou le texte de révélation.

#### Scenario: Contenu de la sauvegarde
- **WHEN** on lit la sauvegarde
- **THEN** elle ne contient que la graine, la difficulté, la zone, la version des données et la progression
