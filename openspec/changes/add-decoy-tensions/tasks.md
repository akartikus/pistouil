# Tasks

## 1. Séjours tendus dans la génération

- [x] 1.1 Écrire les tests dans `generate.spec.ts`, par difficulté : aucune tension à 1 ; à 2 et à 3 des tensions pour des innocents et pour l'auteur ; chaque tension a un écart entre le trajet et le trajet + 3 min ; la preuve d'un séjour tendu ne disculpe pas (même difficulté et mêmes innocentés qu'avec elle retirée) ; les enquêtes restent valides
- [x] 1.2 Implémenter le séjour tendu et le témoignage d'arrivée dans `addDistantProofs` (`generate.ts`), avec repli sur le séjour lointain, et vérifier que 1.1, la suite et les 500 seeds passent

## 2. Mesure, documents

- [x] 2.1 Mesurer sur 300 seeds par difficulté (jeu riche) la part de vraies contradictions parmi les paires contredites ou tendues (100 % à 1, plus bas à 2 et 3), rejouer le fuzz du jeu de 8 lieux (mêmes chiffres de réussite qu'avant) et lire dans le playground quelques enquêtes pour juger si les tensions se lisent bien
- [x] 2.2 Mettre à jour `docs/reference/DATA-MODEL.md` (tensions apparentes) et `guide/ENGINE.md`, puis lancer `npm run test`, `check`, `lint`, `build` et `openspec validate --all --strict`
