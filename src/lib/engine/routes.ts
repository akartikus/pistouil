import type { Place, Route } from './types';

export type TravelTime = (placeA: string, placeB: string) => number;

const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export function missingPairs(placeIds: string[], routes: Route[]): [string, string][] {
	const known = new Set(routes.map((route) => key(route.placeA, route.placeB)));
	const missing: [string, string][] = [];
	for (let i = 0; i < placeIds.length; i++) {
		for (let j = i + 1; j < placeIds.length; j++) {
			if (!known.has(key(placeIds[i], placeIds[j]))) missing.push([placeIds[i], placeIds[j]]);
		}
	}
	return missing;
}

// One route per pair of places is symmetric by construction; two routes for a pair must agree.
export function assertCompleteMatrix(places: Place[], routes: Route[]): void {
	const minutes = new Map<string, number>();
	for (const route of routes) {
		if (!Number.isInteger(route.minutes) || route.minutes < 1) {
			throw new Error(`Route ${route.placeA}-${route.placeB} must last at least 1 minute`);
		}
		const pair = key(route.placeA, route.placeB);
		if (minutes.has(pair) && minutes.get(pair) !== route.minutes) {
			throw new Error(`Routes ${route.placeA}-${route.placeB} disagree on duration`);
		}
		minutes.set(pair, route.minutes);
	}
	const [first] = missingPairs(
		places.map((place) => place.osmId),
		routes
	);
	if (first) throw new Error(`Missing route between ${first[0]} and ${first[1]}`);
}

export function createTravelTime(routes: Route[]): TravelTime {
	const minutes = new Map(routes.map((route) => [key(route.placeA, route.placeB), route.minutes]));
	return (placeA, placeB) => {
		if (placeA === placeB) return 0;
		const value = minutes.get(key(placeA, placeB));
		if (value === undefined) throw new Error(`Missing route between ${placeA} and ${placeB}`);
		return value;
	};
}
