# Brief 06 — Application mobile hors ligne

**Objectif** : le jeu se joue sans aucune connexion, sur le web (PWA) comme dans les applications Android et iOS construites avec Capacitor. Pour le moment, seule **Fuveau** est couverte : ses données (environ 12 Mo) sont dans l'application. Il n'y a ni mode hors ligne à choisir ni zone à télécharger.
**Dépend de** : brief 05.
**À lire** : `docs/VISION.md` §4 (principe 6) et §6 ; `guide/ARCHITECTURE.md` ; `guide/ADD-COMMUNE.md`.

> **Historique.** Ce brief décrivait d'abord un mode hors ligne par téléchargement de la zone d'une commune (changement `add-offline-mobile`, archivé). Quand le périmètre est devenu « Fuveau seule », ce mécanisme n'avait plus d'objet : le changement `embed-fuveau-data` (archivé) l'a remplacé par des données embarquées. Le téléchargement par zone se retrouve dans l'historique git (commit `020ed56`) ; `guide/ADD-COMMUNE.md` dit ce qu'il faudrait recréer pour plusieurs communes.

## Périmètre

**Inclus**
- **Données de Fuveau embarquées** : `static/data/fuveau/` (manifeste, entrée de la commune, cases de lieux, cases de graphe, `fuveau.pmtiles`), couvrant le contour de la commune élargi de 3 km, produites par `tools/embedded-data/build.sh`, de moins de 50 Mo. Aucune adresse de données à fournir à la construction.
- **Départ à Fuveau** : deux boutons, « Je me localise » (position acceptée seulement dans le contour de Fuveau) et « Fuveau ».
- **Enquête** : rayon limité à 2 km ; aucune requête réseau pendant la partie.
- **Source de tuiles** : le fichier de Fuveau lu en entier en mémoire, sans dépendre des requêtes de plages d'octets de l'hôte.
- **Sauvegarde** de la partie sur l'appareil (`@capacitor/preferences`) ; une enquête est reprise à l'identique ou pas du tout.
- Style, polices et icônes de la carte embarqués (`static/map/`).
- **PWA** : manifeste, icônes, Service Worker qui garde les fichiers de l'application, données et tuiles comprises ; installation sur l'écran d'accueil.
- **Capacitor** : projets Android et iOS (commités), géolocalisation (`@capacitor/geolocation`) avec permissions et textes d'explication.

**Exclu**
- Mode hors ligne à activer, téléchargement et gestion de zones, stockage de zones : retirés (voir l'historique ci-dessus).
- Autres communes et hébergement de données : voir `guide/ADD-COMMUNE.md`.
- Construction et test d'iOS : pas de compte Apple Developer pour le moment.
- Publication sur les stores et synchronisation entre appareils.

## Exigences

### Jouer sans connexion
- QUAND l'application est installée (PWA, Android ou iOS) et que l'appareil est en mode avion
- ALORS le joueur lance une enquête à Fuveau, la joue et la termine, carte comprise,
- ET aucune requête réseau n'est faite pendant la partie.

### Départ à Fuveau
- QUAND le joueur choisit « Fuveau »
- ALORS l'enquête est centrée sur le centre de la commune.
- QUAND le joueur choisit « Je me localise » à l'intérieur du contour de Fuveau
- ALORS l'enquête est centrée sur sa position.
- QUAND sa position est hors de Fuveau
- ALORS le jeu dit simplement que seule Fuveau est disponible pour le moment et ne génère aucune enquête.

### Pas de fond vide
- QUAND une tuile manque
- ALORS la carte affiche le fond uni du style, et le jeu reste utilisable.

### Sauvegarde fiable sur mobile
- QUAND l'application n'a pas été ouverte depuis plusieurs semaines
- ALORS la partie en cours est toujours présente dans l'application native.

### Géolocalisation respectueuse
- QUAND le joueur choisit « Je me localise »
- ALORS la permission est demandée avec une explication claire,
- ET la position n'est utilisée que sur l'appareil, jamais envoyée.
- QUAND la permission est refusée
- ALORS le bouton « Fuveau » reste disponible.

### Taille bornée
- QUAND l'application est construite
- ALORS les données embarquées et l'application font chacune moins de 50 Mo.

### Une base de code
- Le même code SvelteKit produit la PWA et les applications natives.

## Critères d'acceptation

- [x] Partie complète sans réseau en PWA : vérifiée sur Chromium, service worker installé, réseau coupé, de l'écran de départ à la révélation, sans aucune requête hors de l'application.
- [x] Position à Aix-en-Provence refusée avec un message, position dans Fuveau acceptée, permission refusée : le bouton « Fuveau » reste disponible (vérifié sur Chromium).
- [x] Données de Fuveau de 12 Mo et application web de 15 Mo ; APK debug construit en local de 14,3 Mo.
- [ ] Partie complète en mode avion sur Android : APK installé, une enquête jouée jusqu'à la révélation. Une erreur 500 au lancement d'une partie reste à diagnostiquer sur appareil.
- [ ] Partie complète en mode avion sur iOS : reportée, faute de compte Apple Developer.
- [ ] Textes de permission relus sur appareil (français, clairs, sans jargon).

## Points restants

- **Erreur 500 sur Android** : à reproduire sur un téléphone ou un émulateur (l'adresse qui renvoie le 500 donnera la cause), puis à corriger dans un changement nommé d'après son objet. Premier suspect : l'ancien service worker d'une installation précédente.
- **iOS** : à reprendre quand un compte Apple Developer existera (brief 07, partie C).
- **Deuxième commune** : quand elle arrivera, les données ne tiendront plus toutes dans l'application ; voir `guide/ADD-COMMUNE.md`.

## Changements OpenSpec de ce brief

- `add-offline-mobile` (archivé) : mode hors ligne par téléchargement de zones, PWA, projets Android et iOS, géolocalisation.
- `embed-fuveau-data` (archivé) : données de Fuveau embarquées, retrait du téléchargement de zones ; ses tâches 7.4 (test Android) et 7.5 (étape 6 de la feuille de route) sont restées ouvertes.
