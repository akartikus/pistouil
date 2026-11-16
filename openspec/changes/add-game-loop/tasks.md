# Tasks

## 1. Catalogue : icône et libellé des indices

- [x] 1.1 Écrire le test dans `src/lib/engine/catalog.spec.ts` : chaque type de `catalog/clue-types.json` a une `icon` parmi les 5 objets de preuve (`receipt`, `bill`, `transport_ticket`, `loan_slip`, `postal_receipt`) et `npc`, et un `label` non vide ; un type sans l’un ni l’autre reste accepté ; vérifier qu’il échoue
- [x] 1.2 Ajouter `icon?` et `label?` à `ClueType` (`src/lib/engine/types.ts`), renseigner les 15 types de `catalog/clue-types.json` ; vérifier que 1.1 et les tests du moteur passent
- [x] 1.3 Dessiner les 6 icônes de pièces (SVG dans `static/pieces/`, registre noir et blanc, affichées en `<img>` : pas de PNG, la carte ne les utilise pas) et un test qui vérifie leur présence

## 2. Logique de jeu pure (`src/lib/game/`)

- [x] 2.1 Écrire les tests de la progression : ouvrir un lieu (faits découverts avec fermeture des liens « débloqué par », idempotent), mesurer un trajet (paire non ordonnée), annotations et notes, statut d’alibi choisi par le joueur (« à vérifier » au départ, jamais changé par le jeu), accusation unique ; y déplacer les tests de `discoveredFactIds` et `checkAccusation` du playground ; vérifier qu’ils échouent
- [x] 2.2 Implémenter `progress.ts` et `discovery.ts` (reprendre `discoveredFactIds` et `checkAccusation`) ; faire importer ces fonctions par `src/lib/playground/playground.ts` ; vérifier que 2.1 et les tests du playground passent
- [x] 2.3 Écrire les tests de la zone : rayon 500 m puis 1, 2, 4 km jusqu’à 6 lieux utilisables dont 2 scènes, au plus 40 lieux retenus (les plus proches, départage par identifiant), zone insuffisante avec 3 communes voisines, lieux retirés et exclus écartés ; vérifier qu’ils échouent
- [x] 2.4 Implémenter `zone.ts` (fonctions pures) ; vérifier que 2.3 passe
- [x] 2.5 Écrire les tests de la projection : l’enquête complète donne une vue sans `author`, `lie`, `motive`, `lieKind`, `segments`, `revelationText` ni faits ; la vue des faits d’un lieu ne contient que le visible ; la sérialisation de tout ce que reçoit l’interface ne contient pas le prénom de l’auteur avant l’accusation ; vérifier qu’ils échouent
- [x] 2.6 Implémenter `projection.ts` ; vérifier que 2.5 passe
- [x] 2.7 Écrire les tests de la déduction : positions au curseur (intervalle, instant, inconnu), incohérence entre deux lieux calculée avec les trajets fournis (même à l’instant identique), jamais pour deux faits d’un même lieu, alibi suffisant avec le trajet vers la scène et formulation conditionnelle, déterminisme ; vérifier qu’ils échouent
- [x] 2.8 Implémenter `deduction.ts` en réutilisant `contradicts` du solveur ; vérifier que 2.7 passe
- [x] 2.9 Écrire les tests de la soirée (`positionAt` pendant un séjour, entre deux séjours sur le tracé, ligne droite pour un trajet approximatif, avant et après la soirée) puis implémenter `evening.ts` ; vérifier qu’ils passent
- [x] 2.10 Écrire les tests de la sauvegarde (format versionné, contenu limité à graine, difficulté, zone, version des données, progression, aucun champ caché ; données changées détectées) puis implémenter `save.ts` avec un port de stockage ; vérifier qu’ils passent
- [x] 2.11 Mettre à jour `docs/reference/DATA-MODEL.md` §5 : `Progress` (`measuredRoutes`, `alibiStatuses`, lieux ouverts)

## 3. Données et Worker

- [x] 3.1 Écrire les tests du chargement avec un faux `fetch` (index des communes, manifeste, cases de lieux et de graphe autour d’une zone avec marge de 1 km, case absente = vide, version des données) puis implémenter `src/lib/data/` ; vérifier qu’ils passent
- [x] 3.2 Écrire les tests du gestionnaire de messages sur des fixtures : `start` (projection, échec de génération), `open`, `measure` (lieu non retenu refusé), `accuse` (seconde accusation refusée, révélation avec séjours et trajets), `resume` (progression restaurée, régénération identique) ; vérifier qu’ils échouent
- [x] 3.3 Implémenter `handle.ts` et le protocole de messages, puis le fichier du Worker (`new Worker(new URL(…, import.meta.url), { type: 'module' })`) ; vérifier que 3.2 passe
- [x] 3.4 Écrire le magasin à runes de l’interface (client du Worker, sauvegarde après chaque action, reprise au démarrage) ; vérifier avec `npm run check`
- [x] 3.5 Mesurer sur les données de Fuveau : temps de démarrage (cible : moins de 3 s, données déjà téléchargées) et poids des cases chargées ; noter les chiffres dans le README de `src/lib/game/`

