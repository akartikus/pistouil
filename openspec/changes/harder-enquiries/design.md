# Design

## Context

Aujourd'hui (`src/lib/engine/generate.ts`) le générateur fabrique toujours la même enquête : l'auteur fait un faux alibi sur lui-même, un témoin ayant vu son départ le contredit, tous les indices tombent près de l'heure du mystère `T`, et les horaires d'un lieu sont une seule liste d'intervalles. Le solveur (`solver.ts`) ne lit ni les mensonges ni les horaires. Les règles sont dans `rules.ts`. Voir `proposal.md` pour la motivation. Specs concernées : `investigation-generation`, `consistency-rules`, `investigation-solver`, `catalog`, `text-rendering`, `engine-playground`. `compose-scenarios` est appliqué mais pas encore archivé ; ses exigences (objets, snapshot) ne se recouvrent pas avec celles-ci.

## Goals / Non-Goals

**Goals:**
- Casser le motif « première contradiction = coupable » avec trois genres de mensonge et des preuves qui ne disculpent pas.
- Des horaires en semaine et le week-end, utilisés partout.
- Garder le solveur et la difficulté (nombre de tours) tels quels.

**Non-Goals:**
- Horaires par jour de la semaine, jours fériés, vrais horaires des lieux réels (leur source sera trouvée plus tard), témoignages de bruit.
- Une difficulté de « démasquage » séparée : la difficulté reste le nombre de tours de déduction.

## Decisions

**Horaires.** `OpeningHours = { weekday, weekend }`, chacun étant `Interval[] | null` : `null` = toujours ouvert, `[]` = fermé toute la journée. `PlaceType.typicalHours` et `Place.actualHours` prennent ce type ; `actualHours` est facultatif et remplace `typicalHours` pour les deux jours quand un lieu en fournit : aujourd'hui seuls les horaires typiques écrits en dur dans le catalogue servent, le jour où une source de vrais horaires existera elle remplira `actualHours` sans toucher au moteur. Un helper `hoursOn(place, type, dayType)` renvoie la liste d'intervalles du jour (`null` devient `[0, 1440]`). *Alternative écartée* : sept jours (lundi à dimanche) : plus de données à écrire pour peu de gain ici, et la source des vrais horaires n'est pas connue.

**Jour de l'enquête.** `DayType = 'weekday' | 'weekend'`, tiré avec la seed au choix du cadre (`chooseSetting`), conservé dans `Investigation.dayType`. Toute heure d'ouverture utilisée ensuite dans la génération (scène, séjours, indices, mensonge) dépend de ce jour. Une scène fermée ce jour-là est écartée. La situation commence par `{day}` (« En semaine » ou « Le week-end », majuscule comprise) : les 7 situations passent de « À {time}, … » à « {day}, à {time}, … ».

**Horaires de départ du catalogue** (semaine / week-end ; « — » = toujours ouvert, « fermé » = liste vide) :

| Type | Semaine | Week-end |
| --- | --- | --- |
| bakery | 07:00–19:30 | 07:00–13:00 |
| cafe | 07:00–23:00 | 08:00–23:00 |
| bar | 11:00–24:00 | 11:00–24:00 |
| restaurant | 12:00–14:30, 19:00–23:00 | 12:00–15:00, 19:00–24:00 |
| pharmacy | 08:30–19:30 | 09:00–12:30 |
| shop | 09:00–19:00 | 09:00–12:30 |
| butcher, greengrocer | 08:00–19:30 | 08:00–13:00 |
| florist | 09:00–19:00 | 09:00–13:00 |
| bookshop, clothes_shop | 10:00–19:00 | 10:00–19:00 |
| hairdresser | 09:00–19:00 | 09:00–17:00 |
| tobacconist | 07:00–20:00 | 07:00–20:00 |
| supermarket | 08:30–20:30 | 08:30–13:00 |
| laundromat | 07:00–21:00 | 07:00–21:00 |
| library | 10:00–18:00 | 10:00–12:00 |
| post_office | 09:00–18:00 | 09:00–12:00 |
| town_hall | 08:30–17:00 | fermé |
| cinema | 10:00–24:00 | 10:00–24:00 |
| performance_hall | 14:00–24:00 | 14:00–24:00 |
| museum | 10:00–18:00 | 10:00–18:00 |
| gym | 07:00–22:00 | 08:00–20:00 |
| kiosk | 08:00–20:00 | 08:00–13:00 |
| open_air_market | 07:00–13:00 | 07:00–13:00 |
| train_station | 05:00–23:30 | 06:00–23:30 |
| school | 08:00–17:00 | fermé |
| music_school | 09:00–21:00 | 09:00–18:00 |
| place_of_worship | 09:00–19:00 | 09:00–19:00 |
| cemetery | 08:00–18:00 | 08:00–18:00 |
| park, fountain, square, pedestrian_street, statue, bench, bus_stop, hospital, war_memorial | — | — |

**Difficulté et pièges.** Les cas évidents d'avant restent ceux de la difficulté facile ; chaque piège apparaît quand la déduction le justifie :

| Difficulté | Genres de mensonge | Preuves lointaines | Pourquoi |
| --- | --- | --- | --- |
| 1 | `alibi` | aucune | contradiction directe, comme avant |
| 2 | `alibi`, `framing` | environ 1 suspect sur 3 | `framing` demande une troisième source |
| 3 | `alibi`, `framing`, `closed` | environ 1 suspect sur 2 | `closed` demande de penser aux horaires |

