# Design

## Context

Voir `proposal.md` (Pourquoi). État actuel observé :

- Le Worker de session lit les fichiers par `fetch` (`src/lib/game/engine.worker.ts`, `src/lib/data/files.ts`) depuis `VITE_DATA_URL` (défaut `/dev-data`) ; la carte lit le PMTiles par l’adresse `VITE_TILES_URL`, avec `new Protocol().tile` (`src/lib/map/Map.svelte`). C’est le « mode normal » : il ne change pas.
- La sauvegarde, le thème et le guide passent déjà par `@capacitor/preferences` (localStorage sur le web) ; `StoragePort` est défini dans `src/lib/game/save.ts`, `settings.svelte.ts` garde le thème.
- `@capacitor/filesystem`, `geolocation` et `preferences` sont installés ; `capacitor.config.ts` existe, mais pas `android/` ni `ios/`, ni Service Worker, ni manifeste. L’écran de départ appelle déjà `Geolocation.getCurrentPosition`.
- `RADII_M` vaut `[500, 1000, 2000, 4000]` et la marge de graphe 1 km (`src/lib/game/zone.ts`, `session.ts`) ; la carte de jeu est bornée aux lieux retenus plus 300 m.

Capabilities existantes dont ce changement dépend (lire leur spec plutôt que le code) : `game-zone`, `game-session`, `game-screens`, `map-display`, `map-style`, `commune-index`, `pedestrian-graph-preparation`.

## Goals / Non-Goals

**Goals:**
- Un mode hors ligne choisi par le joueur ; une zone téléchargée une seule fois et jouable sans connexion, sur PWA, Android et iOS.
- Mode normal inchangé.
- Isoler toute différence web / natif dans `src/lib/data/`.

**Non-Goals:**
- Téléchargement sans choix du joueur, cache des tuiles au fil de la navigation en mode normal.
- Mise à jour d’une zone : la mettre à jour, c’est la supprimer puis la retélécharger.
- Publication sur les stores, synchronisation entre appareils (exclus du brief).

## Decisions

**1. Un réglage `offline`, désactivé par défaut**, gardé comme le thème (`@capacitor/preferences`). Il choisit la source des données et des tuiles : zone téléchargée (activé) ou réseau (désactivé). Sans lui, aucune écriture sur le stockage de zones. Alternative : lire la zone téléchargée dès qu’elle existe, quel que soit le réglage ; rejetée, le joueur a demandé que le mode normal charge normalement.

**2. Une zone = environ 2 km autour du centre d’une commune** (centre de l’index, clé = code INSEE). Hypothèse retenue à partir de « zone de ~2 km » : un disque de rayon 2 km autour du centre. Elle couvre :
- les cases de lieux et de graphe du carré de ±3 km autour du centre (rayon 2 km + marge de graphe 1 km) ;
- les tuiles du carré de ±3,3 km (la carte montre les lieux de décor jusqu’au rayon + 1 km, plus 300 m), du zoom le plus bas au zoom maximal du fichier.
En mode hors ligne le dernier palier de `RADII_M` est 2 km, donc tout lieu retenu est dans la zone. Alternative : zone = bbox de la commune ; rejetée, elle varie beaucoup d’une commune à l’autre et sa taille ne serait pas bornée.

**2 bis. Contenu d’une zone.** Le manifeste des données est gardé avec chaque zone (sa version sert à `dataVersion` hors ligne), avec la liste des cases demandées, y compris celles sans fichier : une case de la liste sans fichier est vide, une case hors de la liste est une erreur « hors zone » et jamais vide, pour ne pas régénérer en silence une enquête différente. L’index des communes (1,4 Mo, utilisé par la recherche au départ et par le masque de `play/carte`) est gardé une seule fois, au premier téléchargement, et supprimé avec la dernière zone.

**2 ter. Centre en mode hors ligne.** Le centre est toujours celui d’une commune téléchargée : la commune choisie, ou pour une position la zone téléchargée dont le disque la contient. Ainsi le disque de 2 km de l’enquête est celui de la zone.

**2 quater. Reprise.** Le mode est lu au moment de `start` / `resume` et passé dans la requête. Une sauvegarde de rayon 4 km reprise en mode hors ligne : `buildZone` avec le dernier palier à 2 km donnerait une autre enquête ; la session renvoie donc un échec dédié (« demande une connexion ») quand `saved.zone.radiusM` dépasse 2 km ou qu’une case est hors zone. La sauvegarde ne change pas de format.

**3. Interface de stockage `ZoneStore` (chemin → texte, ou octets en base64) dans `src/lib/data/store.ts`.** `read`, `write`, `remove`, `list`. Une seule implémentation au-dessus de `@capacitor/filesystem` (`Directory.Data`), dont le plugin écrit déjà sur le système de fichiers dans l’application et dans IndexedDB sur le web : les deux stockages demandés sans second code ni dépendance. Testée avec un faux plugin. La taille d’une zone est notée à son téléchargement. Alternative : une implémentation IndexedDB écrite à la main pour le web ; rejetée, elle refait ce que fait le plugin.

