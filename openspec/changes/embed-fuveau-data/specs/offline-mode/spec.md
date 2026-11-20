# Spec Delta

## REMOVED Requirements

### Requirement: Mode hors ligne choisi par le joueur
**Reason**: Le jeu est hors ligne par construction : les données de Fuveau sont dans l’application, il n’y a plus de mode à choisir.
**Migration**: Aucune ; la logique de zones téléchargées sera reprise dans un nouveau changement quand une deuxième commune arrivera (voir `guide/ADD-COMMUNE.md`).

### Requirement: Téléchargement d’une zone une seule fois
**Reason**: Plus aucune zone à télécharger : les données de Fuveau sont fournies avec l’application.
**Migration**: Aucune ; la logique de zones téléchargées sera reprise dans un nouveau changement quand une deuxième commune arrivera (voir `guide/ADD-COMMUNE.md`).

### Requirement: Index des communes gardé une fois
**Reason**: Plus de recherche de commune : l’application n’embarque que l’entrée de Fuveau.
**Migration**: Aucune ; la logique de zones téléchargées sera reprise dans un nouveau changement quand une deuxième commune arrivera (voir `guide/ADD-COMMUNE.md`).

### Requirement: Jouer hors connexion
**Reason**: Le jeu fonctionne toujours sans connexion, mais par construction : voir `embedded-zone-data` et `pwa-install`.
**Migration**: Aucune ; la logique de zones téléchargées sera reprise dans un nouveau changement quand une deuxième commune arrivera (voir `guide/ADD-COMMUNE.md`).

### Requirement: Centre de l’enquête en mode hors ligne
**Reason**: Le centre est décrit par `game-zone` : Fuveau, ou une position dans son contour.
**Migration**: Aucune ; la logique de zones téléchargées sera reprise dans un nouveau changement quand une deuxième commune arrivera (voir `guide/ADD-COMMUNE.md`).

### Requirement: Reprise fidèle ou refusée
**Reason**: La reprise à l’identique ou refusée reste décrite par `game-session` (version des données) ; le cas du rayon de 4 km n’existe plus.
**Migration**: Aucune ; la logique de zones téléchargées sera reprise dans un nouveau changement quand une deuxième commune arrivera (voir `guide/ADD-COMMUNE.md`).

### Requirement: Gestion des zones téléchargées
**Reason**: Plus de zones téléchargées à lister ni à supprimer.
**Migration**: Aucune ; la logique de zones téléchargées sera reprise dans un nouveau changement quand une deuxième commune arrivera (voir `guide/ADD-COMMUNE.md`).
