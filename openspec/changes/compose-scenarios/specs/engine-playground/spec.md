# Spec Delta

## MODIFIED Requirements

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
