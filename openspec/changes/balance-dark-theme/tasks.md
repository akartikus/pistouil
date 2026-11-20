# Tasks

## 1. Jetons et contrastes

- [x] 1.1 Écrire `src/lib/game/colors.spec.ts` : lit `app.css`, vérifie les contrastes du thème sombre (texte 7:1, texte secondaire 4,5:1, cadres 3:1, jaune 7:1, textes sur `--strong` et `--solid` 7:1, aucun cadre ni aplat en blanc pur), que les valeurs du thème clair sont celles d'avant, et que `GAME_COLORS.dark` reprend `ink`, `paper`, `shadow` et `frame` du CSS ; vérifier qu'il échoue avant le code
- [x] 1.2 Ajouter dans `src/lib/game/app.css` les jetons `--frame`, `--strong`, `--on-strong`, `--solid`, `--on-solid` (clair inchangé, sombre selon le design) et reprendre les règles de base (`.box`, `.btn`, `.btn.solid`, etc.) ; vérifier que `colors.spec.ts` passe

## 2. Reprise des écrans

- [x] 2.1 `src/routes/play/+layout.svelte` : en-tête, barre du bas, onglet actif, compteurs ; vérifier avec `npm run check`
- [x] 2.2 `src/routes/play/suspects/+page.svelte`, `src/routes/play/carnet/+page.svelte`, `src/lib/game/ui/Piece.svelte`, `src/lib/game/ui/FactCard.svelte` ; vérifier avec `npm run check`
- [x] 2.3 `src/routes/play/carte/+page.svelte`, `src/routes/play/reveal/+page.svelte`, `src/routes/reglages/+page.svelte` ; vérifier avec `npm run check`
- [x] 2.4 `src/lib/map/Map.svelte` et `src/lib/map/theme.ts` (couleurs sombres des repères et étiquettes) ; vérifier avec `npm run check` et `npm run test`

## 3. Vérification

- [x] 3.1 Capturer dans Chromium (375 × 667) les dix écrans en sombre et trois en clair ; mesurer qu'aucun cadre ni grand aplat n'est en blanc pur en sombre, que « Fiche ▸ » est lisible, et que le clair est inchangé ; relire les captures
- [x] 3.2 `npm run lint`, `npm run check`, `npm run test`, `npm run build`, `openspec validate balance-dark-theme --strict` ; vérifier que tout passe

## 4. Documentation et cap

- [x] 4.1 Mettre à jour `docs/design/direction.md` (tableau de la palette, section « Thème sombre ») ; vérifier par relecture que les valeurs sont celles de `app.css`
- [x] 4.2 Mettre à jour `docs/VISION.md` (§6 : thème sombre en ardoise, jaune seule couleur forte, contrastes testés) ; vérifier par relecture du diff
