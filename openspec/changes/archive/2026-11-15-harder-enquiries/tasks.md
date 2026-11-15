# Tasks

## 1. Textes naturels

- [x] 1.1 Écrire les tests dans `catalog.spec.ts` : un gabarit contenant « au revoir à » est refusé en nommant le gabarit, un gabarit contenant « précisément » aussi, et le catalogue de départ est exempt de ces tournures
- [x] 1.2 Ajouter la liste des tournures interdites à `catalog.ts`, supprimer `departure_self_2`, retirer « précisément » de `departure_other_2` dans `catalog/testimony-templates.json`, et vérifier que les tests du catalogue et ceux des textes passent

## 2. Horaires de semaine et de week-end

- [x] 2.1 Écrire les tests dans `catalog.spec.ts` : chaque type a des horaires pour les deux jours, une mairie et une école sont fermées le week-end, des lieux ont des horaires différents entre les deux jours, un type sans horaires pour un jour est refusé
- [x] 2.2 Ajouter `OpeningHours`, `DayType` et `hoursOn` à `types.ts` et `rules.ts`, adapter `PlaceType.typicalHours`, `Place.actualHours` et `Investigation.dayType`, valider les horaires dans `catalog.ts`
- [x] 2.3 Migrer `catalog/place-types.json` vers `{ weekday, weekend }` selon le tableau du design, adapter `fixtures.ts` (lieux de test) et les tests existants (`rules.spec.ts` et autres), et vérifier que la suite passe
- [x] 2.4 Écrire les tests de `facts-within-hours` et de `clue-hours` selon le jour (témoignage vrai dans un lieu fermé rejeté, indice un jour de fermeture rejeté, faits conformes acceptés), puis implémenter la règle dans `rules.ts` et adapter `clue-hours`

## 3. Jour de l'enquête dans la génération

- [x] 3.1 Écrire les tests dans `generate.spec.ts` : les deux jours apparaissent sur de nombreuses seeds, une scène fermée le week-end n'est jamais choisie un week-end, même seed même jour, tous les faits tombent dans les horaires du jour ; dans `render.spec.ts` : la situation commence par « En semaine, à » ou « Le week-end, à »
- [x] 3.2 Tirer le jour dans `chooseSetting`, appliquer les horaires du jour à toute la génération (`ctx.hoursOf` selon le jour), rendre `{day}` dans `render.ts`, passer les 7 situations de `catalog/scenarios.json` à « {day}, à {time}, … » et ajouter `day` aux variables autorisées de la situation ; vérifier que les tests passent

## 4. Genres de mensonge

- [x] 4.1 Écrire les tests de contradiction dans `solver.spec.ts` : deux départs au même lieu à des heures différentes se contredisent, deux départs identiques non ; puis l'implémenter dans `contradicts`
- [x] 4.2 Écrire les tests de `lie-detectable` étendu dans `rules.spec.ts` (mensonge dans un lieu fermé accepté sans fait qui le contredise, mensonge sans contradiction ni horaires rejeté), puis l'implémenter dans `rules.ts`
- [x] 4.3 Écrire les tests dans `generate.spec.ts`, par difficulté : à la difficulté 1 le mensonge est toujours `alibi` et un témoin le contredit ; `framing` n'apparaît jamais à 1, apparaît à 2 et à 3 ; `closed` n'apparaît jamais à 1 et 2, apparaît à 3 ; un mensonge `framing` vise un innocent différent de l'auteur et un indice le contredit ; un mensonge `closed` place l'auteur dans un lieu fermé, sans fait fiable qui le contredise ; le genre est conservé dans le témoignage ; les enquêtes restent valides à chaque difficulté
- [x] 4.4 Ajouter `LieKind` et `Testimony.lieKind` à `types.ts`, implémenter les genres `framing` et `closed` avec repli dans `generate.ts`, et vérifier que 4.3 et les tests existants passent

## 5. Preuves lointaines

- [x] 5.1 Écrire les tests dans `generate.spec.ts`, par difficulté : aucune preuve lointaine à la difficulté 1 ; à 2 et à 3, des preuves lointaines pour des innocents et pour l'auteur, en part plus élevée à 3 qu'à 2 ; une preuve lointaine n'innocente pas (le solveur donne la même difficulté et les mêmes innocentés qu'avec elle retirée) ; les trajets restent réalistes ; les règles passent
- [x] 5.2 Implémenter les séjours plus anciens et leurs preuves dans `generate.ts` et vérifier que 5.1, les 500 seeds et le jeu riche passent

## 6. Playground

- [x] 6.1 Écrire les tests dans `playground.spec.ts` : le modèle de vue donne le jour et les horaires du jour de chaque lieu de l'enquête, le snapshot donne `dayType` et `lieKind`, la vraie soirée est triée par heure
- [x] 6.2 Implémenter dans `playground.ts`, afficher le jour et les horaires dans `+page.svelte` et vérifier avec un navigateur sans interface que la page montre « En semaine » ou « Le week-end », les horaires des lieux, et le genre de mensonge dans le snapshot

## 7. Documentation

- [x] 7.1 Mettre à jour `docs/reference/DATA-MODEL.md` (horaires de semaine et de week-end, jour de l'enquête, genres de mensonge, séjours plus anciens et preuves lointaines, règles `facts-within-hours` et `lie-detectable`) et `docs/VISION.md` (principe 3 : l'auteur ment sur lui-même ou sur un autre suspect ; décisions) ; vérifier avec `grep` qu'aucun document ne décrit encore le mensonge comme portant toujours sur l'auteur

## 8. Non-régression

- [x] 8.1 Vérifier `npm run test` (dont les 500 seeds et le jeu riche), `npm run check`, `npm run lint` et `npm run build` sans erreur
- [x] 8.2 Lancer le fuzz du playground sur les 256 combinaisons du jeu de 8 lieux et sur le jeu riche (script temporaire) : aucun plantage, aucune règle violée, aucune difficulté fausse ; noter les nouveaux taux d'échec et, par difficulté, la répartition des genres de mensonge, des jours et des preuves lointaines
- [x] 8.3 Vérifier que le motif « première contradiction = coupable » disparaît avec la difficulté : sur 300 enquêtes par difficulté, compter celles où une seule contradiction directe entre deux témoins désigne l'auteur sans autre fait, et noter la part ; elle doit rester élevée à la difficulté 1 (cas évidents conservés) et baisser nettement à 2 et à 3 ; relire dans le playground une dizaine d'enquêtes de chaque genre de mensonge
- [x] 8.4 Vérifier que le solveur n'a changé que par la nouvelle contradiction (`git diff -- src/lib/engine/solver.ts`)

## Workflow follow-up

- Archiver le changement une fois la revue terminée (après `compose-scenarios`).
