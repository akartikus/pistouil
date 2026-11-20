# ci-android-build Specification

## Purpose
Produire à la demande, depuis `master`, un APK Android debug installable, sans consommer de minutes de build en dehors des lancements manuels.

## Requirements

### Requirement: Build seulement à la demande
Le build Android SHALL se lancer uniquement par déclenchement manuel. Aucun push, aucune pull request ni aucune planification MUST NOT le démarrer.

#### Scenario: Pushes sans lancement manuel
- **WHEN** des commits sont poussés ou des pull requests ouvertes sans que personne lance le workflow
- **THEN** aucun build Android n'a lieu

### Requirement: Build seulement sur master
Le workflow SHALL s'arrêter dès sa première étape, avec un message explicite, quand il est lancé depuis une autre branche que `master`, sans exécuter de test ni de build.

#### Scenario: Lancement depuis une autre branche
- **WHEN** le workflow est lancé depuis une branche autre que `master`
- **THEN** il échoue immédiatement avec un message indiquant que seul `master` est autorisé
- **AND** ni les tests ni le build ne s'exécutent

### Requirement: Tests avant build
Le workflow SHALL exécuter les tests avant tout build et MUST NOT démarrer le build si les tests échouent.

#### Scenario: Test en échec
- **WHEN** le build est demandé depuis `master` et qu'un test échoue
- **THEN** le workflow échoue
- **AND** aucun APK n'est produit

### Requirement: APK debug installable
Quand le build réussit, le workflow SHALL déposer en artefact un APK debug, sans clé de signature, qui s'installe et démarre sur un téléphone Android.

#### Scenario: Build réussi
- **WHEN** le build est lancé depuis `master` et que tous ses contrôles réussissent
- **THEN** un APK est téléchargeable en artefact du workflow
- **AND** il s'installe sur un téléphone Android et l'application démarre

### Requirement: Coût maîtrisé et simplicité
Le workflow SHALL limiter la durée du job, conserver l'artefact peu de temps et n'exécuter qu'un build à la fois. Il MUST n'utiliser que des actions officielles de GitHub à version fixée, chaque étape étant une commande lisible dans le fichier, et MUST NOT lire de secret.

#### Scenario: Deux lancements rapprochés
- **WHEN** le workflow est lancé alors qu'un build est déjà en cours
- **THEN** les deux ne s'exécutent pas en parallèle

#### Scenario: Artefact ancien
- **WHEN** la durée de rétention de l'artefact est dépassée
- **THEN** l'APK est supprimé automatiquement

#### Scenario: Lecture du workflow
- **WHEN** on lit le fichier du workflow
- **THEN** chaque action référencée appartient à GitHub avec une version fixée, aucun secret n'est référencé, et le job a une durée maximale
