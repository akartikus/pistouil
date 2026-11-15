# Design

## Context

Le catalogue (capability `catalog`) est en JSON et validé au chargement ; ajouter une ligne enrichit toutes les enquêtes sans toucher au code. Les règles de rôle sont celles de `docs/reference/DATA-MODEL.md` : lieu public non sensible en `scene`, lieu sensible en `alibi`, vie privée et enfants en `excluded`. Une preuve est datée du départ (changement `fix-proof-timing`) : un billet validé à l’entrée ne convient donc pas pour un cinéma. Voir `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Couvrir des cas variés : horaires courts, horaires tard le soir, séjours longs, lieux sans indice, lieux sensibles.
- Un jeu de lieux de test réaliste, assez gros pour que le moteur ait du choix.

**Non-Goals:**
- Nouveaux scénarios ; changements du moteur ; lieux réels.

## Decisions

**Rôles.** Tous les nouveaux commerces et services sont `scene` (publics, non sensibles). L’école de musique est `alibi` comme l’école : des enfants y vont.

**Indices.** Les commerces reprennent `receipt` et `shopkeeper`. Le bar reprend `bill` et `waiter`. Poste, musée, mairie et salle de sport utilisent le nouvel indice PNJ de guichet. Cinéma et salle de spectacle n’ont qu’un indice PNJ (`usher`) : une preuve datée du départ n’aurait pas de sens pour une séance de deux heures, et cela teste les lieux à séjours longs sans preuve.

**Horaires.** Plages réalistes ; bar et salles de spectacle ouvrent tard (jusqu’à minuit, 1440 minutes) pour tester des heures de mystère le soir. Les minutes sont comptées de 0 à 1440 : pas d’ouverture au-delà de minuit.

**Jeu de lieux riche.** Chaque lieu a une position en mètres ; la distance entre deux lieux est la distance à vol d’oiseau multipliée par 1,3 (comme le secours prévu au brief 03), les minutes valent `ceil(distance / 83,3)` (5 km/h, minimum 1). Les trajets sont donc symétriques et cohérents, contrairement à la formule du jeu de 8 lieux. *Alternative écartée* : agrandir le jeu de 8 lieux (le brief 01 le décrit avec ses 8 lieux, et les tests existants s’y appuient).

**Couverture.** Un test vérifie que le jeu riche contient au moins un lieu de chaque type du catalogue, y compris `alibi` sensibles, `excluded` et un lieu retiré.

## Risks / Trade-offs

- [Un lieu public peut accueillir une farce « chez » un commerce] → c’est la règle déjà décidée ; le droit de retrait protège les propriétaires.
- [Un gros jeu de lieux ralentit la génération] → le test de charge mesure la durée moyenne, avec la limite de 200 ms.
- [Cas limites révélés par ce jeu] → à ajuster au fil des tests, hors de ce changement.
