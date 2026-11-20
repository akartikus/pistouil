# Spec Delta

## Purpose

Valider automatiquement chaque pull request et chaque push sur `master` par les contrôles du projet (typage, lint, tests, build), à coût maîtrisé et sans accès aux secrets.

## ADDED Requirements

### Requirement: Chaque changement est testé
Le dépôt SHALL lancer automatiquement le workflow de tests sur chaque pull request ouverte ou mise à jour et sur chaque push sur `master`, avec une installation propre des dépendances, `check`, `lint`, `test` puis `build`. Un échec d'une de ces étapes MUST faire échouer le workflow.

#### Scenario: Pull request avec un test en échec
- **WHEN** une pull request contient un test en échec
- **THEN** le workflow de tests est signalé en échec sur la pull request

#### Scenario: Pull request au vert
- **WHEN** une pull request passe `check`, `lint`, `test` et `build`
- **THEN** le workflow de tests est signalé au vert sur la pull request

#### Scenario: Échec d'une autre étape
- **WHEN** `check`, `lint` ou `build` échoue
- **THEN** le workflow de tests échoue, même si `test` réussit

#### Scenario: Push sur master
- **WHEN** un commit est poussé sur `master`
- **THEN** le workflow de tests s'exécute

### Requirement: Pas d'exécution inutile
Le workflow de tests MUST NOT se déclencher sur un push de branche sans pull request. Il SHALL annuler l'exécution obsolète d'une même branche quand une plus récente démarre, réutiliser le cache des dépendances et s'arrêter après une durée maximale.

#### Scenario: Push sur une branche sans pull request
- **WHEN** un commit est poussé sur une branche autre que `master` qui n'a pas de pull request
- **THEN** aucun workflow de tests ne démarre

#### Scenario: Pushes successifs sur une pull request
- **WHEN** un second commit est poussé sur une pull request dont le workflow est encore en cours
- **THEN** l'exécution en cours est annulée et seule la plus récente se termine

#### Scenario: Exécution bloquée
- **WHEN** le workflow dépasse sa durée maximale
- **THEN** il est arrêté et signalé en échec

### Requirement: Workflow simple et transparent
Le workflow de tests SHALL n'utiliser que des actions officielles de GitHub à version fixée, et chaque étape MUST être une commande `npm` ou native lisible dans le fichier du workflow, sans script tiers.

#### Scenario: Lecture du workflow
- **WHEN** on lit le fichier du workflow de tests
- **THEN** chaque action référencée appartient à GitHub avec une version fixée, et chaque étape de contrôle est une commande visible dans le fichier

### Requirement: Aucun secret dans les tests
Le workflow de tests MUST NOT lire de secret ni avoir de droits d'écriture sur le dépôt, et aucun secret ni certificat ne SHALL être commité.

#### Scenario: Pull request venant d'une branche
- **WHEN** le workflow de tests s'exécute
- **THEN** il n'utilise aucune valeur de secret et ses permissions se limitent à la lecture du contenu du dépôt
