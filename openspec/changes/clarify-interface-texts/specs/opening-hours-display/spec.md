# Spec Delta

## Purpose

Traduire en français simple les horaires d'ouverture d'un lieu, écrits dans la syntaxe d'OpenStreetMap, pour qu'un joueur les lise sans connaître cette syntaxe.

## ADDED Requirements

### Requirement: Jours et heures en français
Les horaires d'ouverture SHALL être écrits en français : jours abrégés (lun., mar., mer., jeu., ven., sam., dim.), plages de jours reliées par « – », heures au format du jeu (8h30, 20h, sans « :00 »), plusieurs plages d'une même journée reliées par « et », règles séparées par « ; ».

#### Scenario: Semaine et dimanche
- **WHEN** l'horaire est `Mo-Sa 08:30-20:00; Su 08:30-12:30`
- **THEN** il s'affiche « lun.–sam. 8h30–20h ; dim. 8h30–12h30 »

#### Scenario: Pause de midi
- **WHEN** l'horaire est `Mo-Fr 09:00-12:00,14:00-17:30`
- **THEN** il s'affiche « lun.–ven. 9h–12h et 14h–17h30 »

#### Scenario: Jours non consécutifs
- **WHEN** l'horaire est `Mo,We-Fr 09:00-12:00`
- **THEN** il s'affiche « lun., mer.–ven. 9h–12h »

#### Scenario: Occurrence dans le mois
- **WHEN** l'horaire est `We 14:00-17:00; Sa[2] 14:00-17:00`
- **THEN** il s'affiche « mer. 14h–17h ; 2e sam. 14h–17h »

#### Scenario: Sans jour
- **WHEN** l'horaire est `10:30-16:15`
- **THEN** il s'affiche « 10h30–16h15 »

### Requirement: Fermetures, jours fériés et dates
« off » et « closed » SHALL se lire « fermé », les jours fériés (`PH`) « jours fériés », les vacances scolaires (`SH`) « vacances scolaires », et une date précise en toutes lettres (« 1er mai », « 20 mai 2024 »).

#### Scenario: Fermé les jours fériés
- **WHEN** l'horaire est `Mo-Fr 08:30-12:00; PH off`
- **THEN** il s'affiche « lun.–ven. 8h30–12h ; fermé les jours fériés »

#### Scenario: Ouvert les jours fériés
- **WHEN** l'horaire est `Mo-Su,PH 06:00-23:00`
- **THEN** il s'affiche « lun.–dim. et jours fériés 6h–23h »

#### Scenario: Jour de fermeture
- **WHEN** l'horaire est `Tu-Sa 08:30-12:00; Mo off`
- **THEN** il s'affiche « mar.–sam. 8h30–12h ; lun. fermé »

#### Scenario: Date précise
- **WHEN** l'horaire est `Mo-Sa 09:00-12:00; 2024 May 20 off`
- **THEN** il s'affiche « lun.–sam. 9h–12h ; fermé le 20 mai 2024 »

### Requirement: Ouverture permanente
L'horaire `24/7` SHALL se lire « ouvert tout le temps ».

#### Scenario: Ouvert en permanence
- **WHEN** l'horaire est `24/7`
- **THEN** il s'affiche « ouvert tout le temps »

### Requirement: Saisons
Les mois SHALL être écrits en français abrégé (janv., févr., mars, avr., mai, juin, juil., août, sept., oct., nov., déc.), une plage de mois reliée par « – » et suivie de « : » devant les horaires qu'elle concerne.

#### Scenario: Horaires d'été
- **WHEN** l'horaire est `Mar-Sep Su 14:00-18:00`
- **THEN** il s'affiche « mars–sept. : dim. 14h–18h »

### Requirement: Texte non reconnu
Un horaire que la traduction ne comprend pas SHALL être montré avec ses mots connus traduits (jours, mois, heures, « fermé ») et le reste tel qu'écrit : jamais inventé, jamais supprimé. Un horaire vide SHALL ne rien afficher.

#### Scenario: Horaire déjà en français
- **WHEN** l'horaire est « sur rendez-vous »
- **THEN** il s'affiche « sur rendez-vous »

#### Scenario: Horaire complexe
- **WHEN** l'horaire est `Jul 09-Aug 31: Tu 15:00-18:00; Su-Mo off`
- **THEN** ses jours, mois et heures sont traduits et aucune partie n'est supprimée

#### Scenario: Horaire vide
- **WHEN** l'horaire est vide
- **THEN** rien n'est affiché
