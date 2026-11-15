# Proposal

## Why

Les enquêtes sont trop faciles à résoudre, même à la difficulté 3. Le générateur produit toujours la même structure : l'auteur ment sur lui-même et un seul témoin le contredit. Il n'y a donc qu'une contradiction dans toute l'enquête : dès qu'on la trouve, on a le coupable (exemple observé : « Lucie : Maëlys a quitté Fleuriste Le Lilas à 18h28 précisément » contre le propre témoignage de Maëlys). Il manque aussi des pièges qu'un vrai enquêteur rencontre : un menteur qui accuse un autre, un fait que seuls les horaires d'ouverture trahissent, et une preuve parfaitement vraie qui ne disculpe pas. Enfin quelques textes sont faux (« j'ai dit au revoir à Musée du Quartier »). Source : retour d'essais dans le playground, hors brief ; renforce la déduction du moteur.

## What Changes

- **Textes** : suppression du gabarit « j'ai dit au revoir à {place} » et du mot « précisément » ; une règle de validation du catalogue refuse ces tournures.
- **Genres de mensonge, selon la difficulté** : l'auteur ment de l'une des façons permises par la difficulté, tirée avec la seed. Les cas évidents d'avant restent donc ceux de la difficulté facile.
  - `alibi` : un faux alibi sur lui-même, contredit par un témoin (comme aujourd'hui) ;
  - `framing` : un mensonge sur un autre suspect, qui contredit son propre témoignage ; il faut une troisième source (un indice ou un témoin innocenté) pour savoir qui ment ;
  - `closed` : un alibi dans un lieu fermé ce jour-là ; aucun témoin ne le contredit, seuls les horaires le trahissent.

  | Difficulté | Genres de mensonge | Preuves lointaines |
  | --- | --- | --- |
  | 1 (facile) | `alibi` seulement, comme avant | aucune |
  | 2 | `alibi` ou `framing` | environ 1 suspect sur 3 |
  | 3 | `alibi`, `framing` ou `closed` | environ 1 suspect sur 2 |

- **Horaires de semaine et de week-end** : chaque type de lieu et chaque lieu a des horaires pour la semaine et pour le week-end, appliqués à tous les faits dès la difficulté 1 (une contrainte, pas un piège). L'enquête a un jour (`dayType`), tiré avec la seed, affiché au joueur dans la situation (« En semaine, à 10h15, … »).
- **Preuves lointaines** : à partir de la difficulté 2, certains suspects, auteur compris, ont un séjour plus ancien avec une vraie preuve datée du départ, trop éloignée de l'heure du mystère pour disculper.
- **Contradiction** : deux départs du même personnage au même lieu à des heures différentes se contredisent.
- **Règles de cohérence** : « mensonge démasquable » devient « contredit par un fait fiable ou impossible selon les horaires » ; tout fait vrai tombe dans les horaires du lieu ce jour-là.
- **Playground** : le jour et les horaires des lieux sont visibles, le genre de mensonge apparaît dans le snapshot.
- **Documents** : `DATA-MODEL.md` et `VISION.md` (principe 3 : l'auteur ment sur lui-même ou sur un autre suspect).

Les horaires de ce changement sont écrits en dur dans le catalogue pour tester le moteur ; la manière d'obtenir les vrais horaires des vrais lieux sera trouvée plus tard, une fois les lieux réels sur la carte.

Hors périmètre : horaires par jour de la semaine (lundi, mardi…), jours fériés, vrais horaires des lieux réels (source à trouver plus tard), témoignages de bruit supplémentaires. Le solveur ne change pas : il ne lit ni les mensonges ni les horaires.

## Capabilities

### New Capabilities
<!-- Aucune. -->

### Modified Capabilities
- `investigation-generation`: genres de mensonge, jour de l'enquête, preuves lointaines, horaires selon le jour.
- `consistency-rules`: mensonge démasquable étendu aux horaires, faits vrais dans les horaires, lieux et trajets selon le jour.
- `investigation-solver`: deux départs au même lieu se contredisent.
- `catalog`: horaires de semaine et de week-end, gabarits de témoignage naturels.
- `text-rendering`: la situation dit le jour.
- `engine-playground`: jour et horaires visibles, genre de mensonge dans le snapshot.

## Impact

- Données : `catalog/place-types.json` (horaires en semaine et week-end), `catalog/testimony-templates.json`, `catalog/scenarios.json` (situations avec `{day}`).
- Code : `src/lib/engine/` (`types.ts`, `catalog.ts`, `generate.ts`, `rules.ts`, `solver.ts` pour la contradiction, `render.ts`, `fixtures.ts` et leurs tests), `src/lib/playground/playground.ts` et `src/routes/playground/+page.svelte`.
- Docs : `docs/reference/DATA-MODEL.md`, `docs/VISION.md`.
- Ce changement suit `compose-scenarios` (déjà appliqué, pas encore archivé) : leurs specs ne se recouvrent pas.
