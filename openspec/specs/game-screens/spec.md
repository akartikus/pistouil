# game-screens Specification

## Purpose
Écrans de jeu : accueil, carte avec curseur horaire, fiches de lieu et de suspect, Carnet, révélation, réglages et guide de départ, dans le registre brutaliste du jeu.

## Requirements

### Requirement: Écran de départ
L’écran de départ SHALL proposer « Je me localise » ou la recherche d’une commune, le choix de la difficulté (1 à 3) et la mention de fiction : les lieux sont réels, les personnages et les faits sont imaginaires. Quand une enquête est sauvegardée, il SHALL indiquer son état et proposer de la reprendre ou d’en revoir la révélation. Il SHALL toujours proposer une nouvelle enquête.

#### Scenario: Reprise proposée
- **WHEN** une enquête sauvegardée est en cours
- **THEN** l’écran de départ indique qu’elle est en cours et propose de la reprendre, et propose aussi une nouvelle enquête

#### Scenario: Enquête terminée
- **WHEN** l’enquête sauvegardée a déjà une accusation
- **THEN** l’écran de départ indique qu’elle est terminée, propose d’en revoir la révélation et non de la reprendre, et propose aussi une nouvelle enquête

#### Scenario: Nouvelle enquête avec une sauvegarde
- **WHEN** le joueur commence une nouvelle enquête alors qu’une autre est sauvegardée
- **THEN** la nouvelle remplace la sauvegarde, et l’écran l’avait annoncé

### Requirement: Navigation et réglages
Pendant une enquête, une barre en bas SHALL donner accès aux écrans Carte, Carnet et Suspects, avec le nombre de faits et de suspects, et une roue crantée de l’en-tête SHALL ouvrir les Réglages.

#### Scenario: Changer d’écran
- **WHEN** le joueur touche « Carnet »
- **THEN** le Carnet s’affiche et son onglet est marqué actif

### Requirement: Panneau d’un lieu et pièces
Toucher un lieu retenu sur la carte SHALL ouvrir son panneau et en montrer les pièces. Un fait ne SHALL rejoindre le Carnet, les fiches et le curseur horaire qu’une fois sa pièce touchée par le joueur. Le panneau SHALL présenter les faits comme des pièces : un objet pour une preuve selon son type d’indice, un pictogramme pour un PNJ, la tête du suspect pour un témoignage. Ouvrir une pièce affiche son texte. Le panneau n’affiche aucune aide à la déduction : celles-ci vivent dans le Carnet.

#### Scenario: Ouverture d’un lieu
- **WHEN** le joueur touche un lieu retenu qui a un ticket de caisse et un témoignage
- **THEN** le panneau montre un ticket et la tête du témoin, sans que les faits soient encore au Carnet

#### Scenario: Pièce touchée
- **WHEN** le joueur touche la pièce du témoignage
- **THEN** son texte s’affiche et le fait rejoint le Carnet, la fiche du suspect et le curseur horaire

#### Scenario: Pièce non touchée
- **WHEN** le joueur n’a pas touché une pièce du lieu
- **THEN** son fait n’apparaît ni au Carnet, ni dans une fiche, ni sur le curseur

### Requirement: Aucune étiquette sur les pièces
Le jeu SHALL ne mettre aucune étiquette de fiabilité ou de nature (« fiable », « preuve », « témoin ») sur une pièce, un fait ou un témoignage : l’objet, le pictogramme ou la tête, le libellé du type et le texte suffisent.

#### Scenario: Preuve et témoignage
- **WHEN** le joueur ouvre un ticket de caisse puis le témoignage d’un suspect
- **THEN** aucune des deux cartes ne porte d’étiquette de fiabilité

### Requirement: Trajet entre lieux retenus
Le panneau d’un lieu SHALL offrir « Vers le lieu du mystère » (trajet direct) et « Trajet vers… », qui liste seulement les lieux retenus, numérotés, le lieu du mystère en tête. Choisir un lieu SHALL tracer l’itinéraire sur la carte avec sa durée, précédée de « ~ » si estimée. La liste SHALL montrer la durée des trajets déjà mesurés et « — » pour les autres.

#### Scenario: Choix d’un trajet
- **WHEN** le joueur choisit un lieu dans « Trajet vers… »
- **THEN** l’itinéraire est tracé en pointillés avec sa durée, et le trajet est noté comme mesuré

#### Scenario: Points libres exclus
- **WHEN** le joueur ouvre « Trajet vers… »
- **THEN** seuls les lieux de l’enquête sont proposés

### Requirement: Le panneau se ferme après un trajet
Dès qu’un trajet est choisi, par « Vers le lieu du mystère » ou dans « Trajet vers… », le panneau SHALL se fermer et l’itinéraire rester affiché sur la carte.

#### Scenario: Panneau refermé
- **WHEN** le joueur choisit « Vers le lieu du mystère » ou un lieu dans « Trajet vers… »
- **THEN** le panneau se ferme et l’itinéraire reste affiché avec sa durée

### Requirement: Curseur horaire
La carte SHALL offrir un curseur horaire qui couvre l’heure du mystère et tous les faits découverts, et qui marque sur sa piste les heures où il se passe quelque chose (début et fin des faits découverts, l’heure du mystère d’une marque à part).

#### Scenario: Heures marquées
- **WHEN** des faits ont été découverts
- **THEN** leurs heures sont marquées sur le curseur, avec une marque à part pour l’heure du mystère

### Requirement: Suspects sur la carte
La carte SHALL placer une pastille à initiale par suspect selon les positions de la capability `game-deduction` à l’heure du curseur. Toucher une pastille SHALL ouvrir un panneau : où il est à cette heure, son statut d’alibi, et un bouton vers sa fiche.

