# Brief 06 — Mode hors ligne et application mobile

**Objectif** : le joueur peut activer un mode hors ligne ; la zone de sa commune (environ 2 km autour de son centre) est alors téléchargée une seule fois, et le jeu fonctionne ensuite sans connexion, sur le web (PWA) comme dans les applications Android et iOS construites avec Capacitor. Sans ce mode, le jeu charge la carte et les données normalement, puisque le joueur est connecté.
**Dépend de** : brief 05.
**À lire** : `docs/VISION.md` §4 (principe 6) et §6.

## Périmètre

**Inclus**
- **Mode hors ligne** : un réglage que le joueur active ou non (Réglages, rappelé à l’écran de départ). Désactivé par défaut. Quand il est désactivé, rien n’est gardé sur l’appareil et le comportement actuel (lecture par le réseau) ne change pas.
- **Téléchargement d’une zone, une seule fois** : avec le mode activé, le manifeste, les fichiers de lieux et de graphe et les tuiles du rectangle d’environ 2 km autour du centre de la commune, en une action, avec taille annoncée avant et progression pendant. Une zone déjà téléchargée n’est pas retéléchargée. L’index des communes est gardé une fois, au premier téléchargement, pour chercher une commune sans connexion.
- **Enquête en mode hors ligne** : centrée sur le centre d’une commune téléchargée (celle qui contient la position pour « Je me localise »), rayon limité à 2 km, pour rester dans la zone téléchargée. Une enquête est reprise à l’identique ou pas du tout.
- **Source de tuiles** : une source PMTiles personnalisée qui, en mode hors ligne, lit les tuiles de la zone téléchargée sur l’appareil ; sans ce mode, elle lit le réseau comme aujourd’hui.
- **Stockage** : `@capacitor/filesystem` dans l’application, IndexedDB sur le web, derrière une même interface.
- Style, polices et icônes embarqués (déjà dans `static/map/`).
- **PWA** : Service Worker pour l’application elle-même, installation sur l’écran d’accueil.
- **Capacitor** : plateformes Android et iOS, géolocalisation (`@capacitor/geolocation`) avec permissions et textes d’explication, réglages (`@capacitor/preferences`).
- Gestion des zones téléchargées : liste, taille, suppression.

**Exclu**
- Téléchargement automatique ou à l’avance sans que le joueur ait activé le mode hors ligne.
- Cache des tuiles lues au fil de la navigation en mode normal.
- Publication sur les stores (étape ultérieure).
- Synchronisation entre appareils.

## Exigences

### Choisir le mode hors ligne
- QUAND le joueur n’a pas activé le mode hors ligne
- ALORS le jeu charge les données et la carte par le réseau, sans rien garder, comme avant ce brief.
- QUAND le joueur active le mode hors ligne pour Fuveau
- ALORS la zone de Fuveau est téléchargée une seule fois, avec sa taille annoncée avant et une progression.

### Jouer hors connexion
- QUAND le joueur a activé le mode hors ligne, téléchargé Fuveau puis passe en mode avion
- ALORS il peut lancer une nouvelle enquête à Fuveau, la jouer et la terminer, carte comprise.

### Zone limitée à 2 km
- QUAND le mode hors ligne est activé
- ALORS le rayon de l’enquête ne dépasse pas 2 km autour du centre de la commune.
- QUAND la position du joueur ou la commune choisie est hors des zones téléchargées
- ALORS le jeu le dit simplement et propose de télécharger la commune ou d’en chercher une autre.

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

- [ ] Partie complète en mode avion sur Android, sur iOS et en PWA, mode hors ligne activé.
- [ ] Taille de la zone de Fuveau mesurée et affichée avant téléchargement.
- [ ] Une zone n’est téléchargée qu’une fois ; sans le mode hors ligne, rien n’est gardé.
- [ ] Suppression d’une zone libère bien l’espace.
- [ ] Textes de permission relus (français, clairs, sans jargon).

## Points à trancher pendant la proposition

- Taille réelle de la zone de 2 km à Fuveau (tuiles au zoom 15 comprises) et limite éventuelle.

## Consigne pour OpenSpec

> Crée un nouveau changement OpenSpec nommé `add-offline-mobile` à partir de ce brief. Isole toutes les différences web / natif derrière une interface de stockage unique dans `src/lib/data/`. Inclus dans `tasks.md` un test manuel en mode avion sur chaque plateforme.