Les horaires de semaine et de week-end et le jour de l'enquête s'appliquent à tous les faits dès la difficulté 1 : ils contraignent la génération mais ne créent un piège qu'avec `closed`.

**Genre de mensonge.** `LieKind = 'alibi' | 'framing' | 'closed'`, tiré avec la seed parmi les genres que la difficulté permet et que les lieux rendent faisables, stocké dans le témoignage mensonger (`Testimony.lieKind`, privé comme `lie` et `motive`). Le repli se fait seulement vers un genre permis : à la difficulté 1 le genre est toujours `alibi`, ce qui garde exactement la structure actuelle (faux alibi, témoin qui a vu partir l'auteur).
- `alibi` : faux séjour ou fausse heure sur le lieu où l'auteur dit être, avec le témoin qui l'a vu partir.
- `framing` : l'auteur témoigne qu'un des innocents du tour 1 (le témoin ou l'autre) a quitté son lieu à `t0`, avec `T − t0 ≥ trajet` (si on le croyait, cet innocent aurait pu aller à la scène), alors que sa vraie soirée finit plus tard. Le fait fiable qui le contredit est l'indice de cet innocent (départ ou présence). Dans ce genre, il n'y a pas de témoin qui voit partir l'auteur : l'auteur ne dit rien de faux sur lui-même, et la contradiction entre son témoignage et celui de l'innocent n'indique pas qui ment sans l'indice.
- `closed` : un alibi dans un lieu qui, ce jour-là, est fermé à l'heure annoncée mais qui a une raison d'être crédible (il ouvre l'autre jour ou à d'autres heures). Aucun témoin ne le contredit, il n'y a pas de témoin de départ ; seuls les horaires le trahissent.
*Alternative écartée* : n'importe quel suspect comme cible du `framing` : un innocent de chaîne (sans indice) ne pourrait pas être défendu par un fait fiable immédiat.

**Contradiction.** `contradicts` (`solver.ts`) gagne un cas : deux `departure` du même personnage au même lieu à des heures différentes. C'est ce qui oppose le mensonge `framing` (départ à `t0`) à l'indice de preuve de l'innocent (départ à la fin de son séjour). Deux départs à la même heure ne se contredisent pas (le témoin et l'indice peuvent dire la même chose).

**Preuves lointaines.** À partir de la difficulté 2, chaque suspect reçoit, avec une probabilité d'environ un tiers (difficulté 2) ou un demi (difficulté 3), un séjour plus ancien : lieu compatible avec une preuve, fin `e0 ≤ T − trajet(lieu, scène) − 15` et au moins `trajet + 10` avant le premier séjour du suspect, ouvert ce jour-là, durée de 10 à 40 minutes, avec une preuve datée de `e0` (un fait `departure`). Elle est vraie, vérifiable, et ne disculpe pas (écart supérieur au trajet). La difficulté 1 n'en contient aucune. Le tableau `segments` d'un personnage n'est plus forcément chronologique : l'indice d'un séjour est celui de sa position dans le tableau, et l'affichage trie par heure.

**Règles de cohérence.**
- `lie-detectable` : le mensonge est contredit par un fait fiable non prononcé par l'auteur, ou son lieu est fermé à l'heure annoncée le jour de l'enquête.
- `facts-within-hours` (nouvelle) : tout fait vrai, indice ou témoignage, tombe dans les horaires de son lieu le jour de l'enquête. `clue-hours` est conservée et utilise le jour de l'enquête.

**Textes.** Le catalogue refuse un gabarit de témoignage ou d'indice qui contient « au revoir à » ou « précisément » (liste de tournures interdites, extensible). `departure_self_2` est supprimé. `departure_other_2` devient « {firstName} a quitté {place} à {time}. ». Il reste au moins un gabarit par précision et par sujet (règle déjà vérifiée).

**Playground.** Le modèle de vue ajoute le jour et, par lieu de l'enquête, ses horaires du jour (« 9h00–12h30 », « fermé », « toujours ouvert »). Le snapshot ajoute `dayType` et `lieKind`. L'affichage de la vraie soirée trie les séjours par heure.

**Solveur et difficulté.** Inchangés, à part la contradiction ci-dessus : le mensonge n'est jamais fiable, les horaires n'entrent pas dans le solveur. Les nouveaux pièges ajoutent du raisonnement (qui ment ? ce lieu était-il ouvert ?) sans toucher à la difficulté mesurée.

## Risks / Trade-offs

- [Des lieux fermés le week-end réduisent le choix et peuvent faire échouer plus de générations] → on mesure avec le fuzz du playground et le jeu riche, on compare à la base actuelle (6 336 valides, 576 `no-scene`, 2 304 `difficulty-unreachable` sur le jeu de 8 lieux) ; un taux d'échec qui monte beaucoup se corrige par les horaires du catalogue.
- [Le genre `closed` n'est possible qu'avec un lieu fermé ce jour-là] → repli sur un autre genre ; le jeu riche en contient beaucoup.
- [Le genre `framing` dépend d'un innocent du tour 1 avec un séjour assez long] → repli sur un autre genre si aucun `t0` valable.
- [`segments` non chronologique] → l'indice de séjour reste la source de vérité ; les règles (`realistic-routes`) trient déjà par heure.
- [Les preuves lointaines augmentent le nombre de faits] → utile au bruit, mais le test de performance reste (moins de 200 ms).
