# Proposal

## Why

Le thème sombre éblouit et mélange trop de couleurs. Mesuré : les cadres blancs sur noir font un contraste de **21:1** (le maximum possible), les ombres jaunes de 11,5:1 sur le fond, et le lien « Fiche ▸ » en jaune sur l'en-tête blanc de seulement **1,4:1** (presque illisible). Les en-têtes, l'onglet actif, les boutons pleins et « Nouvelle enquête » deviennent de grands aplats blancs. Cause : une seule variable, `--ink`, sert au texte, aux cadres et aux aplats inversés ; en sombre elle vaut blanc partout. Correction de design hors brief, donc changement OpenSpec (`AGENTS.md`).

## What Changes

- **Rôles de couleur séparés** : `--ink` (texte), `--frame` (cadres), `--shadow` (ombres dures), `--strong` / `--on-strong` (barres et pastilles), `--solid` / `--on-solid` (boutons pleins et sélections). Le thème clair garde exactement ses valeurs.
- **Palette sombre rééquilibrée** : noir et bleu nuit conservés ; texte blanc cassé ; cadres en ardoise (6:1 au lieu de 21:1) ; ombres en ardoise sombre ; en-têtes et pastilles en ardoise relevée ; **le jaune seul devient la couleur forte** (boutons pleins, sélection, onglet actif, bulle d'aide, lieux de l'enquête) ; plus aucun grand aplat blanc.
- **Contrastes vérifiés par un test** (`colors.spec.ts`) : texte, cadres, jaune et textes sur aplats, plus l'égalité des valeurs du thème clair.
- Mise à jour de `docs/design/direction.md` (palette et thème sombre) et de `docs/VISION.md` (décision).

**Exclu** : le thème clair, le fichier de style de la carte `style-dark.json`, un thème automatique selon l'heure, de nouvelles illustrations.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `game-screens`: nouvelle exigence « Thème sombre équilibré » (contrastes, pas de grand aplat blanc, jaune réservé à l'action, thème clair inchangé).

## Impact

- `src/lib/game/app.css` (jetons et règles de base), `src/routes/play/+layout.svelte`, `src/routes/play/suspects/+page.svelte`, `src/routes/play/carnet/+page.svelte`, `src/routes/play/carte/+page.svelte`, `src/routes/play/reveal/+page.svelte`, `src/routes/reglages/+page.svelte`, `src/lib/game/ui/Piece.svelte`, `src/lib/game/ui/FactCard.svelte`, `src/lib/map/Map.svelte`, `src/lib/map/theme.ts`.
- `docs/design/direction.md`, `docs/VISION.md`. Aucune dépendance ajoutée, aucun changement de logique ni de données.
