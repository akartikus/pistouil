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
