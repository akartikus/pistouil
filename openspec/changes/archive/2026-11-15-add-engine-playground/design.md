# Design

## Context

Le moteur (`src/lib/engine`, specs `investigation-generation`, `investigation-solver`, `consistency-rules`, `catalog`) est pur et sans interface. Le catalogue de départ et les lieux fictifs existent déjà (`catalog/*.json`, `src/lib/engine/fixtures.ts`). SvelteKit est en mode statique avec `ssr = false` (`src/routes/+layout.ts`). Voir `proposal.md` pour la motivation.

## Goals / Non-Goals

**Goals:**
- Une page simple, interactive, sans modifier le moteur.
- Une logique d’affichage testable en dehors de Svelte.

**Non-Goals:**
- Écran de jeu, carte, stockage, édition du catalogue, lieux réels.
- Mise en forme soignée : l’identité visuelle vient avec le brief 04.

## Decisions

**Route de développement.** `src/routes/playground/+page.svelte`, avec un `+page.ts` dont `load` lève une erreur 404 quand `dev` (de `$app/environment`) est faux. *Alternative écartée* : exclure la route du build (plus lourd, fragile avec adapter-static).

**Forcer scénario et motif sans toucher au moteur.** La page passe au moteur une copie du catalogue réduite au scénario choisi, dont `lieMotives` est réduit au motif choisi. *Alternative écartée* : ajouter des options au moteur (hors périmètre, couplerait le moteur à un outil de test).

**Lieux activables.** La page filtre `places` et `routes` aux lieux cochés avant l’appel : la matrice reste complète sur le sous-ensemble.

**Logique dans `src/lib/playground`.** Fonctions pures : réduction du catalogue, filtrage des lieux, et un modèle de vue (`describeInvestigation`) qui assemble suspects, faits, tours du solveur et règles violées à partir du résultat du moteur. Testé avec Vitest ; le composant Svelte ne fait que l’affichage. Le modèle de vue ne contient les données cachées (auteur, mensonge, vraie soirée, révélation) que dans une section dédiée, affichée seulement à la demande.

**Données.** Catalogue et lieux viennent de `fixtures.ts` (importés par la page de développement). Ce fichier reste une fixture : la page n’est pas dans le build de production utile.

**Matrice.** `describeMatrix` construit, à partir de lieux et de leurs trajets, une grille de textes « N min (M m) » avec la scène marquée. Avec beaucoup de lieux actifs (jeu riche), la page affiche par défaut seulement les lieux de l’enquête ; une case permet d’afficher tous les lieux actifs, et c’est ce qui s’affiche en cas d’échec de génération.

**Mode enquêteur.** État local de la page : lieux ouverts et suspect accusé, remis à zéro quand l’enquête change. `discoveredFactIds(investigation, openedPlaceIds)` applique la règle du jeu (un fait est découvert si son lieu est ouvert et que son fait déclencheur l’est) ; `checkAccusation` compare au vrai auteur. Les deux sont des fonctions pures et testées.

**Onglets et snapshot.** Un état `tab` local à la page. Les contrôles restent au-dessus des onglets. `describeSnapshot` (fonction pure, testée) met en tableaux simples les choix du moteur : une liste nom/valeur, les suspects et leur vraie soirée, les faits bruts. L’onglet snapshot contient la solution : c’est un outil de débogage, séparé de la simulation. L’enquête brute en JSON y est déplacée.

**Séparation visible / caché.** Le modèle de vue range dans `reveal` tout ce qui dévoile la solution ou aide à la trouver : auteur, mensonge, vraie soirée, révélation, tours du solveur, statuts des faits et liens de déblocage. Ce qui est hors de `reveal` ne contient que ce qu’un joueur peut voir.

**Style.** CSS minimal dans le composant, sans bibliothèque.

## Risks / Trade-offs

- [`fixtures.ts` importé hors des tests] → acceptable pour un outil de développement ; le jour où les données OSM arrivent, la page prendra de vrais lieux (hors périmètre ici).
- [La route est présente dans le build statique] → `load` renvoie 404 en production ; vérifié par une tâche dédiée.
- [Le modèle de vue duplique un peu la logique du solveur] → il appelle `solve` et `checkRules` du moteur, sans recalculer.
