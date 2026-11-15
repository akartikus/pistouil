# engine-playground Specification

## Purpose

Donne à l’équipe une page de développement pour essayer le moteur de génération à la main : produire une enquête, comprendre sa validité et comparer les scénarios du catalogue, sans exposer cet outil aux joueurs.

## Requirements

### Requirement: La page est réservée au développement
La route `/playground` SHALL être accessible en développement et SHALL répondre « introuvable » dans une version de production.

#### Scenario: En développement
- **WHEN** on ouvre `/playground` avec le serveur de développement
- **THEN** la page s’affiche avec ses contrôles

#### Scenario: En production
- **WHEN** on ouvre `/playground` dans le build de production
- **THEN** la page répond « introuvable » et n’affiche aucun contrôle

### Requirement: Génération pilotée par l’utilisateur
La page SHALL générer une enquête avec le catalogue de départ et les lieux fictifs à partir de la seed, de la difficulté, du scénario et du motif choisis, et SHALL produire la même enquête pour les mêmes choix.

#### Scenario: Mêmes choix, même enquête
- **WHEN** on génère deux fois avec la même seed, difficulté, scénario, motif et lieux
- **THEN** les deux enquêtes affichées sont identiques

#### Scenario: Scénario et motif imposés
- **WHEN** on choisit le scénario `rubber_ducks` et le motif `mistake`
- **THEN** l’enquête générée utilise ce scénario et ce motif

#### Scenario: Tirage d’une seed
- **WHEN** on demande une seed aléatoire
- **THEN** la seed affichée change et une nouvelle enquête est générée

### Requirement: Lieux activables
La page SHALL permettre d’activer ou de désactiver chaque lieu fictif, et la génération SHALL n’utiliser que les lieux actifs.

#### Scenario: Aucune scène disponible
- **WHEN** on désactive tous les lieux de rôle `scene`
- **THEN** la page affiche que la génération a échoué avec la raison `no-scene`

### Requirement: Cocher les lieux en bloc
La page SHALL proposer de cocher ou de décocher tous les lieux actifs d’un coup.

#### Scenario: Tout décocher
- **WHEN** l’utilisateur décoche tous les lieux
- **THEN** aucun lieu n’est actif et la génération échoue avec la raison `no-scene`

### Requirement: Échec de génération visible
La page SHALL afficher la raison de l’échec quand la génération n’aboutit pas, au lieu d’une enquête.

#### Scenario: Difficulté inatteignable
- **WHEN** les lieux actifs ne permettent pas la difficulté demandée
- **THEN** la page affiche la raison `difficulty-unreachable` et aucune enquête

### Requirement: Vue d’ensemble d’une enquête
La page SHALL afficher la situation du mystère, son heure et sa scène, les suspects, la difficulté mesurée par le solveur et la liste des règles de cohérence violées (vide si l’enquête est valide).

#### Scenario: Enquête valide
- **WHEN** une enquête est générée
- **THEN** la page affiche que toutes les règles sont respectées et la difficulté mesurée par le solveur

### Requirement: Matrice des distances
La page SHALL afficher la matrice des distances entre les lieux de l’enquête générée (ou entre tous les lieux actifs quand l’utilisateur le demande, et en cas d’échec de génération) : pour chaque paire, la durée en minutes et la distance en mètres, identique dans les deux sens, en marquant la scène.

#### Scenario: Lieux de l’enquête par défaut
- **WHEN** une enquête est générée
- **THEN** la matrice ne montre que les lieux retenus par l’enquête

#### Scenario: Tous les lieux actifs
- **WHEN** l’utilisateur demande tous les lieux actifs
- **THEN** la matrice montre chaque lieu actif, et un lieu désactivé en disparaît

#### Scenario: Paire de lieux
- **WHEN** deux lieux sont dans la matrice
- **THEN** elle affiche leur durée et leur distance, identiques dans les deux sens

### Requirement: Résolution par l’utilisateur
La page SHALL permettre de résoudre l’enquête comme un joueur : ouvrir un lieu révèle ses faits dont le fait qui les débloque est déjà découvert, et l’utilisateur peut accuser un suspect, après quoi la page indique si l’accusation est correcte et qui est l’auteur.

#### Scenario: Faits visibles au départ
- **WHEN** on ouvre un lieu
- **THEN** la page affiche ses faits qui n’ont pas de lien « débloqué par »

#### Scenario: Fait débloqué
- **WHEN** un fait est débloqué par un autre fait
- **THEN** il n’apparaît qu’une fois ce fait découvert et son lieu ouvert

#### Scenario: Accusation
- **WHEN** l’utilisateur accuse un suspect
- **THEN** la page indique si c’est l’auteur et le nomme

#### Scenario: Nouvelle enquête
- **WHEN** un choix change l’enquête générée
- **THEN** les lieux ouverts et l’accusation sont remis à zéro

### Requirement: Solution et détail du moteur révélables
La page SHALL cacher par défaut l’auteur, le mensonge, la vraie soirée, le texte de révélation, les étapes du solveur et le détail des faits (statut, liens de déblocage), et SHALL les afficher uniquement quand l’utilisateur le demande.

#### Scenario: Par défaut
- **WHEN** une enquête vient d’être générée
- **THEN** aucune de ces informations n’est affichée

#### Scenario: Après demande
- **WHEN** l’utilisateur active la révélation
- **THEN** la page affiche l’auteur, le fait mensonger et son motif, la vraie soirée de chaque suspect, le texte de révélation, les tours du solveur, et pour chaque fait sa fiabilité, son verdict et le fait qui le débloque

### Requirement: Liste des scénarios
La page SHALL lister les scénarios du catalogue par leur titre, sans détail.

#### Scenario: Titres seulement
- **WHEN** on ouvre la page
- **THEN** chaque scénario du catalogue est listé par son titre, sans situation ni révélation

### Requirement: Deux onglets
La page SHALL proposer deux onglets, « Simulation » pour essayer de résoudre l’enquête et « Snapshot » pour voir ce que le moteur a choisi, les contrôles de génération restant communs.

#### Scenario: Onglet par défaut
- **WHEN** on ouvre la page
- **THEN** l’onglet « Simulation » est affiché

#### Scenario: Changer d’onglet
- **WHEN** on ouvre l’onglet « Snapshot »
- **THEN** la page affiche le snapshot de l’enquête en cours, sans perdre les lieux ouverts de la simulation

### Requirement: Snapshot des choix du moteur
L’onglet « Snapshot » SHALL afficher en clair les choix du moteur pour l’enquête en cours : seed, difficulté, scénario, objets tirés, motif, scène, heure du mystère, auteur, lieux retenus, suspects avec leur vraie soirée, et les faits tels que stockés (identifiants et minutes), ainsi que l’enquête brute.

#### Scenario: Choix du moteur
- **WHEN** une enquête est générée
- **THEN** le snapshot liste la seed, la difficulté, le scénario, le motif, la scène et l’heure du mystère en minutes et en heures

#### Scenario: Objets tirés
- **WHEN** l’enquête générée contient des objets
- **THEN** le snapshot liste leurs identifiants, et rien quand le scénario n’en a pas

#### Scenario: Suspects et faits
- **WHEN** on ouvre le snapshot
- **THEN** il affiche chaque suspect avec sa vraie soirée et chaque fait avec ses identifiants et ses heures sous la forme « 16h56 (1016) » (heure lisible puis minutes)

#### Scenario: Génération échouée
- **WHEN** la génération échoue
- **THEN** le snapshot affiche la raison de l’échec au lieu des choix
