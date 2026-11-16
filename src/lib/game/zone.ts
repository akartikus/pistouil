import { haversineM } from '../engine/pedestrian';
import type { Catalog, Place } from '../engine/types';

// The radius grows through these steps until the zone holds enough places.
export const RADII_M = [500, 1000, 2000, 4000];
export const MIN_USABLE = 6;
export const MIN_SCENES = 2;
// The route matrix is quadratic: the engine gets at most this many places.
export const MAX_PLACES = 40;

export interface Center {
	lat: number;
	lon: number;
}

export type ZoneResult =
	{ ok: true; radiusM: number; places: Place[] } | { ok: false; reason: 'not-enough-places' };

// The nearest usable places of the first radius that holds enough of them, nearest first.
export function buildZone(places: Place[], catalog: Catalog, center: Center): ZoneResult {
	const roles = new Map(catalog.placeTypes.map((type) => [type.id, type.role]));
	const usable = places
		.filter((place) => !place.removed && ['scene', 'alibi'].includes(roles.get(place.typeId) ?? ''))
		.map((place) => ({
			place,
			distance: haversineM(center, place),
			scene: roles.get(place.typeId) === 'scene'
		}))
		.sort((a, b) => a.distance - b.distance || (a.place.osmId < b.place.osmId ? -1 : 1));

	for (const radiusM of RADII_M) {
		const within = usable.filter((entry) => entry.distance <= radiusM);
		if (within.length < MIN_USABLE || within.filter((entry) => entry.scene).length < MIN_SCENES)
			continue;
		const kept = within.slice(0, MAX_PLACES);
		// Nearest places may all be alibis: swap the farthest ones for the nearest scenes.
		const missing = MIN_SCENES - kept.filter((entry) => entry.scene).length;
		if (missing > 0) {
			const extra = within
				.slice(MAX_PLACES)
				.filter((entry) => entry.scene)
				.slice(0, missing);
			const farthestNonScenes = kept.filter((entry) => !entry.scene).slice(-missing);
			const dropped = new Set(farthestNonScenes);
			kept.splice(0, kept.length, ...kept.filter((entry) => !dropped.has(entry)), ...extra);
			kept.sort((a, b) => a.distance - b.distance || (a.place.osmId < b.place.osmId ? -1 : 1));
		}
		return { ok: true, radiusM, places: kept.map((entry) => entry.place) };
	}
	return { ok: false, reason: 'not-enough-places' };
}

export interface CommuneSummary {
	name: string;
	insee: string;
	center: Center;
}

// The communes nearest to the centre, other than the one that was too empty.
export function neighborCommunes(
	communes: CommuneSummary[],
	center: Center,
	excludeInsee: string,
	count = 3
): CommuneSummary[] {
	return communes
		.filter((commune) => commune.insee !== excludeInsee)
		.map((commune) => ({ commune, distance: haversineM(center, commune.center) }))
		.sort((a, b) => a.distance - b.distance)
		.slice(0, count)
		.map((entry) => entry.commune);
}
