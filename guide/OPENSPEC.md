# OpenSpec : guide pratique

Un brief (`docs/briefs/`) = un changement. Chaque changement suit le même cycle.

## Les skills

| Skill | Quand | Résultat |
| --- | --- | --- |
| `openspec-explore` | Idée floue, choix technique à débattre, avant de proposer | Rien d'écrit sans ton accord, aucun code |
| `openspec-propose` | Le brief est clair, on veut le plan | `openspec/changes/<nom>/` : proposal, specs, design, tasks. Aucun code |
| `openspec-update-change` | Le plan doit changer (relecture, décision prise en route) | Artefacts du plan corrigés et cohérents. Aucun code |
| `openspec-apply-change` | Le plan est relu et validé | Code + tests, tâches cochées une à une |
| `openspec-sync-specs` | Rarement : mettre à jour `openspec/specs/` sans archiver | Specs principales à jour |
| `openspec-archive-change` | Tout est fini et vérifié | Specs fusionnées, changement déplacé dans `archive/` |

Les appeler par leur nom (`/openspec-propose`) ou en langage naturel.

## Implémenter une fonctionnalité, pas à pas

1. **Cap** : relire `docs/VISION.md` et le brief de l'étape.
2. **Explorer** (si besoin) : `/openspec-explore` pour trancher les « points à trancher » du brief.
3. **Proposer** : `/openspec-propose` en citant le brief.
   > Crée un changement à partir de `docs/briefs/01-generation-engine.md`, en suivant la consigne à la fin du brief.
4. **Relire le plan** avant tout code :
   - [ ] périmètre = celui du brief, ni plus ni moins
   - [ ] chaque exigence a ses scénarios
   - [ ] tâches petites, tests avant le code
   - [ ] rien ne contredit `VISION.md`
   
   Un défaut ? `/openspec-update-change` puis relire.
5. **Appliquer** : `/openspec-apply-change <nom>`. Après chaque groupe de tâches : `npm run test`, `npm run check`, `npm run lint`.
6. **Vérifier** : tâches cochées, tests verts, critères d'acceptation du brief remplis.
7. **Archiver** : `/openspec-archive-change <nom>`.
8. **Clôturer** : cocher l'étape dans `docs/VISION.md` §7, noter les décisions au §6, puis commit.

## Les 6 briefs sont terminés : et ensuite ?

Le cycle ne change pas, seule l'entrée change : le brief devient une idée à formaliser.

1. `/openspec-explore` sur la colonne « Plus tard » de `VISION.md` §5 (partage, IA, témoins, etc.) pour choisir la suite.
2. Écrire un court brief `docs/briefs/07-<nom-en-anglais>.md` sur le modèle des autres (objectif, périmètre inclus / exclu, exigences, critères d'acceptation).
3. Ajouter la ligne à la feuille de route (`VISION.md` §7) et noter la décision au §6.
4. Suivre le cycle habituel : propose → relire → apply → archive → clôturer.

## Ajouter un bug

| Cas | Marche à suivre |
| --- | --- |
| Le code ne respecte pas la spec (cas simple) | Écrire un test qui échoue, corriger, vérifier `npm run test`. Pas de changement OpenSpec ; message de commit `fix: ...` |
| La spec est fausse ou ne couvre pas ce cas | `/openspec-propose` avec un nom `fix-<nom>` : décrire le bug, le comportement attendu, ajouter le scénario manquant. Puis apply → archive |
| Le bug remet en cause `VISION.md` ou `DATA-MODEL.md` | Trancher et corriger ces documents d'abord, puis procéder comme ci-dessus |

Dans tous les cas : un test de non-régression, et un bug = un changement (ne pas en grouper plusieurs).

## Cas fréquents

| Situation | Action |
| --- | --- |
| Un imprévu apparaît pendant l'apply | Ne pas l'ajouter : nouveau brief, nouveau changement |
| Le plan est faux en cours d'apply | Arrêter, `/openspec-update-change`, reprendre l'apply |
| Une décision remet en cause `VISION.md` | Trancher et mettre à jour `VISION.md` d'abord |
| Je veux réfléchir sans engager de changement | `/openspec-explore` |
| Voir où on en est | `openspec list` · `openspec status --change <nom>` |
| Vérifier le format des specs | `openspec validate --all --strict` |

## Règles de format des specs

Exigences avec `SHALL` / `MUST`, scénarios en `#### Scenario:` avec `WHEN` / `THEN`. Texte en français.
