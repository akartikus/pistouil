// Every text of the interface, in French. The texts of the facts come from the engine.

export const texts = {
	appName: 'Pistouil',
	fiction: 'Les lieux sont réels, les personnages et les faits sont imaginaires.',

	start: {
		locate: 'Je me localise',
		locating: 'Localisation…',
		locationRefused: 'Position refusée. Cherche plutôt une commune.',
		searchCommune: 'Ou cherche une commune',
		communePlaceholder: 'Fuveau…',
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
		noCommune: 'Aucune commune de ce nom.',
		locateWhy:
			'Ta position sert seulement à choisir le lieu de l’enquête. Elle reste sur ton téléphone et n’est jamais envoyée.',
		locateContinue: 'Continuer',
		offlineOn: 'Mode hors ligne activé',
		downloadAsk: (name: string) =>
			`Pour jouer hors ligne à ${name}, télécharge une seule fois sa zone (environ 2 km autour du centre).`,
		measuring: 'Calcul de la taille…',
		download: (size: string) => `Télécharger (${size})`,
		downloading: (percent: number) => `Téléchargement… ${percent} %`,
		cancel: 'Annuler',
		downloadFailed: 'Téléchargement impossible. Vérifie ta connexion et réessaie.',
		outsideZones: (name: string) =>
			`Ta position n’est dans aucune zone téléchargée. La commune la plus proche est ${name}.`
	},

	// A size in megabytes, the French way: « 6,2 Mo ».
	size: (bytes: number, estimated = false) =>
		`${estimated ? 'environ ' : ''}${(bytes / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`,

	failure: {
		'not-enough-places':
			'Il n’y a pas assez de lieux publics ici pour monter une enquête. Essaie une commune voisine :',
		'no-scene': 'Aucun lieu de la zone ne convient pour la farce. Essaie une autre commune.',
		'difficulty-unreachable':
			'Impossible de monter une enquête à cette difficulté ici. Essaie une autre difficulté ou une autre commune.',
		'data-missing': 'Les données du jeu sont introuvables. Réessaie plus tard.',
		'data-changed':
			'Les données ont changé depuis ta dernière partie : cette enquête ne peut plus être rejouée à l’identique.',
		'needs-connection':
			'Cette enquête demande une connexion : elle sort de tes zones téléchargées. Désactive le mode hors ligne dans les Réglages, ou commence une autre enquête.',
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
		pieces: 'Preuves et témoins',
		nothingHere: 'Rien ici.',
		toMystery: 'Vers le lieu du mystère',
		tripTo: 'Trajet vers…',
		tripFrom: (name: string) => `Trajet depuis ${name} vers…`,
		mystery: 'Lieu du mystère',
		onlyRetained: 'Seuls les lieux de l’enquête sont proposés.',
		noted: 'Chaque trajet affiché est noté dans le carnet.',
		cursor: 'Curseur horaire',
		unknown: 'inconnu',
		notAnywhere: 'Position inconnue à cette heure.',
		openFile: (name: string) => `Fiche de ${name} ▸`,
		close: 'Fermer'
	},

	piece: {
		testimony: (name: string) => `Témoignage de ${name}`,
		about: (name: string) => `À propos de ${name}`
	},

	verdict: {
		measured: (trip: number, gap: number) =>
			`${trip} min de trajet, mais ${gap} min d’écart : les deux faits ne peuvent pas être vrais tous les deux.`,
		tooFar: (name: string, trip: number, gap: number) =>
			`Si ce fait est vrai, ${name} ne peut pas être à la scène (${trip} min de trajet, ${gap} min d’écart).`,
		couldReach: (name: string, trip: number, gap: number) =>
			`Si ce fait est vrai, ${name} aurait pu être à la scène (${trip} min de trajet, ${gap} min d’écart).`
	},

	notebook: {
		chronology: 'Chronologie',
		notes: 'Notes',
		empty: 'Aucun fait pour l’instant. Ouvre un lieu sur la carte.',
		explained: 'Partie terminée : les incohérences et les alibis sont maintenant expliqués.',
		freeNote: 'Note libre',
		notePlaceholder: 'Qui avait un motif ? Qui ment ?',
		measured: 'Trajets mesurés',
		annotations: 'Annotations de lieux',
		inconsistency: 'Incohérence',
		unseen: 'Non vu pendant la partie',
		facts: (count: number) => `${count} fait${count > 1 ? 's' : ''}`
	},

	suspects: {
		title: 'Suspects',
		alibi: 'Alibi',
		statuses: { 'to-check': 'À vérifier', doubtful: 'Douteux', verified: 'Vérifié' } as Record<
			string,
			string
		>,
		file: 'Fiche',
		saysHimself: 'Ce qu’il dit lui-même',
		othersSay: 'Ce que les autres disent de lui',
		proofs: 'Preuves et témoins',
		nothing: 'Rien pour l’instant',
		fillsUp: 'La fiche se remplit en explorant les lieux.',
		explored: (count: number, total: number) => `${count} lieux explorés sur ${total}`,
		accuse: (name: string) => `Accuser ${name}`,
		definitive: 'Définitif : la révélation se lance.',
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
		explain: 'Comprendre : revoir le carnet expliqué',
		toMap: 'Voir sur la carte',
		newInvestigation: 'Nouvelle enquête'
	},

	tour: {
		1: 'Touche un lieu numéroté sur la carte.',
		2: 'Touche une pièce pour la lire : elle rejoint ton carnet.',
		3: 'Mesure un trajet vers le lieu du mystère pour comparer les alibis.',
		skip: 'Passer',
		replay: 'Revoir le guide'
	},

	settings: {
		title: 'Réglages',
		theme: 'Thème',
		light: 'Clair',
		dark: 'Sombre',
		investigation: 'Enquête',
		seed: 'graine',
		status: 'État',
		ongoing: 'En cours',
		finished: 'Terminée',
		dataVersion: 'Données',
		newInvestigation: 'Nouvelle enquête',
		offline: 'Mode hors ligne',
		offlineText: 'Télécharge une seule fois la zone d’une commune pour y jouer sans connexion.',
		on: 'Activé',
		off: 'Désactivé',
		zones: 'Zones téléchargées',
		noZone: 'Aucune zone. Choisis une commune à l’écran de départ pour la télécharger.',
		remove: 'Supprimer',
		notKept: 'Ton navigateur peut effacer les zones et la partie en cours s’il manque de place.',
		about: 'À propos',
		fictionTitle: 'Fiction',
		dataTitle: 'Données',
		dataText: '© OpenStreetMap contributors, licence ODbL 1.0',
		mapTitle: 'Fond de carte',
		mapText: 'Protomaps, tuiles dérivées d’OpenStreetMap',
		fontTitle: 'Police',
		fontText: 'IBM Plex Mono, licence OFL',
		back: 'Retour'
	}
};
