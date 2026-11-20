# Vocabulaire de l'interface

Les textes de l'interface sont dans `src/lib/game/texts.ts`. Ils s'adressent à un joueur qui n'a jamais vu le jeu : chaque mot doit se comprendre sans connaître le moteur ni le code. Les specs, le code et les guides techniques gardent leurs termes internes (« fait », « pièce », « scène », « graine »). Un test (`src/lib/game/texts.spec.ts`) refuse les plus courants dans l'interface.

## Règles

- **Tutoiement**, phrases courtes, un verbe d'action qui dit quoi faire (« Touche… », « Choisis… »).
- **Un seul mot par notion** : le même partout, sur la carte, dans le Carnet, sur les fiches et dans le guide.
- **Un message d'erreur dit ce qui s'est passé et ce qu'on peut faire**, sans parler de données, de fichiers ni de zone.
- Les noms des écrans et des boutons déjà clairs ne changent pas : Carte, Carnet, Suspects, Réglages, Accuser, Passer, Fiche.
- Ne pas traduire la mention légale « © OpenStreetMap contributors » : c'est la formule de la licence.

## Mots à employer

| Notion | Mot de l'interface | Mots à éviter |
| --- | --- | --- |
| Ce qu'on découvre dans un lieu (objet, trace) | **indice** | pièce, fait, preuve |
| Ce qu'une personne raconte | **témoignage** | pièce, témoin (pour un texte) |
| Le lieu où la farce a eu lieu | **lieu du mystère** | scène |
| Le temps que prend un trajet à pied | **temps de marche**, « N min à pied » | trajet mesuré, durée de trajet |
| Calculer ce temps | étiquette « Calculer le trajet à pied », boutons « Vers le lieu du mystère » et « Trajet vers… » | mesurer, relever |
| L'identifiant d'une enquête | **numéro de l'enquête** (« enquête n° … ») | graine, seed |
| Les lieux du jeu | **lieux**, « données OpenStreetMap du 15 novembre 2026 » | données, extrait, fichier, `.pbf` |
| La personne qui dit la vérité ou ment | **suspect**, « la personne » quand le genre est inconnu | il, lui |
| Le résultat de l'accusation | **révélation** | verdict (réservé au Carnet) |
| Un récit qui ne peut pas être vrai avec un autre | **incohérence** | contradiction, conflit |
| Où était un suspect à une heure donnée | **alibi** (à vérifier, douteux, vérifié) | — |

## Ajouter un texte

1. Chercher la notion dans le tableau : reprendre son mot.
2. Si elle n'y est pas, choisir un mot courant, l'ajouter au tableau, puis l'employer.
3. Si le test des termes internes échoue, remplacer le mot au lieu de le retirer de la liste.
