# Tasks

## 1. Logique d’affichage

- [x] 1.1 Écrire `src/lib/playground/playground.spec.ts` : catalogue réduit au scénario et au motif choisis ; lieux filtrés avec matrice complète ; modèle de vue d’une enquête valide (suspects, faits avec lien « débloqué par », tours du solveur, aucune règle violée) ; échec de génération transmis tel quel ; données cachées présentes seulement dans la section « révélation »
- [x] 1.2 Implémenter `src/lib/playground/playground.ts` (réduction du catalogue, filtrage des lieux, `describeInvestigation`) sans modifier `src/lib/engine`, et vérifier que 1.1 passe

## 2. Page

- [x] 2.1 Créer `src/routes/playground/+page.ts` qui renvoie 404 hors développement, et vérifier en production (`npm run build`, puis `npm run preview`) que `/playground` répond « introuvable »
- [x] 2.2 Créer `src/routes/playground/+page.svelte` : contrôles (seed et tirage, difficulté, scénario, motif, lieux), résultat (situation, suspects, faits, solveur, règles, échec) et case de révélation ; vérifier en développement (`npm run dev`) que chaque choix change l’enquête et que la même seed redonne la même enquête
- [x] 2.3 Ajouter la liste des scénarios du catalogue à la page et vérifier qu’elle affiche les 7 scénarios

## 3. Résolution, matrice et titres des scénarios

- [x] 3.1 Écrire les tests dans `playground.spec.ts` : matrice complète et symétrique avec la scène marquée et un lieu désactivé absent ; `discoveredFactIds` (lieu fermé, fait visible au départ, fait débloqué seulement après son déclencheur) ; `checkAccusation` (bon et mauvais suspect) ; `reveal` contient les tours du solveur et le détail des faits, et rien de cela n’est hors de `reveal`
- [x] 3.2 Implémenter `describeMatrix`, `discoveredFactIds`, `checkAccusation` et la nouvelle séparation `reveal` dans `src/lib/playground/playground.ts`, et vérifier que 3.1 et les tests existants passent
- [x] 3.3 Mettre à jour `src/routes/playground/+page.svelte` : matrice, section « Enquêter » (ouvrir un lieu, faits découverts, accusation, remise à zéro quand l’enquête change), solution et détail du moteur derrière la case de révélation, scénarios listés par titre seulement ; vérifier avec `npm run dev` et un navigateur sans interface que la solution est cachée par défaut et qu’un lieu ouvert affiche ses faits

## 4. Onglets et snapshot

- [x] 4.1 Écrire le test de `describeSnapshot` dans `playground.spec.ts` : choix du moteur (seed, difficulté, scénario, motif, scène, heure en minutes et en heures, auteur, lieux retenus), un suspect par personnage avec sa vraie soirée, un fait par fait avec identifiants et minutes
- [x] 4.2 Implémenter `describeSnapshot` dans `src/lib/playground/playground.ts` et vérifier que 4.1 passe
- [x] 4.3 Ajouter les onglets « Simulation » et « Snapshot » à `+page.svelte` (contrôles communs, simulation par défaut, JSON brut déplacé dans le snapshot) ; vérifier avec un navigateur sans interface que l’onglet par défaut est la simulation et que le snapshot affiche les choix du moteur

## 5. Finition

- [x] 5.1 Vérifier `npm run test`, `npm run check`, `npm run lint` et `npm run build` sans erreur
- [x] 5.2 Ajouter la ligne `src/lib/playground` à la table Structure de `AGENTS.md` et vérifier que `src/lib/engine` n’a pas été modifié (`git diff --stat`)

## Workflow follow-up

- Archiver le changement une fois la revue terminée.
