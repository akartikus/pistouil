# Modèles de scénario (ScenarioModel)

> Notes de rédaction, à encoder en JSON au brief 01 puis à supprimer. Contenu de départ, à compléter ou remplacer plus tard : le moteur ne dépend d’aucun scénario en particulier.
> Variables : `{place}` (nom de la scène), `{time}` (heure du mystère), `{author}` (prénom de l’auteur). Plages horaires en `HH:MM–HH:MM` (heure du mystère, de jour comme de soirée), à convertir en minutes.

**Ton** : farces de potache, façon « On ne demande qu’à en rire » : simples, plausibles, faites par une seule personne avec trois fois rien. Jamais méchantes : inoffensives, réversibles, sans victime désignée, sans dégradation (pas de saleté, de vol ni de danger), sans mettre un lieu en cause. Dans un lieu public non sensible (rôle `scene`, commerces et services compris), jamais dans un lieu sensible (école, culte, hôpital, cimetière).

**Thèmes de farce** (pour en trouver d’autres plus tard) :
- l’objet incongru, laissé là comme si de rien n’était ;
- l’inversion ou le mélange (deux choses échangées) ;
- le déguisement d’un élément du décor ;
- la fausse annonce, prise très au sérieux.

Le mystère a l’air d’une farce, mais son explication n’en est pas forcément une : l’auteur ment pour une raison toujours bienveillante, parmi `surprise` (farce ou cadeau), `modesty` (pas de mérite), `clumsiness` (maladresse), `misunderstanding` (malentendu) et `mistake` (erreur). Chaque révélation explique à la fois pourquoi la chose est arrivée et pourquoi l’auteur a menti. Sans accord de genre.

## `laundry_line` — La corde à linge

- **Thème** : l’objet incongru
- **Situation** : À {time}, une corde à linge est tendue entre un arbre et un lampadaire près de {place}. Un caleçon à cœurs et une chaussette dépareillée y sèchent, comme si de rien n’était.
- **Scènes possibles** : `square`, `park`, `pedestrian_street`
- **Plage horaire** : 09:00–19:00
- **Révélations**
  - `surprise` : {author} préparait ce « linge perdu » pour l’anniversaire d’un ami, qui passe tous les jours par là. Mentir permettait de garder la farce secrète.
  - `modesty` : {author} trouvait la blague trop bête pour y mettre son nom, et préférait que les passants en rient sans savoir qui.
  - `clumsiness` : {author} a laissé s’envoler le caleçon en l’accrochant, a couru derrière, et a mélangé les heures en racontant l’épisode.
  - `misunderstanding` : {author} avait compris qu’un voisin cherchait un endroit où faire sécher du linge dehors. La confusion était trop drôle pour être expliquée : mieux valait brouiller les pistes.
  - `mistake` : {author} portait son panier de linge, a pris le mauvais chemin, et a tout étendu au mauvais endroit. Mieux valait ne rien dire.

## `laundromat_surprise` — La culotte du tambour

- **Thème** : l’objet incongru
- **Situation** : À {time}, une grande culotte à pois est restée dans un tambour de {place}, avec un mot : « Quelqu’un a perdu ça ? ».
- **Scènes possibles** : `laundromat`
- **Plage horaire** : 08:00–20:00
- **Révélations**
  - `surprise` : {author} préparait un faux « objet perdu » pour l’anniversaire d’un ami. Mentir permettait de garder la farce secrète.
  - `modesty` : {author} trouvait la blague trop bête pour y mettre son nom, et préférait que les clients en rient sans savoir qui.
  - `clumsiness` : {author} a glissé la culotte dans le mauvais tambour, a dû la déplacer, et a mélangé les heures en racontant l’épisode.
  - `misunderstanding` : {author} avait compris qu’une personne cherchait un vêtement oublié à {place} et a laissé la culotte avec un mot pour qu’elle la retrouve. Personne ne cherchait rien : trop gênant à raconter.
  - `mistake` : {author} a repris le linge d’une autre machine par erreur, a voulu le remettre en cachette avec un mot, et ne voulait pas qu’on le sache.

## `rubber_ducks` — La course de canards

- **Thème** : l’objet incongru
- **Situation** : À {time}, une vingtaine de canards en plastique flottent dans la fontaine de {place}, avec une pancarte : « Course de canards en cours ».
- **Scènes possibles** : `fountain`, `square`
- **Plage horaire** : 10:00–20:00
- **Révélations**
  - `surprise` : {author} préparait une petite course de canards pour les enfants du quartier, et voulait garder l’effet entier.
  - `modesty` : {author} avait trouvé ces canards dans un grenier et les offrait à la fontaine, sans attendre le moindre mérite.
  - `clumsiness` : {author} a renversé tout le sac de canards d’un coup, a pris la fuite par réflexe, et a donné une version pleine de trous.
  - `misunderstanding` : {author} avait compris qu’une course de canards se tenait ce jour-là, alors qu’elle était prévue la semaine suivante. Mieux valait ne pas le raconter.
  - `mistake` : {author} transportait les canards pour une fête, a posé le sac au bord de la fontaine une minute, et tout a basculé. La suite a été discrètement effacée du récit.

