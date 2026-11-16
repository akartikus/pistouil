# Design

## Context

Dépend de `investigation-generation` (`openspec/specs/investigation-generation/spec.md`, matrice complète et liens « débloqué par » à l’intérieur d’un lieu), `investigation-solver` (`openspec/specs/investigation-solver/spec.md`, `contradicts`, `solve`), `pedestrian-routing` (`openspec/specs/pedestrian-routing/spec.md`, trajets et approximation), `commune-index` et `osm-place-extraction` (index, lieux, grille), `map-display` et `map-style` (carte), et `catalog`. Les types (`Investigation`, `Fact`, `Progress`…) sont ceux de `docs/reference/DATA-MODEL.md` §4 et §5. Les écrans sont dessinés dans `docs/design/` (`direction.md`, `screens-mockup*.png`). Le playground a déjà `discoveredFactIds` et `checkAccusation`. Voir `proposal.md` pour la motivation et les décisions prises en exploration.

## Goals / Non-Goals

**Goals:**
- Une enquête jouable de bout en bout à Fuveau, conforme aux croquis.
- Aucune donnée cachée lisible côté interface avant l’accusation.
- Un maximum de logique pure et testée ; le reste (Worker, composants) fin.

**Non-Goals:**
- Hors-ligne complet, cache des tuiles, application native (brief 06).
- Limite de visites, score, partage, textes réécrits par IA.
- Finitions du design (étape 8) ; liens « débloqué par » entre lieux (futur brief, changement du moteur).

## Decisions

**Le Worker est la frontière de confiance.** Il charge la zone, calcule les trajets, génère l’enquête et la garde. L’interface lui envoie des actions (`start`, `resume`, `open`, `measure`, `accuse`) et reçoit des vues : la projection au départ, les faits d’un lieu quand on l’ouvre, un trajet quand on le mesure, la révélation après l’accusation. Aucun type privé (`author`, `lie`, `motive`, `lieKind`, `segments`, `revelationText`) ne figure dans les messages avant l’accusation, et un test le vérifie en sérialisant tout ce que l’interface a reçu. Alternative : filtrer côté interface une enquête complète, rejetée car le critère d’acceptation exige que rien de caché n’y soit lisible.

**Un gestionnaire pur derrière le Worker.** `handle(state, message) → { state, reply }` est une fonction pure dans `src/lib/game/` ; le fichier du Worker ne fait que brancher `postMessage`. Les parcours (démarrer, ouvrir, mesurer, accuser) se testent donc dans vitest (environnement Node, sans DOM).

**Lieux retenus : les 40 plus proches utilisables.** La matrice du moteur est quadratique : on retient au plus 40 lieux utilisables (rôle `scene` ou `alibi`, non retirés) les plus proches du centre, départagés par identifiant OSM ; c’est ce qui a donné 60 enquêtes sur 60 à Fuveau. Le rayon passe de 500 m à 1, 2, puis 4 km jusqu’à 6 lieux utilisables dont 2 scènes (`DATA-MODEL.md` §5). Tous les lieux reconnus de la zone (rayon plus 1 km) restent pour le décor de la carte et sont renvoyés par le Worker.

**Faits, mesures et déduction.** Ouvrir un lieu renvoie tous ses faits : les liens « débloqué par » sont dans un même lieu, donc `discoveredFactIds` les résout en un coup. Les trajets sont gardés dans le Worker et livrés seulement à la mesure (option B). Pendant la partie le jeu ne conclut rien : il donne la durée du trajet que le joueur mesure, rien de plus. À l’accusation, la révélation contient aussi les trajets entre les lieux de l’enquête, et le Carnet explique alors la partie : incohérences (écart inférieur au trajet, écart nul compris ; deux faits d’un même lieu ne sont pas signalés) et alibis suffisants. L’alibi suffisant compare l’écart d’un fait à l’heure du mystère avec le trajet lieu ↔ scène ; les phrases sont conditionnelles (« si ce fait est vrai ») car un témoignage d’un suspect non innocenté n’est pas fiable, et le jeu ne le sait pas pour le joueur.

