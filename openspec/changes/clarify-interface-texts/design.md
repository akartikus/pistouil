# Design

## Context

Tous les textes de l'interface sont dans `src/lib/game/texts.ts` (aucun texte en dur dans les composants, sauf un `aria-label`). Les textes des faits viennent du moteur et sont hors périmètre. Capabilities existantes concernées, à lire avant le code : `game-screens` (guide, Réglages, fiches, écran de départ), `map-display` (panneau d'un lieu de décor, aujourd'hui « horaires bruts »), `game-deduction` (les verdicts affichés au Carnet). Voir `proposal.md` (Why).

« Guides » est compris comme les guides **de l'application** : les trois bulles du guide de départ et les phrases d'aide du jeu, pas les fichiers `guide/*.md`. Les horaires s'affichent en un seul endroit : `Map.svelte`, `showInfo`, qui reçoit la propriété `hours` construite par `placeFeatures` (`src/lib/map/features.ts`). Les valeurs réelles de Fuveau (106 horaires distincts sur 120 lieux) emploient : jours `Mo`…`Su`, plages (`Mo-Sa`), listes (`Mo,We-Fr`), `PH`, `off`, `24/7`, plages de mois (`Mar-Sep`), dates (`2024 May 20 off`, `May 1 off`), `Sa[2]` et quelques règles à rallonge (`Jul 09-Aug 31: …`).

## Goals / Non-Goals

**Goals:**
- Un joueur qui n'a jamais vu le jeu comprend chaque phrase et chaque bouton.
- Un seul endroit pour décider du vocabulaire, vérifié par un test.

**Non-Goals:**
- Réécrire les textes du moteur ; traduire dans d'autres langues ; implémenter toute la grammaire `opening_hours` d'OpenStreetMap.

## Decisions

