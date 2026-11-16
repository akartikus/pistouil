# Tasks

## 1. Préparation du graphe (Python)

- [x] 1.1 Écrire `tools/data-preparation/tests/test_graph.py` avec un petit extrait `.osm` dans `fixtures/` : voies retenues et écartées (`motorway`, `foot=no`, `access=private`), sens unique ignoré, contraction (rue droite = une arête, forme gardée), longueur entière arrondie une fois, carrefour = nœud, arête à cheval sur deux cases écrite dans les deux, rattachement au segment (distance d’accès, position, nœuds), lieu à plus de 300 m sans rattachement, sortie déterministe
- [x] 1.2 Implémenter le module de graphe (par exemple `tools/data-preparation/graph.py`) : lecture des voies retenues, contraction, découpe par cases (même grille que `prepare.py`), rattachement des lieux ; écrire `graph/{ligne}_{colonne}.json` ; vérifier que 1.1 passe
- [x] 1.3 Brancher le module dans `run` de `prepare.py` (même commande, même dossier `--out`) et ajouter à `report.json` les comptes du graphe, les lieux sans rattachement et la taille de la plus grosse case ; vérifier que les tests de `add-osm-data-preparation` passent toujours
- [x] 1.4 Mettre à jour `tools/data-preparation/README.md` (nouvelle sortie `graph/`, format, copie dans `static/dev-data/`)

## 2. Calcul des trajets (TypeScript pur)

- [x] 2.1 Ajouter `approximate?: boolean` à `Route` dans `src/lib/engine/types.ts`
- [x] 2.2 Écrire `src/lib/engine/pedestrian.spec.ts` sur de petits graphes faits à la main : assemblage (nœuds fusionnés, arête en double comptée une fois, arête vers une case absente ignorée) ; trajet par les rues (distance = accès + chemin + accès, durée arrondie au-dessus, minimum 1 minute, tracé en `[lon, lat]`) ; deux lieux sur la même arête (raccourci) ; déterminisme avec deux chemins de même longueur (le plus petit identifiant l’emporte) ; matrice complète et symétrique acceptée par `assertCompleteMatrix` ; secours sur deux composantes non reliées et sur un lieu sans rattachement (`approximate: true`, vol d’oiseau × 1,3)
- [x] 2.3 Implémenter `src/lib/engine/pedestrian.ts` (fonctions pures : assemblage du graphe, Dijkstra à entiers arrêté quand les lieux sont atteints, construction des `Route`) ; vérifier que 2.2 passe

## 3. Générateur

- [x] 3.1 Ajouter à `src/lib/engine/generate.spec.ts` : avec un lieu relié à la scène par un trajet approximatif, il n’apparaît dans aucun segment ni fait ; sans trajet approximatif, l’enquête est identique à celle d’avant (mêmes graines que les tests existants) ; scène isolée
- [x] 3.2 Dans `src/lib/engine/generate.ts`, après le choix de la scène, retirer des lieux utilisables ceux dont le trajet vers la scène est approximatif ; vérifier que 3.1 et les tests existants passent

## 4. Playground

- [x] 4.1 Dans `src/lib/playground/`, ajouter la lecture des cases de graphe autour du centre (mêmes cases 3 × 3 que les lieux) et le choix « réseau piéton si disponible, sinon estimation à vol d’oiseau » ; tester la logique pure (compte des trajets estimés, repli sans graphe)
- [x] 4.2 Dans `src/routes/playground/+page.svelte`, lire `static/dev-data/graph/{ligne}_{colonne}.json`, utiliser les trajets réels, indiquer l’origine des durées et le nombre de trajets estimés ; vérifier à la main avec `npm run dev`, avec et sans `static/dev-data/graph`

## 5. Mesures et vérifications

- [x] 5.1 Lancer le script sur un extrait de Fuveau (`osmium extract`) puis sur PACA ; consigner le poids des cases de graphe, la durée et la mémoire du script, le nombre de lieux sans rattachement ; comparer au `diff -r` de deux exécutions identiques
- [x] 5.2 Mesurer le calcul de 45 trajets entre 10 lieux de Fuveau (cible : moins d’une seconde) ; vérifier le critère sur 20 enquêtes générées (graines et difficultés variées)
- [x] 5.3 Fournir 10 paires de lieux de Fuveau à l’utilisateur pour comparaison avec un calculateur d’itinéraire piéton de référence ; constater un écart inférieur à 15 %

## 6. Contrôles et cap

- [x] 6.1 Lancer `npm run test`, `npm run check`, `npm run lint` et `.venv/bin/pytest` ; vérifier qu’ils passent sans régression
- [x] 6.2 Mettre à jour `docs/reference/DATA-MODEL.md` §5 (`approximate`, ordre de `geometry`)
- [x] 6.3 Mettre à jour `docs/VISION.md` : décisions du §6 (graphe par case, rattachement au segment, secours marqué, lieux à trajet approximatif écartés), étape 3 de la feuille de route ; vérifier avec `grep` que rien ne contredit les briefs 04 à 06