**Progression et sauvegarde.** `Progress` du modèle gagne `measuredRoutes` (paires de lieux) et `alibiStatuses` (suspect → à vérifier, douteux, vérifié) ; `discoveredFactIds` se déduit des lieux ouverts, qu’on sauvegarde à la place. La sauvegarde (`@capacitor/preferences`, déjà installé, qui retombe sur le stockage du navigateur sur le web) contient version de format, graine, difficulté, zone (centre, rayon), version des données (date de l’extrait du manifeste) et progression, jamais de donnée cachée. À la reprise le Worker régénère l’enquête ; si la version des données a changé, le jeu le dit.

**Données.** L’adresse des données (`VITE_DATA_URL`, `/dev-data` en développement) donne `manifest.json`, `communes.json`, `places/` et `graph/` ; elles sont chargées avant la partie (le hors-ligne et le cache sont au brief 06). Le chargement est une fonction qui prend `fetch` en paramètre, donc testable avec de faux fichiers et utilisable dans le Worker.

**Rejeu de la soirée.** À l’accusation, le Worker renvoie les séjours de chaque suspect et les trajets entre séjours consécutifs ; `positionAt(soirée, heure)` interpole le long du tracé (ligne droite si approximatif). C’est une fonction pure ; la carte ne fait que placer des pastilles.

**Carte.** `Map.svelte` gagne des événements (toucher un lieu ou une pastille de suspect), des pastilles de suspects (DOM comme les marqueurs numérotés) et une attribution en bouton « i » dépliée à l’affichage ; il ne décide de rien. Les couleurs et le registre brutaliste viennent de `docs/design/`.

**Écrans.** Routes SvelteKit statiques : `/` départ, `/play/carte`, `/play/carnet`, `/play/suspects`, `/play/suspects/[id]`, `/reglages`, avec une coquille commune (en-tête, barre d’onglets). L’état de l’interface est un magasin à runes (`src/lib/game/`) qui parle au Worker et à la sauvegarde. Les pièces utilisent `icon` et `label` des types d’indice (catalogue) ; les têtes sont des visages dessinés par le code d’après l’identifiant du suspect.

**Catalogue.** `ClueType` gagne `icon?` et `label?`, renseignés pour les 15 types : 5 objets de preuve (ticket de caisse, addition, titre de transport, fiche de prêt, reçu postal) et un pictogramme de personne pour les 10 PNJ, dont le libellé précise le rôle (« Serveur », « Gardien »…).

## Risks / Trade-offs

- **Taille du changement** : c’est le plus gros brief. Les tâches sont découpées en tranches (logique pure, Worker, carte, écrans, révélation, test de jeu) pour pouvoir s’arrêter proprement entre deux.
- **Reprise et données** : changer les fichiers de données change la génération. On sauvegarde la version et on prévient, au lieu de rejouer une autre enquête en silence.
- **Chargement des cases** : en zone dense, beaucoup de cases (surtout de graphe, jusqu’à 500 Ko) à télécharger avant la partie ; à mesurer sur Fuveau et Marseille, le hors-ligne étant traité au brief 06.
- **Worker sous Vite** : le Worker de MapLibre a déjà demandé une configuration particulière ; celui du jeu utilise `new Worker(new URL(…, import.meta.url), { type: 'module' })`, à vérifier en développement et en production (`npm run build`).
- **Verdicts de déduction** : un message trop affirmatif révélerait l’auteur ; d’où les phrases conditionnelles et la mention de fiabilité réservée aux preuves et PNJ.
- **Géolocalisation** : sur le web, `navigator.geolocation` (le plugin Capacitor la relaie) ; un refus doit toujours laisser la recherche de commune.
