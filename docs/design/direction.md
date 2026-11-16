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

Seul l’écran **Carte** est dessiné (`map-mockup.png`, avec légende). Les écrans **Carnet** et **Suspects** sont à dessiner avant le brief 05, dans le même registre : fonds clairs, cadres noirs épais, texte monospace.

## Garde-fous

Attribution « © OpenStreetMap contributors » et schéma de tuiles toujours visibles, mention de fiction visible, aucune photo de bâtiment, aucun logo.
