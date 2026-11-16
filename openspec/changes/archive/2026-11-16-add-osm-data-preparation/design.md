# Design

## Context

Dépend du catalogue (`openspec/specs/catalog/spec.md`) : le script lit `catalog/place-types.json` (`osmTags`, `role`) et ne connaît aucun tag. Les types `Place` et `PlaceType` sont ceux de `docs/reference/DATA-MODEL.md` §2 et §3. Le moteur exige un `name` pour chaque lieu et les textes disent « à {place} » : un lieu sans nom est inutilisable. Rien n’existe encore dans `tools/data-preparation/`, et ni `osmium` ni extrait `.pbf` ne sont installés. Voir `proposal.md` pour la motivation et le périmètre.

## Goals / Non-Goals

**Goals:**
- Sortie reproductible à l’octet près, lisible et simple à déboguer.
- Premier passage rapide sur un petit extrait autour de Fuveau, avant PACA.

**Non-Goals:**
- Analyser `opening_hours` (le chargement dans l’application, briefs 05 et 06, s’en chargera).
- Compresser, héberger ou charger les fichiers.
- Réseau de rues et fond de carte (briefs 03 et 04).

## Decisions

**Un seul script Python avec pyosmium et shapely.** pyosmium lit le `.pbf` et assemble les surfaces (parcs, contours de communes) ; shapely donne le centroïde, le point intérieur, la simplification et l’appartenance à une commune. Alternative : `osmium tags-filter` puis `osmium export` en GeoJSON, lu en Python. Elle ajoute des fichiers intermédiaires volumineux et une deuxième étape à relancer, pour un gain faible. Les API de ces deux bibliothèques sont à vérifier via `context7` avant de les utiliser.

**Correspondance par le catalogue, une seule fois par objet.** Le script construit un index `(clé, valeur)` à partir des groupes d’`osmTags`, teste les groupes complets, et retient le premier type dans l’ordre du catalogue. Le résultat est déterministe et un objet ne donne jamais deux lieux.

**Nom obligatoire, adresse jamais.** Un objet sans `name` est écarté, quel que soit son rôle ; cela écarte aussi presque toutes les habitations. Les adresses sont rares précisément sur les objets de rue sans nom, et un texte « à 12 rue des Lilas » ne convient pas aux gabarits.

**Rôle `excluded` sans champ dédié.** Le lieu garde son `typeId` ; le rôle se lit dans le catalogue, que le jeu charge déjà. Pas de donnée en double. Le rapport compte les rôles avec le même catalogue.

**Grille par entiers.** Les coordonnées sont d’abord arrondies à 5 décimales, puis converties en entiers (×100 000). La case est `floor(lat_e5 / 1800)` et `floor(lon_e5 / 2500)`, soit environ 2 km à 43,5° N. Le calcul entier évite les erreurs de virgule flottante aux limites. Le fichier se nomme `{ligne}_{colonne}.json` ; les valeurs négatives sont possibles à l’ouest du méridien de Greenwich. Les deux pas sont écrits dans le manifeste pour que l’application les relise. Alternative : un pas unique en degrés, qui donne des cases de 2 km sur 1,45 km à cette latitude.

**Sortie déterministe.** Lieux triés par `osmId` (préfixe `n`, `w`, `r`, puis nombre), communes par code INSEE, clés JSON dans un ordre fixe, séparateurs compacts, UTF-8, saut de ligne final. La date du manifeste est celle de l’extrait (en-tête du `.pbf`), jamais celle de l’exécution. JSON en clair ; la compression à la livraison relève du brief 06.

**Fichiers produits.** Dans un dossier de sortie donné en argument (par défaut `tools/data-preparation/out/`, ignoré par git) : `places/{ligne}_{colonne}.json`, `communes.json`, `manifest.json`, `report.json`. L’emplacement final dans l’application sera décidé avec le chargement (brief 05).

**Communes.** Relations `boundary=administrative` avec `admin_level=8` et `ref:INSEE`. Le contour est simplifié avec une tolérance fixe (environ 50 m) puis arrondi. Un lieu est rattaché à une commune par appartenance à son polygone complet, pour le rapport seulement.

**Tests.** Un petit fichier `.osm` écrit à la main (osmium sait le lire) sert de jeu de test : objets nommés et sans nom, parc en croissant, tags incomplets, deux types possibles, lieu retiré, commune avec contour. Tests avec `pytest`, à côté du script. L’extrait autour de Fuveau est produit avec `osmium extract` depuis le `.pbf` PACA, hors dépôt.

## Risks / Trade-offs

- [Les bancs, fontaines et arrêts sans nom disparaissent] → le rapport par commune mesure la perte ; si elle gêne, un nom de repli par type fera l’objet d’un changement séparé.
- [Doublons de nom, par exemple un arrêt de bus par sens] → acceptés dans ce changement ; à regarder sur Fuveau.
- [Index des communes lourd avec les contours de toute la région] → mesurer sur PACA ; resserrer la tolérance de simplification ou séparer les contours de l’index si besoin.
- [Cases de 2 km lourdes en centre-ville] → mesurer la taille du plus gros fichier sur PACA.
- [Mémoire sur PACA avec l’assemblage des surfaces] → vérifier sur un ordinateur portable ordinaire, critère d’acceptation du brief.

## Open Questions

- Emplacement définitif des fichiers dans l’application (brief 05).
- Source des vrais horaires, déjà notée comme « à trouver » dans le brief.
