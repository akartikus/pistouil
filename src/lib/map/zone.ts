import type { Feature, MultiLineString, MultiPolygon, Position } from 'geojson';

// An entry of communes.json (see tools/data-preparation/README.md).
export interface Commune {
	name: string;
	insee: string;
	center: { lat: number; lon: number };
	bbox: BBox;
	contour: MultiPolygon;
}

export interface BBox {
	minLat: number;
	minLon: number;
	maxLat: number;
	maxLon: number;
}

// [[min lon, min lat], [max lon, max lat]], the order MapLibre expects.
export type Bounds = [[number, number], [number, number]];

const METRES_PER_DEGREE = 111195;

// The rectangle of a zone widened by a margin, which is as far as the player can pan.
export function zoneBounds(bbox: BBox, marginM: number): Bounds {
	const dLat = marginM / METRES_PER_DEGREE;
	const middle = ((bbox.minLat + bbox.maxLat) / 2) * (Math.PI / 180);
	const dLon = dLat / Math.cos(middle);
	return [
		[bbox.minLon - dLon, bbox.minLat - dLat],
		[bbox.maxLon + dLon, bbox.maxLat + dLat]
	];
}

export function boundsAround(lat: number, lon: number, radiusM: number): Bounds {
	return zoneBounds({ minLat: lat, minLon: lon, maxLat: lat, maxLon: lon }, radiusM);
}

const WORLD: Position[] = [
	[-180, -85],
	[180, -85],
	[180, 85],
	[-180, 85],
	[-180, -85]
];

// The world with each part of the commune cut out; an enclave of the commune is outside it, so masked.
export function communeMask(contour: MultiPolygon): Feature<MultiPolygon> {
	const polygons: Position[][][] = [[WORLD, ...contour.coordinates.map(([outer]) => outer)]];
	for (const [, ...enclaves] of contour.coordinates) {
		for (const enclave of enclaves) polygons.push([enclave]);
	}
	return {
		type: 'Feature',
		properties: {},
		geometry: { type: 'MultiPolygon', coordinates: polygons }
	};
}

export function communeOutline(contour: MultiPolygon): Feature<MultiLineString> {
	return {
		type: 'Feature',
		properties: {},
		geometry: { type: 'MultiLineString', coordinates: contour.coordinates.flat() }
	};
}

// The cells of the preparation grid (same integer arithmetic as the script) touching a rectangle.
export function cellsCovering(
	grid: { latStepE5: number; lonStepE5: number },
	bbox: BBox
): string[] {
	const cell = (value: number, step: number) => Math.floor(Math.round(value * 100000) / step);
	const cells: string[] = [];
	for (
		let row = cell(bbox.minLat, grid.latStepE5);
		row <= cell(bbox.maxLat, grid.latStepE5);
		row++
	) {
		for (
			let col = cell(bbox.minLon, grid.lonStepE5);
			col <= cell(bbox.maxLon, grid.lonStepE5);
			col++
		) {
			cells.push(`${row}_${col}`);
		}
	}
	return cells;
}