**4. Une zone est complète ou absente.** Le téléchargement écrit dans un dossier provisoire de la zone, puis l’ajoute à un index (`zones.json`) en dernier. Une zone absente de l’index n’existe pas, et ses restes sont nettoyés au démarrage ou à l’annulation. Une zone déjà dans l’index n’est pas retéléchargée.

**5. Taille annoncée avant.** Fichiers de cases : tailles par requêtes `HEAD`. Tuiles : somme des longueurs lues dans les répertoires du PMTiles pour les tuiles du carré (lectures de plages, sans télécharger les tuiles). Affichée avant confirmation.

**6. Le Worker ne parle pas à Capacitor : pont par messages.** Les plugins Capacitor n’existent pas dans un Worker. En mode hors ligne, la lecture des cases dans le Worker (`SessionDeps.source`, déjà injectable) demande à l’interface la case dans `ZoneStore` ; en mode normal elle reste un `fetch`. Le mode est passé dans la requête `start` / `resume`. `session.ts` et le moteur ne changent pas, sauf `RADII_M` limité à 2 km en mode hors ligne.

**7. Source de tuiles.** Une implémentation de l’interface `Source` de la bibliothèque `pmtiles` (présente dans la version installée : `getBytes`, `getKey`) : en mode hors ligne elle lit les plages d’octets dans `ZoneStore` ; en mode normal, le réseau comme aujourd’hui, sans rien écrire. Le téléchargement lit les tuiles du carré avec la source réseau et les enregistre. Une lecture qui échoue donne une tuile vide : MapLibre garde le fond uni du style. Les tuiles sont regroupées en morceaux d’octets plutôt qu’un fichier par tuile (Filesystem natif lent pour des milliers de petits fichiers). Vérifier l’enregistrement d’une source personnalisée dans la version installée de `pmtiles` (MCP `context7`).

**8. Centre hors zones.** Mode hors ligne : si le centre (commune choisie ou position) n’est dans aucun disque de 2 km téléchargé, le jeu propose de télécharger la commune ou d’en chercher une autre. Pour une position, il propose la commune la plus proche de l’index.

**9. PWA par le Service Worker de SvelteKit** (`src/service-worker.ts`, module `$service-worker`) : met en cache les fichiers construits seulement ; les zones passent par `ZoneStore`. `static/dev-data` n’entre pas dans le build (le script `postbuild` le retire déjà). Manifeste et icônes dans `static/`.

**10. Géolocalisation.** `@capacitor/geolocation` (déjà utilisé) avec un écran d’explication avant la demande, des textes dans `texts.ts`, et les chaînes d’autorisation natives (`Info.plist`, `AndroidManifest.xml`) en français. Refus ou erreur : message et recherche de commune, comme aujourd’hui.

**11. Persistance web.** `navigator.storage.persist()` au premier téléchargement ; si refus, avertissement dans les Réglages.

**12. Plateformes natives.** `android/` et `ios/` créés par `npx cap add` et versionnés ; le build web alimente les deux (`npx cap sync`). Les adresses de données et de tuiles de production restent fournies à la construction (`VITE_DATA_URL`, `VITE_TILES_URL`).

**13. Principe 6 de la vision.** « Aucune requête réseau pendant une partie » ne vaut plus qu’en mode hors ligne : en mode normal la carte lit le réseau (c’est déjà le cas). `docs/VISION.md` est corrigé ; la même règle dans `AGENTS.md` est à aligner par le propriétaire du dépôt.

## Risks / Trade-offs

- [Taille d’une zone] → mesurée à Fuveau (extrait du 2026-11-16) : **6,2 Mo**, dont 3,2 Mo de tuiles (zooms 0 à 15, 128 parties d’archive), 1,4 Mo d’index des communes (une seule fois) et environ 1,6 Mo de cases (16 cases) ; annoncée avant chaque téléchargement.
- [Rayon limité à 2 km en mode hors ligne : une commune éparse peut être déclarée insuffisante] → message existant `not-enough-places` et propositions de communes voisines.
- [Un serveur sans `Content-Length` sur `HEAD` (réponse compressée)] → afficher une taille estimée (cases × taille moyenne) et le dire ; vérifier sur l’hébergement de production.
- [Changer le mode pendant une enquête] → le mode n’est lu qu’au départ et à la reprise (décision 2 quater).
- [Octets passés entre Worker et interface] → cases petites (~35 Ko) ; transférer les `ArrayBuffer`.
- [Le navigateur efface IndexedDB] → persistance demandée et avertissement (décision 11).
- [Hypothèse « disque de 2 km autour du centre » fausse] → constante unique du rayon de zone ; à confirmer par le propriétaire.
- [Pas de moyen de tester iOS en CI] → test manuel par plateforme.

## Open Questions

- Aucune.
