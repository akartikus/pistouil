# Pistouil

<!-- PROJECT-SPECIFIC: rewrite for each project. -->

Jeu d'enquête solo (mobile + web) : chaque mystère est généré à partir des vrais lieux OpenStreetMap, résolu par déduction (alibis contre temps de marche). Cap complet : `docs/VISION.md`.

## Stack

SvelteKit statique (adapter-static, `ssr = false`), TypeScript strict, Vitest, MapLibre + pmtiles, Capacitor.

## Règles à ne jamais enfreindre

- Aucune requête réseau pendant une partie.
- Mystères uniquement sur des lieux de rôle `scene` (publics, non sensibles) ; personnages toujours fictifs ; seul l'auteur ment.
- Pas de logos ni de photos de bâtiments.
- `src/lib/engine` est du code pur : ni Svelte, ni DOM, ni carte, ni réseau, ni `Math.random`.

## Conventions

- Fichiers et dossiers en anglais ; identifiants du modèle métier en anglais (voir `docs/reference/DATA-MODEL.md`) ; textes du jeu et documents en français.
- Un brief = un changement OpenSpec ; un ajustement hors brief (outil de test, correction, contenu) est aussi un changement OpenSpec. Si une décision contredit `docs/VISION.md`, mettre ce fichier à jour d'abord.

## Structure

| Chemin | Contenu |
| --- | --- |
| `src/lib/engine` | Génération, solveur, trajets |
| `src/lib/data` | Chargement, cache, stockage |
| `src/lib/map` | Composants de carte |
| `src/lib/game` | Zone, session dans un Worker, progression, déduction, révélation, sauvegarde, écrans de jeu |
| `src/lib/playground` | Logique de la page de test du moteur (`/playground`, développement seulement) |
| `catalog/` | Catalogue JSON (types de lieux, indices, scénarios, objets) |
| `tools/data-preparation/` | Scripts Python OSM |
| `tools/map-tiles/` | Extraction des tuiles de la carte (PMTiles) et glyphes |
| `static/map/` | Style, polices, icônes |
| `docs/` | Vision, référence, briefs |
| `guide/` | Guides pratiques (méthode OpenSpec, fonctionnement du moteur) |
| `openspec/` | Specs (`specs/`), changements (`changes/`), config |

## Commandes

`npm run dev` · `npm run test` · `npm run check` · `npm run lint` · `npm run build`

## Méthode de travail (OpenSpec)

Les changements passent par les skills OpenSpec de `.agents/skills/` (propose → apply → archive). Ne lire que ce que la tâche exige :
`docs/VISION.md` (cap, périmètre), `docs/reference/DATA-MODEL.md` (types, cohérence, solveur), et uniquement le brief en cours dans `docs/briefs/`. Procédure : `README.md`.

Pour comprendre l'existant sans tout lire : `openspec list --specs`, puis la spec de la capability concernée dans `openspec/specs/`, puis uniquement les fichiers cités par le changement. Chercher avec grep avant d'ouvrir un fichier entier.

<!-- GENERIC: reusable as is. -->

## Style de code

Développeur senior : le strict minimum, et l'existant d'abord.

- Faire uniquement ce que la tâche demande : pas de fonctionnalité, d'option ni d'abstraction « au cas où ».
- Avant d'écrire, chercher dans le dépôt, puis dans les dépendances déjà installées (`package.json`), puis dans la plateforme. Réutiliser ou étendre ; n'inventer qu'en dernier recours.
- Avant d'utiliser l'API d'une bibliothèque, consulter sa documentation à jour via le MCP `context7` (`.mcp.json`) plutôt que de se fier à la mémoire.
- Ne pas ajouter de dépendance sans nécessité claire ; la signaler et la justifier.
- Petites modifications, localisées : ne pas refactorer, reformater ni renommer en dehors du périmètre.
- Suivre les conventions et le style des fichiers voisins. Commenter uniquement les passages complexes ou non évidents, en anglais, en phrases simples et aussi courtes que possible ; jamais de commentaire qui répète le code.
- Pas de gestion d'erreur ni de validation pour des cas impossibles ; valider aux frontières (entrées externes, stockage, saisie).
- Code simple et lisible plutôt que malin. Tester le comportement, pas l'implémentation ; tests à côté du code, en `*.spec.ts`.
- En cas de doute sur le périmètre, s'en tenir au brief et à la spec du changement ; si un besoin dépasse, le signaler et attendre.
- Ne jamais commiter ni pousser sans demande explicite.
- Ne jamais ajouter Claude (ni aucune IA) en co-auteur : pas de ligne `Co-Authored-By` ni de mention de génération dans les commits et pull requests.
