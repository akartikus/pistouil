# Spec Delta

## Purpose

Fournit un index des communes pour retrouver un lieu de départ à partir de son nom (« Fuveau »), sans aucune API externe. Produit par le script de préparation des données OSM.

## ADDED Requirements

### Requirement: L’index décrit chaque commune
Le script SHALL produire un index contenant, pour chaque commune de l’extrait, son nom, son code INSEE, son centre, son rectangle englobant et son contour simplifié. Les coordonnées SHALL être arrondies à 5 décimales et les communes triées par code INSEE.

#### Scenario: Recherche de Fuveau
- **WHEN** on cherche « Fuveau » dans l’index
- **THEN** on retrouve la commune avec son code INSEE, son centre, son rectangle englobant et son contour

#### Scenario: Rectangle englobant
- **WHEN** on lit une entrée de l’index
- **THEN** son centre et tous les points de son contour sont dans son rectangle englobant

### Requirement: Le contour est simplifié
Le contour d’une commune SHALL être simplifié avec une tolérance fixe, de sorte que l’index reste petit tout en couvrant la commune.

#### Scenario: Contour plus léger que l’original
- **WHEN** une commune a un contour OSM détaillé
- **THEN** le contour de l’index a moins de points que l’original et reste un polygone valide
