# Pistouil — référence principale

> À relire avant chaque nouvelle étape. Si une décision contredit ce fichier, on met d’abord ce fichier à jour, puis on avance.
> Nom du jeu : **Pistouil** (« piste » + « fouille », prononcé « pistouille »). Vérifier sa disponibilité (INPI, EUIPO, stores, nom de domaine) avant tout dépôt ou publication.

## 1. L’objectif final

Un jeu mobile et web d’enquête **en solo**, dont chaque mystère est **généré automatiquement à partir des vrais lieux** autour du joueur (ou d’une commune qu’il choisit). Le joueur résout l’énigme **par déduction**, en confrontant des alibis aux **vrais temps de marche** entre les lieux, sans avoir à se déplacer.

Le ton est **absurde et farceur, sans malveillance** : pas de crimes, mais des farces loufoques, inoffensives et réversibles, dans des lieux publics non sensibles (« Qui a étendu une culotte à pois sur une corde à linge au milieu de la place ? », « Qui a lâché 200 canards en plastique dans la fontaine ? »). La logique, elle, reste implacable.

## 2. L’expérience du joueur

1. Il se localise ou choisit une commune (ex. Fuveau).
2. Le jeu génère un mystère avec les lieux réels du coin : une scène dans un lieu public non sensible, d’autres lieux comme alibis.
3. Il explore la carte : chaque lieu de l’enquête révèle des faits (ticket de caisse, serveur, témoignages).
4. Il mesure les trajets à pied entre les lieux et repère l’alibi impossible.
5. Il désigne l’auteur, une seule fois.
6. La carte rejoue la vraie soirée, et l’on découvre pourquoi l’auteur a menti (une surprise, de la modestie, une maladresse, un malentendu, une erreur).

## 3. Ce qui nous différencie

Aucun jeu connu ne réunit les trois à la fois :

- **des enquêtes générées pour n’importe quel lieu**, sans écriture manuelle par ville ;
- **une vraie déduction logique**, fondée sur la géographie réelle ;
- **un jeu depuis le canapé**, sans déplacement obligatoire.

## 4. Principes non négociables

1. **La vérité d’abord.** On simule la vraie soirée, puis on en dérive témoignages et indices. Une enquête n’est jamais écrite « à l’envers ».
2. **Solution unique et atteignable.** Le solveur valide chaque enquête : un seul suspect possible, et tous les faits nécessaires peuvent être découverts. Sinon, l’enquête est rejetée.
3. **Seul l’auteur ment**, une seule fois, sur lui-même ou sur un autre suspect, et pour une raison bienveillante révélée à la fin (farce, malentendu ou erreur).
4. **Mystères uniquement dans des lieux publics non sensibles** (places, parcs, mais aussi commerces et services ouverts au public : une farce inoffensive ne nuit pas à leur réputation). Les lieux sensibles (écoles, lieux de culte, hôpitaux, cimetières, monuments aux morts) n’accueillent jamais de mystère : alibis seulement, avec des faits neutres ou positifs. Habitations et aires de jeux sont exclues.
5. **Personnages toujours fictifs**, jamais le personnel réel d’un lieu.
6. **Aucune dépendance réseau pendant le jeu en mode hors ligne.** Données préparées hors ligne, calculs sur le téléphone, jeu jouable hors connexion une fois la zone (environ 2 km autour d’une commune) téléchargée, sur choix du joueur. Sans ce mode, le joueur est connecté et la carte est chargée normalement.
7. **Garde-fous légaux** : mention de fiction visible (écran de départ et À propos), pas de logos de marques, pas de photos de bâtiments, carte stylisée, attribution OpenStreetMap (bouton « i » sur la carte, texte complet dans À propos), droit de retrait d’un lieu sur demande.
8. **Le moteur est du code pur** (aucune dépendance à l’interface), testé et reproductible à partir d’une seed.

## 5. Périmètre

| Version 1 | Plus tard |
| --- | --- |
| Mode solo, enquête à la demande | Partage de résultat façon Wordle, envoi d’une enquête par sa seed |
| Exploration libre des lieux | Limite de visites ou temps d’enquête fictif |
| Textes à trous | Textes réécrits par IA, une fois par enquête |
| Suspects identifiés par leur nom | Témoins qui décrivent sans reconnaître (« manteau rouge ») |
| Déduction par alibis et trajets | Mobiles et relations entre personnages |
| PWA, puis application Capacitor | — |

