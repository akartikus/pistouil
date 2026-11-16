# map-display Specification

## Purpose
Affiche l’enquête sur la carte avec MapLibre : centrage et limites de zone, lieux de l’enquête, du mystère et de décor, trajet, masque hors commune, changement de thème sans recharger les tuiles et page de validation en développement. Les entités de la carte sont calculées par des fonctions pures.

## Requirements

### Requirement: Composant de carte sur le style maison
Le composant SHALL afficher la carte avec MapLibre GL JS et le protocole `pmtiles`, à partir du style choisi, sans bibliothèque Svelte intermédiaire. L’adresse du fichier de tuiles SHALL être fournie à l’exécution, le reste du style restant dans son fichier.

#### Scenario: Affichage
- **WHEN** le composant reçoit l’adresse d’un fichier PMTiles et un thème
- **THEN** la carte s’affiche avec le style de ce thème

### Requirement: Zone limitée et centrage
Le composant SHALL se centrer sur une commune (à partir du rectangle de l’index des communes) ou sur une position, et limiter le déplacement au rectangle de la zone élargi d’une marge, de sorte que seules les tuiles de ce rectangle soient téléchargées.

#### Scenario: Commune choisie
- **WHEN** on choisit une commune quelconque de l’index
- **THEN** la carte se centre sur elle et son déplacement est limité à son rectangle élargi de la marge

#### Scenario: Position du joueur
- **WHEN** on donne une position et un rayon
- **THEN** la carte se centre sur cette position et reste dans le rectangle de la zone

### Requirement: Lieux de l’enquête, du mystère et de décor
Les couches du jeu SHALL être ajoutées par le code au-dessus du fond. Un lieu de l’enquête SHALL être mis en évidence (aplat de la couleur de l’enquête, carré numéroté, nom cadré) ; le lieu du mystère SHALL l’être dans une autre couleur ; tout autre lieu reconnu SHALL apparaître en décor avec l’icône de sa famille et son nom. Un lieu de rôle `excluded` SHALL apparaître en décor neutre et jamais mis en évidence.

#### Scenario: Deux niveaux
- **WHEN** la carte affiche une enquête de 6 lieux dont une scène
- **THEN** les 5 lieux de l’enquête et la scène se distinguent des lieux de décor, et la scène a sa propre couleur

#### Scenario: Lieu sensible
- **WHEN** un lieu de rôle `excluded` figure parmi les lieux reconnus
- **THEN** il apparaît en décor neutre, sans mise en évidence

#### Scenario: Famille d’icône inconnue
- **WHEN** le type d’un lieu n’a pas de famille d’icône
- **THEN** il reçoit l’icône générique

### Requirement: Bâtiment du lieu coloré quand il existe
Quand le point d’un lieu de l’enquête est dans un bâtiment du fond de carte, ce bâtiment SHALL recevoir l’aplat de la couleur du lieu ; sinon le lieu garde seulement son carré numéroté et son nom.

#### Scenario: Commerce dans un bâtiment
- **WHEN** un lieu de l’enquête se trouve dans un bâtiment visible
- **THEN** ce bâtiment est coloré à la couleur du lieu

#### Scenario: Statue sur une place
- **WHEN** un lieu de l’enquête n’est dans aucun bâtiment
- **THEN** seul son marqueur est affiché

### Requirement: Clic sur un lieu de décor
Au clic sur un lieu de décor, la carte SHALL afficher seulement les informations OSM disponibles : son nom, son libellé de type et ses horaires bruts. Une information absente SHALL être omise.

#### Scenario: Lieu avec horaires
- **WHEN** on touche un lieu de décor qui a des horaires
- **THEN** un panneau montre son nom, son type et ses horaires

#### Scenario: Lieu sans horaires
- **WHEN** on touche un lieu de décor sans horaires
- **THEN** le panneau n’affiche ni ligne d’horaires ni texte inventé

### Requirement: Tracé d’un trajet
Pour un trajet entre deux lieux de l’enquête, la carte SHALL tracer en pointillés le `geometry` du `Route` (points `[lon, lat]`) avec sa durée dans une étiquette. Un trajet sans tracé (approximatif) SHALL être tracé en ligne droite entre les deux lieux.

#### Scenario: Trajet réel
- **WHEN** un trajet avec tracé est demandé entre deux lieux de l’enquête
- **THEN** son tracé suit les rues en pointillés et la durée s’affiche

#### Scenario: Trajet approximatif
- **WHEN** le trajet demandé est marqué `approximate` et n’a pas de tracé
- **THEN** la carte trace une ligne droite en pointillés entre les deux lieux avec sa durée

### Requirement: Masque hors commune
Quand une commune est choisie, l’extérieur de son contour SHALL être estompé et le contour tracé en tirets.

#### Scenario: Contour de la commune
- **WHEN** une commune est choisie
- **THEN** la zone hors du contour est estompée et le contour est visible

### Requirement: Thème et style modifiables sans recharger les données
Le composant SHALL permettre de passer du thème clair au thème sombre par `setStyle` et d’ajuster une propriété de peinture par `setPaintProperty`, sans retélécharger les tuiles déjà chargées ni perdre les couches du jeu.

#### Scenario: Passage au thème sombre
- **WHEN** on passe du thème clair au thème sombre pendant que la carte est affichée
- **THEN** le fond change, les couches du jeu restent affichées et les tuiles déjà chargées ne sont pas redemandées

### Requirement: Attribution toujours visible
La carte SHALL afficher en permanence, sans la replier, « © OpenStreetMap contributors » et l’attribution du schéma de tuiles, ainsi que la mention de fiction.

#### Scenario: Mentions visibles
- **WHEN** la carte est affichée, quel que soit le thème
- **THEN** les attributions et la mention de fiction sont visibles

### Requirement: Entités de la carte calculées par des fonctions pures
La conversion des lieux, des trajets et de la commune en données géographiques de la carte SHALL être faite par des fonctions pures et testées, sans MapLibre ni DOM, de sorte que le composant ne fasse que les afficher.

#### Scenario: Lieux en entités
- **WHEN** on convertit des lieux avec leur rôle dans l’enquête
- **THEN** on obtient une entité par lieu avec sa catégorie (enquête, mystère, décor, neutre), son icône, son nom et son numéro éventuel

### Requirement: Page de validation en développement
Une page `/map`, réservée au développement, SHALL permettre de choisir une commune de l’index, de choisir le thème et d’afficher quelques lieux de l’enquête avec un trajet, à partir des fichiers de `static/dev-data/`, afin de contrôler visuellement la carte sur plusieurs communes.

#### Scenario: Trois communes
- **WHEN** on choisit successivement Fuveau, une grande ville et un petit village
- **THEN** la page affiche chacune avec le même style, ses lieux et son masque
