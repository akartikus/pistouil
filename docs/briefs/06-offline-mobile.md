# Brief 06 — Hors-ligne et application mobile

**Objectif** : une fois une zone chargée, le jeu fonctionne sans connexion, sur le web (PWA) comme dans les applications Android et iOS construites avec Capacitor.
**Dépend de** : brief 05.
**À lire** : `docs/VISION.md` §4 (principe 6) et §6.

## Périmètre

**Inclus**
- **Téléchargement d’une zone** : fichiers de lieux et de graphe des cases concernées, tuiles du rectangle de la zone, en une action avec indicateur de progression.
- **Cache des tuiles** : une source PMTiles personnalisée qui enregistre les morceaux lus et les relit hors connexion ; préchargement des tuiles du rectangle de la zone.
- **Stockage** : `@capacitor/filesystem` dans l’application, IndexedDB sur le web, derrière une même interface.
- Style, polices et icônes embarqués (déjà dans `static/map/`).
- **PWA** : Service Worker pour l’application elle-même, installation sur l’écran d’accueil.
- **Capacitor** : plateformes Android et iOS, géolocalisation (`@capacitor/geolocation`) avec permissions et textes d’explication, réglages (`@capacitor/preferences`).
- Gestion des zones téléchargées : liste, taille, suppression.

**Exclu**
- Publication sur les stores (étape ultérieure).
- Synchronisation entre appareils.

## Exigences

### Jouer hors connexion
- QUAND le joueur a téléchargé Fuveau puis passe en mode avion
- ALORS il peut lancer une nouvelle enquête à Fuveau, la jouer et la terminer, carte comprise.

### Pas de fond vide
- QUAND une tuile manque hors connexion
- ALORS la carte affiche le fond uni du style, et le jeu reste utilisable.

### Stockage fiable sur mobile
- QUAND l’application n’a pas été ouverte depuis plusieurs semaines
- ALORS les zones téléchargées et les parties en cours sont toujours présentes dans l’application native.
- Sur le web, le jeu demande un stockage persistant quand le navigateur le permet et prévient que les données peuvent être effacées.

### Géolocalisation respectueuse
- QUAND le joueur choisit « Je me localise »
- ALORS la permission est demandée avec une explication claire,
- ET la position n’est utilisée que sur l’appareil, jamais envoyée.
- QUAND la permission est refusée
- ALORS la recherche de commune reste disponible.

### Une base de code
- Le même code SvelteKit produit la PWA et les applications natives ; les différences de plateforme sont isolées dans `src/lib/data/`.

## Critères d’acceptation

- [ ] Partie complète en mode avion sur Android, sur iOS et en PWA.
- [ ] Taille de la zone de Fuveau mesurée et affichée avant téléchargement.
- [ ] Suppression d’une zone libère bien l’espace.
- [ ] Textes de permission relus (français, clairs, sans jargon).

## Points à trancher pendant la proposition

- Stratégie de cache des tuiles : source personnalisée avec cache des morceaux (recommandée) ou extraits PMTiles par commune.
- Limite de taille par zone et comportement au-delà.

## Consigne pour OpenSpec

> Crée un nouveau changement OpenSpec nommé `add-offline-mobile` à partir de ce brief. Isole toutes les différences web / natif derrière une interface de stockage unique dans `src/lib/data/`. Inclus dans `tasks.md` un test manuel en mode avion sur chaque plateforme.
