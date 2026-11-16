import type { Feature, FeatureCollection, Point } from 'geojson';
import type { Catalog, Place } from '../engine/types';

// Icon families of static/map/icons; any other value falls back to the generic icon.
const ICON_FAMILIES = [
	'health',
	'food',
	'shop',
	'culture',
	'service',
	'nature',
	'transport',
	'leisure',
	'neutral'
];

export type MapRole = 'investigation' | 'mystery' | 'decor' | 'neutral';

export interface PlaceProperties {
	osmId: string;
	name: string;
	role: MapRole;
	number?: number;
	icon: string;
	label: string;
	hours?: string;
}

export interface Selection {
	// Places of the investigation, in display order (they are numbered from 1).
	investigationIds: string[];
	mysteryId?: string;
	// Raw OSM opening hours by place id.
	hours?: Record<string, string>;
}

export function placeFeatures(
	places: Place[],
	catalog: Catalog,
	selection: Selection
): FeatureCollection<Point, PlaceProperties> {
	const types = new Map(catalog.placeTypes.map((type) => [type.id, type]));
	const features: Feature<Point, PlaceProperties>[] = [];
	for (const place of places) {
		if (place.removed) continue;
		const type = types.get(place.typeId);
		const excluded = type?.role === 'excluded';
		const index = selection.investigationIds.indexOf(place.osmId);
		let role: MapRole = excluded ? 'neutral' : 'decor';
		if (!excluded && index >= 0)
			role = place.osmId === selection.mysteryId ? 'mystery' : 'investigation';
		const family = excluded ? 'neutral' : type?.icon;
		const properties: PlaceProperties = {
			osmId: place.osmId,
			name: place.name,
			role,
			icon: family && ICON_FAMILIES.includes(family) ? family : 'generic',
			label: type?.label ?? place.typeId
		};
		if (role === 'investigation' || role === 'mystery') properties.number = index + 1;
		const hours = selection.hours?.[place.osmId];
		if (hours) properties.hours = hours;
		features.push({
			type: 'Feature',
			properties,
			geometry: { type: 'Point', coordinates: [place.lon, place.lat] }
		});
	}
	return { type: 'FeatureCollection', features };
}

// A suspect shown on the map at a time, as a round chip with their initial.
export interface SuspectChip {
	id: string;
	initial: string;
	lon: number;
	lat: number;
	// Hatched when the facts about this suspect do not fit.
	conflict?: boolean;
	selected?: boolean;
}
