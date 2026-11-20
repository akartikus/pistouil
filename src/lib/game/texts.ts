// Every text of the interface, in French. The texts of the facts come from the engine.
// The words follow docs/design/wording.md: no term of the engine or of the code.

// The date of the data in French, from a data version like `source.osm.pbf@2026-11-15T21:22:28Z`.
export function dataDateText(version: string): string {
	const date = new Date(version.split('@')[1] ?? '');
	if (Number.isNaN(date.getTime())) return version;
	return date.toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
}

export const texts = {
	appName: 'Pistouil',
	fiction: 'Les lieux sont réels, les personnages et les faits sont imaginaires.',

	start: {
		locate: 'Je me localise',
		locating: 'Localisation…',
		locationRefused: 'Impossible de te localiser. Touche « Fuveau » pour jouer.',
		outsideFuveau:
			'Pour le moment, on ne peut jouer qu’à Fuveau, et tu n’y es pas. Touche « Fuveau » pour jouer.',
		locateSoon: 'Bientôt disponible',
		fuveau: 'Fuveau',
		difficulty: 'Difficulté',
		difficulties: { 1: 'Facile', 2: 'Moyenne', 3: 'Difficile' } as Record<number, string>,
		resume: 'Reprendre l’enquête',
		resumeIn: (name: string) => `Enquête en cours à ${name}`,
		finishedIn: (name: string) => `Enquête terminée à ${name}`,
		seeReveal: 'Revoir la révélation',
		newTitle: 'Nouvelle enquête',
		replaces: 'Elle remplace l’enquête enregistrée.',
		newInvestigation: 'Nouvelle enquête',
		loading: 'Préparation de l’enquête…',
		locateWhy:
			'Ta position sert seulement à choisir le lieu de l’enquête. Elle reste sur ton téléphone et n’est jamais envoyée.',
		locateContinue: 'Continuer'
	},

	failure: {
		'not-enough-places': 'Il n’y a pas assez de lieux publics ici pour monter une enquête.',
		'no-scene': 'Aucun lieu des environs ne convient pour y organiser la farce.',
		'difficulty-unreachable':
			'Impossible de monter une enquête à cette difficulté ici. Essaie une autre difficulté.',
		'data-missing': 'Impossible de charger les lieux du jeu. Ferme puis rouvre l’application.',
		'data-changed':
			'Cette enquête ne peut plus être reprise : les lieux du jeu ont changé depuis. Commence-en une nouvelle.',
		back: 'Retour'
	},

	nav: {
		map: 'Carte',
		notebook: 'Carnet',
		suspects: 'Suspects',
		settings: 'Réglages',
		newShort: '+ Nouvelle',
		newFull: 'Nouvelle enquête'
	},

	map: {
		pieces: 'Indices et témoignages',
		nothingHere: 'Aucun indice ici.',
		routeLabel: 'Calculer le trajet à pied',
		toMystery: 'Vers le lieu du mystère',
		tripTo: 'Vers un autre lieu',
		tripFrom: (name: string) => `Trajet depuis ${name} vers…`,
		mystery: 'Lieu du mystère',
		onlyRetained: 'Seuls les lieux numérotés de l’enquête sont proposés.',
		noted: 'Chaque trajet affiché est noté dans le carnet.',
		cursor: 'Choisir l’heure',
		unknown: 'inconnu',
		notAnywhere: 'On ne sait pas où se trouve cette personne à cette heure-là.',
		openFile: (name: string) => `Fiche de ${name} ▸`,
		close: 'Fermer',
		attribution: '© OpenStreetMap contributors · Protomaps',
		attributionLabel: 'Crédits de la carte'
	},

	piece: {
		testimony: (name: string) => `Témoignage de ${name}`,
		about: (name: string) => `À propos de ${name}`
	},

	verdict: {
		measured: (trip: number, gap: number) =>
			`Il faut ${trip} min à pied, mais ${gap} min seulement séparent ces deux indices : ils ne peuvent pas être vrais tous les deux.`,
		tooFar: (name: string, trip: number, gap: number) =>
			`Si cet indice est vrai, ${name} n’a pas pu être au lieu du mystère : il faut ${trip} min à pied, mais ${gap} min seulement séparent cet indice du mystère.`,
		couldReach: (name: string, trip: number, gap: number) =>
			`Si cet indice est vrai, ${name} aurait pu être au lieu du mystère : ${trip} min à pied pour ${gap} min d’écart.`
	},

	notebook: {
		chronology: 'Chronologie',
		notes: 'Notes',
		empty: 'Aucun indice pour l’instant. Touche un lieu sur la carte.',
		explained: 'Partie terminée : les incohérences et les alibis sont maintenant expliqués.',
		freeNote: 'Note libre',
		notePlaceholder: 'Qui avait un motif ? Qui ment ?',
		measured: 'Trajets mesurés',
		annotations: 'Notes sur les lieux',
		inconsistency: 'Incohérence',
		unseen: 'Pas découvert pendant la partie',
		facts: (count: number) => `${count} indice${count > 1 ? 's' : ''}`
	},

	suspects: {
		title: 'Suspects',
		alibi: 'Alibi',
		statuses: { 'to-check': 'À vérifier', doubtful: 'Douteux', verified: 'Vérifié' } as Record<
			string,
			string
		>,
		file: 'Fiche',
		saysHimself: 'Ce que la personne dit',
		othersSay: 'Ce que les autres en disent',
		proofs: 'Indices et témoignages',
		nothing: 'Rien pour l’instant',
		fillsUp: 'La fiche se remplit en explorant les lieux.',
		explored: (count: number, total: number) => `${count} lieux explorés sur ${total}`,
		accuse: (name: string) => `Accuser ${name}`,
		definitive: 'Définitif : la révélation s’affiche aussitôt.',
		confirmTitle: (name: string) => `Accuser ${name} ?`,
		confirmText: 'Une accusation est définitive, juste ou non.',
		confirm: 'Oui, j’accuse',
		cancel: 'Annuler'
	},

	reveal: {
		title: 'Révélation',
		right: 'Bien vu !',
		wrong: 'Raté…',
		author: (name: string) => `Le coupable : ${name}`,
		replay: 'Rejouer la soirée',
		play: 'Lecture',
		pause: 'Pause',
		explain: 'Comprendre : voir le carnet avec les explications',
		toMap: 'Voir sur la carte',
		newInvestigation: 'Nouvelle enquête'
	},

	tour: {
		1: 'Une farce a eu lieu ! Touche un lieu numéroté pour chercher des indices.',
		2: 'Touche un indice ou un témoignage pour le lire. Il sera noté dans ton carnet.',
		3: 'Touche « Vers le lieu du mystère » pour voir le temps de marche : un alibi trop juste est suspect.',
		skip: 'Passer',
		replay: 'Revoir le guide'
	},

	settings: {
		title: 'Réglages',
		theme: 'Thème',
		light: 'Clair',
		dark: 'Sombre',
		investigation: 'Enquête',
		seed: 'enquête n°',
		status: 'État',
		ongoing: 'En cours',
		finished: 'Terminée',
		dataVersion: 'Lieux',
		dataValue: (version: string) => {
			const date = dataDateText(version);
			return date === version ? version : `données OpenStreetMap du ${date}`;
		},
		newInvestigation: 'Nouvelle enquête',
		about: 'À propos',
		fictionTitle: 'Fiction',
		dataTitle: 'Données',
		dataText: '© OpenStreetMap contributors, licence ODbL 1.0',
		mapTitle: 'Fond de carte',
		mapText: 'Protomaps, d’après les données d’OpenStreetMap',
		fontTitle: 'Police',
		fontText: 'IBM Plex Mono, licence OFL',
		back: 'Retour'
	}
};
