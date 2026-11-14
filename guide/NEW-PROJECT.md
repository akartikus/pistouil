# Nouveau projet avec la même méthode

## Ce qui se copie tel quel
- `openspec/config.yaml` : bloc `rules` (marqué GENERIC)
- `AGENTS.md` : section « Style de code » (marquée GENERIC)
- `.mcp.json`, `.env.example`, `.gitignore` (lignes `/guide/` et `.env`)
- `guide/OPENSPEC.md`

## Ce qui se réécrit
- `openspec/config.yaml` : bloc `context` (projet, documents de référence, langue)
- `AGENTS.md` : titre, Stack, Règles à ne jamais enfreindre, Conventions, Structure, Commandes
- `docs/VISION.md`, `docs/reference/`, `docs/briefs/`

## Étapes
1. Créer le dépôt, puis `npm install -g @fission-ai/openspec@latest` et `openspec init` (choisir l'assistant).
2. Copier les fichiers « tel quel », puis réécrire les autres.
3. Écrire `docs/VISION.md` : objectif, principes non négociables, décisions, feuille de route.
4. Écrire un brief par étape (objectif, dépend de, à lire, périmètre inclus / exclu, exigences, critères d'acceptation, points à trancher, consigne OpenSpec).
5. Si les chemins ou noms des documents changent, mettre à jour la liste du `context` : les `rules` s'y réfèrent (cap, modèle, brief).
6. Vérifier : `openspec new change x`, `openspec instructions proposal --change x` (les `rules` s'affichent, sans avertissement YAML), puis supprimer `x`.
7. Premier commit, puis le cycle de `guide/OPENSPEC.md`.

## Pièges
- Dans `config.yaml`, une règle contenant « : » doit être entre guillemets, sinon OpenSpec ignore tout l'artefact.
- Mots-clés de specs en anglais (`SHALL`, `WHEN`/`THEN`), sinon `validate --strict` échoue.
- Un brief = un changement.
