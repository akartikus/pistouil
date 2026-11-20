# Tasks

## 1. Workflow de tests

- [x] 1.1 Relever dans la documentation officielle les versions fixes actuelles de `actions/checkout` et `actions/setup-node` (MCP `context7`)
- [x] 1.2 Créer `.github/workflows/test.yml` (déclencheurs, Node 22 avec cache npm, `permissions: contents: read`, `concurrency` avec annulation, `timeout-minutes`, étapes `npm ci`, `check`, `lint`, `test`, `build`) ; vérifier que `npx prettier --check .github` passe et que les mêmes commandes réussissent en local
- [x] 1.3 Pousser une branche avec une pull request de test contenant un test volontairement en échec ; vérifier que le workflow est en échec, puis corriger et vérifier qu'il est au vert
- [x] 1.4 Pousser deux commits de suite sur cette pull request ; vérifier que l'exécution obsolète est annulée
- [x] 1.5 Vérifier qu'un push sur une branche sans pull request ne lance rien, et noter la durée réelle de l'exécution pour fixer `timeout-minutes`

## 2. Documentation

- [x] 2.1 Ajouter au `README.md` une section « Tests automatiques » : déclencheurs, étapes, durée et minutes consommées mesurées en 1.5, protection de `master` (ou discipline d'équipe si le plan GitHub ne la permet pas) ; vérifier que `npx prettier --check README.md` passe
- [x] 2.2 Mettre à jour `docs/VISION.md` (feuille de route : partie A du brief 07 faite ; décisions si elles ont changé) et vérifier qu'aucune ligne ne contredit le workflow livré
