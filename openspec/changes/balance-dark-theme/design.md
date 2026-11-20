# Design

## Context

Les couleurs de l'interface sont des variables CSS dans `src/lib/game/app.css` (`:root` pour le clair, `:root[data-theme='dark']` pour le sombre). Celles de la carte (repères, étiquettes) viennent de `GAME_COLORS` dans `src/lib/map/theme.ts`, relayées à `Map.svelte`. Le style de fond de carte est à part (`static/map/style-dark.json`) et ne change pas. Voir `docs/design/direction.md` (palette) et `proposal.md` (Why).

Le problème vient des **rôles**, pas des valeurs. `--ink` sert à trois choses : le texte, les cadres (`border: 3px solid var(--ink)`) et les aplats inversés (`background: var(--ink); color: var(--paper)`, environ 70 déclarations dans 11 fichiers). En clair, `--ink` est noir et les trois usages sont corrects. En sombre, `--ink` est blanc : texte blanc (bien), cadres blancs sur noir (21:1, éblouissant) et aplats inversés blancs (en-têtes, boutons pleins, pastilles, onglet actif de Carnet). Les ombres sont jaunes, ce qui ajoute une deuxième couleur criarde. `direction.md` prévoyait pourtant, en sombre, des cadres et ombres jaunes.

## Goals / Non-Goals

**Goals:**
- Garder le caractère brutaliste (cadres épais, ombres dures, monospace, noir) avec une seule couleur forte.
- Des contrastes mesurables, vérifiés par un test.

**Non-Goals:**
- Toucher au thème clair, au style de carte sombre, ou ajouter un thème automatique.

## Decisions

- **Cinq rôles au lieu d'un.** `--ink` ne garde que le texte ; `--frame` pour les cadres ; `--shadow` pour les ombres ; `--strong` et `--on-strong` pour les barres et pastilles (en-têtes, heure du curseur, compteurs, titres) ; `--solid` et `--on-solid` pour les boutons pleins et les sélections. En clair, ils valent tous ce que valait `--ink` ou `--paper` : rien ne bouge.
- **Valeurs du thème sombre :**

| Jeton | Clair (inchangé) | Sombre | Contraste (sombre) |
| --- | --- | --- | --- |
| `--bg` | `#F2EFE7` | `#15202B` | |
| `--paper` | `#FFFFFF` | `#0B1218` | |
| `--ink` | `#000000` | `#E6ECF2` | 15,8:1 sur `--paper` |
| `--dim` | `#555555` | `#9FB0C1` | 8,5:1 sur `--paper` |
| `--frame` | `#000000` | `#8195AA` | 6,1:1 sur `--paper` (3:1 requis) |
| `--shadow` | `#000000` | `#3B4E63` | 1,9:1 sur `--bg` (visible, calme) |
| `--strong` / `--on-strong` | `#000000` / `#FFFFFF` | `#1F2E3E` / `#E6ECF2` | 11,6:1 |
| `--solid` / `--on-solid` | `#000000` / `#FFFFFF` | `#FFD400` / `#000000` | 14,7:1 |
| `--accent` | `#FF8A00` | `#FFD400` | 13,2:1 sur `--paper`, 9,7:1 sur `--strong` |
| `--mystery`, `--route` | inchangés | inchangés | 6,2:1 et 10,0:1 sur `--paper` |

- **Le jaune est la seule couleur forte.** Il marque : le bouton principal ou sélectionné, l'onglet actif, la bulle d'aide, les lieux de l'enquête (déjà jaunes) et les liens sur barres. Il ne sert plus aux cadres ni aux ombres, ce qui lui rend son sens. Alternative écartée : cadres jaunes (comme le prévoyait `direction.md`) : trop d'aplats jaunes dilueraient « jaune = lieu de l'enquête », règle de la palette.
- **Les aplats inversés deviennent de l'ardoise relevée**, pas du blanc : en sombre, la hiérarchie se fait par l'élévation (plus clair que le fond) et non par l'inversion. Alternative écartée : un blanc adouci (`#B7C4D1`) : le gros aplat des boutons éblouirait encore.
- **Test `colors.spec.ts`** : lit `app.css`, vérifie les contrastes du tableau, que les valeurs du thème clair n'ont pas bougé et que `GAME_COLORS.dark` reprend celles du CSS (`ink`, `paper`, `shadow`, `frame`).
- **Ordre de la reprise** : (1) jetons et règles de base de `app.css`, (2) fichiers un par un en remplaçant `border: … var(--ink)` par `--frame`, les paires `background: var(--ink); color: var(--paper)` par `--strong` ou `--solid` selon le rôle, (3) `Map.svelte` et `theme.ts`.

## Risks / Trade-offs

- [Une reprise de 70 déclarations peut oublier un endroit] → capture des dix écrans en sombre et mesure automatique : aucun cadre ni grand aplat en blanc pur, plus les écrans en clair comparés avant et après.
- [Ardoise et jaune sont un choix de goût] → les valeurs sont dans un seul bloc de `app.css` ; un réglage ne touche que ce bloc et `theme.ts`.
- [Cadres moins forts qu'en blanc] → 6:1 reste très lisible, et l'épaisseur de 3 px et les ombres dures gardent le caractère brutaliste.
