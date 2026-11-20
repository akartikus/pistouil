# Proposal

## Why

Le principe 6 de `docs/VISION.md` promet un jeu jouable hors connexion une fois la zone chargée. Aujourd’hui rien n’est gardé sur l’appareil, et l’application n’existe ni en PWA installable ni en application Android ou iOS. Le joueur connecté n’a pas besoin de télécharger quoi que ce soit ; celui qui veut jouer sans connexion doit pouvoir le choisir. Brief source : `docs/briefs/06-offline-mobile.md` (corrigé dans ce sens).

## What Changes

- **Mode hors ligne choisi par le joueur** (désactivé par défaut). Sans lui, le comportement actuel ne change pas : données et carte lues par le réseau, rien gardé.
- **Téléchargement d’une zone, une seule fois** : avec le mode activé, la zone d’environ 2 km autour du centre de la commune (lieux, graphe, tuiles), en une action, taille annoncée avant, progression pendant. Une zone déjà téléchargée n’est pas retéléchargée.
- **Enquête en mode hors ligne** : rayon limité à 2 km pour rester dans la zone téléchargée ; position ou commune hors zone : message et proposition de télécharger ou de chercher une autre commune.
- **Source de tuiles** : lit la zone téléchargée en mode hors ligne, le réseau sinon ; fond uni du style quand une tuile manque.
- **Stockage unique** dans `src/lib/data/` : `@capacitor/filesystem` dans l’application native, IndexedDB sur le web, derrière une même interface ; stockage persistant demandé sur le web, avec avertissement.
- **Gestion des zones téléchargées** (Réglages) : liste, taille, suppression.
- **PWA** : Service Worker de l’application elle-même, manifeste, installation sur l’écran d’accueil.
- **Capacitor** : plateformes Android et iOS, textes d’explication des permissions de géolocalisation, position jamais envoyée ; la recherche de commune reste disponible si la permission est refusée.
- `docs/VISION.md` (principe 6) corrigé : l’absence de réseau pendant le jeu vaut en mode hors ligne.
- Exclu : téléchargement sans choix du joueur, cache des tuiles au fil de la navigation en mode normal, publication sur les stores, synchronisation entre appareils.

## Capabilities

### New Capabilities
- `offline-mode`: choisir le mode hors ligne, télécharger une zone une seule fois, la jouer sans connexion, la lister et la supprimer.
- `offline-tiles`: source de tuiles qui lit la zone téléchargée en mode hors ligne et le réseau sinon, avec repli sur le fond uni.
- `device-storage`: interface de stockage de fichiers unique, implémentations native et web, persistance.
- `pwa-install`: Service Worker, manifeste et installation de l’application web.
- `device-location`: demande de position expliquée, usage local, repli sur la recherche de commune.

### Modified Capabilities
- `game-zone`: lecture des données depuis la zone téléchargée en mode hors ligne ; rayon limité à 2 km dans ce mode.
- `game-screens`: réglage du mode hors ligne, zones téléchargées dans les Réglages, proposition de téléchargement au départ.

## Impact

- `src/lib/data/` : interface de stockage, implémentations Filesystem et IndexedDB, téléchargement de zone, lecture locale (étend `files.ts`).
- `src/lib/game/` : réglage du mode hors ligne (comme `settings.svelte.ts`), pont entre le Worker et le stockage (le Worker n’accède pas aux plugins Capacitor), rayon maximal dans `zone.ts`, textes (`texts.ts`).
- `src/lib/map/Map.svelte` : source PMTiles du mode hors ligne.
- `src/routes/` : départ, Réglages, enregistrement du Service Worker.
- Nouveaux : `src/service-worker.ts`, `static/manifest.webmanifest`, icônes d’application, `android/`, `ios/`.
- Dépendances déjà installées (`@capacitor/filesystem`, `geolocation`, `preferences`) ; ajout probable de `@capacitor/android` et `@capacitor/ios`, à justifier à l’apply.
- `docs/VISION.md` : principe 6 déjà corrigé ; feuille de route et décisions à la fin.
