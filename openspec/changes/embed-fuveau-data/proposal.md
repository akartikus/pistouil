# Proposal

## Why

Le jeu lit aujourd'hui ses données (index des communes, cases de lieux, graphe, tuiles) depuis une adresse fixée à la construction, et l'extrait de la région PACA pèse 609 Mo, sans hébergement prévu : l'APK construit par la CI ne trouve aucune donnée et la recherche de commune ne charge rien. Le cap change : **le jeu ne couvre que Fuveau pour le moment**, avec ses données dans l'application (moins de 50 Mo), et d'autres communes viendront plus tard. Le mode hors ligne par téléchargement de zones, qui prépare un monde de plusieurs communes, n'a plus d'objet. Sources : `docs/briefs/06-offline-mobile.md` (périmètre repris, sauf le téléchargement), `docs/briefs/07-ci-cd.md` (hébergement exclu) et la décision de cap prise en exploration.

## What Changes

- **Écran de départ à deux boutons** : « Je me localise » et « Fuveau ». La recherche de commune et les communes voisines disparaissent.
- **Zone de jeu = Fuveau** : « Je me localise » n'est accepté que dans le contour réel de la commune ; dehors, un message dit que seule Fuveau est disponible. Un seul jeu de données, couvrant le contour agrandi d'une marge de 3 km (rayon de l'enquête de 2 km plus marge de lecture de 1 km depuis le bord).
- **Données embarquées dans l'application** : manifeste, entrée de Fuveau (centre, rectangle, contour), cases de lieux, cases de graphe et un `fuveau.pmtiles` extrait du build Protomaps, lus comme fichiers de l'application (pas d'adresse configurée, aucune requête réseau pendant la partie). Taille estimée de 20 à 25 Mo, mesurée à l'implémentation ; budget : APK de moins de 50 Mo.
- **Rayon de l'enquête** : paliers 500 m, 1 km, 2 km, pour toutes les parties (plus de 4 km).
- **Fin du mode hors ligne par téléchargement** : réglage, zones téléchargées, stockage de zones, plan et téléchargement, source de tuiles à plages d'octets rejouées sont supprimés. Le jeu est hors ligne par construction.
- **PWA** : manifeste, icônes, Service Worker qui met en cache les fichiers de l'application **et** les données de Fuveau (reprend les tâches 7.1 et 7.2 de `add-offline-mobile`, archivé avec 7 tâches ouvertes).
- **Chaîne de préparation** : une commande documentée produit le jeu de données de Fuveau à partir des outils existants (`tools/data-preparation/`, `tools/map-tiles/`).
- **Documentation** : `docs/VISION.md` et `AGENTS.md` mis à jour d'abord (principe 6 absolu, décisions), `README.md` (limite de l'APK levée), README des outils, et un guide `guide/ADD-COMMUNE.md` qui décrit comment ajouter une commune et ce qui passerait en ligne à ce moment-là.
- **BREAKING** : le réglage « mode hors ligne » et les zones téléchargées disparaissent ; une sauvegarde faite avant, avec d'autres données, est refusée par la détection existante du changement de données.

**Exclu** : autres communes, hébergement de données, application iOS (pas de compte Apple Developer), APK release signé, agrandissement de la zone au-delà du contour et de sa marge.

## Capabilities

### New Capabilities

- `embedded-zone-data`: jeu de données de Fuveau fourni avec l'application (contenu, couverture, taille, reproductibilité, attribution ODbL), lu sans réseau.

### Modified Capabilities

- `game-zone`: centre = Fuveau ou position dans son contour ; données lues dans l'application ; paliers 500 m, 1 km, 2 km ; zone insuffisante sans communes voisines.
- `game-screens`: écran de départ à deux boutons ; Réglages sans mode hors ligne ni zones téléchargées.
- `game-session`: reformulation des cas d'échec (plus d'« autre commune ») et du chargement des données.
- `offline-tiles`: tuiles lues dans le fichier de Fuveau embarqué, sans réseau ni zone téléchargée.
- `device-location`: la permission refusée se replie sur le bouton « Fuveau ».
- `pwa-install`: le Service Worker met aussi en cache les données de Fuveau.
- `offline-mode`: retirée (toutes ses exigences).
- `device-storage`: ne garde que la durabilité de la partie sauvegardée ; stockage de zones et stockage persistant web retirés.

## Impact

- `src/routes/+page.svelte`, `src/routes/reglages/`, `src/routes/play/carte/`, `src/routes/play/reveal/`, `src/routes/map/` : départ à deux boutons, plus de réglage hors ligne, tuiles et données embarquées.
- `src/lib/game/` : `zone.ts` (paliers, plus de voisines), `session.ts`, `engine.worker.ts`, `game.svelte.ts`, `protocol.ts`, `settings.svelte.ts`, `texts.ts` ; suppression de `offline.svelte.ts`.
- `src/lib/data/` : suppression de `zones.ts`, `store.ts`, `tiles.ts` et de leurs tests ; `files.ts` simplifié.
- `openspec/specs/commune-index/` et `offline-tiles/` : la section Purpose, hors d'un delta, est reformulée directement.
- Nouveaux : jeu de données dans `static/data/fuveau/`, service worker et manifeste PWA, guide `guide/ADD-COMMUNE.md`.
- `tools/` : commande de production du jeu de données de Fuveau, README mis à jour.
- Dépendances : `@capacitor/filesystem` devient inutile pour les zones (à vérifier à l'apply s'il sert encore ailleurs) ; aucune nouvelle dépendance.
- `docs/VISION.md`, `AGENTS.md`, `README.md`. Les dossiers `android/` et `ios/` ne changent pas.
