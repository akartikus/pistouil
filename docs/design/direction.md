# Direction artistique

Phase de design avant le brief 04 (`docs/VISION.md` §7). Validée avec l’auteur. Maquette : `map-mockup.png` (source modifiable : `map-mockup.svg`), thème clair à gauche, thème sombre à droite.

## Principe

Deux registres, séparés :

- **La carte reste colorée et lisible** : parcs verts, eau bleue, rues blanches, bâtiments de décor beiges, pastilles de couleur par famille de lieux. On identifie un élément sans effort.
- **Le texte et les repères sont brutalistes** : monospace gras en capitales, cadres noirs épais, ombres dures décalées, aplats francs. Cela vaut pour les noms de lieux, la légende, la durée d’un trajet et les mentions d’attribution.

But premier : distinguer d’un coup d’œil les lieux de l’enquête des lieux de décor, et, parmi les premiers, le lieu du mystère.

## Lieux de l’enquête, du mystère et de décor

| Élément | Rendu |
| --- | --- |
| Lieu de l’enquête | Bâtiment en aplat saturé (orange en clair, jaune en sombre), contour noir de 3 px, ombre dure de 5 px, carré noir numéroté, étiquette cadrée |
| Lieu du mystère | Même rendu en magenta (rose vif en sombre), carré numéroté de la même couleur ; connu dès le début, car la scène fait partie de la situation |
| Lieu de décor | Bâtiment beige discret, pastille ronde de la couleur de sa famille avec une icône blanche, nom en petit sans cadre |
| Lieu sans bâtiment (statue, banc, place) | Pas d’aplat : seul le marqueur (carré numéroté ou pastille) |
| Trajet | Pointillés bleus le long des rues, durée dans une étiquette brutaliste (« 6 MIN ») |
| Hors commune | Extérieur estompé, contour en tirets |

Règle : aucune couleur de famille de lieux ne reprend l’orange / jaune de l’enquête, le magenta / rose du mystère ni le bleu du trajet.

## Palette (valeurs de départ, ajustables à l’application)

| Rôle | Clair | Sombre |
| --- | --- | --- |
| Fond | `#F2EFE7` | `#15202B` |
| Rues (bordure) | `#FFFFFF` (`#C8C1B2`) | `#233140` (`#2B3A4A`) |
| Bâtiments de décor (contour) | `#E2DACB` (`#BDB4A2`) | `#2A394A` (`#3D506A`) |
| Parc (arbres) | `#BFE0A3` (`#8FC070`) | `#2C5A40` (`#3F7C57`) |
| Eau | `#8EC5E8` | `#1F5C8C` |
| Lieux de l’enquête | `#FF8A00` | `#FFD400` |
| Lieu du mystère | `#E0007A` | `#FF4FA3` |
| Trajet | `#1F4FFF` | `#5CC8FF` |
| Cadres, ombres, carrés numérotés | noir, texte blanc | jaune, texte noir (ombre des cadres : jaune) |

Familles de lieux (pastilles de décor, couleurs des icônes de `static/map/icons/`) : santé `#2FA36B`, restauration `#A8623C`, commerces `#00A39B`, culture et éducation `#7B4FD0`, services `#5E7186`, nature `#3F8F3F`, transport `#2B7A9B`, loisirs `#9A7B1E`, neutre (lieux sensibles et exclus) `#8A8A8A`, générique `#6B6B6B`. Le bleu de la maquette pour la culture a été remplacé par un violet, trop proche du bleu du trajet. On peut ajouter d’autres couleurs de famille pour rendre le jeu plus vivant.

## Thème sombre

Même structure, fond bleu nuit, aplats de l’enquête en jaune et du mystère en rose. Il est prévu pour assombrir la carte au fil de la soirée (`setPaintProperty`, brief 04).

## Police

Une seule famille, monospace, pour toute l’interface et les noms sur la carte. Proposition : IBM Plex Mono (graisses normale et gras, licence OFL, accents français couverts). À confirmer au brief 04 : les glyphes MapLibre se fabriquent à partir de la police (fichiers dans `static/map/`) et il faut vérifier la couverture des accents.

## Icônes de départ

Un symbole blanc dans une pastille ronde colorée : croix (pharmacie), tasse (bar, café), pain (boulangerie), sac (commerce), livre (école, bibliothèque), colonnes (banque, mairie), arbre (parc). Génériques, jamais de logo de marque.

## Écrans

Trois maquettes, en clair :

- `screens-mockup.png` : navigation, Carte avec curseur horaire, Carnet, Suspects (source modifiable : `screens-mockup.svg`). Ses bandeaux et étiquettes d’incohérence sont ceux de la **fin de partie** : pendant la partie, le jeu ne conclut rien.
- `screens-mockup-2.png` : panneau d’un lieu avec ses pièces, choix du trajet, fiche d’un suspect (`.svg`).
- `screens-mockup-3.png` : une tête ouvre sa fiche, un suspect sur la carte, Réglages et À propos (`.svg`).

L’écran Carte seul, avec de vraies tuiles, est vérifié sur la page `/map` (brief 04).

**La carte est le point d’entrée.** Toucher un lieu, une tête de témoin ou la pastille d’un suspect ouvre le bon panneau, puis la fiche ; les onglets Carnet et Suspects servent à relire à son rythme.

