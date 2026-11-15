# Types de lieux (PlaceType)

> Notes de rédaction, à encoder en JSON au brief 01 puis à supprimer. Identifiants en anglais. Horaires : `HH:MM–HH:MM`, valables tous les jours ; « — » = toujours ouvert. Icônes : à définir pendant la phase de design.

Un lieu de rôle `scene` peut accueillir la farce ; quand il n’est pas la scène d’une enquête, il sert d’alibi. Un lieu de rôle `alibi` (sensible) n’accueille jamais de farce.

## Lieux publics non sensibles (`scene`)

| id | osmTags | Horaires typiques | Indices compatibles |
| --- | --- | --- | --- |
| `park` | `leisure=park` | — | `park_keeper`, `jogger`, `dog_walker` |
| `fountain` | `amenity=fountain` | — | — |
| `square` | `place=square` | — | `dog_walker` |
| `pedestrian_street` | `highway=pedestrian` | — | `dog_walker` |
| `statue` | `tourism=artwork` + `artwork_type=statue` | — | — |
| `bench` | `amenity=bench` | — | `dog_walker` |
| `kiosk` | `shop=kiosk` | 08:00–20:00 | — |
| `open_air_market` | `amenity=marketplace` | 07:00–13:00 | — |
| `bakery` | `shop=bakery` | 07:00–19:30 | `receipt`, `shopkeeper` |
| `cafe` | `amenity=cafe` | 07:00–23:00 | `bill`, `waiter` |
| `restaurant` | `amenity=restaurant` | 12:00–14:30, 19:00–23:00 | `bill`, `waiter` |
| `pharmacy` | `amenity=pharmacy` | 08:30–19:30 | `receipt`, `shopkeeper` |
| `shop` | `shop=convenience`, `shop=florist`, `shop=books` | 09:00–19:00 | `receipt`, `shopkeeper` |
| `laundromat` | `shop=laundry` | 07:00–21:00 | `receipt`, `shopkeeper` |
| `library` | `amenity=library` | 10:00–18:00 | `loan_slip`, `librarian` |
| `bus_stop` | `highway=bus_stop` | — | `bus_driver`, `transport_ticket` |
| `train_station` | `railway=station` | 05:00–23:30 | `transport_ticket`, `station_agent` |

Notes :
- `statue` ne couvre que les statues d’art public : jamais un monument aux morts ni une statue religieuse (ils sont `alibi`).
- Un marché peut être une scène sans jamais nommer un étal.
- Les lieux sans indice compatible hébergent seulement le mystère (ou des alibis par témoignage).

## Lieux sensibles (`alibi`)

Alibi seulement, faits neutres ou positifs, jamais de farce. Aucun indice compatible : seuls des témoignages peuvent y placer quelqu’un.

| id | osmTags | Horaires typiques |
| --- | --- | --- |
| `school` | `amenity=school` | 08:00–17:00 |
| `place_of_worship` | `amenity=place_of_worship` | 09:00–19:00 |
| `hospital` | `amenity=hospital` | — |
| `cemetery` | `landuse=cemetery` | 08:00–18:00 |
| `war_memorial` | `historic=memorial` + `memorial=war_memorial` | — |

## Exclus (`excluded`)

Visibles en décor seulement, jamais retenus.

| id | osmTags |
| --- | --- |
| `playground` | `leisure=playground` |
| `dwelling` | `building=house`, `building=residential` |
