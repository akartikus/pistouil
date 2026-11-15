# Pistouil

Jeu d'enquête solo, mobile et web : des mystères générés à partir des vrais lieux OpenStreetMap, résolus par déduction. Cap et décisions : [`docs/VISION.md`](docs/VISION.md).

## Démarrer

```sh
npm install
npm run dev      # développement (page de test du moteur : /playground)
npm run test     # tests
npm run check    # types
npm run lint     # format + lint
npm run build    # build statique dans build/
```

Prérequis : Node.js 20+. Plus tard : Android Studio / Xcode (étape 6), Python 3 + osmium-tool (étape 2).

## Guides

- [`guide/OPENSPEC.md`](guide/OPENSPEC.md) : la méthode de travail, pas à pas.
- [`guide/ENGINE.md`](guide/ENGINE.md) : comment fonctionne le moteur (couches, faits, solveur, règles).

## Travailler avec OpenSpec

Chaque étape de la feuille de route (`docs/VISION.md` §7) est un brief (`docs/briefs/`) traité comme **un changement** OpenSpec. On demande l'action à l'assistant en langage naturel ; il utilise les skills de `.agents/skills/`.

1. **Relire le cap** : `docs/VISION.md`, puis le brief de l'étape.
2. **Proposer** : « Crée un changement OpenSpec à partir de `docs/briefs/01-generation-engine.md`, en suivant la consigne à la fin du brief. Ne code rien. » → `openspec/changes/<nom>/`
3. **Relire la proposition** avant tout code : périmètre = celui du brief ; chaque exigence a ses scénarios ; tâches petites, tests d'abord ; rien ne contredit `VISION.md`.
4. **Appliquer** : « Implémente le changement `<nom>`, tâche par tâche. » Lancer `npm run test` après chaque groupe de tâches.
5. **Terminé quand** : tâches cochées, tests verts, critères d'acceptation du brief remplis.
6. **Archiver** : « Archive le changement `<nom>`. » → specs fusionnées dans `openspec/specs/`, changement daté dans `openspec/changes/archive/`.
7. **Mettre à jour le cap** : cocher l'étape dans `VISION.md` §7, noter les décisions au §6, puis **commit**.

Règles : un brief = un changement ; si un principe de `VISION.md` est remis en cause, trancher d'abord dans `VISION.md` ; un imprévu = un nouveau brief, pas un ajout au changement en cours. Un ajustement demandé hors brief (outil de test, correction, contenu) est aussi un changement OpenSpec, nommé d’après son objet.

## Documents

| Fichier | Rôle |
| --- | --- |
| `docs/VISION.md` | Cap, principes, décisions, feuille de route |
| `docs/reference/DATA-MODEL.md` | Modèle de données, règles de cohérence, solveur |
| `docs/briefs/` | Un brief par étape |
| `openspec/` | Specs, changements, archives, config |
| `AGENTS.md` | Règles pour les assistants de code (`CLAUDE.md` l'importe) |