## 6. Décisions prises

| Décision | Raison |
| --- | --- |
| Solo, une enquête par joueur, générée à la demande | Pas de masse critique nécessaire, jeu possible partout |
| Zone = centre (position ou commune) + rayon adaptatif | S’adapte aux villes denses comme aux villages |
| Données OSM préparées hors ligne (Geofabrik + osmium), pas d’Overpass | Coût nul, aucune dépendance externe |
| Lieux OSM : un objet sans nom est écarté (quel que soit son rôle), aucune adresse extraite ; un lieu par objet, représenté par un point ; `opening_hours` transmis en texte brut, sans analyse | Le moteur et les textes exigent un nom ; les adresses manquent justement sur les objets de rue sans nom ; l’analyse des horaires attend les vrais horaires |
| Lieux rangés en cases de 2 km (pas fixes de 0,018° en latitude et 0,025° en longitude, calcul sur entiers) ; sortie déterministe, sans date d’exécution | Peu de fichiers à charger autour du joueur, cases calculables sans table ; sorties comparables à l’octet près |
| Trajets calculés sur le téléphone (Dijkstra sur le réseau piéton OSM) | Pas de serveur de routage, léger à l’échelle d’une zone |
| Trajets uniquement entre lieux de l’enquête, calculés à la génération | Le solveur en a besoin ; affichage instantané |
| Réseau piéton préparé hors ligne : graphe contracté par case de 2 km (JSON compact, nœuds à identifiants OSM, longueurs entières), lieux rattachés au segment de rue le plus proche (au plus 300 m) ; voies du brief plus `unclassified`, `living_street`, `track`, `cycleway`, `primary` | Trajets courts justes (deux boutiques d’une même rue), rues continues d’une case à l’autre, cases d’environ 35 Ko (240 Ko au plus, 63 Ko compressés) à Fuveau |
| Trajet non relié par le réseau : vol d’oiseau × 1,3 marqué `approximate` ; le générateur écarte, une fois la scène choisie, les lieux dont le trajet vers la scène est approximatif | Aucune déduction fondée sur une estimation, sans toucher au solveur |
| Tous les lieux visibles sur la carte, deux niveaux (enquête / décor) | Carte vivante, jouable même avec peu de données |
| Fond de carte vectoriel (PMTiles) stylé par nos soins (MapLibre) | Identité visuelle propre, appliquée à toute commune |
| Tuiles Protomaps (schéma v4) extraites hors ligne en un PMTiles régional (PACA : 610 Mo au zoom 15, bâtiments individuels à partir de ce zoom) ; MapLibre directement, sans bibliothèque Svelte ; deux styles en fichiers (`static/map/style-light.json` et `style-dark.json`) à structure identique, pour que le changement de thème garde les tuiles ; polices en glyphes (IBM Plex Mono) et icônes PNG par famille embarquées ; adresse des tuiles fournie à l’exécution | Un style maison sur toutes les communes sans préparation, aucune requête externe, thème sombre sans retéléchargement ; l’extraction est un outil de `tools/map-tiles/` |
| Bâtiment d’un lieu de l’enquête coloré en interrogeant le fond de carte au point du lieu (zoom 15 au moins) ; sans bâtiment, seul le marqueur reste | Les tuiles n’ont pas d’identifiant de bâtiment et nos lieux n’ont qu’un point ; aucun changement du format des lieux |
| Les types de lieux du catalogue portent `icon` (famille d’icône) et `label` (libellé français) pour la carte | Ajouter un type sans toucher au code de la carte |
| Direction artistique : carte colorée et lisible, texte et repères (étiquettes, légende, durées, mentions) brutalistes en monospace ; lieux de l’enquête en aplat orange (jaune en sombre), lieu du mystère en magenta (rose en sombre), décor en pastilles de couleur par famille ; thème sombre en soirée | Repérer d’un coup d’œil les lieux de l’enquête sans alourdir la carte, avec une identité propre ; voir `docs/design/direction.md` |
| La carte est le point d’entrée du jeu : un lieu, une tête de témoin ou la pastille d’un suspect ouvre le bon panneau puis la fiche ; trois versions d’un suspect (ce qu’il dit, ce que les autres disent, preuves et témoins) ; aucune incohérence ni aucun verdict d’alibi pendant la partie, expliqués dans le Carnet à la fin ; ouvrir un lieu révèle tous ses faits d’un coup ; attribution repliée en « i » avec texte complet dans À propos | Le joueur garde l’initiative de la déduction, la même information est joignable par le lieu, la personne ou l’heure ; voir `docs/design/direction.md` |
| Enquête générée dans un Web Worker qui garde l’enquête complète : l’interface ne reçoit qu’une projection (jamais auteur, mensonge, vraie soirée ni texte de révélation avant l’accusation) et la sauvegarde ne contient que la graine, la zone, la version des données et la progression ; au plus 40 lieux utilisables, les plus proches du centre, dans le moteur (rayon 500 m, 1, 2, puis 4 km) ; le jeu ne conclut rien pendant la partie (sinon il désignerait le menteur : le faux alibi est démenti par un témoin du même lieu) | Aucune donnée cachée lisible côté interface ; matrice de trajets de taille bornée ; la déduction reste au joueur |
| Mode hors ligne choisi par le joueur (désactivé par défaut) : une zone = disque de 2 km autour du centre d’une commune, téléchargée une seule fois (cases de ±3 km, tuiles de ±3,3 km du zoom 0 au zoom 15, index des communes une fois) ; dans ce mode, enquête centrée sur la commune et rayon limité à 2 km, reprise refusée plutôt que régénérée autrement ; tuiles lues dans la zone par une source PMTiles qui rejoue les plages d’octets enregistrées ; stockage par `@capacitor/filesystem` (fichiers en natif, IndexedDB sur le web) ; sans ce mode, rien n’est gardé | Zone de Fuveau mesurée à 6,2 Mo (3,2 Mo de tuiles, 1,4 Mo d’index, 1,6 Mo de cases) : léger sur un téléphone ; le joueur connecté n’a rien à télécharger |
| PNJ (serveur, gardien) = sources d’indices, pas des personnages | Modèle plus simple, PNJ toujours fiables |
| Le lieu d’un indice est celui du fait qu’il prouve | Évite une donnée en double |
| SvelteKit (statique) + TypeScript + Vitest + Capacitor | Un seul code pour web et mobile |
| Suivi du projet avec OpenSpec, un brief par grande étape | Garder le fil et des décisions traçables |
| CI/CD GitHub Actions : tests sur chaque changement, builds mobiles à la demande et sur `master` seulement | Valider chaque changement sans consommer le cloud (dépôt privé, runner macOS coûteux) |
| Textes rendus par le moteur à la génération (indices et témoignages), gabarits dans le catalogue, sans accord de genre | Moteur pur et déterministe, interface qui n’affiche que du texte, point d’entrée unique pour une réécriture par IA ultérieure |
| Générateur pseudo-aléatoire mulberry32 ; génération retournée en `{ ok, investigation }` ou `{ ok: false, reason }` ; texte de révélation rendu à la génération (`revelationText`, caché jusqu’à l’accusation) | Quelques lignes sans dépendance, reproductible ; l’échec (difficulté inatteignable) est un cas normal, pas une exception ; même principe que les autres textes rendus |
| Genres de mensonge selon la difficulté : faux alibi (facile), accusation d’un autre suspect (dès la difficulté 2), alibi dans un lieu fermé (difficulté 3) ; preuves vraies mais lointaines ; horaires de semaine et de week-end et jour de l’enquête | Les cas évidents restent à la difficulté facile ; la première contradiction ne désigne plus toujours le coupable ; les horaires, écrits en dur pour tester, seront remplacés par de vrais horaires plus tard |
| Scénarios composés : une farce générique écrite à la main, complétée par des objets tirés d’une réserve du catalogue (étiquettes, formes avec article) | Beaucoup de farces à partir de peu de textes, sans moteur de grammaire ; ajouter un objet enrichit toutes les enquêtes |
| Le playground peut tourner sur quelques dizaines de vrais lieux OSM (fichiers copiés dans `static/dev-data/`), avec les trajets du réseau piéton quand `graph/` est copié aussi, sinon des trajets estimés à vol d’oiseau, en attendant le chargement réel des cases (brief 05) | Essayer le moteur sur de vrais noms et de vraies distances sans rien ajouter au moteur ni au modèle ; `Place` accepte déjà de vrais lieux |
| Nom du jeu : Pistouil | Jeu de mots « piste » + « fouille », court, sans accent, plus facile à protéger qu’un mot courant |

