# Brief 03 — Réseau piéton et trajets

**Objectif** : calculer sur l’appareil les vrais trajets à pied entre les lieux d’une enquête (durée, distance, tracé), à partir du réseau de rues OSM préparé hors ligne.
**Dépend de** : briefs 01 et 02.
**À lire** : `docs/VISION.md` §6 (décisions sur les trajets) ; `docs/reference/DATA-MODEL.md` §5.

## Périmètre

**Inclus**
- **Hors ligne** : extension du script du brief 02 pour produire, par case, un graphe piéton compact : nœuds (coordonnées entières), arêtes (deux nœuds, longueur en mètres entière).
- Voies retenues : rues résidentielles, voies de desserte, rues piétonnes, chemins, sentiers, escaliers, routes secondaires et tertiaires. Voies écartées : autoroutes, voies rapides, `foot=no`, `access=private`. Les sens uniques sont ignorés.
- Accrochage de chaque lieu au nœud de rue le plus proche, avec la distance d’accès.
- **Sur l’appareil** : assemblage du graphe de la zone à partir des cases, puis Dijkstra depuis chaque lieu de l’enquête, arrêté dès que tous les autres lieux sont atteints.
- Sortie : un `Route` par paire de lieux (`distanceM`, `minutes` à 5 km/h, `geometry`).
- Une approximation de secours (vol d’oiseau × 1,3) quand deux lieux ne sont pas reliés par le réseau.

**Exclu**
- Trajets vers un point libre de la carte : les trajets relient uniquement des lieux de l’enquête.
- Pentes, feux, traversées : éventuelles pénalités plus tard.
- Affichage (brief 04).

## Exigences

### Trajets par les vraies rues
- QUAND on calcule le trajet entre deux lieux reliés par le réseau
- ALORS la distance suit les rues et chemins retenus, accès depuis chaque lieu compris,
- ET la durée vaut `distanceM / 83,3` minutes (5 km/h), arrondie à la minute supérieure.

### Calcul déterministe
- QUAND le même calcul est fait deux fois, sur deux appareils
- ALORS les durées et les tracés sont identiques : longueurs entières, et à longueur égale, départage fixe (le nœud d’identifiant le plus petit l’emporte).

### Léger et non bloquant
- QUAND une enquête de 10 lieux est générée sur un téléphone d’entrée de gamme
- ALORS le calcul des 45 trajets prend moins d’une seconde et s’exécute dans le Web Worker du moteur.
- Après la génération, le graphe peut être libéré de la mémoire : seuls les trajets sont conservés.

### Secours
- QUAND deux lieux ne sont pas reliés par le réseau (données incomplètes)
- ALORS le trajet utilise l’approximation à vol d’oiseau × 1,3, marquée comme approximative,
- ET le générateur évite de fonder une déduction clé sur un trajet approximatif.

### Intégration au moteur
- QUAND le moteur génère une enquête
- ALORS il reçoit la matrice issue de ce calcul à la place de la matrice fournie à la main dans le brief 01, sans autre changement.

## Critères d’acceptation

- [ ] Sur Fuveau, les durées calculées sont cohérentes avec un calculateur d’itinéraire piéton de référence (écart inférieur à 15 % sur 10 paires vérifiées à la main).
- [ ] Test de déterminisme sur un petit graphe avec deux chemins de même longueur.
- [ ] Test du secours sur deux composantes non reliées.
- [ ] Le poids du graphe d’une case est mesuré et noté (cible indicative : quelques centaines de Ko compressés pour un village).

## Points à trancher pendant la proposition

- Format du graphe (JSON compact ou tableaux typés binaires).
- Marge autour de la zone pour inclure les raccourcis (proposition : 1 km).

## Consigne pour OpenSpec

> Crée un nouveau changement OpenSpec nommé `add-pedestrian-routes` à partir de ce brief. Sépare clairement la partie préparation (script Python) et la partie calcul (TypeScript, dans `src/lib/engine/`). Le module de calcul doit rester pur et testable avec de petits graphes construits à la main.
