# Brief 01 — Moteur : génération et solveur

**Objectif** : à partir d’une liste de lieux, d’une matrice de temps de marche, du catalogue et d’une graine, produire une enquête valide, vérifiée par le solveur.
**Dépend de** : étape 0 (projet initialisé).
**À lire** : `docs/VISION.md` §4 ; `docs/reference/DATA-MODEL.md` en entier.

## Périmètre

**Inclus**
- Types TypeScript du modèle (catalogue, lieux, enquête, faits, sources, segments, trajets, progression).
- Un catalogue de départ en JSON (`catalog/`) : types de lieux et rôles, types d’indices, compatibilités, 3 modèles de scénario absurdes et positifs.
- Le générateur : choix de la scène, de l’heure, des suspects et de l’auteur ; simulation de la vraie soirée ; dérivation des témoignages, du mensonge et des indices ; liens « débloqué par ».
- Le solveur, tel que décrit dans la référence §7.
- La vérification de toutes les règles de cohérence (référence §6).
- Un générateur pseudo-aléatoire déterministe initialisé par la graine.

**Exclu**
- Lecture des données OSM (brief 02) et calcul des trajets (brief 03) : le moteur reçoit lieux et matrice en entrée.
- Interface, carte, stockage.
- Textes enrichis par IA.

## Exigences

### Le moteur est pur et reproductible
- QUAND on appelle `genererEnquete(lieux, trajets, catalogue, { graine, difficulte })` deux fois avec les mêmes entrées
- ALORS les deux enquêtes sont strictement identiques.
- Le moteur n’utilise ni `Math.random`, ni l’horloge, ni le réseau, ni le DOM.

### La vérité d’abord
- QUAND une enquête est générée
- ALORS chaque suspect a une vraie soirée faite de segments consécutifs, dont les enchaînements respectent les temps de marche,
- ET l’auteur est présent sur la scène à l’heure du mystère,
- ET chaque fait non mensonger est inclus dans un segment.

### Un seul mensonge, avec un motif
- QUAND une enquête est générée
- ALORS l’auteur fait exactement un témoignage mensonger, sur l’heure ou le lieu où il se trouvait au moment du mystère,
- ET ce témoignage porte un motif parmi `surprise`, `modestie`, `maladresse`.

### Rôles des lieux respectés
- QUAND le générateur choisit la scène
- ALORS il ne la prend que parmi les lieux de rôle `scene`,
- ET il n’utilise jamais un lieu `exclu` ou `retire`,
- ET les lieux d’alibi ne reçoivent que des indices de la table de compatibilité, à une heure d’ouverture.

### Validation par le solveur
- QUAND le solveur analyse l’exemple de référence (référence §8)
- ALORS il trouve Lucie comme seule suspecte possible, avec une difficulté de 1.
- QUAND on retire le ticket de caisse de l’exemple
- ALORS le solveur trouve deux suspects possibles et l’enquête est déclarée invalide.
- Le solveur ne lit jamais `auteur`, `mensonge` ni `motif`.

### Réparation ou rejet
- QUAND une enquête générée n’est pas valide
- ALORS le générateur ajoute ou retire un indice et revérifie, dans une limite de tentatives,
- ET s’il n’y parvient pas, il recommence avec une graine dérivée, de façon déterministe.

### Difficulté
- QUAND le joueur demande une difficulté donnée
- ALORS l’enquête produite a exactement cette difficulté selon le solveur, ou le générateur signale qu’il ne peut pas l’atteindre avec ces lieux.

## Critères d’acceptation

- [ ] Tous les types du modèle existent et compilent en mode strict.
- [ ] L’exemple de référence et sa variante invalide sont des tests permanents.
- [ ] Sur 500 graines et un jeu de lieux fictif de 8 lieux, 100 % des enquêtes produites sont valides et respectent toutes les règles de cohérence.
- [ ] Même graine, même enquête (test dédié).
- [ ] Génération d’une enquête en moins de 200 ms sur un ordinateur de bureau.

## Points à trancher pendant la proposition

- Nombre de suspects par défaut (proposition : 3 à 5 selon la difficulté).
- Algorithme pseudo-aléatoire retenu (proposition : un générateur simple et éprouvé, type mulberry32 ou xoshiro).

## Consigne pour OpenSpec

> Crée un nouveau changement OpenSpec nommé `add-generation-engine` à partir de ce brief. Respecte strictement le périmètre « Inclus / Exclu », reprends chaque exigence comme exigence de spécification avec ses scénarios, et découpe `tasks.md` de façon à écrire les tests de l’exemple de référence avant le solveur. Appuie-toi sur `docs/reference/DATA-MODEL.md` pour les types et les règles, sans les redéfinir.