- **Vocabulaire : `docs/design/wording.md`.** Un tableau « notion, mot à employer, mots à éviter », avec les règles de ton (tutoiement, phrases courtes, un mot par notion). Il est cité par `texts.ts` et par l'exigence « Textes compréhensibles ». Choix : **indice** (objet, trace) et **témoignage** pour ce qu'on découvre dans un lieu, au lieu de « pièce » et « fait » ; **lieu du mystère** au lieu de « scène » ; **temps de marche** ; **numéro de l'enquête** au lieu de « graine ». Les specs et le code gardent leurs termes internes.
- **Garde-fou : `texts.spec.ts`.** Un test parcourt toutes les valeurs de `texts` (en appelant les fonctions avec des arguments d'exemple) et refuse « graine », « pièce », « scène » et un nom de fichier `.pbf`. Alternative : une revue à la main, écartée (les mots reviennent à chaque nouveau texte).
- **Localisation grisée : une constante, `LOCATE_AVAILABLE`, dans `src/lib/game/features.ts`**, à `false`, avec un commentaire qui dit de la repasser à `true` quand le brief 06 est fini. Le bouton est `disabled` avec la mention « Bientôt disponible ». Alternative : un réglage dans les Réglages, écartée (le joueur n'a pas à le voir). Le code de localisation reste en place, testé par `locate.spec.ts`.
- **Horaires : une fonction pure `formatOpeningHours(raw): string` dans `src/lib/map/opening-hours.ts`**, appelée par `placeFeatures`. Pour chaque règle (séparées par `;`), elle reconnaît la forme *saison, date ou jours, puis heures ou « off »* et la réécrit ; une règle qu'elle ne comprend pas passe par une traduction mot à mot (jours, mois, `PH`, `off`, heures `HH:MM` en `XhMM`) qui garde le reste tel quel. Alternative : la bibliothèque `opening_hours`, écartée (dépendance lourde pour un affichage ; on n'évalue pas les horaires).
- **Date des données : `dataDateText(version)` dans `texts.ts`**, qui lit la date après le `@` de `dataVersion` et l'écrit en français (`toLocaleDateString('fr-FR', …)`, fuseau UTC) ; sans date, la version est montrée telle quelle.

### Textes : avant et après

À relire avant l'implémentation. Ce qui ne figure pas ici ne change pas.

| Où | Avant | Après |
| --- | --- | --- |
| Guide, bulle 1 | Touche un lieu numéroté sur la carte. | Une farce a eu lieu ! Touche un lieu numéroté pour chercher des indices. |
| Guide, bulle 2 | Touche une pièce pour la lire : elle rejoint ton carnet. | Touche un indice ou un témoignage pour le lire. Il sera noté dans ton carnet. |
| Guide, bulle 3 | Mesure un trajet vers le lieu du mystère pour comparer les alibis. | Touche « Vers le lieu du mystère » pour voir le temps de marche : un alibi trop juste est suspect. |
| Départ | Position refusée. Choisis plutôt Fuveau. | Impossible de te localiser. Touche « Fuveau » pour jouer. |
| Départ | Seule Fuveau est disponible pour le moment, et ta position est en dehors. Choisis plutôt Fuveau. | Pour le moment, on ne peut jouer qu'à Fuveau, et tu n'y es pas. Touche « Fuveau » pour jouer. |
| Départ | (bouton actif) | « Je me localise » grisé, mention « Bientôt disponible » |
| Échec | Aucun lieu de la zone ne convient pour la farce. | Aucun lieu des environs ne convient pour y organiser la farce. |
| Échec | Les données du jeu sont introuvables. Réessaie plus tard. | Impossible de charger les lieux du jeu. Ferme puis rouvre l'application. |
| Échec | Les données ont changé depuis ta dernière partie : cette enquête ne peut plus être rejouée à l'identique. | Cette enquête ne peut plus être reprise : les lieux du jeu ont changé depuis. Commence-en une nouvelle. |
| Carte | Preuves et témoins | Indices et témoignages |
| Carte | Rien ici. | Aucun indice ici. |
| Carte | Seuls les lieux de l'enquête sont proposés. | Seuls les lieux numérotés de l'enquête sont proposés. |
| Carte | Curseur horaire | Choisir l'heure |
| Carte | Position inconnue à cette heure. | On ne sait pas où se trouve cette personne à cette heure-là. |
| Verdicts | …ne peuvent pas être vrais tous les deux. (`N min de trajet, mais M min d'écart`) | Il faut N min à pied, mais il ne s'est passé que M min : ces deux indices ne peuvent pas être vrais tous les deux. |
| Verdicts | Si ce fait est vrai, X ne peut pas être à la scène (…) | Si cet indice est vrai, X n'a pas pu être au lieu du mystère : il faut N min à pied, il ne reste que M min. |
| Verdicts | Si ce fait est vrai, X aurait pu être à la scène (…) | Si cet indice est vrai, X aurait pu être au lieu du mystère : N min à pied pour M min disponibles. |
| Carnet | Aucun fait pour l'instant. Ouvre un lieu sur la carte. | Aucun indice pour l'instant. Touche un lieu sur la carte. |
| Carnet | N faits | N indices |
| Carnet | Annotations de lieux | Notes sur les lieux |
| Carnet | Non vu pendant la partie | Pas découvert pendant la partie |
| Fiche suspect | Ce qu'il dit lui-même / Ce que les autres disent de lui / Preuves et témoins | Ce que la personne dit / Ce que les autres en disent / Indices et témoignages |
| Accusation | Définitif : la révélation se lance. | Définitif : la révélation s'affiche aussitôt. |
| Révélation | Comprendre : revoir le carnet expliqué | Comprendre : voir le carnet avec les explications |
| Réglages | graine 238337462 | enquête n° 238337462 |
| Réglages | Données : provence-alpes-cote-d-azur-latest.osm.pbf@2026-11-15T21:22:28Z | Lieux : données OpenStreetMap du 15 novembre 2026 |
| À propos | Protomaps, tuiles dérivées d'OpenStreetMap | Protomaps, d'après les données d'OpenStreetMap |

L'attribution « © OpenStreetMap contributors, licence ODbL 1.0 » ne change pas : sa formule est celle de la licence.

## Risks / Trade-offs

- [Les textes sont une affaire de goût] → le tableau ci-dessus est relu avant l'implémentation ; un changement de mot après coup ne touche que `texts.ts` et `wording.md`.
- [La bulle du guide est étroite : un texte plus long peut déborder] → vérification dans Chromium à 375 et 390 px de large, avec les trois bulles.
- [La traduction des horaires ne couvre pas toute la syntaxe OpenStreetMap] → le mot-à-mot garde le reste lisible, et un test passe les 106 horaires de Fuveau pour vérifier qu'aucun jour ou mois anglais ne reste.
- [`LOCATE_AVAILABLE` oublié à `false`] → noté dans le brief 06 (« Points restants ») et dans la tâche finale de ce changement.
