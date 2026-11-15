# Design

## Context

Capabilities concernées : `catalog`, `investigation-generation`, `text-rendering`, `consistency-rules`, `engine-playground` (`openspec/specs/`). Aujourd’hui `ScenarioModel` porte une `situation` et des `revelations` figées (`catalog/scenarios.json`, 7 scénarios) ; `generate.ts` les rend avec `{place}`, `{time}`, `{author}`. Le catalogue interdit déjà les accords de genre avec les prénoms. Le solveur ne lit ni scénario ni texte : il n’est pas concerné. Voir `proposal.md`.

Constats relevés en préparant ce changement, corrigés par lui :
- plusieurs situations construisent une phrase autour du type de lieu (« la statue de {place} », « la fontaine de {place} ») alors que la scène peut être une place ou une fontaine : on lit « la statue de Fontaine des Lilas » ;
- l’exemple d’accord du modèle (« départ de {firstName} du {place} ») contracte un article devant `{place}`, ce que les gabarits réels ne font pas ;
- le test des règles de cohérence utilise un identifiant de scénario absent du catalogue.

## Goals / Non-Goals

**Goals:**
- Beaucoup de farces à partir de peu de textes, sans moteur de grammaire.
- Ajouter un objet = ajouter une ligne au catalogue.
- Ne rien changer à la déduction : mêmes garanties du moteur.

**Non-Goals:**
- Petit mot tiré au hasard, plusieurs verbes par farce, accords automatiques, textes par IA, nouveaux scénarios.

## Decisions

**Données.** Nouveau fichier `catalog/items.json` : `{ id, tags, indefinite, definite }`. `ScenarioModel` gagne `itemTags` (étiquettes acceptées) et `itemCount` (`{ min, max }`, `0`/`0` pour un scénario sans objet). `Investigation` gagne `itemIds`, visibles du joueur (ils sont dans la situation). *Alternative écartée* : une forme plurielle par objet ; « une vingtaine de canards en plastique » s’écrit directement comme forme indéfinie.

**Un objet peut porter plusieurs étiquettes** (une écharpe est `wearable` et `linen`). Réserve de départ : `wearable` (perruque, rouge à lèvres, écharpe, lunettes de soleil, casque audio, chapeau…), `linen` (caleçon, chaussette, culotte, pyjama…), `floating` (canards, bateaux en papier…), `tableware` (nappe, chandelier, bouquet…), `welcome` (tapis rouge, cordon de velours, ballons dorés…), une trentaine d’objets en tout.

**Les 7 scénarios réécrits.**

| Scénario | Étiquettes | Objets | Forme de la situation |
| --- | --- | --- | --- |
| `laundry_line` | `linen` | 2 à 3 | corde à linge près de `{place}`, « on y a étendu `{items}` » |
| `laundromat_surprise` | `linen` | 1 | « on a retrouvé `{items}` dans un tambour, à `{place}` » |
| `rubber_ducks` | `floating` | 1 | « quelqu’un a lâché `{items}` dans l’eau, à `{place}` » |
| `bench_table` | `tableware` | 1 à 2 | deux bancs face à face, « quelqu’un y a installé `{items}` » |
| `library_swap` | aucune | 0 | inchangée, sans objet |
| `statue_makeover` (ex `statue_sunglasses`) | `wearable` | 1 à 2 | « à `{place}`, la statue porte `{items}` » |
| `vip_entrance` (ex `red_carpet`) | `welcome` | 1 à 2 | « quelqu’un a installé `{items}` devant `{place}` » |

Les identifiants cités par les tests et la spec du playground (`laundry_line`, `rubber_ducks`) sont conservés.

Deux listes de scènes sont resserrées à la relecture des textes générés : `rubber_ducks` ne se passe plus que sur une fontaine (une place n’a pas forcément d’eau), et `library_swap` seulement dans une bibliothèque ou une librairie (une épicerie n’a pas de rayon « romans policiers »).

**Règles d’écriture, pour se passer de grammaire.**
- Un objet n’est jamais sujet d’un verbe (« on y a étendu `{items}` », pas « `{items}` sèchent ») : le verbe ne dépend ni du nombre ni du genre des objets.
- Un objet n’est jamais placé juste après « de » ou « à » (« de le caleçon » ne se contracte pas). Vérifié au chargement par une expression simple sur les gabarits.
- Pas de pronom ni de participe accordé avec un objet (« a laissé tomber `{item}` trois fois », pas « l’a posée »).
- `{place}` est utilisé tel quel, avec « à », « près de », « devant » : les noms réels portent déjà leur nom commun (« Statue du Poète »).
- Une révélation cite au plus un objet, `{item}`, sous sa forme définie.

**Rendu.** `render.ts` gagne une fonction de jointure (« a », « a et b », « a, b et c »). `{items}` = formes indéfinies jointes ; `{item}` = forme définie du premier objet tiré. Variables autorisées : situation `{place}`, `{time}`, `{items}` ; révélation `{author}`, `{place}`, `{item}`.

**Génération.** Dans `buildCandidate`, après le choix du motif : nombre tiré entre `min` et `max`, puis objets pris dans la réserve mélangée du scénario (tous différents). Le tirage utilise le générateur de la seed, donc reste déterministe. Les enquêtes d’une même seed changent par rapport à aujourd’hui : sans conséquence, les tests vérifient des propriétés.

**Validation du catalogue** (`catalog.ts`). Identifiants d’objets uniques, formes non vides, au moins une étiquette ; par scénario : `0 ≤ min ≤ max`, au moins `max` objets portant ses étiquettes, `{items}` présent dans la situation dès que `min ≥ 1`, aucune variable d’objet quand `max = 0`, `min ≥ 1` dès que `max ≥ 1` (une situation ne peut pas avoir une liste vide), aucun objet après « de » ou « à ».

**Règle `items-match-scenario`** (`rules.ts`). Objets connus, distincts, d’étiquette acceptée, en nombre permis. Le scénario est lu dans le catalogue du contexte ; le test de référence des règles passe à un scénario réel sans objet.

**Filet de sécurité sur les textes.** Un test rend chaque scénario avec chaque objet de sa réserve, pour la situation et pour chaque révélation, et vérifie qu’il ne reste ni variable ni article non contracté.

## Risks / Trade-offs

- [Une combinaison d’objets peut être moins drôle qu’une farce écrite à la main] → les étiquettes limitent les mélanges ; on retire un objet ou une étiquette au fil des essais dans le playground.
- [Une phrase maladroite avec un objet précis] → le test exhaustif des textes attrape les erreurs mécaniques ; la relecture se fait dans le playground.
- [Deux identifiants de scénario changent] → aucun test ni spec ne les cite ; une seed donnera une autre enquête, comme pour tout changement de tirage.
- [Révélations plus génériques, donc moins savoureuses] → elles gardent un objet cité ; l’option 2 (petit mot) reste possible plus tard.
