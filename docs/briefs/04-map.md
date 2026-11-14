# Brief 04 — Carte et identité visuelle

**Objectif** : afficher, pour n’importe quelle commune choisie, une carte vectorielle à l’identité du jeu, avec tous les lieux reconnus et une distinction nette entre lieux de l’enquête et lieux de décor.
**Dépend de** : brief 02 (lieux et index des communes) ; brief 03 pour l’affichage des trajets.
**À lire** : `docs/VISION.md` §4 et §6 (dont la direction artistique et les croquis des écrans, à produire avant ce brief : voir §7) ; `docs/reference/DATA-MODEL.md` §2 (rôles des lieux).

## Périmètre

**Inclus**
- Composant de carte Svelte avec MapLibre GL JS et le protocole `pmtiles`, lisant un fichier PMTiles régional hébergé en statique.
- Un style MapLibre maison (édité avec Maputnik), une palette de 3 à 4 couleurs, une police libre, une planche d’icônes génériques par type de lieu.
- Style, polices et icônes embarqués dans `static/map/`.
- Couches du jeu au-dessus du fond : lieux de décor, lieux de l’enquête, tracés de trajets, masque hors commune.
- Centrage sur une commune choisie ou sur la position du joueur, et limitation du déplacement à la zone.
- Attributions OSM et schéma de tuiles toujours visibles.

**Exclu**
- Panneaux d’enquête, carnet, curseur horaire (brief 05).
- Cache hors ligne des tuiles (brief 06).

## Exigences

### Un style, toutes les communes
- QUAND le joueur choisit une commune quelconque
- ALORS la carte s’affiche avec l’identité du jeu sans aucune préparation propre à cette commune,
- ET seules les tuiles du rectangle de la zone sont téléchargées.

### Deux niveaux de lieux
- QUAND la carte affiche une enquête
- ALORS les lieux de l’enquête sont mis en évidence (pastille de couleur, contour, numéro),
- ET les autres lieux reconnus apparaissent avec une icône générique par type et leur nom OSM.
- Les lieux `exclu` peuvent apparaître en décor neutre, jamais mis en évidence.

### Clic sur un lieu de décor
- QUAND le joueur touche un lieu de décor
- ALORS seules les informations OSM s’affichent (nom, type, horaires) ; s’il n’y en a aucune, rien ne s’affiche.

### Tracé d’un trajet
- QUAND un trajet est demandé entre deux lieux de l’enquête
- ALORS son tracé s’affiche le long des rues, en pointillés, avec sa durée.

### Masque de la commune
- QUAND une commune est choisie
- ALORS l’extérieur de son contour est estompé.

### Style modifiable en cours de jeu
- Le style peut être changé (`setStyle`) ou ajusté (`setPaintProperty`) sans recharger les données, par exemple pour assombrir la carte au fil de la soirée.

### Garde-fous
- Aucune icône de marque, aucune photo de bâtiment.
- Mentions « © OpenStreetMap contributors » et attribution du schéma de tuiles toujours visibles.

## Critères d’acceptation

- [ ] Fuveau et deux autres communes très différentes (une grande ville, un petit village) s’affichent correctement avec le même style.
- [ ] Les lieux de l’enquête se distinguent au premier coup d’œil des lieux de décor (test rapide auprès de 3 personnes).
- [ ] Fluide sur un téléphone d’entrée de gamme.
- [ ] Le style fonctionne en clair ; un thème sombre est prévu (au moins esquissé).

## Points à trancher pendant la proposition

- Schéma de tuiles : Protomaps ou OpenMapTiles (vérifier licence et attribution).
- Direction artistique : « carnet de détective » (papier, encre, hachures) ou style épuré et coloré. À trancher avant le brief (phase de design, `VISION.md` §7) ; ici on l'applique, et on ne la rouvre que si elle s'avère infaisable.
- Intégration MapLibre directe ou via une bibliothèque Svelte.

## Consigne pour OpenSpec

> Crée un nouveau changement OpenSpec nommé `add-map-identity` à partir de ce brief. Le style doit être un fichier séparé dans `static/map/`, jamais généré dans le code. Les couches du jeu sont ajoutées par le code au-dessus du fond. Prévois une tâche de validation visuelle sur trois communes de densités différentes.
