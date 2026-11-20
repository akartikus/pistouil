# Design

## Context

Le jeu lit aujourd'hui ses données (index, manifeste, cases de lieux et de graphe, tuiles) depuis `VITE_DATA_URL` et `VITE_TILES_URL` (défaut `/dev-data`, 609 Mo non commités), ou depuis des zones téléchargées par le mode hors ligne (`src/lib/data/zones.ts`, `store.ts`, `tiles.ts`, `src/lib/game/offline.svelte.ts`). Voir `proposal.md` (Why) pour le changement de cap.

Capabilities existantes dont ce changement dépend, à lire avant le code :
- `game-zone`, `game-session`, `game-screens` : centre, rayon, chargement, départ, Réglages.
- `offline-mode`, `offline-tiles`, `device-storage`, `device-location`, `pwa-install` : archivées avec `add-offline-mobile` ; leurs exigences sont ici retirées ou ramenées à Fuveau.
- `commune-index`, `osm-place-extraction`, `pedestrian-graph-preparation`, `map-style` : produisent les fichiers et le style que l'on embarque ; ils ne changent pas.
- `ci-android-build` : le build manuel Android vérifiera l'APK final.

Mesures utiles (données locales) : contour de Fuveau 29,9 km², rectangle 9,3 × 5,7 km, 4,7 km du centre à la limite la plus lointaine ; sur 120 points du contour, 500 m suffisent partout pour au moins 6 lieux utilisables dont 2 scènes ; zone du mode hors ligne actuel mesurée à 6,2 Mo pour 44 km².

## Goals / Non-Goals

**Goals:**
- Un jeu entièrement hors ligne par construction : aucun réglage, aucune requête réseau pendant la partie.
- Aucun code ni dépendance gardés « pour plus tard » : on supprime ce qui ne sert plus, le guide dit comment le recréer.
- Un jeu de données reproductible par une commande documentée.

**Non-Goals:**
- Hébergement de données, plusieurs communes, iOS, APK signé, zone plus large que le contour et sa marge.

## Decisions

- **Emplacement : `static/data/fuveau/`, commité.** Contenu : `manifest.json`, `commune.json` (l'entrée de Fuveau), `places/`, `graph/`, `fuveau.pmtiles`. Le dossier est copié dans `build/` par SvelteKit, donc dans l'APK et la PWA. `static/dev-data/` (gitignoré) ne sert plus que le playground et la page `/map`. Alternative : un dossier hors `static/` copié à la construction, écartée (une étape de plus sans bénéfice).
- **Adresse unique.** Une constante `/data/fuveau` remplace `VITE_DATA_URL` et `VITE_TILES_URL` pour le jeu ; les pages de développement gardent les leurs. Aucune variable à fournir à la construction.
- **Couverture : contour de Fuveau plus 3 km (lieux, graphe), rectangle de ce contour plus 3,3 km (tuiles).** 3 km = rayon maximal de 2 km plus la marge de lecture de 1 km de `game-zone`. Estimation de 20 à 25 Mo (la zone actuelle de 44 km² pèse 6,2 Mo, celle-ci couvre environ 200 km²), à mesurer. Alternative : disque de 5 km, écartée (60 % hors commune).
- **Production : un script `tools/embedded-data/build.sh`** qui chaîne les outils existants : lecture de l'entrée de la commune dans l'index régional ; découpe `osmium` du rectangle élargi ; `tools/data-preparation/prepare.py` sur cet extrait (la grille est fixe, les cases sont identiques à celles d'une préparation régionale) ; `tools/map-tiles/extract.sh` avec ce rectangle ; copie dans `static/data/<slug>/`. Alternative : filtrer les cases d'une sortie régionale déjà préparée, écartée car elle suppose 14 min et 3,9 Go de préparation préalable à chaque fois.
- **Tuiles : fichier lu en entier en mémoire.** Une source PMTiles personnalisée charge `fuveau.pmtiles` une fois par `fetch` et répond aux lectures par tranches, sans dépendre des requêtes de plages d'octets du serveur local de Capacitor ni du cache du Service Worker. Coût : le fichier (environ 10 à 15 Mo) en mémoire. Alternative : `FetchSource` avec plages d'octets, écartée tant que leur prise en charge par l'APK n'est pas vérifiée.
- **Centre dans le contour.** Une fonction pure `insideContour(point, contour)` (rayon de balayage, comme le contour est un polygone simple) décide si « Je me localise » est accepté. Elle vit à côté de `src/lib/map/zone.ts` et est testée sur des points connus (centre de Fuveau dedans, Aix-en-Provence dehors).
- **Rayon : paliers 500 m, 1 km, 2 km.** `RADII_M` perd 4 000 ; `OFFLINE_RADII_M` et `neighborCommunes` disparaissent. La zone insuffisante n'a plus de voisines.
- **Suppressions** : `offline.svelte.ts`, `data/zones.ts`, `data/store.ts`, `data/tiles.ts` et leurs `*.spec.ts`, le pont de lecture de fichiers du Worker (`FileRequest`, `FileReply`, `OfflineZone` dans `protocol.ts`), le réglage et la clé `pistouil.offline` de `settings.svelte.ts`, les textes correspondants de `texts.ts`, `@capacitor/filesystem` s'il n'est plus utilisé (vérifié par recherche dans `src/` à l'apply, puis `npx cap sync android`).
- **PWA** : le Service Worker (`src/service-worker.ts`) met en cache `build` et `files` de `$service-worker`, ce qui inclut `static/data/fuveau/`. Le premier chargement télécharge donc les données (environ 20 Mo) ; c'est le prix d'un jeu sans réseau, noté dans le README.
- **Guide `guide/ADD-COMMUNE.md`** : étapes pour une autre commune (extrait, préparation, tuiles, contour, test de couverture), et ce qui devrait alors changer : hébergement en ligne des données, choix de la commune (index ou liste), téléchargement par zone et stockage (à reprendre de l'historique git du changement `add-offline-mobile`), taille de la PWA.

## Risks / Trade-offs

- [Un aller-retour d'archive : `offline-mode` est retiré juste après avoir été créé] → l'historique des specs montre le virage, comme voulu ; les raisons sont écrites dans les `REMOVED`.
- [Données de Fuveau figées dans l'APK, mises à jour par une nouvelle version] → acceptable avec une seule commune ; le guide décrit le passage en ligne.
- [Le fichier de tuiles en mémoire pèse sur un petit téléphone] → mesure à l'apply sur le téléphone ; repli sur des plages d'octets sinon.
- [Les sauvegardes faites avant, au centre d'une autre commune, ne se rejouent plus] → la reprise est refusée par le contrôle de la version des données de `game-session` ; vérifié par un test à l'apply.
- [Redistribution d'une base dérivée d'OpenStreetMap (ODbL) dans le dépôt et l'APK] → attribution conservée et rappelée dans le `README.md` ; le dépôt est privé, à revoir avant toute ouverture.
- [Taille réelle au-dessus de l'estimation] → budget de 50 Mo testé automatiquement ; réduire la marge de lecture ou le zoom maximal en dernier recours.
