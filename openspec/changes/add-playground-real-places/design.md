# Design

## Context

Dépend de `engine-playground` (`openspec/specs/engine-playground/spec.md`) pour la page et ses vues, et de `osm-place-extraction` (`openspec/specs/osm-place-extraction/spec.md`) pour le format des fichiers et la grille. `Place` et `Route` sont ceux de `docs/reference/DATA-MODEL.md` : le moteur ne sait pas d'où viennent les lieux, donc rien ne change dans `src/lib/engine`. Aucun brief ne prévoit la conversion fichier → `Place` ; le brief 05 écrira le vrai chargement des cases. Voir `proposal.md` pour la motivation.

## Goals / Non-Goals

**Goals:**
- Essayer le moteur sur quelques dizaines de vrais lieux, sans toucher au moteur ni au modèle.
- Logique pure et testée dans `src/lib/playground/`, lecture des fichiers seulement dans la page.

**Non-Goals:**
- Préfigurer le chargeur du brief 05 : cette conversion pourra être jetée ou reprise, sans engagement.
- Horaires réels et trajets réels (briefs 03 et suite).

## Decisions

**Fichiers lus par `fetch` depuis `static/dev-data/`.** On y copie (ou on y lie) la sortie du script : `manifest.json` et `places/{ligne}_{colonne}.json`. Le dossier est ignoré par git. Alternative : `import.meta.glob` sur `tools/data-preparation/out/`, rejetée car la page est compilée aussi en production et le glob créerait des milliers de morceaux. Le `fetch` est une lecture de fichiers locaux du serveur de développement ; il ne concerne pas une partie (la page est réservée au développement).

**Cases voisines du centre.** On lit `manifest.json` pour les pas de la grille, on calcule la case du centre avec la même formule entière que le script (`floor(round(x × 100000) / pas)`), et on charge les 3 × 3 cases autour. Une case absente (404) est simplement une case vide. Avec des cases de 2 km, 3 × 3 couvre au moins 2 km autour du centre, largement assez pour quelques dizaines de lieux. Alternative : lister les cases disponibles et chercher la plus proche, plus de code pour un outil de test.

**Sélection : les N plus proches.** Distance à vol d'oiseau (haversine) entre le centre et chaque lieu ; tri par distance puis par `osmId` pour rester déterministe ; on garde N (40 par défaut). Alternative : une sélection variée par type pour garantir une enquête possible. Rejetée : la génération peut échouer, et la page affiche déjà la raison de l'échec ; l'utilisateur ajuste le centre ou N.

**Conversion.** `type` → `typeId`, `removed` par défaut à `false`, `openingHours` ignoré (le moteur applique les horaires typiques du catalogue, comme le dit le modèle tant que la source des vrais horaires n'est pas trouvée). Les types absents du catalogue sont ignorés : le script les tire du même catalogue, donc ce cas n'arrive qu'avec des fichiers anciens.

**Trajets à vol d'oiseau.** Mêmes constantes que `richRoutes` : distance haversine × 1,3, arrondie au mètre, durée `ceil(distance / 83,3)` avec un minimum de 1 minute. Les constantes sont reprises dans le nouveau module plutôt que d'extraire une fonction de `fixtures.ts`, pour ne pas modifier du code hors périmètre. Le résultat est une `Route[]` complète : `assertCompleteMatrix` du moteur reste satisfait.

**Une page, deux sources.** La liste de lieux et de trajets passée à `runPlayground` devient une valeur dérivée de la source choisie. L'état des lieux actifs est réinitialisé à tous les lieux quand la source ou la sélection change. Les lieux de test restent la source par défaut.

## Risks / Trade-offs

- [Les N plus proches peuvent manquer de lieux de rôle `scene` ou d'un type voulu par un scénario] → la page affiche déjà l'échec et sa raison ; augmenter N ou déplacer le centre.
- [Les trajets à vol d'oiseau peuvent contredire un vrai trajet à pied (rivière, voie ferrée)] → acceptable pour juger la génération ; signalé dans la page, remplacé au brief 03.
- [Matrice carrée en N²] → N de quelques dizaines, soit au plus quelques milliers de paires.
- [`static/dev-data` copié dans `build/` si présent en local] → ignoré par git et absent de la CI ; la route reste en 404 en production.

## Open Questions

- Aucune qui change le plan.
