// Test fixtures: the starter catalog and a fictional set of places.
import placeTypes from '../../../catalog/place-types.json';
import clueTypes from '../../../catalog/clue-types.json';
import compatibilities from '../../../catalog/compatibilities.json';
import scenarios from '../../../catalog/scenarios.json';
import firstNames from '../../../catalog/first-names.json';
import testimonyTemplates from '../../../catalog/testimony-templates.json';
import type { Place, Route } from './types';

export const rawStarterCatalog = {
	placeTypes,
	clueTypes,
	compatibilities,
	scenarios,
	firstNames,
	testimonyTemplates
};

const place = (osmId: string, name: string, typeId: string, removed = false): Place => ({
	osmId,
	name,
	lat: 0,
	lon: 0,
	typeId,
	removed
});

// 4 scene places, 2 alibi places, 1 excluded place, 1 removed place.
export const fixturePlaces: Place[] = [
	place('p1', 'Fontaine des Lilas', 'fountain'),
	place('p2', 'Parc Mirabeau', 'park'),
	place('p3', 'Café du Cours', 'cafe'),
	place('p4', 'Boulangerie Sainte-Anne', 'bakery'),
	place('p5', 'École des Tilleuls', 'school'),
	place('p6', 'Église Saint-Paul', 'place_of_worship'),
	place('p7', 'Aire de jeux du Vallon', 'playground'),
	place('p8', 'Banc de la Treille', 'bench', true)
];

// Complete symmetric matrix, minutes between 3 and 12.
export const fixtureRoutes: Route[] = fixturePlaces.flatMap((a, i) =>
	fixturePlaces.slice(i + 1).map((b, j) => {
		const minutes = 3 + ((i * 5 + j * 7 + 3) % 10);
		return { placeA: a.osmId, placeB: b.osmId, distanceM: minutes * 83, minutes };
	})
);

// A rich set of places: one place of each type of the catalog, with positions in meters.
// Walking distance is the straight line times 1.3, at 5 km/h (about 83 m per minute).
const richSpecs: [string, string, string, number, number][] = [
	['r01', 'Fontaine des Lilas', 'fountain', 400, 300],
	['r02', 'Parc Mirabeau', 'park', 150, 520],
	['r03', 'Place des Tilleuls', 'square', 430, 360],
	['r04', 'Rue des Arcades', 'pedestrian_street', 350, 330],
	['r05', 'Statue du Poète', 'statue', 460, 280],
	['r06', 'Banc de la Treille', 'bench', 300, 420],
	['r07', 'Kiosque à journaux', 'kiosk', 380, 450],
	['r08', 'Marché du Jeudi', 'open_air_market', 500, 330],
	['r09', 'Boulangerie Sainte-Anne', 'bakery', 360, 310],
	['r10', 'Café du Cours', 'cafe', 410, 340],
	['r11', 'Le Zinc', 'bar', 450, 390],
	['r12', 'Chez Marius', 'restaurant', 330, 370],
	['r13', 'Pharmacie du Centre', 'pharmacy', 390, 290],
	['r14', 'Épicerie du Coin', 'shop', 320, 300],
	['r15', 'Boucherie Martin', 'butcher', 300, 340],
	['r16', 'Primeur de la Treille', 'greengrocer', 280, 380],
	['r17', 'Fleuriste Le Lilas', 'florist', 470, 310],
	['r18', 'Librairie des Quais', 'bookshop', 440, 420],
	['r19', 'Boutique Mode Douce', 'clothes_shop', 520, 360],
	['r20', 'Coiffeur Tête en l’Air', 'hairdresser', 340, 400],
	['r21', 'Tabac de la Place', 'tobacconist', 415, 370],
	['r22', 'Supermarché Panier Vert', 'supermarket', 600, 420],
	['r23', 'Laverie des Écoles', 'laundromat', 250, 330],
	['r24', 'Bibliothèque municipale', 'library', 480, 450],
	['r25', 'Bureau de poste', 'post_office', 500, 290],
	['r26', 'Cinéma Le Moderne', 'cinema', 550, 320],
	['r27', 'Théâtre de la Source', 'performance_hall', 520, 240],
	['r28', 'Musée du Quartier', 'museum', 540, 400],
	['r29', 'Mairie', 'town_hall', 470, 250],
	['r30', 'Arrêt Mairie', 'bus_stop', 480, 260],
	['r31', 'Gare', 'train_station', 700, 500],
	['r32', 'Salle de sport Énergie', 'gym', 610, 360],
	['r33', 'École des Tilleuls', 'school', 230, 450],
	['r34', 'Église Saint-Paul', 'place_of_worship', 445, 300],
	['r35', 'Centre hospitalier', 'hospital', 800, 200],
	['r36', 'Cimetière du Vallon', 'cemetery', 100, 650],
	['r37', 'Monument aux morts', 'war_memorial', 425, 325],
	['r38', 'École de musique', 'music_school', 510, 430],
	['r39', 'Aire de jeux du Vallon', 'playground', 210, 480],
	['r40', 'Maison des Glycines', 'dwelling', 380, 520],
	['r41', 'Banc retiré', 'bench', 300, 430]
];

export const richPlaces: Place[] = richSpecs.map(([osmId, name, typeId], i) =>
	place(osmId, name, typeId, i === richSpecs.length - 1)
);

export const richRoutes: Route[] = richSpecs.flatMap(([idA, , , xa, ya], i) =>
	richSpecs.slice(i + 1).map(([idB, , , xb, yb]) => {
		const distanceM = Math.round(Math.hypot(xa - xb, ya - yb) * 1.3);
		return {
			placeA: idA,
			placeB: idB,
			distanceM,
			minutes: Math.max(1, Math.ceil(distanceM / 83.3))
		};
	})
);
