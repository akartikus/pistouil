# Brief 05 — Boucle de jeu complète

**Objectif** : une enquête jouable de bout en bout, du choix du lieu à la révélation finale, en reliant le moteur, les données et la carte.
**Dépend de** : briefs 01 à 04.
**À lire** : `docs/VISION.md` §2, §5 et §6 (direction artistique) ; croquis des écrans carte, carnet et suspects (phase de design, `VISION.md` §7) ; `docs/reference/DATA-MODEL.md` §4 et §5.

## Périmètre

**Inclus**
- Écran de départ : « Je me localise » ou recherche d’une commune ; choix de la difficulté.
- Construction de la zone (centre + rayon adaptatif), chargement des cases, calcul des trajets, génération dans le Web Worker.
- Écran **Carte** : panneau d’un lieu de l’enquête (faits découverts, bouton « Trajet vers… »).
- Découverte des faits : ouvrir un lieu révèle ses faits ; les liens « débloqué par » font apparaître de nouveaux lieux ou faits.
- **Curseur horaire** : place chaque suspect là où il affirme être, selon les faits découverts, et signale les contradictions.
- Écran **Carnet** : chronologie des faits découverts, incohérences repérées, notes libres, annotations attachées à des lieux.
- Écran **Suspects** : fiches, statut d’alibi (vérifié, douteux, à vérifier), accusation unique.
- **Révélation** : la carte rejoue la vraie soirée le long des trajets, et le texte de révélation du motif du mensonge (`revelationText`, rendu par le moteur) s’affiche.
- Progression sauvegardée localement (seed + faits découverts + annotations + notes + accusation).
- Mention de fiction visible.

**Exclu**
- Hors-ligne complet et application native (brief 06).
- Limite de visites, score, partage, IA.

## Exigences

### Démarrer une enquête
- QUAND le joueur choisit Fuveau et une difficulté
- ALORS une enquête est générée et affichée en moins de 3 secondes sur un téléphone moyen, données déjà téléchargées.
- QUAND la zone ne contient pas assez de lieux même au rayon maximal
- ALORS le jeu l’explique simplement et propose une commune voisine.

### Exploration libre
- QUAND le joueur ouvre un lieu de l’enquête
- ALORS ses faits sont marqués découverts et ajoutés au carnet,
- ET les lieux ou faits qu’ils débloquent deviennent accessibles.

### Statut des alibis
- QUAND un fait découvert innocente un suspect selon les règles du solveur
- ALORS son alibi peut être marqué « vérifié » par le joueur ; le jeu ne le fait jamais à sa place.

### Accusation unique
- QUAND le joueur accuse un suspect
- ALORS l’accusation est définitive, puis la révélation se lance, que la réponse soit juste ou non.

### Reprise
- QUAND le joueur ferme l’application puis la rouvre
- ALORS il retrouve son enquête exactement où il l’avait laissée, régénérée à partir de la seed.

### Rien n’est révélé avant l’heure
- L’interface n’affiche jamais l’auteur, les mensonges ni la vraie soirée avant l’accusation.
- Le `revelationText` n’entre dans l’état de l’interface qu’après l’accusation.

## Critères d’acceptation

- [ ] Une enquête à Fuveau se joue du début à la fin, conformes aux croquis des trois écrans (carte, carnet, suspects).
- [ ] Test de jeu avec 3 à 5 personnes : temps de résolution, points de blocage et plaisir notés dans un compte rendu.
- [ ] Aucune donnée cachée n’est lisible dans l’état de l’interface (vérification dans les outils de développement).

## Points à trancher pendant la proposition

- Forme exacte du signalement des contradictions sur le curseur horaire.
- Les liens « débloqué par » produits par le moteur relient aujourd’hui des faits d’un même lieu : ouvrir un lieu révèle donc tous ses faits d’un coup. Décider s’il faut aussi des liens entre lieux (alors un changement du moteur), ou s’en tenir à l’ouverture du lieu.
- Textes de l’interface (boutons, libellés, messages) : seuls textes rédigés dans ce brief. Les textes des faits viennent du moteur (`renderedText`, brief 01).

## Consigne pour OpenSpec

> Crée un nouveau changement OpenSpec nommé `add-game-loop` à partir de ce brief. L’état visible par l’interface doit être une projection de l’enquête qui exclut les données cachées. Termine `tasks.md` par une session de test de jeu et la mise à jour de `docs/VISION.md` avec ses conclusions.
