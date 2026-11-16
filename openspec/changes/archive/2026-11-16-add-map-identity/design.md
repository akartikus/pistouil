# Design

## Context

Dépend de `commune-index` (`openspec/specs/commune-index/spec.md`) pour le rectangle et le contour d’une commune, de `osm-place-extraction` (`openspec/specs/osm-place-extraction/spec.md`) pour les lieux et leur grille, de `pedestrian-routing` (`openspec/specs/pedestrian-routing/spec.md`) pour les `Route` et leur `geometry` en `[lon, lat]`, et de `catalog` (`openspec/specs/catalog/spec.md`) pour les types de lieux. La direction artistique (palette, couleurs réservées, police, icônes, maquette) est dans `docs/design/direction.md` et se fixe, elle ne se rouvre pas. `src/lib/map/` et `static/map/` sont vides ; `maplibre-gl` 6.18 et `pmtiles` 4.5 sont déjà des dépendances. Voir `proposal.md` pour la motivation.

## Goals / Non-Goals

**Goals:**
- La même identité visuelle sur n’importe quelle commune, sans préparation propre.
- Lieux de l’enquête et lieu du mystère reconnaissables au premier coup d’œil.
- Un maximum de logique pure et testée (vitest tourne en environnement Node, sans DOM).

**Non-Goals:**
- Panneaux d’enquête, carnet, curseur horaire (brief 05), cache hors ligne des tuiles (brief 06).
- Chargement des cases et construction de la zone : le composant reçoit ses lieux, trajets et commune en entrée.

## Decisions

**Tuiles Protomaps, extraites hors ligne.** Un seul fichier PMTiles, lu par requêtes de plages d’octets depuis un hébergement statique ; l’extraction d’une région se fait avec le CLI `pmtiles extract` sur un build Protomaps (données ODbL, attribution OSM et Protomaps). Alternative : OpenMapTiles produit avec planetiler, plus mûr pour Maputnik mais qui demande de générer les tuiles nous-mêmes. Le poids du fichier PACA est inconnu : il est mesuré dans une tâche (niveau de zoom maximal à régler si besoin, la carte surzoomant au-delà).

**Deux styles en fichiers, mêmes sources et mêmes couches.** `static/map/style-light.json` et `style-dark.json`, écrits dans Maputnik puis relus et rangés à la main ; la structure est identique, seules les couleurs changent. Passer d’un thème à l’autre par `setStyle` conserve alors les tuiles (MapLibre compare les deux styles et ne retouche que les couleurs). Le style n’est jamais produit par le code. Seule l’adresse du fichier de tuiles est fournie à l’exécution : le composant lit le style puis remplace l’URL de la source (`VITE_TILES_URL`, valeur de développement `/dev-data/map/zone.pmtiles`), car le fichier n’est pas hébergé au même endroit partout.

**MapLibre directement, sans bibliothèque Svelte.** Un composant `Map.svelte` crée la carte, enregistre le protocole `pmtiles` et délègue tout le calcul à des modules purs. Une couche d’abstraction ne simplifie ni `setStyle` ni `setPaintProperty`.

**Modules purs pour tout ce qui se teste.** `src/lib/map/` : conversion des lieux en entités (`placeFeatures`), limites de zone (`zoneBounds`), masque hors commune (polygone du monde avec un trou), tracé de trajet (ligne et point d’étiquette), choix du style. Le composant ne fait qu’alimenter MapLibre. Alternative : tester le composant dans un navigateur, rejeté car le dépôt n’a pas d’environnement DOM de test ; la validation visuelle est une tâche manuelle (page `/map`, trois communes).

**Couches du jeu par le code.** Sources GeoJSON et couches ajoutées après le chargement du style et réajoutées après un changement de thème : lieux de décor (symbole icône + nom), lieux de l’enquête et du mystère (carré numéroté, étiquette), trajet (ligne en pointillés, étiquette de durée), masque. Les couleurs de ces couches viennent du thème (palette de `direction.md`), qui est une petite table de valeurs dans le module de thème ; les couleurs du fond restent dans les fichiers de style.

**Bâtiment du lieu : interrogation du fond de carte.** Les tuiles ne portent pas l’identifiant OSM d’un bâtiment et les fichiers de lieux n’ont qu’un point. À l’inactivité de la carte, pour chaque lieu de l’enquête, on cherche avec `queryRenderedFeatures` le bâtiment qui contient son point et on place sa géométrie dans une source GeoJSON colorée ; sans bâtiment, seul le marqueur reste. Limite : un lieu hors d’une tuile affichée n’est pas coloré avant d’être visible. Alternative : écrire l’empreinte du bâtiment dans les fichiers de lieux au script du brief 02, qui change son format et alourdit les fichiers.

**Catalogue : `icon` et `label`.** Le modèle a déjà `icon?` ; on ajoute `label?` et on renseigne les deux pour les 40 types de départ. Familles d’icône : santé, restauration, commerces, culture, services, nature, transport, loisirs, neutre (lieux de rôle `excluded`), plus une icône générique de repli. Cela garde la règle « ajouter un type sans toucher au code ». Alternative : une table type → icône dans `src/lib/map/`, rejetée car elle oblige à modifier le code pour chaque nouveau type.

**Polices et icônes.** Une famille monospace (proposition : IBM Plex Mono, normale et gras) convertie en glyphes MapLibre (fichiers `.pbf` par plage) rangés dans `static/map/fonts/`, aucune police externe. Les icônes sont des PNG par famille (disque coloré et symbole blanc, @1x et @2x), rasterisés une fois depuis des SVG gardés dans le dépôt, ajoutés à la carte avec `addImage`.

**Attribution.** Le texte vient de la source de tuiles ; le contrôle d’attribution est étendu en permanence et habillé par la feuille de style du composant dans le registre brutaliste (fond noir, texte monospace), avec la mention de fiction.

**Page `/map`.** Réservée au développement comme `/playground` : choix de commune (index `communes.json` copié dans `static/dev-data/`), thème, quelques lieux proches du centre marqués comme enquête (dont une scène comme lieu du mystère), un trajet calculé par `pedestrianRoutes` quand les fichiers de graphe sont présents. C’est l’outil de la validation visuelle sur trois communes.

## Risks / Trade-offs

- **API de MapLibre 6 et schéma Protomaps non relus** : la documentation à jour n’a pas pu être consultée pendant la planification. Avant d’écrire le code, relire la documentation de MapLibre (`addProtocol`, `setStyle`, `queryRenderedFeatures`, glyphes) et celle du schéma Protomaps (noms des couches et propriétés, dont `buildings`).
- **Poids du PMTiles de PACA** : inconnu, à mesurer ; de lui dépend l’hébergement et, plus tard, le téléchargement hors ligne d’une zone (brief 06).
- **Glyphes** : la conversion de la police et la couverture des accents français sont à vérifier ; repli sur une autre police libre monospace si besoin.
- **Fluidité sur téléphone d’entrée de gamme** : nombre d’entités modeste (quelques dizaines de lieux), requêtes de bâtiments seulement à l’inactivité ; mesure par ralentissement du processeur dans le navigateur, puis sur un vrai téléphone quand l’application existera.
- **Maquette idéalisée** : la maquette dessine des rues en quadrillage ; sur de vraies tuiles le rendu diffère et le style demande des ajustements (tâche de validation visuelle).
