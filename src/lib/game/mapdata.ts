import type { Place } from '../engine/types';
import type { DecorPlace } from './protocol';
import type { PublicInvestigation } from './projection';

// Places of the session as the map wants them.
export const asPlaces = (places: (DecorPlace | PublicInvestigation['places'][number])[]): Place[] =>
	places.map((place) => ({
		osmId: place.osmId,
		name: place.name,
		typeId: place.typeId,
		lat: place.lat,
		lon: place.lon,
		removed: false
	}));

export const boxOf = (places: { lat: number; lon: number }[]) => ({
	minLat: Math.min(...places.map((p) => p.lat)),
	maxLat: Math.max(...places.map((p) => p.lat)),
	minLon: Math.min(...places.map((p) => p.lon)),
	maxLon: Math.max(...places.map((p) => p.lon))
});

export const hoursOf = (decor: DecorPlace[]) =>
	Object.fromEntries(
		decor.filter((place) => place.hours).map((place) => [place.osmId, place.hours!])
	);
