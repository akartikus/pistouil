# Tasks

## 1. Stockage (`src/lib/data/`)

- [x] 1.1 Écrire les tests de l’interface `ZoneStore` (écrire puis relire, `list` avec tailles, `usage`, suppression), exécutés sur les deux implémentations ; vérif : `npm run test` échoue avant le code
- [x] 1.2 Implémenter `ZoneStore` avec IndexedDB (web) et avec `@capacitor/filesystem` (natif), choisie par `Capacitor.isNativePlatform()` ; vérif : les tests de 1.1 passent
- [x] 1.3 Demander le stockage persistant sur le web et exposer son état ; vérif : test avec `navigator.storage` simulé (accordé, refusé)

## 2. Réglage et rayon

- [x] 2.1 Écrire les tests du réglage `offline` (désactivé par défaut, conservé) et du rayon maximal de 2 km en mode hors ligne (`zone.spec.ts` : palier 4 km ignoré, zone insuffisante au-delà) ; vérif : ils échouent avant le code
- [x] 2.2 Implémenter le réglage (comme `settings.svelte.ts`) et le paramètre de rayon maximal dans `src/lib/game/zone.ts` ; vérif : tests de 2.1 et tests de zone existants

## 3. Téléchargement d’une zone

- [x] 3.1 Écrire les tests du calcul de la zone d’une commune (manifeste, cases de lieux et de graphe du carré de ±3 km, tuiles du carré de ±3,3 km, index des communes ajouté au premier téléchargement seulement, taille totale) sur Fuveau avec des fichiers factices ; vérif : ils échouent avant le code
- [x] 3.2 Implémenter le calcul des fichiers, des tuiles et de la taille avant téléchargement (`HEAD` des cases, longueurs lues dans les répertoires du PMTiles) ; vérif : tests de 3.1 ; noter la taille mesurée de Fuveau dans `design.md`
- [x] 3.3 Écrire les tests du téléchargement (progression, annulation et coupure sans zone partielle, zone déjà téléchargée non retéléchargée, index `zones.json` écrit en dernier) ; vérif : ils échouent avant le code
- [x] 3.4 Implémenter le téléchargement en une action, l’index des zones, le nettoyage des restes, la liste et la suppression ; vérif : tests de 3.3 ; après suppression, `usage` diminue de la taille de la zone

## 4. Tuiles et pont Worker

- [x] 4.1 Écrire les tests de la source de tuiles (mode hors ligne : lecture locale sans réseau et tuile manquante vide sans erreur ; mode normal : réseau, rien écrit) ; vérif : ils échouent avant le code
- [x] 4.2 Implémenter la source PMTiles personnalisée, après lecture de la doc de `pmtiles` via `context7`, et la brancher dans `src/lib/map/Map.svelte` ; vérif : tests de 4.1, et la carte de `/play/carte` s’affiche toujours en mode normal (`npm run dev`)
- [x] 4.3 Écrire les tests de session en mode hors ligne (zone téléchargée : aucune requête ; case de la zone sans fichier : vide ; case hors zone : refus, jamais vide ; position dans une zone : centre de la commune ; position ou commune hors zones : échec « à télécharger » ; reprise d’une sauvegarde de 4 km : échec « demande une connexion » ; mode normal : comportement actuel) ; vérif : ils échouent avant le code
- [x] 4.4 Implémenter le mode dans `start` / `resume`, les messages de lecture entre `engine.worker.ts` et l’interface, les échecs « zone non téléchargée » et « demande une connexion », sans changer le moteur ni le format de sauvegarde ; vérif : tests de 4.3 et tests de session existants
- [x] 4.5 Lire l’index des communes depuis l’appareil en mode hors ligne (écran de départ, `play/carte`) ; vérif : test de la lecture, puis recherche de « Fuveau » en mode avion

## 5. Écrans

- [x] 5.1 Ajouter les textes (mode hors ligne, taille, progression, zone non téléchargée, persistance, permission) dans `src/lib/game/texts.ts` ; vérif : `npm run check`
- [x] 5.2 Réglages : interrupteur du mode hors ligne, liste des zones avec taille et suppression, avertissement de persistance web ; vérif : `npm run dev`, activer, télécharger, supprimer met la liste à jour
- [x] 5.3 Écran de départ : rappel du mode, proposition de téléchargement avec taille, message hors zone (position ou commune) ; vérif : `npm run dev`, commune non téléchargée en mode hors ligne affiche la proposition ; mode normal inchangé

## 6. Géolocalisation

- [x] 6.1 Écran d’explication avant la demande de position, usage local seulement ; refus : message et recherche de commune ; vérif : test de la logique de refus, puis `npm run dev` avec permission refusée
- [x] 6.2 Textes d’autorisation natifs en français (`Info.plist`, `AndroidManifest.xml`) ; vérif : relecture des textes (critère du brief : clairs, sans jargon)

## 7. PWA

- [ ] 7.1 Ajouter `static/manifest.webmanifest`, les icônes de l’application et la balise dans `src/app.html` ; vérif : l’audit installable de Chrome (DevTools > Application) ne signale rien
- [ ] 7.2 Ajouter `src/service-worker.ts` (fichiers du build seulement, pas de zones) et son enregistrement ; vérif : `npm run build && npm run preview`, l’application démarre hors connexion après une première visite

## 8. Applications natives

- [x] 8.1 Ajouter les plateformes (`npx cap add android`, `npx cap add ios`), justifier les dépendances ajoutées, versionner `android/` et `ios/` ; vérif : `npm run build && npx cap sync` sans erreur
- [x] 8.2 Vérifier `npm run lint`, `npm run check` et `npm run test` ; vérif : trois commandes vertes

## 9. Test manuel en mode avion (critère d’acceptation du brief)

- [ ] 9.1 PWA : activer le mode hors ligne, télécharger Fuveau (taille affichée avant), passer en mode avion, lancer une enquête, la jouer et la terminer, carte comprise ; fermer et rouvrir en mode avion, reprendre une enquête en cours ; vérifier que, mode désactivé, aucune case, tuile ni index n’est gardé ; se localiser dans Fuveau en mode avion
- [ ] 9.2 Android : même parcours sur appareil ou émulateur ; relancer l’application après un redémarrage de l’appareil
- [ ] 9.3 iOS : même parcours sur appareil ou simulateur
- [ ] 9.4 Sur chaque plateforme : supprimer la zone, l’espace utilisé diminue ; relire les textes de permission

## 10. Cap

- [ ] 10.1 Mettre à jour `docs/VISION.md` (feuille de route : brief 06 fait ; décisions : mode hors ligne choisi, zone de 2 km par commune, source de tuiles à deux modes, taille mesurée) ; vérif : relecture du diff