## `bench_table` — La table réservée

- **Thème** : l’inversion ou le mélange
- **Situation** : À {time}, deux bancs près de {place} ont été placés face à face, avec une nappe à carreaux et une pancarte : « Table réservée ».
- **Scènes possibles** : `bench`, `park`, `square`
- **Plage horaire** : 07:30–19:00
- **Révélations**
  - `surprise` : {author} préparait un pique-nique-surprise pour des amis, et voulait que la table soit prête à leur arrivée. Mentir gardait le secret.
  - `modesty` : {author} voulait juste offrir aux passants un coin sympa, sans qu’on le sache.
  - `clumsiness` : {author} a déplacé les bancs dans le mauvais sens, a recommencé deux fois, et a perdu le fil en racontant sa journée.
  - `misunderstanding` : {author} avait compris qu’une surprise se préparait pour des amis à cet endroit et a mis la table. L’invitation n’existait pas : mieux valait ne pas le raconter.
  - `mistake` : {author} a mis la table le mauvais jour, a voulu tout ranger avant l’arrivée du monde, et a donné un autre emploi du temps.

## `library_swap` — Le mélange des genres

- **Thème** : l’inversion ou le mélange
- **Situation** : À {time}, deux étiquettes de rayon ont été échangées dans {place} : « Cuisine » sur les romans policiers et « Policier » sur les livres de recettes. Un petit mot : « Mélange des genres, bonne lecture ».
- **Scènes possibles** : `library`, `shop`
- **Plage horaire** : 10:00–17:30
- **Révélations**
  - `surprise` : {author} voulait offrir une petite chasse au trésor à un ami lecteur, et garder le secret jusqu’au bout.
  - `modesty` : {author} voulait juste faire sourire les lecteurs, sans en tirer le moindre mérite.
  - `clumsiness` : {author} a collé les étiquettes à l’envers, a tout recommencé, et a perdu le fil en racontant son après-midi.
  - `misunderstanding` : {author} avait compris qu’on réorganisait les rayons et a voulu aider en échangeant deux étiquettes. Personne n’avait rien demandé : mieux valait ne rien dire.
  - `mistake` : {author}, en voulant corriger une étiquette abîmée, a échangé les deux par erreur, et n’a pas osé le dire.

## `statue_sunglasses` — La statue branchée

- **Thème** : le déguisement d’un élément du décor
- **Situation** : À {time}, la statue de {place} porte des lunettes de soleil et un casque audio, avec un mot : « Ne pas déranger ».
- **Scènes possibles** : `statue`, `fountain`, `square`
- **Plage horaire** : 09:00–20:00
- **Révélations**
  - `surprise` : {author} voulait faire sourire une personne qui passe chaque matin devant la statue. Il fallait que personne ne devine l’heure de la farce.
  - `modesty` : {author} trouvait l’idée petite et ne voulait pas qu’on en fasse tout un plat.
  - `clumsiness` : {author} a laissé tomber les lunettes trois fois avant de réussir à les poser, et a mélangé les heures en racontant l’épisode.
  - `misunderstanding` : {author} avait compris que la statue faisait partie d’un défilé de mode du quartier et lui a ajouté les accessoires. Il n’y avait pas de défilé : mieux valait ne pas en parler.
  - `mistake` : {author} a posé lunettes et casque sur la statue pour fouiller son sac, a oublié de les reprendre, et a préféré ne rien dire.

## `red_carpet` — Le tapis rouge

- **Thème** : la fausse annonce
- **Situation** : À {time}, un petit tapis rouge est déroulé devant {place}, avec une pancarte : « Entrée des artistes ».
- **Scènes possibles** : `bus_stop`, `bakery`, `cafe`, `shop`, `train_station`
- **Plage horaire** : 08:00–20:00
- **Révélations**
  - `surprise` : {author} préparait un accueil de star pour une personne qui passe chaque jour. Il fallait que personne ne devine l’heure de la farce.
  - `modesty` : {author} trouvait le tapis trop modeste pour être signé, et l’a laissé là sans nom.
  - `clumsiness` : {author} a déroulé le tapis du mauvais côté, l’a retourné deux fois, et a donné une version pleine de trous.
  - `misunderstanding` : {author} avait compris qu’une personnalité devait passer ici et a déroulé le tapis. Personne n’était attendu : trop gênant à expliquer.
  - `mistake` : {author} devait livrer ce tapis à une autre adresse, l’a posé au mauvais endroit, et a préféré faire comme si de rien n’était.
