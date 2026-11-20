# Design

## Context

Aucun workflow n'existe (`.github/` absent). Les contrôles sont déjà des scripts `package.json` : `check`, `lint`, `test`, `build` (`postbuild` supprime `build/dev-data`). Le dépôt est privé : les minutes Linux comptent, d'où les garde-fous. Voir `proposal.md` (Why) et `docs/briefs/07-ci-cd.md` (partie A). Aucune capability existante de `openspec/specs/` n'est concernée.

## Goals / Non-Goals

**Goals:**
- Un seul fichier `.github/workflows/test.yml`, court, lisible de haut en bas.

**Non-Goals:**
- Builds mobiles, tests Python de `tools/data-preparation/`, matrices de versions.

## Decisions

- **Déclencheurs** : `pull_request` et `push` sur `master` seulement, pas de push de branche (décision proposée par le brief). Alternative : tout push, rejetée pour les minutes.
- **Node 22**, comme `@types/node` (`^22`), via `actions/setup-node` avec `cache: npm`. Pas de matrice.
- **Actions** : `actions/checkout` et `actions/setup-node`, seules actions officielles nécessaires. Versions fixées à une version précise vérifiée dans leur documentation au moment de l'implémentation (pas de `@main` ni de tag flottant). Alternative : SHA de commit, plus sûr mais moins lisible ; non retenu car les actions sont officielles.
- **Étapes** : `npm ci`, `npm run check`, `npm run lint`, `npm run test`, `npm run build`, dans cet ordre (du plus rapide au plus lent), un seul job. Alternative : un job par étape, rejetée : réinstaller à chaque job coûte plus de minutes.
- **Coût** : `concurrency` par référence avec `cancel-in-progress`, `timeout-minutes` sur le job (valeur choisie après avoir mesuré une exécution réelle).
- **Droits** : `permissions: contents: read`. Aucun `secrets.*` dans le fichier.
- **Protection de `master`** : réglage GitHub, hors dépôt, à faire si le plan le permet ; la tâche finale l'enregistre dans le README.

## Risks / Trade-offs

- [Protection de branche indisponible sur dépôt privé gratuit] → discipline d'équipe : vérifier le statut avant de fusionner, notée dans le README.
- [`npm run build` dépend de fichiers locaux absents en CI, ex. `static/dev-data` ignoré par git] → vérifier au premier essai ; si le build échoue pour cette raison, le signaler plutôt que contourner.
- [Durée maximale trop courte ou trop large] → mesurer la durée réelle puis fixer la limite avec une marge.
