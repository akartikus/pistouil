import { describe, it, expect } from 'vitest';
import { cellsAround, estimateRoutes, nearestPlaces, toPlaces, type RawPlace } from './real-places';
import { validateCatalog } from '../engine/catalog';
import { rawStarterCatalog } from '../engine/fixtures';
import { assertCompleteMatrix } from '../engine/routes';
import type { Place } from '../engine/types';

const catalog = validateCatalog(structuredClone(rawStarterCatalog));
const grid = { latStepE5: 1800, lonStepE5: 2500 };

const raw = (overrides: Partial<RawPlace> = {}): RawPlace => ({
	osmId: 'n1',
	name: 'Boulangerie du Cours',
	type: 'bakery',
	lat: 43.4531,
	lon: 5.5612,
	...overrides
});

const at = (osmId: string, lat: number, lon: number): Place => ({
	osmId,
	name: osmId,
	typeId: 'bakery',
	lat,
	lon,
	removed: false
});

describe('toPlaces', () => {
	it('converts a file place into a model place', () => {
		const [place] = toPlaces([raw({ openingHours: 'Mo-Sa 07:00-19:30' })], catalog);
		expect(place).toEqual({
			osmId: 'n1',
			name: 'Boulangerie du Cours',
			typeId: 'bakery',
			lat: 43.4531,
			lon: 5.5612,
			removed: false
		});
	});

	it('keeps a removed place removed', () => {
		expect(toPlaces([raw({ removed: true })], catalog)[0].removed).toBe(true);
	});

	it('ignores a type unknown to the catalog', () => {
		expect(toPlaces([raw({ type: 'spaceport' })], catalog)).toEqual([]);
	});
});

describe('cellsAround', () => {
	it('returns the 3 x 3 cells around the center cell', () => {
		// 43.4531 N, 5.5612 E is in cell 2414_222.
		const cells = cellsAround(grid, 43.4531, 5.5612);
		expect(cells).toHaveLength(9);
		expect(cells).toContain('2414_222');
		expect(cells).toContain('2413_221');
		expect(cells).toContain('2415_223');
	});

	it('uses the same cell as the preparation script on a limit', () => {
		expect(cellsAround(grid, 43.452, 5.55)).toContain('2414_222');
		expect(cellsAround(grid, 43.45199, 5.55)).toContain('2413_222');
	});
});

describe('nearestPlaces', () => {
	const places = [at('n3', 43.46, 5.56), at('n1', 43.4531, 5.5612), at('n2', 43.4531, 5.5612)];

	it('keeps the closest places, ties broken by id', () => {
		const kept = nearestPlaces(places, { lat: 43.4531, lon: 5.5612 }, 2);
		expect(kept.map((p) => p.osmId)).toEqual(['n1', 'n2']);
	});

	it('returns every place when there are fewer than requested', () => {
		expect(nearestPlaces(places, { lat: 43.4531, lon: 5.5612 }, 40)).toHaveLength(3);
	});
});

describe('estimateRoutes', () => {
	const places = [
		at('n1', 43.4531, 5.5612),
		at('n2', 43.4541, 5.5622),
		at('n3', 43.4531, 5.5612) // same spot as n1
	];

	it('gives a complete matrix accepted by the engine', () => {
		const routes = estimateRoutes(places);
		expect(routes).toHaveLength(3);
		expect(() => assertCompleteMatrix(places, routes)).not.toThrow();
	});

	it('gives positive distance and duration, even for the same spot', () => {
		for (const route of estimateRoutes(places)) {
			expect(route.distanceM).toBeGreaterThan(0);
			expect(route.minutes).toBeGreaterThanOrEqual(1);
		}
	});

	it('walks about 83 m per minute on a 1.3 detour factor', () => {
		const [route] = estimateRoutes([at('a', 43.45, 5.56), at('b', 43.46, 5.56)]);
		// 0.01 deg of latitude is about 1112 m, times 1.3.
		expect(route.distanceM).toBeGreaterThan(1400);
		expect(route.distanceM).toBeLessThan(1500);
		expect(route.minutes).toBe(Math.ceil(route.distanceM / 83.3));
	});
});
