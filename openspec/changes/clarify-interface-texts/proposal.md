# Proposal

## Why

Les textes de l'interface emploient des mots du métier que le joueur ne connaît pas : « pièce » (on ne sait pas si c'est une pièce de la maison), « scène », « graine », « Données : provence-alpes-cote-d-azur-latest.osm.pbf@2026-11-15… ». Le guide du départ, qui doit expliquer le jeu, est le plus concerné. Les horaires d'ouverture des lieux s'affichent tels qu'OpenStreetMap les écrit (`Mo-Sa 08:30-20:00; PH off`). Enfin, « Je me localise » est proposé alors que la position n'a pas encore été essayée sur un appareil (brief 06). Ajustement hors brief, donc changement OpenSpec (`AGENTS.md`).

## What Changes

- **Vocabulaire sans jargon** : un guide de vocabulaire (`docs/design/wording.md`) fixe un mot par notion (indice et témoignage, lieu du mystère, temps de marche, numéro de l'enquête) et les mots à éviter. Tous les textes de `texts.ts` sont relus avec lui : guide, messages d'erreur, verdicts, carnet, fiches, Réglages. Les libellés de boutons déjà clairs ne changent pas.
- **Guide de départ réécrit** : trois bulles qui disent quoi faire et pourquoi (une farce a eu lieu, quoi toucher, comment vérifier un alibi).
- **Réglages lisibles** : « numéro de l'enquête » au lieu de « graine » ; la date des données en français (« 15 novembre 2026 ») au lieu du nom du fichier source.
- **Boutons de trajet expliqués** : une étiquette « Calculer le trajet à pied » au-dessus de « Vers le lieu du mystère » et « Vers un autre lieu » dans le panneau d'un lieu, pour dire à quoi ils servent.
- **« Je me localise » grisé** tant que la localisation n'est pas validée sur appareil, avec la mention « Bientôt disponible ». Un seul réglage dans le code à repasser à `true` ensuite.
- **Horaires d'ouverture en français** : jours, heures, fermetures, jours fériés, mois et dates traduits (`lun.–sam. 8h30–20h ; dim. 8h30–12h30 ; fermé les jours fériés`), dans le panneau d'un lieu de décor.
- **Garde-fou** : un test vérifie qu'aucun texte de l'interface n'emploie un terme interne interdit.
- Mise à jour de `docs/VISION.md` (décisions) et du brief 06 (réactiver « Je me localise »).

**Exclu** : les textes générés par le moteur (situation, indices, témoignages, révélation), dont l'écriture est un autre chantier ; les noms des écrans et des boutons déjà compréhensibles ; l'ajout de langues ; la réactivation de la localisation elle-même (brief 06).

## Capabilities

### New Capabilities

- `opening-hours-display`: traduction en français simple des horaires d'ouverture écrits dans la syntaxe d'OpenStreetMap.

### Modified Capabilities

- `game-screens`: guide de départ, Réglages et fiches de suspect reformulés ; localisation grisée tant qu'elle n'est pas disponible ; exigence de textes compréhensibles.
- `map-display`: les horaires d'un lieu de décor s'affichent traduits, plus « bruts ».

## Impact

- `src/lib/game/texts.ts` (tous les textes) et son nouveau test `texts.spec.ts` ; `src/routes/+page.svelte` (bouton grisé) ; `src/routes/reglages/+page.svelte` ; fiches de suspect, carnet et panneau d'un lieu pour les libellés qu'ils lisent dans `texts`.
- `src/lib/map/opening-hours.ts` (nouveau, pur) et `features.ts` pour l'appliquer aux horaires des lieux.
- `docs/design/wording.md` (nouveau), `docs/VISION.md`, `docs/briefs/06-offline-mobile.md`.
- Aucune dépendance ajoutée ; aucun changement du moteur ni des données.
