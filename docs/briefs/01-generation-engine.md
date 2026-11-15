# Brief 01 — Moteur : génération et solveur

**Objectif** : à partir d’une liste de lieux, d’une matrice de temps de marche, du catalogue et d’une seed, produire une enquête valide, vérifiée par le solveur.
**Dépend de** : étape 0 (projet initialisé).
**À lire** : `docs/VISION.md` §4 et §6 (ton et règles de rédaction, issus de la phase de rédaction, §7) ; `docs/reference/DATA-MODEL.md` en entier.

## Périmètre

**Inclus**
- Types TypeScript du modèle (catalogue, lieux, enquête, faits, sources, segments, trajets, progression).
- Un catalogue de départ en JSON (`catalog/`) : types de lieux et rôles, types d’indices avec leurs gabarits, compatibilités, au moins 3 modèles de scénario farceurs, inoffensifs et situés dans un lieu public non sensible (avec les textes de révélation par motif), liste de prénoms, gabarits de témoignage. Le contenu vient des notes de la phase de rédaction.
- Le rendu des textes : le moteur remplit les gabarits et produit `renderedText` pour chaque indice et chaque témoignage.
- Le générateur : choix de la scène, de l’heure, des suspects et de l’auteur ; simulation de la vraie soirée ; dérivation des témoignages, du mensonge et des indices ; liens « débloqué par ».
- Le solveur, tel que décrit dans la référence §7.
- La vérification de toutes les règles de cohérence (référence §6).
- Un générateur pseudo-aléatoire déterministe initialisé par la seed.

**Exclu**
- Lecture des données OSM (brief 02) et calcul des trajets (brief 03) : le moteur reçoit lieux et matrice en entrée.
- Interface, carte, stockage.
- Textes enrichis par IA.

## Exigences

### Le moteur est pur et reproductible
- QUAND on appelle `generateInvestigation(places, routes, catalog, { seed, difficulty })` deux fois avec les mêmes entrées
- ALORS les deux enquêtes sont strictement identiques.
- Le moteur n’utilise ni `Math.random`, ni l’horloge, ni le réseau, ni le DOM.

### La vérité d’abord
- QUAND une enquête est générée
- ALORS l’enquête a `difficulty + 2` suspects (difficulté de 1 à 3),
- ET chaque suspect a une vraie soirée faite de segments consécutifs, dont les enchaînements respectent les temps de marche,
- ET l’auteur est présent sur la scène à l’heure du mystère,
- ET chaque fait non mensonger est inclus dans un segment.

### Un seul mensonge, avec un motif
- QUAND une enquête est générée
- ALORS l’auteur fait exactement un témoignage mensonger : un faux alibi sur lui-même, ou, selon la difficulté, une accusation d’un autre suspect ou un alibi dans un lieu fermé (voir `docs/reference/DATA-MODEL.md`, genres de mensonge),
- ET ce témoignage porte un motif parmi `surprise`, `modesty`, `clumsiness`, `misunderstanding`, `mistake`.

### Textes rendus par le moteur
- QUAND une enquête est générée
- ALORS chaque indice et chaque témoignage a un `renderedText` sans variable non résolue,
- ET deux personnages n'ont jamais le même prénom,
- ET aucun `renderedText` ne signale qu'un témoignage est un mensonge.

### Rôles des lieux respectés
- QUAND le générateur choisit la scène
- ALORS il ne la prend que parmi les lieux de rôle `scene`,
- ET il n’utilise jamais un lieu `excluded` ou `removed`,
- ET les lieux d’alibi (rôle `alibi`, ou rôle `scene` qui n’est pas la scène) ne reçoivent que des indices de la table de compatibilité, à une heure d’ouverture (un lieu sans horaires est toujours ouvert), et les lieux de rôle `alibi` que des faits neutres ou positifs,
- ET une scène peut recevoir des PNJ et des témoins, dont les faits n’innocentent personne,
- ET une preuve (ticket, addition, titre de transport) est datée de la fin du séjour, car la personne part ensuite.

### Validation par le solveur
- QUAND le solveur analyse l’exemple de référence (référence §8)
- ALORS il trouve Lucie comme seule suspecte possible, avec une difficulté de 1.
- QUAND on retire le ticket de caisse de l’exemple
- ALORS le solveur trouve deux suspects possibles et l’enquête est déclarée invalide.
- Le solveur ne lit jamais `author`, `lie` ni `motive`.

### Matrice de trajets complète
- QUAND le moteur reçoit des lieux et des trajets
- ALORS il exige un `Route` symétrique pour chaque paire de lieux fournis, de `minutes ≥ 1`,
- ET il rejette l’entrée avec une erreur explicite s’il en manque un.

### Solution atteignable
- QUAND une enquête est générée
- ALORS le graphe « débloqué par » est sans cycle et toute chaîne finit par un fait visible dès le départ,
- ET le solveur, appliqué aux seuls faits atteignables, trouve l’auteur comme seul suspect possible.

### Mensonge démasquable
- QUAND une enquête est générée
- ALORS le témoignage mensonger est contredit (référence §7) par au moins un fait fiable à la fin de la résolution, qui n’est pas de l’auteur,
- ET aucun fait vrai n’est contredit par un fait fiable.

### Réparation ou rejet
- QUAND une enquête générée n’est pas valide
- ALORS le générateur ajoute ou retire un indice et revérifie, dans une limite de tentatives,
- ET s’il n’y parvient pas, il recommence avec une seed dérivée, de façon déterministe.

### Difficulté
- QUAND le joueur demande une difficulté donnée
- ALORS l’enquête produite a exactement cette difficulté selon le solveur, ou le générateur signale qu’il ne peut pas l’atteindre avec ces lieux.

## Critères d’acceptation

- [ ] Tous les types du modèle existent et compilent en mode strict.
- [ ] L’exemple de référence et sa variante invalide sont des tests permanents ; l’exemple contient un mensonge contredit (témoignage d’Inès).
- [ ] Sur 500 seeds et un jeu de lieux fictif de 8 lieux (4 `scene`, 2 `alibi`, 1 `excluded`, 1 `removed`, matrice complète), à chaque difficulté de 1 à 3, 100 % des enquêtes produites sont valides et respectent toutes les règles de cohérence.
- [ ] Même seed, même enquête (test dédié).
- [ ] Sur les 500 seeds, le mensonge est toujours démasquable et aucun fait vrai n’est contredit.
- [ ] Sur les 500 seeds, aucun texte avec variable non résolue et aucun prénom en double.
- [ ] Génération d’une enquête en moins de 200 ms sur un ordinateur de bureau.

## Points à trancher pendant la proposition

- Algorithme pseudo-aléatoire : mulberry32 (tranché, voir `docs/VISION.md` §6).

## Consigne pour OpenSpec

> Crée un nouveau changement OpenSpec nommé `add-generation-engine` à partir de ce brief. Respecte strictement le périmètre « Inclus / Exclu », reprends chaque exigence comme exigence de spécification avec ses scénarios, et découpe `tasks.md` de façon à écrire les tests de l’exemple de référence avant le solveur. Appuie-toi sur `docs/reference/DATA-MODEL.md` pour les types et les règles, sans les redéfinir.
