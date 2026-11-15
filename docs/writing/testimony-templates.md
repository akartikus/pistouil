# Gabarits de témoignage (TestimonyTemplate)

> Notes de rédaction, à encoder en JSON au brief 01 puis à supprimer. Variables et règles : voir `clue-types.md`. Variables en plus : `{speaker}` (prénom de celui qui parle).

**Règle clé** : le même gabarit sert au témoignage vrai et au témoignage mensonger. Rien dans le texte ne doit trahir le mensonge (pas de « je le jure », pas d’hésitation).

Chaque gabarit a un sujet : `self` (la personne parle d’elle-même) ou `other` (elle parle d’un autre suspect). C’est le champ `subject` de `TestimonyTemplate`.

## Précision `instant`

| id | sujet | gabarit |
| --- | --- | --- |
| `instant_self_1` | self | {speaker} : « À {time}, j’étais à {place}. » |
| `instant_self_2` | self | {speaker} : « Vers {time}, passez à {place} : j’y étais. » |
| `instant_other_1` | other | {speaker} : « À {time}, {firstName} était à {place}. » |
| `instant_other_2` | other | {speaker} : « J’ai vu {firstName} à {place} à {time}. » |

## Précision `interval`

| id | sujet | gabarit |
| --- | --- | --- |
| `interval_self_1` | self | {speaker} : « J’étais à {place} de {from} à {to}. » |
| `interval_self_2` | self | {speaker} : « Je n’ai pas bougé de {place} entre {from} et {to}. » |
| `interval_other_1` | other | {speaker} : « {firstName} était à {place} de {from} à {to}. » |
| `interval_other_2` | other | {speaker} : « Entre {from} et {to}, {firstName} était à {place}. » |

## Précision `departure`

| id | sujet | gabarit |
| --- | --- | --- |
| `departure_self_1` | self | {speaker} : « J’ai quitté {place} à {time}. » |
| `departure_self_2` | self | {speaker} : « À {time}, j’ai dit au revoir à {place}. » |
| `departure_other_1` | other | {speaker} : « J’ai vu {firstName} quitter {place} à {time}. » |
| `departure_other_2` | other | {speaker} : « {firstName} a quitté {place} à {time} précisément. » |
