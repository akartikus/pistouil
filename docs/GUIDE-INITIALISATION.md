# Guide d’initialisation

> Objectif : un dépôt SvelteKit + Capacitor prêt, OpenSpec initialisé, et la documentation en place. Aucune fonctionnalité n’est codée ici : tout le reste passe par les briefs.
> Les commandes évoluent avec les outils : en cas d’écart, la documentation officielle de chaque outil fait foi.

## 0. Prérequis

| Outil | Pour quoi | Quand |
| --- | --- | --- |
| Node.js LTS (20 ou plus) et npm | Projet web, OpenSpec | Maintenant |
| Git | Versionnage | Maintenant |
| Android Studio | Application Android | Étape 6 |
| Xcode (macOS uniquement) | Application iOS | Étape 6 |
| Python 3, osmium-tool, pyosmium | Préparation des données | Étape 2 |

## 1. Créer le projet SvelteKit

```bash
npx sv create pistouil
```

Choix à faire dans l’assistant : modèle **minimal**, **TypeScript**, et les modules **vitest**, **prettier**, **eslint**.

```bash
cd pistouil
git init
```

## 2. Passer en application statique

```bash
npm install -D @sveltejs/adapter-static
```

`svelte.config.js` :

```js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: { adapter: adapter({ fallback: 'index.html' }) }
};
```

`src/routes/+layout.ts` :

```ts
export const ssr = false;
```

Vérifier que `tsconfig.json` contient `"strict": true`.

## 3. Créer l’arborescence

```bash
mkdir -p src/lib/{moteur,donnees,carte,jeu} catalogue outils/preparation-donnees static/carte docs/reference docs/briefs
```

| Dossier | Contenu |
| --- | --- |
| `src/lib/moteur` | Génération, solveur, trajets (code pur) |
| `src/lib/donnees` | Chargement et cache des données |
| `src/lib/carte` | Composants de carte |
| `src/lib/jeu` | État de partie et progression |
| `catalogue` | JSON du catalogue |
| `outils/preparation-donnees` | Scripts Python OSM |
| `static/carte` | Style, polices, icônes de la carte |
| `docs` | Vision, référence, briefs |

## 4. Installer les dépendances de carte

```bash
npm install maplibre-gl pmtiles
```

## 5. Ajouter Capacitor

```bash
npm install @capacitor/core
npm install -D @capacitor/cli
npx cap init "Pistouil" fr.tondomaine.pistouil --web-dir build
npm install @capacitor/geolocation @capacitor/filesystem @capacitor/preferences
```

Les plateformes natives (`npx cap add android`, `npx cap add ios`) et les permissions de géolocalisation viendront à l’étape 6. Remplace `fr.tondomaine.pistouil` par ton identifiant d’application définitif : il est difficile à changer après publication.

## 6. Vérifier que tout tourne

```bash
npm run dev     # l’application s’ouvre
npm run test    # Vitest répond (même sans test)
npm run build   # le dossier build/ est produit
```

## 7. Initialiser OpenSpec

```bash
npm install -g @fission-ai/openspec@latest
openspec init
```

Choisis ton assistant de code quand l’outil le demande : `openspec init` installe alors les **skills OpenSpec** dans le dossier de skills de cet assistant (par exemple `.claude/skills/` pour Claude Code). Jette un œil à ce dossier : les noms des skills installés te serviront à l’étape 10.

Place ensuite le contexte du projet fourni dans ce kit (`openspec/project.md`) là où ta version d’OpenSpec l’attend : soit dans `openspec/project.md`, soit dans le champ de contexte du fichier de configuration créé par `openspec init`.

## 8. Installer la documentation

Copie dans le dépôt :

- `docs/VISION.md`
- `docs/GUIDE-INITIALISATION.md`
- `docs/reference/MODELE-DONNEES.md`
- `docs/briefs/01` à `06`

## 9. Premier commit

```bash
git add .
git commit -m "Initialise le projet : SvelteKit statique, Capacitor, OpenSpec, documentation"
```

