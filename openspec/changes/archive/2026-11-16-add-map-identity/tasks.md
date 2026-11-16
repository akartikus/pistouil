# Tasks

## 1. Catalogue : icône et libellé

- [x] 1.1 Écrire le test dans `src/lib/engine/catalog.spec.ts` : chaque type de `catalog/place-types.json` a une famille d’icône parmi santé, restauration, commerces, culture, services, nature, transport, loisirs, neutre (lieux de rôle `excluded`) et un libellé non vide ; un catalogue dont un type n’a ni `icon` ni `label` reste accepté ; vérifier qu’il échoue
- [x] 1.2 Ajouter `label?` à `PlaceType` (`src/lib/engine/types.ts`) et renseigner `icon` et `label` (français) pour les 40 types de `catalog/place-types.json` ; vérifier que 1.1 et les tests du moteur passent

## 2. Tuiles régionales

- [x] 2.1 Écrire `tools/map-tiles/extract.sh` et son `README.md` : installation du CLI `pmtiles`, commande d’extraction par rectangle (PACA par défaut), emplacement de sortie (`tools/map-tiles/out`, ignoré par git), copie dans `static/dev-data/map/zone.pmtiles` pour la page `/map`
- [x] 2.2 Lancer l’extraction pour PACA, noter dans le README le poids du fichier et le zoom maximal retenu ; vérifier qu’un serveur statique le sert par requêtes de plages d’octets

## 3. Style, polices et icônes

- [x] 3.1 Relire la documentation à jour de MapLibre (styles, glyphes, sprites) et celle du schéma Protomaps (couches et propriétés) ; noter dans le README de `static/map/` les couches utilisées
- [x] 3.2 Écrire `src/lib/map/style.spec.ts` : styles clair et sombre de version 8, couches rattachées à une source déclarée, identifiants de couche uniques, mêmes sources et mêmes couches dans les deux, aucune adresse `http(s)://`, glyphes présents pour chaque police utilisée, attribution citant OpenStreetMap et Protomaps, une icône par famille du catalogue plus l’icône générique ; vérifier qu’il échoue
- [x] 3.3 Produire les glyphes de la police monospace (normale et gras, accents français) dans `static/map/fonts/` et noter leur fabrication dans le README
- [x] 3.4 Dessiner les icônes (SVG sources dans le dépôt, PNG @1x et @2x dans `static/map/icons/`) : une par famille, générique et neutre, sans marque
- [x] 3.5 Écrire `static/map/style-light.json` (palette de `docs/design/direction.md`) puis `style-dark.json` avec la même structure ; vérifier que 3.2 passe

## 4. Modules purs

- [x] 4.1 Écrire les tests dans `src/lib/map/*.spec.ts` : `placeFeatures` (catégories enquête, mystère, décor, neutre ; numéro ; icône du catalogue, repli générique ; libellé du type ; horaires bruts ; lieu `excluded` jamais en évidence), `zoneBounds` (rectangle d’une commune élargi d’une marge ; position et rayon), masque (polygone du monde avec le contour en trou), tracé (ligne depuis `geometry`, droite pour un trajet sans tracé, point d’étiquette et durée), choix du style par thème ; vérifier qu’ils échouent
- [x] 4.2 Implémenter les modules dans `src/lib/map/` (fonctions pures, sans MapLibre) ; vérifier que 4.1 passe

## 5. Composant et page de validation

- [x] 5.1 Relire la documentation à jour de MapLibre 6 (`addProtocol`, `setStyle`, `queryRenderedFeatures`, `setPaintProperty`, contrôle d’attribution) et de `pmtiles`
- [x] 5.2 Écrire `src/lib/map/Map.svelte` : protocole `pmtiles`, style lu depuis `static/map/` avec l’adresse des tuiles (`VITE_TILES_URL`), centrage et limites de zone, chargement des icônes, couches du jeu (décor, enquête, mystère, trajet, masque), couleur du bâtiment des lieux de l’enquête à l’inactivité, panneau au clic sur un lieu de décor, attribution et mention de fiction permanentes, changement de thème par `setStyle` avec ré-ajout des couches, `setPaintProperty` exposé
- [x] 5.3 Écrire la page `src/routes/map/+page.svelte` et `+page.ts` (développement seulement, comme `/playground`) : commune de l’index, thème, lieux de l’enquête dont une scène comme mystère, un trajet calculé par `pedestrianRoutes` quand les fichiers de graphe existent ; documenter dans `tools/data-preparation/README.md` la copie de `communes.json` dans `static/dev-data/`
- [x] 5.4 Vérifier à la main avec `npm run dev` : trajet réel et trajet approximatif, clic sur un décor, passage clair / sombre sans retéléchargement des tuiles (onglet réseau), attribution visible dans les deux thèmes

## 6. Validation visuelle et mesures

- [x] 6.1 Valider visuellement avec `/map` trois communes de densités différentes (Fuveau, une grande ville, un petit village) avec le même style ; noter les ajustements de style faits
- [x] 6.2 Mesurer la fluidité avec le processeur ralenti dans le navigateur et noter les chiffres ; faire le test rapide de lisibilité (lieux de l’enquête et du mystère au premier coup d’œil) auprès de 3 personnes
- [x] 6.3 Vérifier que le thème sombre est utilisable (esquisse acceptée par le brief) et que les couleurs réservées (enquête, mystère, trajet) ne sont reprises par aucune couleur de famille

## 7. Contrôles et cap

- [x] 7.1 Lancer `npm run test`, `npm run check`, `npm run lint` et `npm run build` ; vérifier qu’ils passent et que `static/dev-data` n’entre pas dans la version de production
- [x] 7.2 Mettre à jour `docs/VISION.md` (§6 : Protomaps, MapLibre sans bibliothèque Svelte, deux styles à structure commune, bâtiment coloré par interrogation du fond ; §7 : étape 4) et `AGENTS.md` (ligne `tools/map-tiles/` dans la structure) ; vérifier avec `grep` que rien ne contredit les briefs 05 et 06
