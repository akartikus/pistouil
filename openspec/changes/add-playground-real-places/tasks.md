# Tasks

## 1. Logique pure

- [x] 1.1 Écrire `src/lib/playground/real-places.spec.ts` : conversion en `Place` (`type` → `typeId`, `removed` par défaut `false`, `openingHours` ignoré, type inconnu du catalogue ignoré, lieu retiré gardé retiré) ; cases voisines du centre (calcul entier aligné sur la grille du manifeste, 3 × 3) ; sélection des N plus proches (ordre par distance puis `osmId`, moins de lieux que N sans erreur) ; trajets à vol d'oiseau (matrice complète, distance et durée strictement positives, acceptée par `assertCompleteMatrix`)
- [x] 1.2 Implémenter `src/lib/playground/real-places.ts` (fonctions pures, sans `fetch`) et vérifier que 1.1 passe
- [x] 1.3 Ajouter à `playground.spec.ts` un test qui exécute `runPlayground` sur des lieux convertis et des trajets estimés (jeu de lieux construit dans le test) et vérifie qu'il ne lève pas d'erreur de matrice ; vérifier qu'il passe

## 2. Page

- [x] 2.1 Ajouter au `.gitignore` `static/dev-data` et expliquer dans `tools/data-preparation/README.md` comment y copier `manifest.json` et `places/` (vérifier avec `git status` qu'une copie n'apparaît pas)
- [ ] 2.2 Dans `src/routes/playground/+page.svelte`, ajouter le choix de source (lieux de test par défaut, vrais lieux), le centre (latitude, longitude) et le nombre de lieux ; lire `manifest.json` et les cases par `fetch` ; réinitialiser les lieux actifs quand la source ou la sélection change ; vérifier à la main avec `npm run dev` que le jeu de test reste inchangé
- [ ] 2.3 Afficher que les durées sont des estimations à vol d'oiseau et, quand les fichiers manquent, un message qui explique comment les fournir en laissant le jeu de test utilisable ; vérifier à la main avec et sans `static/dev-data`
- [x] 2.4 Vérifier avec les données PACA copiées dans `static/dev-data` : autour de la mairie de Fuveau (43.4539, 5.5609) avec 40 lieux, générer plusieurs enquêtes (graines et difficultés variées), constater qu'au moins une réussit et que les échecs affichent leur raison ; consigner le résultat dans la description du changement

## 3. Contrôles et cap

- [x] 3.1 Lancer `npm run test`, `npm run check` et `npm run lint` ; vérifier qu'ils passent sans régression
- [x] 3.2 Mettre à jour `docs/VISION.md` §6 : le playground peut s'exécuter sur de vrais lieux avec des trajets estimés à vol d'oiseau, jusqu'aux briefs 03 et 05 ; vérifier avec `grep` que rien ne contredit les briefs 03 et 05