## 7. Feuille de route

| Étape | Brief | État |
| --- | --- | --- |
| 0. Initialisation du projet | — | ☑ |
| 1. Moteur : génération et solveur | `briefs/01-generation-engine.md` | ☑ |
| 2. Préparation des données OSM | `briefs/02-osm-data.md` | ☑ |
| 3. Réseau piéton et trajets | `briefs/03-routes.md` | ☑ |
| 4. Carte et identité visuelle | `briefs/04-map.md` | ☑ |
| 5. Boucle de jeu complète | `briefs/05-game-loop.md` | ☑ |
| 6. Hors-ligne et application mobile | `briefs/06-offline-mobile.md` | ☐ |
| 7. CI/CD : tests (partie A, dès maintenant), builds mobiles (partie B, après l’étape 6) | `briefs/07-ci-cd.md` | ☐ |
| 8. Design restant et finitions (brief à rédiger à la fin des autres) | — | ☐ |

**Reporté à l’étape 8** (le design reste tel quel pendant les briefs 05 à 07) : orange de l’enquête jugé trop vif (variantes A à D comparées, couleur du thème sombre comprise) ; vraies illustrations pour les têtes des suspects ; chargement de la police IBM Plex Mono pour le texte HTML de l’interface (aujourd’hui seulement dans les glyphes de la carte) ; écrans manquants (confirmation de l’accusation, démarrage, rejeu de la révélation) ; contraste des bâtiments de décor, revue du jeu d’icônes et finition du thème sombre sur la carte ; régénération des maquettes pour qu’elles redeviennent la référence ; icônes et écran de lancement des applications Android et iOS (aujourd’hui ceux de Capacitor par défaut).

