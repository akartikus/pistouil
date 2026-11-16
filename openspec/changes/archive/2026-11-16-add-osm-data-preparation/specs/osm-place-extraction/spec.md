# Spec Delta

## Purpose

Transforme un extrait OpenStreetMap en fichiers statiques de lieux découpés en cases de grille, utilisables par le jeu sans aucune API externe. Les types et les règles sont ceux de `docs/reference/DATA-MODEL.md` (`Place`, `PlaceType`).

## ADDED Requirements

### Requirement: La correspondance des lieux est pilotée par le catalogue
Le script SHALL déterminer le `PlaceType` d’un objet OSM uniquement à partir des `osmTags` du catalogue : un type correspond quand tous les tags d’un de ses groupes sont présents, et le premier type du catalogue qui correspond l’emporte. Aucun tag OSM ne SHALL être codé en dur dans le script.

#### Scenario: Nouveau type de lieu
- **WHEN** on ajoute un `PlaceType` avec ses `osmTags` au catalogue et qu’on relance le script
- **THEN** les lieux correspondants apparaissent dans les fichiers produits, sans modification du script

#### Scenario: Groupe de tags incomplet
- **WHEN** un objet porte `tourism=artwork` sans `artwork_type=statue`
- **THEN** il ne correspond pas au type `statue`

#### Scenario: Objet qui correspond à deux types
- **WHEN** un objet satisfait les `osmTags` de deux types
- **THEN** il donne un seul lieu, du premier type dans l’ordre du catalogue

### Requirement: Seuls les lieux nommés et connus sont gardés
Le script SHALL écarter tout objet sans nom ou ne correspondant à aucun `PlaceType`. Les lieux de rôle `excluded` qui ont un nom SHALL être conservés, avec leur type, pour l’affichage en décor. Aucune adresse ne SHALL être extraite.

#### Scenario: Objet sans nom
- **WHEN** un banc (`amenity=bench`) n’a pas de tag `name`
- **THEN** il n’apparaît dans aucun fichier produit

#### Scenario: Lieu sensible nommé
- **WHEN** une école (type de rôle `excluded` ou `alibi`) porte un nom
- **THEN** elle apparaît dans les fichiers avec son type, que le jeu utilise pour savoir comment la traiter

### Requirement: Un objet donne un seul lieu, représenté par un point
Le script SHALL représenter chaque lieu par un point, arrondi à 5 décimales. Pour une surface, le point SHALL être le centroïde, ou un point intérieur à la surface quand le centroïde en sort. Pour une ligne, le point SHALL être un point de la ligne.

#### Scenario: Parc en croissant
- **WHEN** le centroïde d’un parc se trouve hors du parc
- **THEN** le lieu est placé en un point situé à l’intérieur du parc

#### Scenario: Un objet, un lieu
- **WHEN** une rue piétonne est un seul objet OSM
- **THEN** elle donne un seul lieu

### Requirement: Les horaires OSM sont transmis tels quels
Quand un objet porte `opening_hours`, le lieu SHALL conserver sa valeur en texte brut dans `openingHours`, sans analyse ni modification. Sans ce tag, le champ SHALL être absent.

#### Scenario: Horaires présents
- **WHEN** un objet porte `opening_hours=Mo-Sa 07:00-19:30`
- **THEN** son lieu contient `openingHours` égal à `Mo-Sa 07:00-19:30`

#### Scenario: Horaires absents
- **WHEN** un objet n’a pas de tag `opening_hours`
- **THEN** son lieu n’a pas de champ `openingHours`

### Requirement: Un lieu retiré est marqué, jamais supprimé
Quand l’identifiant OSM d’un lieu figure dans `catalog/removed-places.json`, le lieu SHALL être gardé avec `removed` à `true`, pour qu’aucune enquête ne le retienne. Les autres lieux n’ont pas de champ `removed`. Un identifiant de la liste qui ne correspond à aucun lieu SHALL être signalé dans le rapport, sans faire échouer le script.

#### Scenario: Lieu dans la liste de retrait
- **WHEN** l’identifiant d’un lieu figure dans la liste de retrait
- **THEN** le lieu est présent dans sa case avec `removed` à `true`

#### Scenario: Identifiant inconnu
- **WHEN** la liste de retrait contient un identifiant absent de l’extrait
- **THEN** le rapport le signale et le script se termine normalement

### Requirement: Chaque lieu est rangé dans exactement une case
Le script SHALL ranger chaque lieu dans une seule case de grille d’environ 2 km de côté, déterminée par ses coordonnées arrondies, avec un pas fixe en latitude et un pas fixe en longitude. Il SHALL écrire un fichier JSON par case non vide, nommé par les indices de la case, et ne dupliquer aucun lieu.

#### Scenario: Lieu à la limite de deux cases
- **WHEN** un lieu se trouve exactement sur la limite entre deux cases
- **THEN** il figure dans une seule des deux cases

#### Scenario: Case sans lieu
- **WHEN** aucune case ne contient de lieu à un endroit de la grille
- **THEN** aucun fichier n’est produit pour cette case

### Requirement: Un manifeste décrit l’extrait et la grille
Le script SHALL écrire un manifeste contenant le nom et la date de l’extrait source, la mention de licence ODbL avec l’attribution aux contributeurs d’OpenStreetMap, et les pas de la grille.

#### Scenario: Manifeste complet
- **WHEN** le script se termine
- **THEN** le manifeste indique la source, la date de l’extrait, la licence ODbL et les pas de la grille

### Requirement: Un rapport compte les lieux par commune
Le script SHALL écrire un rapport donnant, pour chaque commune, le nombre de lieux de rôle `scene`, `alibi` et `excluded`, et le nombre de lieux hors de toute commune.

#### Scenario: Rapport de Fuveau
- **WHEN** le script traite un extrait qui contient Fuveau
- **THEN** le rapport donne pour Fuveau le nombre de lieux de chacun des trois rôles

### Requirement: La sortie est déterministe
Deux exécutions du script sur le même extrait, le même catalogue et la même liste de retrait SHALL produire des fichiers identiques à l’octet près. Aucune date de génération ne SHALL figurer dans les fichiers.

#### Scenario: Deux exécutions
- **WHEN** on lance le script deux fois de suite sur le même extrait
- **THEN** tous les fichiers produits sont identiques à l’octet près
