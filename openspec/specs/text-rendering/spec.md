# text-rendering Specification

## Purpose

Le moteur remplit les gabarits du catalogue à la génération et stocke le texte final dans chaque source ; l’interface n’affiche que ce texte. Rendu pur, déterministe, sans trace du mensonge.

## Requirements

### Requirement: Chaque source a un texte rendu complet
Le moteur SHALL produire un `renderedText` pour chaque indice et chaque témoignage, pour la situation du mystère et pour le texte de révélation, sans aucune variable non résolue.

#### Scenario: Texte sans variable restante
- **WHEN** une enquête est générée
- **THEN** aucun `renderedText` ne contient d’accolade `{` ni de nom de variable

#### Scenario: Heures lisibles
- **WHEN** un fait a une heure `1265`
- **THEN** le texte rendu affiche `21h05`

### Requirement: Les prénoms sont distincts
Deux personnages d’une même enquête SHALL avoir des prénoms différents, tirés dans la liste du catalogue avec la seed.

#### Scenario: Cinq suspects
- **WHEN** une enquête est générée avec la difficulté 3 (5 suspects)
- **THEN** les 5 prénoms sont deux à deux différents

### Requirement: Le texte ne trahit pas le mensonge
Le `renderedText` d’un témoignage mensonger SHALL être produit par le même type de gabarit qu’un témoignage vrai et ne signaler en rien qu’il est faux.

#### Scenario: Même forme que le vrai
- **WHEN** l’auteur fait son témoignage mensonger sur un intervalle
- **THEN** son texte utilise un gabarit `interval` de sujet `self`, comme un témoignage vrai du même type

### Requirement: Rendu pur et reproductible
Le rendu SHALL dépendre uniquement du gabarit, des valeurs et de la seed, sans lire l’horloge ni le réseau.

#### Scenario: Même entrée, même texte
- **WHEN** on rend deux fois le même gabarit avec les mêmes valeurs et la même seed
- **THEN** les deux textes sont identiques
