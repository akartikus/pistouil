// Real OSM places for the playground: a development shortcut until the zone loading
// (brief 05) and the pedestrian routes (brief 03) exist.
import {
	assembleGraph,
	haversineM,
	minutesFor,
	pedestrianRoutes,
	type GraphCell
} from '../engine/pedestrian';
import type { Place, Route } from '../engine/types';
import type { Grid } from '../data/places';

export { toPlaces, type Grid, type RawPlace } from '../data/places';

export interface Center {
	lat: number;
	lon: number;
}

// Same integer arithmetic as the preparation script, so cell limits agree.
export function cellsAround(grid: Grid, lat: number, lon: number): string[] {
	const row = Math.floor(Math.round(lat * 100000) / grid.latStepE5);
	const col = Math.floor(Math.round(lon * 100000) / grid.lonStepE5);
	const cells: string[] = [];
	for (let r = row - 1; r <= row + 1; r++) {
		for (let c = col - 1; c <= col + 1; c++) cells.push(`${r}_${c}`);
	}
	return cells;
}

export function nearestPlaces(places: Place[], center: Center, count: number): Place[] {
	return places
		.map((place) => ({ place, distance: haversineM(center, place) }))
		.sort((a, b) => a.distance - b.distance || (a.place.osmId < b.place.osmId ? -1 : 1))
		.slice(0, count)
		.map((entry) => entry.place);
}

// Same constants as the rich test routes: 1.3 detour factor, 83.3 m per minute.
export function estimateRoutes(places: Place[]): Route[] {
	return places.flatMap((a, i) =>
		places.slice(i + 1).map((b) => {
			const distanceM = Math.max(1, Math.round(haversineM(a, b) * 1.3));
			return {
				placeA: a.osmId,
				placeB: b.osmId,
				distanceM,
				minutes: minutesFor(distanceM)
			};
		})
	);
}

export interface RealRoutes {
	routes: Route[];
	// Whether a pedestrian graph was used.
	network: boolean;
	// Pairs whose duration is a straight-line estimate.
	estimated: number;
}

// Walks along the streets when graph cells are given, and estimates the pairs they do not connect.
export function routesFor(places: Place[], cells: GraphCell[]): RealRoutes {
	if (cells.length === 0) {
		const routes = estimateRoutes(places);
		return { routes, network: false, estimated: routes.length };
	}
	const routes = pedestrianRoutes(places, assembleGraph(cells));
	return { routes, network: true, estimated: routes.filter((route) => route.approximate).length };
}
