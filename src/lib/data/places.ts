import type { Catalog, Place } from '../engine/types';

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
