import { pointAlong } from '../engine/pedestrian';
import type { Route } from '../engine/types';

// The true evening, revealed after the accusation.
export interface EveningStay {
	placeId: string;
	from: number;
	to: number;
}

export interface Evening {
	places: Record<string, { lat: number; lon: number }>;
	characters: { id: string; firstName: string; stays: EveningStay[] }[];
	// The routes between the places of the stays.
	routes: Route[];
}

// A route's line from one place to another, whichever way the route is stored.
function lineBetween(evening: Evening, from: string, to: string): [number, number][] {
	const a = evening.places[from];
	const b = evening.places[to];
	const route = evening.routes.find(
		(r) => (r.placeA === from && r.placeB === to) || (r.placeA === to && r.placeB === from)
	);
	if (!route?.geometry || route.geometry.length < 2) {
		return [
			[a.lon, a.lat],
			[b.lon, b.lat]
		];
	}
	return route.placeA === from ? route.geometry : [...route.geometry].reverse();
}

// [lon, lat] of a suspect at a time: at the place of a stay, on the way between two stays,
// and at the first or last place before or after the evening.
export function positionAt(evening: Evening, characterId: string, time: number): [number, number] {
	const stays = [...evening.characters.find((c) => c.id === characterId)!.stays].sort(
		(x, y) => x.from - y.from
	);
	const place = (id: string): [number, number] => [evening.places[id].lon, evening.places[id].lat];
	if (time <= stays[0].from) return place(stays[0].placeId);
	for (let i = 0; i < stays.length; i++) {
		const stay = stays[i];
		if (time <= stay.to) return place(stay.placeId);
		const next = stays[i + 1];
		if (next && time < next.from) {
			const fraction = (time - stay.to) / (next.from - stay.to);
			return pointAlong(lineBetween(evening, stay.placeId, next.placeId), fraction);
		}
	}
	return place(stays[stays.length - 1].placeId);
}