Coche l’étape 0 dans `docs/VISION.md` §7.

## 10. Travailler avec OpenSpec

### Le principe

OpenSpec fonctionne par **skills** : ton assistant de code les utilise de lui-même quand ta demande correspond à leur rôle. Tu n’as pas de commande à retenir, tu demandes simplement l’action en langage naturel.

Chaque étape de la feuille de route devient un **changement**, qui passe toujours par trois temps :

| Temps | Ce que tu demandes à l’assistant | Ce qui est produit |
| --- | --- | --- |
| 1. Proposer | Créer un changement à partir du brief | Un dossier `openspec/changes/<nom>/` : proposition, spécifications, conception, tâches |
| 2. Appliquer | Implémenter les tâches du changement | Le code et les tests, tâches cochées au fur et à mesure |
| 3. Archiver | Archiver le changement terminé | Les spécifications rejoignent `openspec/specs/`, la référence du projet |

Selon ta version, d’autres skills existent (explorer une idée avant de proposer, vérifier un changement, avancer artefact par artefact) : leurs noms et descriptions sont dans le dossier de skills installé à l’étape 7. Rien n’est codé avant que la proposition soit relue.

### Exemple complet avec l’étape 1

**1. Relire le cap.** Ouvre `docs/VISION.md` et vérifie que `docs/briefs/01-moteur-generation.md` est toujours d’actualité.

**2. Proposer.** Écris à ton assistant :

> Crée un nouveau changement OpenSpec à partir de `docs/briefs/01-moteur-generation.md`, en suivant la consigne à la fin de ce brief. Ne code rien pour l’instant.

L’assistant crée `openspec/changes/ajouter-moteur-generation/` avec la proposition (pourquoi et quoi), les spécifications (exigences et scénarios), éventuellement la conception (choix techniques) et la liste des tâches.

**3. Relire la proposition.** Avant tout code, réponds à ces quatre questions :

- [ ] Le périmètre est-il exactement celui du brief, ni plus ni moins ?
- [ ] Chaque exigence du brief a-t-elle ses scénarios dans les spécifications ?
- [ ] Les tâches sont-elles petites et dans un ordre logique (tests de l’exemple de référence d’abord) ?
- [ ] Rien ne contredit `docs/VISION.md` ?

Si une réponse est non, demande la correction (« Retire la lecture des données OSM du périmètre, elle relève du brief 02 »), puis relis à nouveau.

**4. Appliquer.** Écris :

> Implémente le changement `ajouter-moteur-generation`, tâche par tâche, en cochant chaque tâche terminée.

Après chaque groupe de tâches, lance `npm run test` et regarde le code produit.

**5. Vérifier la fin.** Le changement est terminé quand :

- [ ] toutes les tâches sont cochées ;
- [ ] `npm run test` passe ;
- [ ] les critères d’acceptation du brief sont remplis.

Si ta version propose un skill de vérification, demande-lui de comparer le code au changement.

**6. Archiver.** Écris :

> Archive le changement `ajouter-moteur-generation`.

**7. Mettre à jour le cap.** Dans `docs/VISION.md`, coche l’étape 1 au §7 et ajoute au §6 toute décision prise en route (par exemple le nombre de suspects retenu). Fais un commit.

Puis recommence avec le brief suivant.

### Dans le terminal

La commande `openspec` reste utile pour regarder où en est le projet : `openspec --help` liste ce que ta version propose (par exemple voir les changements en cours, ou valider leur format).

### Trois règles

1. **Un brief, un changement.** Ne mélange jamais deux étapes dans le même changement.
2. **Le cap d’abord.** Si une proposition ou le code remet en cause un principe de `VISION.md`, arrête-toi et tranche d’abord dans `VISION.md`.
3. **Un imprévu, un nouveau brief.** Si un besoin apparaît en route, ne l’ajoute pas au changement en cours : écris un court brief sur le même modèle et traite-le ensuite.