## 4. Carte

- [x] 4.1 Relire la documentation à jour de MapLibre 6 sur le contrôle d’attribution (`compact`, classes de dépliage) puis modifier `src/lib/map/Map.svelte` : bouton « i » toujours présent, attribution dépliée à l’affichage puis repliée après quelques secondes ou au premier déplacement, sans la barre permanente ni la mention de fiction de la carte
- [x] 4.2 Ajouter à `Map.svelte` les événements de toucher d’un lieu et d’une pastille de suspect (identifiant) et les pastilles de suspects à initiale (hachurées en cas d’incohérence) ; vérifier avec `/map` (adapter la page si besoin)
- [x] 4.3 Faire gérer à `Map.svelte` l’itinéraire et son étiquette de durée pour un trajet mesuré à la demande, et vérifier à la main avec `npm run dev` que l’attribution se déplie, se replie et se rouvre

## 5. Écrans

- [x] 5.1 Écrire le module des textes de l’interface (`src/lib/game/texts.ts`, français) et le dessin des têtes d’après l’identifiant du suspect
- [x] 5.2 Écrire l’écran de départ (`/`) : « Je me localise » avec refus géré, recherche de commune, difficulté, mention de fiction, reprise ; zone insuffisante avec communes voisines et échec de génération expliqués
- [x] 5.3 Écrire la coquille du jeu (en-tête avec roue crantée, barre d’onglets Carte, Carnet, Suspects avec compteurs) et l’écran Réglages et À propos (thème, rappel de l’enquête, nouvelle enquête, crédits)
- [x] 5.4 Écrire l’écran Carte : panneau d’un lieu avec ses pièces (objets, pictogrammes, têtes, « FIABLE » seulement pour preuves et PNJ), « Vers le lieu du mystère », « Trajet vers… » limité aux lieux retenus avec durées des seuls trajets mesurés, curseur horaire, panneau d’un suspect
- [x] 5.5 Écrire l’écran Carnet : chronologie, incohérences reliées, trajets mesurés, note libre, annotations de lieux
- [x] 5.6 Écrire l’écran Suspects et les fiches qui se remplissent au fil de l’enquête (trois versions, « RIEN POUR L’INSTANT », « N lieux explorés sur M », statut d’alibi choisi), l’accusation avec confirmation
- [x] 5.7 Écrire la révélation : verdict, auteur, texte de révélation et rejeu de la soirée sur la carte avec horloge (lecture, pause, déplacement) ; disponible après reprise d’une enquête conclue

- [x] 5.8 Simplifier l’interface après le premier essai : marquer sur le curseur horaire les heures où il se passe quelque chose, retirer du panneau d’un lieu les aides « si ce fait est vrai… » (elles restent dans le Carnet), retirer toute étiquette « fiable », « preuve » ou « témoin » des pièces et des faits, fermer le panneau en touchant la carte hors des lieux retenus et après le choix d’un trajet
- [x] 5.9 Ne rien conclure pendant la partie : ni incohérence ni verdict d’alibi dans le Carnet, le panneau d’un suspect ou les pastilles ; la révélation fournit les trajets entre les lieux de l’enquête et le Carnet explique alors la partie, avec un bouton depuis la révélation
- [x] 5.10 Faits lus : un fait n’entre au Carnet, dans les fiches et sur le curseur qu’une fois sa pièce touchée ; l’avatar d’un témoignage ouvre la fiche du suspect et le bouton « Fiche de … » du panneau disparaît (celui de l’écran Suspects reste)
- [x] 5.11 Guide de départ en trois bulles (un lieu numéroté, une pièce, un trajet vers le lieu du mystère), passable, montré une seule fois et rejouable depuis les Réglages

## 6. Vérifications

- [x] 6.1 Jouer une enquête complète à Fuveau, du départ à la révélation, et la comparer aux croquis de `docs/design/` ; noter les écarts
- [x] 6.2 Vérifier dans les outils de développement qu’aucune donnée cachée n’est lisible (état de l’interface, messages du Worker, stockage) avant l’accusation ; fermer et rouvrir l’application pour vérifier la reprise
- [x] 6.3 Lancer `npm run test`, `npm run check`, `npm run lint` et `npm run build` ; vérifier qu’ils passent et que le Worker et la page de jeu fonctionnent dans la version de production

## 7. Test de jeu et cap

- [ ] 7.1 Organiser un test de jeu avec 3 à 5 personnes ; consigner dans `docs/playtests/` un compte rendu (temps de résolution, points de blocage, plaisir, lisibilité des signalements après mesure)
- [ ] 7.2 Mettre à jour `docs/VISION.md` (§6 : Worker comme frontière, 40 lieux, mesure avant signalement, sauvegarde par graine et version des données ; §7 : étape 5 et conclusions du test de jeu) et `AGENTS.md` si la structure change ; vérifier avec `grep` que rien ne contredit les briefs 06 et 07