#### Scenario: Suspect au curseur
- **WHEN** le joueur règle le curseur sur 20:40
- **THEN** chaque suspect localisé à cette heure apparaît à son lieu

### Requirement: Carnet
Le Carnet SHALL montrer la chronologie des faits découverts (heure, suspect, source), les trajets mesurés, une note libre et les annotations de lieux. Pendant la partie, il ne montre ni incohérence ni verdict. Une fois la partie terminée, il SHALL montrer tous les faits de l’enquête, avec leurs incohérences et verdicts d’alibi. Il SHALL se mettre à jour à chaque lieu ouvert.

#### Scenario: Pendant la partie
- **WHEN** le joueur consulte le Carnet avant d’avoir accusé
- **THEN** aucune incohérence ni aucun verdict n’y figure, et seuls les faits lus y figurent

#### Scenario: Après l’accusation
- **WHEN** la partie est terminée et que deux faits sont incompatibles
- **THEN** ils apparaissent hachurés et reliés par une étiquette d’incohérence, avec le trajet et l’écart

#### Scenario: Alibis jamais vus
- **WHEN** la partie est terminée et que le joueur n’avait pas ouvert certains lieux
- **THEN** leurs faits figurent au Carnet, marqués comme non vus, avec leurs incohérences et leurs verdicts

### Requirement: Suspects et fiches qui se remplissent
L’écran Suspects SHALL montrer une carte par suspect avec son statut d’alibi (à vérifier, douteux, vérifié) que le joueur choisit. La fiche SHALL regrouper ce qu’il dit lui-même, ce que les autres disent de lui, les preuves et les témoins, et ne contenir que les faits déjà découverts. Une rubrique vide SHALL afficher « RIEN POUR L’INSTANT » et la fiche « N lieux explorés sur M », sans jamais annoncer combien de pièces restent à trouver.

#### Scenario: Fiche au départ
- **WHEN** aucun lieu n’a été ouvert
- **THEN** la fiche ne montre que la tête, le nom et le statut, et ses rubriques sont vides

#### Scenario: Fiche après exploration
- **WHEN** le joueur ouvre un lieu dont un fait concerne ce suspect
- **THEN** ce fait apparaît dans la rubrique correspondante de sa fiche

### Requirement: Accusation avec confirmation
Le bouton « Accuser » d’une fiche SHALL demander une confirmation qui rappelle que l’accusation est définitive. Après confirmation, l’accusation est enregistrée et la révélation se lance.

#### Scenario: Confirmation
- **WHEN** le joueur touche « Accuser » puis annule
- **THEN** aucune accusation n’est enregistrée

### Requirement: Réglages et À propos
L’écran Réglages SHALL permettre de choisir le thème clair ou sombre, d’activer ou non le mode hors ligne, de gérer les zones téléchargées (liste, taille, suppression), rappeler l’enquête (commune, difficulté, graine, version des données, état en cours ou terminée), proposer une nouvelle enquête, et afficher À propos : la mention de fiction, « © OpenStreetMap contributors » (licence ODbL), le fond de carte Protomaps et la police IBM Plex Mono (licence OFL).

#### Scenario: Crédits
- **WHEN** le joueur ouvre À propos
- **THEN** il y lit la mention de fiction et les crédits des données, du fond de carte et de la police

#### Scenario: Zones téléchargées
- **WHEN** le joueur ouvre les Réglages
- **THEN** il voit le réglage du mode hors ligne et ses zones téléchargées avec leur taille, et peut en supprimer une

#### Scenario: État de l’enquête
- **WHEN** le joueur ouvre les Réglages après avoir accusé
- **THEN** le rappel de l’enquête indique qu’elle est terminée

### Requirement: Textes de l’interface réunis
Les textes de l’interface (boutons, libellés, messages) SHALL être rédigés en français dans un seul module ; les textes des faits viennent du moteur.

#### Scenario: Un seul endroit
- **WHEN** on cherche un libellé de l’interface
- **THEN** il se trouve dans le module des textes et non dans les composants

### Requirement: Toucher la carte referme le panneau
Toucher la carte en dehors d’un lieu retenu, d’une pastille de suspect et d’un lieu de décor SHALL fermer le panneau ouvert (lieu, suspect ou choix de trajet), sans effacer l’itinéraire affiché.

#### Scenario: Toucher la carte nue
- **WHEN** un panneau est ouvert et que le joueur touche la carte à un endroit sans lieu
- **THEN** le panneau se ferme et l’itinéraire éventuel reste affiché

### Requirement: L’avatar ouvre la fiche
Dans la carte d’un témoignage, toucher la tête du suspect qui témoigne SHALL ouvrir sa fiche, sans bouton supplémentaire. L’écran Suspects garde son lien « Fiche » en haut à droite de chaque carte.

#### Scenario: Toucher l’avatar
- **WHEN** le joueur ouvre un témoignage et touche la tête du témoin
- **THEN** la fiche de ce suspect s’affiche

### Requirement: Guide de départ
Au premier lancement, un guide en trois bulles SHALL accompagner le joueur : toucher un lieu numéroté, toucher une pièce, mesurer un trajet vers le lieu du mystère. Chaque bulle passe à la suivante quand le joueur fait l’action ; le guide se passe d’un toucher, ne se montre qu’une fois et se rejoue depuis les Réglages.

#### Scenario: Guide passé
- **WHEN** le joueur touche « Passer »
- **THEN** le guide disparaît et ne revient pas au lancement suivant

#### Scenario: Guide rejoué
- **WHEN** le joueur touche « Revoir le guide » dans les Réglages
- **THEN** le guide se montre à nouveau à la prochaine ouverture de la carte
