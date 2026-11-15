# Types d’indices (ClueType)

> Notes de rédaction, à encoder en JSON au brief 01 puis à supprimer.

## Variables et règles d’écriture (communes à tous les gabarits)

| Variable | Rendu | Exemple |
| --- | --- | --- |
| `{firstName}` | prénom du personnage concerné par le fait | Paul |
| `{place}` | nom du lieu du fait | Boulangerie du Cours |
| `{time}` | heure d’un fait ponctuel | 21h03 |
| `{from}`, `{to}` | bornes d’un fait en intervalle | 20h30, 21h20 |

Règles :
- **Aucun accord de genre** : pas de participe passé accordé avec le prénom (« était là », « a quitté », « J’ai vu {firstName} » ; pas « est resté », « est parti »).
- **Ton** : court, factuel, léger. Les indices ne sont jamais ironiques ni suspicieux.
- **PNJ anonymes** : un rôle (« le serveur »), jamais un nom ni un personnage réel du lieu.
- **Pas de marque** ni de logo dans les textes.
- Les indices de nature `proof` portent un fait ponctuel (`instant`) ; les `npc` un fait ponctuel ou en intervalle.

## Preuves (`proof`, précision `instant`)

| id | gabarit |
| --- | --- |
| `receipt` | Un ticket de caisse de {place} daté de {time}, retrouvé dans la poche de {firstName}. |
| `bill` | Une addition de {place} réglée à {time} par {firstName}. |
| `transport_ticket` | Un titre de transport validé à {place} à {time} par {firstName}. |
| `loan_slip` | Une fiche de prêt de {place} tamponnée à {time} pour {firstName}. |

## PNJ (`npc`)

| id | précision | gabarit |
| --- | --- | --- |
| `shopkeeper` | interval | Au comptoir de {place}, un témoin se souvient : « {firstName} était là de {from} à {to}. » |
| `waiter` | interval | Le serveur de {place} : « {firstName} était là de {from} à {to}. » |
| `librarian` | interval | À {place}, on se souvient : « {firstName} était là de {from} à {to}. » |
| `station_agent` | interval | À {place}, un agent confirme : « {firstName} attendait entre {from} et {to}. » |
| `bus_driver` | instant | Le chauffeur : « J’ai vu {firstName} à {place} à {time}. » |
| `park_keeper` | interval | Le gardien de {place} : « {firstName} se promenait entre {from} et {to}. » |
| `jogger` | instant | Un joggeur : « J’ai croisé {firstName} à {place} à {time}. » |
| `dog_walker` | interval | Une personne qui promenait son chien : « {firstName} était là de {from} à {to}. » |
