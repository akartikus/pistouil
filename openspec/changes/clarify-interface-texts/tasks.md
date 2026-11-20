# Tasks

## 1. Textes sans jargon

- [ ] 1.1 Écrire `src/lib/game/texts.spec.ts` : aucun texte de `texts` (fonctions appelées avec des arguments d'exemple) ne contient « graine », « pièce », « scène » ni un nom de fichier `.pbf` ; `dataDateText` donne « 15 novembre 2026 » pour `x.osm.pbf@2026-11-15T21:22:28Z` et la version telle quelle sans date ; vérifier qu'il échoue avant la réécriture
- [ ] 1.2 Réécrire `src/lib/game/texts.ts` selon le tableau « Textes : avant et après » du design, ajouter `dataDateText` et la mention « Bientôt disponible », puis adapter les composants qui lisent les clés renommées ; vérifier avec `npm run test` et `npm run check`
- [ ] 1.3 Écrire `docs/design/wording.md` (un mot par notion, mots à éviter, règles de ton) ; vérifier par relecture que chaque ligne du tableau du design y a son mot

## 2. Horaires d'ouverture en français

- [ ] 2.1 Écrire `src/lib/map/opening-hours.spec.ts` : un test par scénario de la spec `opening-hours-display`, plus un test qui passe les horaires réels de `static/data/fuveau/places/` et vérifie qu'aucun jour, mois, `PH`, `off` ni heure `HH:MM` anglais ne reste ; vérifier qu'il échoue avant l'implémentation
- [ ] 2.2 Implémenter `src/lib/map/opening-hours.ts` (fonction pure `formatOpeningHours`, repli mot à mot) ; vérifier que `npm run test` passe
- [ ] 2.3 Appliquer `formatOpeningHours` aux horaires dans `placeFeatures` (`src/lib/map/features.ts`) et adapter `features.spec.ts` ; vérifier avec `npm run test`

## 3. Écran de départ, Réglages et guide

- [ ] 3.1 Créer `src/lib/game/features.ts` (`LOCATE_AVAILABLE = false`, commentaire de réactivation) et griser « Je me localise » dans `src/routes/+page.svelte` avec la mention ; vérifier dans Chromium (375 × 667) : bouton grisé, le toucher ne demande aucune permission, « Fuveau » lance une enquête
- [ ] 3.2 Afficher dans les Réglages « enquête n° … » et la date des données en français ; vérifier dans Chromium avec une enquête en cours
- [ ] 3.3 Vérifier dans Chromium, à 375 et 390 px de large, les trois bulles du guide (aucun débordement) et le panneau d'un lieu de décor avec des horaires, en français

## 4. Documentation et cap

- [ ] 4.1 Ajouter au brief 06 (« Points restants ») : repasser `LOCATE_AVAILABLE` à `true` dans `src/lib/game/features.ts` quand la position est validée sur appareil ; vérifier par relecture
- [ ] 4.2 Lancer `npm run lint`, `npm run check`, `npm run test`, `npm run build` et `openspec validate clarify-interface-texts --strict` ; vérifier que tout passe
- [ ] 4.3 Mettre à jour `docs/VISION.md` (§6 : vocabulaire de l'interface sans jargon, « Je me localise » grisé tant que le brief 06 n'est pas fini, horaires affichés en français) ; vérifier par relecture du diff