- **Navigation** : barre en bas avec trois onglets (Carte, Carnet, Suspects), onglet actif en orange, nombre de faits et de suspects en pastille noire ; une roue crantée dans l’en-tête ouvre les Réglages.
- **Panneau d’un lieu** : rangée de **pièces** cliquables, un objet pour chaque preuve (ticket de caisse, addition, titre de transport, fiche de prêt, reçu postal), un pictogramme pour chaque PNJ (serveur, gardien, chauffeur, joggeur…), la tête de chaque suspect qui témoigne. Une pièce touchée s’ouvre : un témoignage porte la tête de celui qui parle, et toucher cette tête ouvre sa fiche (pas de bouton « FICHE DE … ▸ » dans la carte). Un fait n’entre au Carnet, dans les fiches et sur le curseur horaire qu’une fois sa pièce touchée. Aucune étiquette de fiabilité ou de nature (« fiable », « preuve », « témoin ») sur les pièces, les faits et les témoignages : l’objet, le pictogramme ou la tête, le libellé et le texte suffisent. Le panneau n’affiche aucune aide à la déduction (elles sont dans le Carnet), et toucher la carte hors d’un lieu retenu le ferme, comme après le choix d’un trajet. Deux boutons : « VERS LE LIEU DU MYSTÈRE » (trajet direct) et « TRAJET VERS… ».
- **Choix du trajet** : liste des seuls lieux retenus (numérotés, le lieu du mystère en tête). Choisir un lieu trace l’itinéraire en pointillés bleus avec sa durée (« ~ » si estimé). Les durées déjà mesurées figurent dans la liste, les autres restent à « — » : choisir, c’est mesurer, et chaque mesure est notée dans le carnet.
- **Curseur horaire** : cadré, avec l’heure en grand et, sur sa piste, des marques aux heures où il se passe quelque chose (faits découverts, une marque à part pour l’heure du mystère) ; une pastille à initiale par suspect là où les faits découverts le situent. Toucher une pastille ouvre un panneau (où il est à cette heure, statut d’alibi, bouton « FICHE DE … ▸ »). Pendant la partie, le jeu ne conclut rien : ni incohérence ni verdict d’alibi (ni sur le curseur, ni dans le panneau d’un suspect, ni dans le Carnet). Une fois l’accusation faite, le Carnet explique la partie (incohérences hachurées et alibis) et la révélation y mène.
- **Carnet** : deux onglets, chronologie et notes. La chronologie est un fil vertical, heures à gauche, une carte cadrée par fait avec le suspect concerné et sa source (indice, preuve, témoignage) ; une fois l’accusation faite, deux faits incompatibles sont hachurés et reliés par une étiquette noire « ≠ INCOHÉRENCE » et les alibis sont expliqués sous les faits. Une note libre est en bas ; les annotations de lieux s’y rattachent.
- **Suspects** : une carte par suspect avec sa phrase clé et son statut d’alibi (à vérifier, douteux, vérifié), **choisi par le joueur** : plein noir pour vérifié, hachuré pour douteux, tirets pour à vérifier. La **fiche** regroupe trois versions : ce qu’il dit lui-même, ce que les autres disent de lui, preuves et témoins. Elle **se remplit au fil de l’enquête** : au départ elle ne montre que sa tête, son nom et son statut d’alibi, puis chaque lieu exploré y ajoute ses pièces ; une rubrique vide affiche un cadre en tirets « RIEN POUR L’INSTANT » (le jeu n’annonce jamais combien de pièces restent à trouver), avec la mention « N LIEUX EXPLORÉS SUR M ». Bouton « ACCUSER » noir en bas, à bande hachurée, avec la mention « définitif » ; un écran de confirmation reste à dessiner.
- **Têtes** : visages simples dessinés par le code, un par suspect, qui varieront selon son identifiant (lunettes, chapeau, cheveux) ; de vraies illustrations pourront les remplacer plus tard sans changer les écrans.
- **Réglages et À propos** : thème clair ou sombre, rappel de l’enquête (commune, difficulté, graine, version des données), nouvelle enquête, et le texte de crédits : fiction, données © OpenStreetMap contributors (licence ODbL), fond de carte Protomaps, police IBM Plex Mono (licence OFL).

Règles communes : cadres noirs de 3 px, ombres dures décalées, monospace gras en capitales, aucun état codé par une couleur de la palette réservée (orange de l’enquête, magenta du mystère, bleu du trajet) : les états passent par le plein, le hachuré et les tirets.

Décidé pour le brief 05 : ouvrir un lieu révèle tous ses faits d’un coup (les liens « débloqué par » restent à l’intérieur d’un lieu), donc la ligne « ??? un fait reste à découvrir » de la première maquette est retirée.

## Prise en main

Un guide en trois bulles accompagne la première partie (toucher un lieu numéroté, toucher une pièce, mesurer un trajet vers le lieu du mystère) ; il se passe d'un toucher et se rejoue depuis les Réglages.

## Garde-fous

Attribution « © OpenStreetMap contributors » et schéma de tuiles (Protomaps) : sur la carte, un bouton « i » toujours présent (texte déplié quelques secondes à l’affichage de la carte, puis replié), et le texte complet dans À propos, comme l’autorisent les règles d’attribution d’OpenStreetMap. Mention de fiction visible sur l’écran de départ et dans À propos. Aucune photo de bâtiment, aucun logo.
