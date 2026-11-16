# Design

## Context

Dépend de `osm-place-extraction` (`openspec/specs/osm-place-extraction/spec.md`) pour la grille de 2 km et les fichiers de lieux, de `investigation-generation` (`openspec/specs/investigation-generation/spec.md`) pour la matrice de trajets que le générateur exige, et de `engine-playground` (`openspec/specs/engine-playground/spec.md`) pour la source « Vrais lieux ». `Place`, `Route` et la règle « matrice complète, symétrique, `minutes ≥ 1` » sont ceux de `docs/reference/DATA-MODEL.md` §5. Aujourd’hui le moteur reçoit ses trajets tout faits (`createTravelTime`, `assertCompleteMatrix` dans `src/lib/engine/routes.ts`) et le playground les estime à vol d’oiseau (`src/lib/playground/real-places.ts`). Voir `proposal.md` pour la motivation.

## Goals / Non-Goals

**Goals:**
- De vrais trajets à pied entre les lieux d’une enquête, identiques sur tous les appareils.
- Un module de calcul pur, testable avec de petits graphes faits à la main.
- Un graphe par case assez léger pour un village (cible indicative : quelques centaines de Ko compressés).

**Non-Goals:**
- Chargement des cases depuis l’application, Web Worker, cache hors ligne (briefs 05 et 06).
- Pentes, feux, traversées, sens uniques, trajets vers un point libre, affichage.

## Decisions

**Graphe contracté.** Seuls les carrefours, les extrémités de voie et les nœuds partagés entre voies sont des nœuds ; les autres points deviennent la forme de l’arête. Une case de village tient alors en quelques milliers de nœuds. Alternative : garder tous les points comme nœuds, plus simple mais 3 à 5 fois plus gros, sans gain pour Dijkstra.

**Format JSON compact.** Comme au brief 02 : tableaux de nombres, sans indentation superflue (`nodes: [[id, lat5, lon5], …]`, `edges: [[a, b, longueurM, [[lat5, lon5], …]], …]`, `access: { osmId: [nodeA, nodeB, accessM, positionM, longueurArêteM] }`). Le poids est mesuré sur Fuveau (tâche de mesure) ; un format binaire n’est étudié que si une case dépasse l’objectif. Alternative : tableaux typés binaires, plus petits et plus rapides mais illisibles et à documenter.

**Arêtes à cheval sur deux cases.** Une arête est écrite dans la case de chacun de ses deux nœuds ; un nœud n’est décrit que dans sa case. À l’assemblage, les nœuds sont fusionnés par identifiant OSM (entier, sans perte en JSON), les arêtes dédoublonnées par leurs deux nœuds et leur longueur, et une arête dont un nœud manque est ignorée. Ainsi l’appelant peut charger n’importe quel ensemble de cases sans erreur : des rues continues à l’intérieur de l’ensemble, un bord franc à l’extérieur. Alternative : un identifiant global de nœud par coordonnées, rejeté car il fusionnerait à tort un pont et la voie dessous.

**Rattachement au segment, pas au nœud.** Avec un graphe contracté, le nœud le plus proche d’un lieu peut être à plusieurs centaines de mètres sur une rue droite. Le script projette donc chaque lieu sur l’arête la plus proche (distance d’accès, position sur l’arête) et le calcul part des deux nœuds de l’arête avec leur distance initiale (accès + position, accès + reste). Deux lieux sur la même arête (cas courant d’une rue commerçante entre deux carrefours) ont un raccourci direct, sinon leur distance serait gonflée d’un détour. Au-delà de 300 m d’une arête, un lieu n’est pas rattaché et passe au secours. Alternative du brief (nœud le plus proche) : plus simple, rejetée pour l’erreur sur les trajets courts, qui sont justement ceux du jeu.

**Voies retenues, élargies par rapport au brief.** Le brief liste résidentielles, desserte, piétonnes, chemins, sentiers, escaliers, secondaires et tertiaires. On ajoute `unclassified`, `living_street`, `track`, `cycleway` et `primary` : autour de Fuveau, des chemins et petites routes courants manqueraient sinon, et les lieux seraient séparés à tort. Les écarts du brief restent (autoroutes, voies rapides, `foot=no`, `access=private`).

**Dijkstra à entiers, départage par le plus petit identifiant.** File de priorité ordonnée par (distance, identifiant de nœud) ; à distance égale, le prédécesseur de plus petit identifiant est conservé. Aucune virgule flottante sur les longueurs. La durée utilise la même formule que le playground (`ceil(distance / 83,3)`, minimum 1) pour que les deux sources restent comparables.

**Matrice symétrique.** Pour chaque paire, le calcul part du lieu d’identifiant le plus petit : un seul sens est calculé, sans écart entre A→B et B→A. Chaque recherche s’arrête quand les lieux d’identifiant plus grand sont atteints.

**Secours marqué.** `Route.approximate?: boolean` (absent = trajet réel). Le générateur filtre ensuite, une fois la scène choisie, les lieux dont le trajet vers la scène est approximatif : un seul point d’entrée (la liste des lieux utilisables du contexte) au lieu de modifier les neuf usages de `travel`. Alternative : marquer chaque déduction clé et refuser celles fondées sur un trajet approximatif, plus précis mais invasif pour le générateur et le solveur.

**Ordre du tracé : `[lon, lat]`.** Comme `communes.json` et GeoJSON, ce que MapLibre attend. Le modèle ne le précisait pas ; `DATA-MODEL.md` §5 est complété.

**Playground.** La page lit aussi `static/dev-data/graph/` pour les mêmes cases 3 × 3 autour du centre ; si les fichiers manquent, elle garde l’estimation. L’appel est une fonction pure de `src/lib/engine/` qui reçoit les cases déjà lues.

## Risks / Trade-offs

- **Mémoire du script sur PACA** : lire les voies avec leurs nœuds demande un index de positions de nœuds, lourd sur toute la région. On mesure ; si besoin, repli sur des extraits plus petits (la préparation est occasionnelle, comme au brief 02).
- **Rattachement imparfait** : un lieu proche d’une voie non retenue (par exemple privée) peut se retrouver accroché à une rue voisine ; l’écart est visible dans `report.json` (lieux sans rattachement) et les trajets restent plausibles.
- **Réseau incomplet** : OSM peut avoir des rues non connectées ; le secours à vol d’oiseau × 1,3 et le filtre du générateur évitent de bâtir une déduction dessus.
- **Cases manquantes en bordure de zone** : un chemin qui sortirait de la zone chargée n’est pas vu ; d’où la marge de 1 km laissée à l’appelant (brief 05), et le secours en dernier recours.
- **Précision** : l’écart acceptable (moins de 15 % sur 10 paires vérifiées à la main à Fuveau) dépend d’un calculateur de référence consulté par l’utilisateur.
