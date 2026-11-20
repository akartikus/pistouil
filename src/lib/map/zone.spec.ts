import { describe, it, expect } from 'vitest';
import {
	boundsAround,
	cellsCovering,
	communeMask,
	communeOutline,
	insideContour,
	zoneBounds
} from './zone';

const bbox = { minLat: 43.4, minLon: 5.5, maxLat: 43.5, maxLon: 5.6 };

describe('zoneBounds', () => {
	it('widens the rectangle by the margin on every side', () => {
		const [[minLon, minLat], [maxLon, maxLat]] = zoneBounds(bbox, 1000);
		// 1 km is about 0.009 degree of latitude, and 0.0124 of longitude at 43.5 N.
		expect(minLat).toBeCloseTo(43.4 - 0.009, 3);
		expect(maxLat).toBeCloseTo(43.5 + 0.009, 3);
		expect(minLon).toBeCloseTo(5.5 - 0.0124, 3);
		expect(maxLon).toBeCloseTo(5.6 + 0.0124, 3);
	});

	it('keeps the rectangle as is without margin', () => {
		expect(zoneBounds(bbox, 0)).toEqual([
			[5.5, 43.4],
			[5.6, 43.5]
		]);
	});
});

describe('boundsAround', () => {
	it('is centred on the position', () => {
		const [[minLon, minLat], [maxLon, maxLat]] = boundsAround(43.45, 5.56, 2000);
		expect((minLat + maxLat) / 2).toBeCloseTo(43.45, 6);
		expect((minLon + maxLon) / 2).toBeCloseTo(5.56, 6);
		expect(maxLat - minLat).toBeCloseTo(0.036, 3);
	});
});

const ring = (x: number, y: number, size: number) => [
	[x, y],
	[x + size, y],
	[x + size, y + size],
	[x, y + size],
	[x, y]
];

describe('communeMask', () => {
	it('is the world with the commune cut out', () => {
		const contour = { type: 'MultiPolygon' as const, coordinates: [[ring(5.5, 43.4, 0.1)]] };
		const mask = communeMask(contour);
		expect(mask.geometry.coordinates).toHaveLength(1);
		const [world, hole] = mask.geometry.coordinates[0];
		expect(hole).toEqual(ring(5.5, 43.4, 0.1));
		expect(world.some(([lon]) => lon <= -180)).toBe(true);
	});

	it('masks an enclave of the commune too', () => {
		const contour = {
			type: 'MultiPolygon' as const,
			coordinates: [[ring(5.5, 43.4, 0.1), ring(5.52, 43.42, 0.02)]]
		};
		const { coordinates } = communeMask(contour).geometry;
		expect(coordinates).toHaveLength(2);
		expect(coordinates[1]).toEqual([ring(5.52, 43.42, 0.02)]);
	});
});

describe('communeOutline', () => {
	it('is one line per ring of the contour', () => {
		const contour = {
			type: 'MultiPolygon' as const,
			coordinates: [[ring(5.5, 43.4, 0.1)], [ring(5.7, 43.4, 0.05)]]
		};
		expect(communeOutline(contour).geometry.coordinates).toEqual([
			ring(5.5, 43.4, 0.1),
			ring(5.7, 43.4, 0.05)
		]);
	});
});

describe('cellsCovering', () => {
	const grid = { latStepE5: 1800, lonStepE5: 2500 };

	it('lists every cell that touches the rectangle', () => {
		// Cell limits: latitude every 0.018 degree, longitude every 0.025.
		const cells = cellsCovering(grid, { minLat: 43.4, minLon: 5.5, maxLat: 43.44, maxLon: 5.54 });
		expect(cells).toEqual(['2411_220', '2411_221', '2412_220', '2412_221', '2413_220', '2413_221']);
	});

	it('gives one cell for a rectangle inside a cell', () => {
		const cells = cellsCovering(grid, {
			minLat: 43.4,
			minLon: 5.51,
			maxLat: 43.401,
			maxLon: 5.512
		});
		expect(cells).toEqual(['2411_220']);
	});
});

describe('insideContour', () => {
	const square = { type: 'MultiPolygon' as const, coordinates: [[ring(5.5, 43.4, 0.1)]] };

	it('accepts a point inside the contour', () => {
		expect(insideContour({ lat: 43.45, lon: 5.55 }, square)).toBe(true);
	});

	it('refuses a point just outside the contour', () => {
		expect(insideContour({ lat: 43.45, lon: 5.6001 }, square)).toBe(false);
		expect(insideContour({ lat: 43.3999, lon: 5.55 }, square)).toBe(false);
	});

	it('refuses a point in an enclave of the commune', () => {
		const withEnclave = {
			type: 'MultiPolygon' as const,
			coordinates: [[ring(5.5, 43.4, 0.1), ring(5.52, 43.42, 0.02)]]
		};
		expect(insideContour({ lat: 43.43, lon: 5.53 }, withEnclave)).toBe(false);
		expect(insideContour({ lat: 43.41, lon: 5.51 }, withEnclave)).toBe(true);
	});

	it('accepts a point in any part of a commune made of several parts', () => {
		const two = {
			type: 'MultiPolygon' as const,
			coordinates: [[ring(5.5, 43.4, 0.1)], [ring(5.8, 43.4, 0.1)]]
		};
		expect(insideContour({ lat: 43.45, lon: 5.85 }, two)).toBe(true);
		expect(insideContour({ lat: 43.45, lon: 5.7 }, two)).toBe(false);
	});
});