**Phase de rédaction, avant l’étape 1** (avec `/openspec-explore`, sans changement OpenSpec) : ton, 3 scénarios (situation, scène, motifs et textes de révélation), liste d’au moins 12 prénoms, exemples de gabarits d’indices et de témoignages, règles d’écriture (pas d’accord de genre). Contenu encodé en JSON dans `catalog/` au brief 01 (les notes en prose ont été supprimées) ; décisions au §6.

**Phase de design, avant l’étape 4** (avec `/openspec-explore`, sans changement OpenSpec) : direction artistique (palette, police, ton), croquis des trois écrans (carte, carnet, suspects) et premières icônes. Les décisions vont au §6 ; les croquis sont un lien Figma ou des images dans `docs/design/`. Faite : direction artistique et croquis des trois écrans (`docs/design/direction.md`, `screens-mockup.png`) ; reste l’écran de confirmation de l’accusation, à dessiner avec le brief 05.

Jalon de validation après l’étape 5 : **une enquête jouable de bout en bout à Fuveau**, testée par 3 à 5 personnes. Question à trancher : le cœur du jeu est-il amusant ?

## 8. Glossaire

| Terme | Sens |
| --- | --- |
| Mystère | L’événement absurde à élucider, à un lieu et une heure précis |
| Auteur | Le suspect responsable du mystère ; le seul qui ment |
| Scène | Le lieu public non sensible où s’est produit le mystère |
| Lieu d’alibi | Un lieu où l’on peut prouver une présence : tout lieu public qui n’est pas la scène, ou un lieu sensible (alibi seulement) |
| Lieu de décor | Un lieu visible sur la carte mais sans rôle dans l’enquête |
| Vraie soirée | Les déplacements réels de chaque suspect (segments), cachés au joueur |
| Fait | « Telle personne, à tel lieu, entre telle et telle heure », avec sa source |
| Indice | Source toujours fiable : preuve (ticket) ou PNJ (serveur) |
| Témoignage | Parole d’un suspect, fiable seulement s’il est innocenté |
| Objet | Un détail interchangeable d’une farce (perruque, canards en plastique…), tiré dans le catalogue |
| Seed | Valeur qui permet de régénérer une enquête à l’identique |

## 9. Carte des documents

| Fichier | Rôle |
| --- | --- |
| `docs/VISION.md` | Ce fichier : le cap, à relire avant chaque étape |
| `docs/reference/DATA-MODEL.md` | Modèle de données complet, règles de cohérence, algorithme du solveur |
| `docs/briefs/NN-*.md` | Un brief par étape, à donner à OpenSpec pour créer la proposition de changement |
| `openspec/config.yaml` | Contexte permanent du projet pour OpenSpec |
| `AGENTS.md` | Règles courtes pour les assistants de code (`CLAUDE.md` l’importe) |
