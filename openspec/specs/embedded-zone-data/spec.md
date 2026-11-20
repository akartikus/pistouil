# embedded-zone-data Specification

## Purpose
Fournir avec l'application le jeu de données de Fuveau (carte, lieux, trajets, contour), pour que le jeu fonctionne sans aucune requête réseau et sans téléchargement, en attendant d'autres communes.

## Requirements

### Requirement: Données de Fuveau fournies avec l'application
L'application SHALL contenir, comme fichiers de l'application, le manifeste des données, l'entrée de Fuveau (nom, code INSEE, centre, rectangle englobant, contour), les cases de lieux, les cases de graphe piéton et le fichier de tuiles de la carte. Aucune adresse de données configurée à la construction ne SHALL être nécessaire pour jouer.

#### Scenario: Application sans réseau
- **WHEN** l'application est installée sur un appareil sans connexion
- **THEN** une enquête à Fuveau peut être générée et jouée, carte comprise

#### Scenario: Aucune configuration à la construction
- **WHEN** l'application est construite sans variable d'adresse de données
- **THEN** le jeu trouve toutes ses données dans ses propres fichiers

### Requirement: Couverture du contour de Fuveau
Les données SHALL couvrir le contour de Fuveau élargi d'au moins 3 km pour les lieux et les trajets, et le rectangle de ce contour élargi pour les tuiles, du zoom le plus bas au zoom 15, de sorte que le rayon maximal de l'enquête et la marge de lecture restent couverts depuis n'importe quel point du contour.

#### Scenario: Départ au bord de la commune
- **WHEN** le joueur lance une enquête depuis le point du contour de Fuveau le plus éloigné du centre
- **THEN** tous les lieux, trajets et tuiles dans un rayon de 2 km et une marge de 1 km sont disponibles

### Requirement: Taille bornée
L'ensemble des données embarquées SHALL peser moins de 50 Mo, et l'application construite, moins de 50 Mo au total.

#### Scenario: Taille mesurée
- **WHEN** on mesure les fichiers de données et l'application construite
- **THEN** les données et l'application font chacune moins de 50 Mo

### Requirement: Données reproductibles par une commande documentée
Le dépôt SHALL fournir une commande documentée qui produit le jeu de données de Fuveau à partir d'un extrait OpenStreetMap et d'un build Protomaps, avec une sortie déterministe sans date d'exécution. Un guide SHALL décrire comment la réutiliser pour une autre commune.

#### Scenario: Régénération identique
- **WHEN** la commande est lancée deux fois sur les mêmes sources
- **THEN** les fichiers produits sont identiques

#### Scenario: Ajout d'une commune
- **WHEN** un développeur lit le guide pour ajouter une commune
- **THEN** il y trouve les étapes de préparation des données, des tuiles et du contour, et ce qui devrait passer en ligne

### Requirement: Attribution des données embarquées
Les données embarquées SHALL rester accompagnées de l'attribution OpenStreetMap (licence ODbL) et Protomaps, visible dans l'application et rappelée dans le `README.md`.

#### Scenario: Attribution visible
- **WHEN** le joueur affiche la carte ou ouvre À propos
- **THEN** il lit l'attribution OpenStreetMap (ODbL) et le fond de carte Protomaps
