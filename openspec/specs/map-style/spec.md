# map-style Specification

## Purpose
Fournit le fond de carte du jeu : deux styles MapLibre maison (clair et sombre) sur des tuiles vectorielles PMTiles de schéma Protomaps, avec polices, icônes et attribution embarquées, sans aucun serveur externe, et l’extraction hors ligne des tuiles régionales. Direction artistique : `docs/design/direction.md`.

## Requirements

### Requirement: Un style maison en fichiers séparés
Le dépôt SHALL contenir deux styles MapLibre (version 8) dans `static/map/`, `style-light.json` et `style-dark.json`, écrits comme des fichiers et jamais produits par le code. Ils habillent les tuiles vectorielles du schéma Protomaps avec la palette de `docs/design/direction.md` : parcs verts, eau bleue, rues blanches, bâtiments de décor beiges en clair, leurs équivalents en sombre.

#### Scenario: Styles valides
- **WHEN** on lit `style-light.json` et `style-dark.json`
- **THEN** chacun est un style de version 8 dont toutes les couches renvoient à une source déclarée et dont les identifiants de couche sont uniques

#### Scenario: Aucune préparation par commune
- **WHEN** on affiche une commune que personne n’a préparée
- **THEN** la carte prend l’identité du jeu avec le même style, sans fichier propre à cette commune

### Requirement: Les deux thèmes partagent leurs sources et leurs couches
Les styles clair et sombre SHALL déclarer la même source de tuiles et les mêmes identifiants de couche, de sorte qu’un changement de thème conserve les tuiles déjà chargées.

#### Scenario: Même structure
- **WHEN** on compare les deux fichiers
- **THEN** ils ont la même source de tuiles et la même liste ordonnée d’identifiants de couche

### Requirement: Polices et icônes embarquées, sans réseau externe
Les polices du style SHALL être fournies sous forme de glyphes dans `static/map/fonts/` (police monospace, accents français compris) et les icônes dans `static/map/icons/`, une par famille de lieux plus une icône générique et une icône neutre. Aucune adresse du style ne SHALL désigner un autre serveur que celui de l’application et du fichier de tuiles ; aucune icône ne SHALL représenter une marque.

#### Scenario: Polices disponibles
- **WHEN** une couche de texte du style demande une police
- **THEN** ses glyphes existent dans `static/map/fonts/`

#### Scenario: Aucune adresse externe
- **WHEN** on lit les adresses d’un style (glyphes, sprites, tuiles)
- **THEN** aucune ne commence par `http://` ni `https://`

#### Scenario: Une icône par famille
- **WHEN** on liste les familles d’icône des types du catalogue
- **THEN** chacune a un fichier dans `static/map/icons/`, de même que l’icône générique

### Requirement: Attribution dans la source de tuiles
La source de tuiles SHALL porter l’attribution « © OpenStreetMap contributors » et celle du schéma de tuiles (Protomaps), afin qu’elles s’affichent avec la carte.

#### Scenario: Attribution déclarée
- **WHEN** on lit la source de tuiles d’un style
- **THEN** son attribution cite OpenStreetMap et Protomaps

### Requirement: Tuiles régionales extraites hors ligne
Le dépôt SHALL fournir, dans `tools/map-tiles/`, une commande documentée qui extrait d’un fichier de tuiles Protomaps un fichier PMTiles pour un rectangle donné (la région PACA par défaut), utilisable en statique par requêtes de plages d’octets. Le README SHALL indiquer le poids mesuré du fichier.

#### Scenario: Extraction d’une région
- **WHEN** on lance la commande avec le rectangle de la région
- **THEN** elle produit un fichier PMTiles que la carte peut lire sans autre serveur que celui de fichiers statiques

#### Scenario: Poids consigné
- **WHEN** l’extraction de la région a été faite
- **THEN** le README donne la taille du fichier obtenu
