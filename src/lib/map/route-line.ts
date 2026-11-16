import type { Feature, LineString, Point, Position } from 'geojson';
import { haversineM } from '../engine/pedestrian';
import type { Place, Route } from '../engine/types';

export interface RouteLabel {
	text: string;
	approximate: boolean;
}

// The point halfway along a line, measured on the ground.
function midpoint(line: Position[]): Position {
	const lengths = line.slice(1).map((to, i) => {
		const from = line[i];
		return haversineM({ lon: from[0], lat: from[1] }, { lon: to[0], lat: to[1] });
	});
	let remaining = lengths.reduce((sum, length) => sum + length, 0) / 2;
	for (let i = 0; i < lengths.length; i++) {
		if (remaining <= lengths[i] || i === lengths.length - 1) {
			const t = lengths[i] === 0 ? 0 : remaining / lengths[i];
			return [
				line[i][0] + (line[i + 1][0] - line[i][0]) * t,
				line[i][1] + (line[i + 1][1] - line[i][1]) * t
			];
		}
		remaining -= lengths[i];
	}
	return line[0];
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
			geometry: { type: 'Point', coordinates: midpoint(coordinates) }
		}
	};
}
