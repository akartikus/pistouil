import { describe, it, expect } from 'vitest';
import { routeFeatures } from './route-line';
import type { Place, Route } from '../engine/types';

const at = (osmId: string, lat: number, lon: number): Place => ({
	osmId,
	name: osmId,
	typeId: 'bakery',
	lat,
	lon,
	removed: false
});
const places = [at('a', 0, 0), at('b', 0.01, 0.03)];

describe('routeFeatures', () => {
	it('draws the geometry of a route along the streets', () => {
		const geometry: [number, number][] = [
			[0, 0],
			[0, 0.01],
			[0.03, 0.01]
		];
		const route: Route = { placeA: 'a', placeB: 'b', distanceM: 4300, minutes: 52, geometry };
		const { line } = routeFeatures(route, places);
		expect(line.geometry.coordinates).toEqual(geometry);
	});

	it('draws a straight line for a route without geometry', () => {
		const route: Route = {
			placeA: 'a',
			placeB: 'b',
			distanceM: 100,
			minutes: 2,
			approximate: true
		};
		const { line, label } = routeFeatures(route, places);
		expect(line.geometry.coordinates).toEqual([
			[0, 0],
			[0.03, 0.01]
		]);
		expect(label.properties.approximate).toBe(true);
	});

	it('puts the label in the middle of the walk with the duration', () => {
		const geometry: [number, number][] = [
			[0, 0],
			[0, 0.01],
			[0.03, 0.01]
		];
		const route: Route = { placeA: 'a', placeB: 'b', distanceM: 4300, minutes: 52, geometry };
		const { label } = routeFeatures(route, places);
		expect(label.properties.text).toBe('52 MIN');
		// 1.1 km up, then 3.3 km east: the middle is 1.1 km into the eastward leg.
		const [lon, lat] = label.geometry.coordinates;
		expect(lat).toBeCloseTo(0.01, 5);
		expect(lon).toBeCloseTo(0.0098, 3);
		expect(label.properties.approximate).toBe(false);
	});

	it('refuses a route between unknown places', () => {
		const route: Route = { placeA: 'a', placeB: 'zzz', distanceM: 1, minutes: 1 };
		expect(() => routeFeatures(route, places)).toThrow(/zzz/);
	});
});
