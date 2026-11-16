// Real OSM places for the playground: a development shortcut until the zone loading
// (brief 05) and the pedestrian routes (brief 03) exist.
import type { Catalog, Place, Route } from '../engine/types';

// A place as written by tools/data-preparation (see its README).
export interface RawPlace {
	osmId: string;
	name: string;
	type: string;
	lat: number;
	lon: number;
	openingHours?: string;
	removed?: boolean;
}

export interface Grid {
	latStepE5: number;
	lonStepE5: number;
}

export interface Center {
	lat: number;
	lon: number;
}

// openingHours is dropped: the catalog's typical hours apply.
export function toPlaces(raw: RawPlace[], catalog: Catalog): Place[] {
	const known = new Set(catalog.placeTypes.map((type) => type.id));
	return raw
		.filter((place) => known.has(place.type))
		.map((place) => ({
			osmId: place.osmId,
			name: place.name,
			typeId: place.type,
			lat: place.lat,
			lon: place.lon,
			removed: place.removed ?? false
		}));
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

const EARTH_RADIUS_M = 6371000;

function haversineM(a: Center, b: Center): number {
	const rad = Math.PI / 180;
	const dLat = (b.lat - a.lat) * rad;
	const dLon = (b.lon - a.lon) * rad;
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
	return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
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
				minutes: Math.max(1, Math.ceil(distanceM / 83.3))
			};
		})
	);
}
