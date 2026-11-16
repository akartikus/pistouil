import type { Feature, LineString, Point, Position } from 'geojson';
import { pointAlong } from '../engine/pedestrian';
import type { Place, Route } from '../engine/types';

export interface RouteLabel {
	text: string;
	approximate: boolean;
}

// The dotted line of a route and the label with its duration. A route without a track
// (an estimate) is drawn straight between its two places.
export function routeFeatures(
	route: Route,
	places: Place[]
): { line: Feature<LineString>; label: Feature<Point, RouteLabel> } {
	const find = (id: string) => {
		const place = places.find((p) => p.osmId === id);
		if (!place) throw new Error(`Unknown place ${id}`);
		return place;
	};
	const a = find(route.placeA);
	const b = find(route.placeB);
	const coordinates: Position[] =
		route.geometry && route.geometry.length >= 2
			? route.geometry
			: [
					[a.lon, a.lat],
					[b.lon, b.lat]
				];
	return {
		line: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } },
		label: {
			type: 'Feature',
			properties: { text: `${route.minutes} MIN`, approximate: route.approximate === true },
			geometry: { type: 'Point', coordinates: pointAlong(coordinates as [number, number][], 0.5) }
		}
	};
}
