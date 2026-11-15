# Brief 02 — Préparation des données OSM

**Objectif** : transformer un extrait OpenStreetMap en petits fichiers statiques de lieux, découpés en cases, plus un index des communes, utilisables par le jeu sans aucune API externe.
**Dépend de** : brief 01 (catalogue et types `Place`, `PlaceType`).
**À lire** : `docs/VISION.md` §4 et §6 ; `docs/reference/DATA-MODEL.md` §2 et §3.

## Périmètre

**Inclus**
- Un script Python (`tools/data-preparation/`) lancé à la main, une fois par mois.
- Entrée : un extrait Geofabrik `.osm.pbf` (pour commencer, Provence-Alpes-Côte d’Azur).
- Filtrage avec osmium sur les tags utiles au catalogue (commerces, cafés, restaurants, pharmacies, fontaines, bancs, marchés, parcs, places, arrêts de bus, œuvres d’art, et les lieux sensibles `alibi` ou `excluded` pour le décor).
- Correspondance tags OSM → `PlaceType`, à partir des `osmTags` du catalogue (jamais codée en dur dans le script).
- Point représentatif pour les surfaces (un parc devient un point).
- Lecture de `opening_hours` quand il existe. Les horaires réels des lieux (semaine et week-end, `weekday` et `weekend`) viendront plus tard, une fois les lieux réels sur la carte, et leur source reste à trouver : en attendant, le moteur utilise les horaires typiques du catalogue, écrits en dur pour tester.
- Application d’une liste de retrait (`catalog/removed-places.json`, identifiants OSM).
- Sortie : un fichier JSON compact par case de grille, plus un index des communes (nom, code INSEE, centre, rectangle englobant, contour simplifié).
- Un manifeste avec la date et la source de l’extrait.

**Exclu**
- Réseau de rues et trajets (brief 03).
- Fond de carte (brief 04).
- Hébergement et chargement dans l’application (briefs 05 et 06).

## Exigences

### Pilotage par le catalogue
- QUAND on ajoute un `PlaceType` avec ses `osmTags` au catalogue et qu’on relance le script
- ALORS les lieux correspondants apparaissent dans les fichiers, sans modification du script.

### Lieux exploitables seulement
- QUAND un objet OSM n’a pas de nom ou ne correspond à aucun `PlaceType`
- ALORS il est écarté.
- Les lieux de rôle `excluded` sont conservés, marqués comme tels, pour l’affichage en décor.

### Retrait sur demande
- QUAND un identifiant OSM figure dans la liste de retrait
- ALORS le lieu est marqué `removed` et ne pourra jamais être retenu dans une enquête.

### Découpage en cases
- QUAND le script s’exécute
- ALORS chaque lieu est rangé dans exactement une case de grille, selon ses coordonnées,
- ET un lieu à cheval sur deux cases n’est jamais dupliqué.

### Index des communes
- QUAND le joueur tapera « Fuveau »
- ALORS l’index permet de retrouver la commune, son centre, son rectangle englobant et son contour.

### Déterminisme
- QUAND on relance le script sur le même extrait
- ALORS les fichiers produits sont identiques à l’octet près (tri stable, arrondis fixes).

## Format de sortie (proposition)

```json
{ "osmId": "n123456789", "name": "Boulangerie du Cours", "type": "bakery",
  "lat": 43.4531, "lon": 5.5612, "openingHours": "Mo-Sa 07:00-19:30" }
```

Coordonnées arrondies à 5 décimales (environ 1 m). Nom et valeurs ci-dessus inventés pour l’exemple.

## Critères d’acceptation

- [ ] Le script traite l’extrait PACA sur un ordinateur portable ordinaire.
- [ ] Les fichiers de Fuveau sont produits ; une vérification manuelle sur openstreetmap.org confirme les principaux lieux du centre.
- [ ] Un rapport indique, par commune, le nombre de lieux `scene`, `alibi` et `excluded`.
- [ ] Deux exécutions successives donnent des fichiers identiques.
- [ ] La mention de licence ODbL figure dans le manifeste.

## Points à trancher pendant la proposition

- Taille des cases (proposition : environ 1 km de côté).
- Format JSON ou binaire compact (proposition : JSON compressé à la livraison, plus simple à déboguer).
- Liste exacte des tags de départ.

## Consigne pour OpenSpec

> Crée un nouveau changement OpenSpec nommé `add-osm-data-preparation` à partir de ce brief. Le script doit lire les correspondances de tags dans le catalogue existant, pas les coder en dur. Prévois dans `tasks.md` un premier passage sur un petit extrait autour de Fuveau avant l’extrait régional complet.
