# Tasks

## 1. Outillage et jeu de test

- [x] 1.1 Installer osmium-tool et créer l’environnement Python de `tools/data-preparation/` (`requirements.txt` avec pyosmium, shapely, pytest ; consulter `context7` pour les API) ; vérifier que `pytest` se lance et que le README de l’étape explique l’installation
- [x] 1.2 Écrire un petit fichier `.osm` de test dans `tools/data-preparation/tests/fixtures/` (commune avec contour, parc en croissant, banc sans nom, tags incomplets, objet à deux types, lieu nommé de rôle `excluded`, lieu avec `opening_hours`, lieu à retirer) ; vérifier qu’osmium le lit (`osmium fileinfo`)
- [x] 1.3 Ajouter `tools/data-preparation/out/` au `.gitignore` et créer `catalog/removed-places.json` (liste vide) ; vérifier avec `git status`

## 2. Extraction des lieux

- [x] 2.1 Écrire les tests de correspondance : groupe de tags complet ou incomplet, premier type du catalogue gagnant, aucun tag codé en dur (un type ajouté dans un catalogue de test est reconnu), objet sans nom ou sans type écarté, aucune adresse dans la sortie
- [x] 2.2 Implémenter la lecture du catalogue et la correspondance, et vérifier que 2.1 passe
- [x] 2.3 Écrire les tests de point représentatif (centroïde, point intérieur pour le parc en croissant, point sur une ligne, un objet donne un seul lieu) et d’`openingHours` (présent tel quel, absent sans tag)
- [x] 2.4 Implémenter le point représentatif et `openingHours`, et vérifier que 2.3 passe
- [x] 2.5 Écrire les tests de retrait (`removed: true` seulement pour les identifiants listés, identifiant inconnu signalé sans échec), puis l’implémenter et vérifier qu’ils passent

## 3. Grille, communes, manifeste, rapport

- [x] 3.1 Écrire les tests de grille : un lieu dans une seule case, lieu sur une limite, indices négatifs, pas de fichier pour une case vide ; implémenter le découpage (entiers sur coordonnées arrondies) et vérifier que les tests passent
- [x] 3.2 Écrire les tests de l’index des communes (nom, code INSEE, centre, rectangle englobant contenant le contour, contour simplifié plus léger et valide, tri par code INSEE) ; implémenter l’index et vérifier que les tests passent
- [x] 3.3 Écrire les tests du manifeste (source, date de l’extrait, licence ODbL, pas de la grille) et du rapport (comptes `scene`, `alibi`, `excluded` par commune, lieux hors commune) ; les implémenter et vérifier que les tests passent
- [x] 3.4 Écrire le test de déterminisme (deux exécutions sur le jeu de test, fichiers identiques à l’octet près, aucune date d’exécution) ; régler le tri et la sérialisation si besoin, et vérifier qu’il passe

## 4. Exécution sur les vrais extraits

- [x] 4.1 Produire l’extrait autour de Fuveau avec `osmium extract` depuis le `.pbf` PACA, lancer le script et vérifier à la main sur openstreetmap.org les principaux lieux du centre (consigner le résultat dans la description du changement)
- [x] 4.2 Lancer le script sur l’extrait PACA complet et vérifier : durée et mémoire acceptables sur un ordinateur portable, taille du plus gros fichier de case et de l’index des communes (voir Risques du design), rapport par commune présent
- [x] 4.3 Relancer 4.2 et comparer les sorties (`diff -r`) : identiques à l’octet près
- [x] 4.4 Lancer `npm run test`, `npm run check` et `npm run lint` ; vérifier qu’ils passent sans régression

## 5. Cap

- [x] 5.1 Mettre à jour `docs/VISION.md` : décisions du §6 (lieux sans nom écartés, adresses non extraites, cases de 2 km, horaires OSM transmis en texte brut) et étape 2 cochée au §7 ; mettre à jour `README.md` (prérequis Python et osmium) ; vérifier avec `grep` que rien ne contredit le brief 02
