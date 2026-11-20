import { describe, it, expect } from 'vitest';
import { buildZone, MAX_PLACES, RADII_M } from './zone';
import { validateCatalog } from '../engine/catalog';
import { rawStarterCatalog } from '../engine/fixtures';
import type { Place } from '../engine/types';

const catalog = validateCatalog(structuredClone(rawStarterCatalog));
const center = { lat: 43.45, lon: 5.56 };

// About 111 m per 0.001 degree of latitude.
const at = (
	osmId: string,
	typeId: string,
	metres: number,
	overrides: Partial<Place> = {}
): Place => ({
	osmId,
	name: osmId,
	typeId,
	lat: center.lat + metres / 111195,
	lon: center.lon,
	removed: false,
	...overrides
});

const scenes = (count: number, metres: number, prefix = 's') =>
	Array.from({ length: count }, (_, i) => at(`${prefix}${i}`, 'bakery', metres + i));

describe('buildZone', () => {
	it('keeps a radius of 500 m when it holds enough usable places', () => {
		const zone = buildZone(scenes(8, 100), catalog, center);
		expect(zone).toMatchObject({ ok: true, radiusM: 500 });
	});

	it('widens the radius step by step until 6 usable places with 2 scenes', () => {
		const places = [...scenes(3, 100), ...scenes(3, 900, 'far'), ...scenes(3, 1800, 'farther')];
		expect(buildZone(places, catalog, center)).toMatchObject({ ok: true, radiusM: 1000 });
		expect(
			buildZone(places.slice(0, 3).concat(scenes(5, 1800, 'x')), catalog, center)
		).toMatchObject({
			ok: true,
			radiusM: 2000
		});
	});

	it('stops at 2 km', () => {
		const places = [...scenes(2, 100), ...scenes(6, 3500, 'far')];
		expect(buildZone(places, catalog, center)).toEqual({ ok: false, reason: 'not-enough-places' });
		expect(RADII_M).toEqual([500, 1000, 2000]);
	});

	it('needs at least 2 scenes, not only usable places', () => {
		const alibis = Array.from({ length: 8 }, (_, i) => at(`a${i}`, 'school', 100 + i));
		const zone = buildZone([...alibis, at('only-scene', 'bakery', 150)], catalog, center);
		expect(zone).toMatchObject({ ok: false, reason: 'not-enough-places' });
	});

	it('ignores removed and excluded places', () => {
		const places = [
			...scenes(5, 100),
			at('gone', 'bakery', 110, { removed: true }),
			at('home', 'dwelling', 120)
		];
		expect(buildZone(places, catalog, center)).toMatchObject({ ok: false });
	});

	it('keeps the nearest 40, ties broken by OSM id', () => {
		const places = Array.from({ length: 60 }, (_, i) =>
			at(`n${String(i).padStart(2, '0')}`, 'bakery', 100 + (i >> 1))
		);
		const zone = buildZone(places, catalog, center);
		if (!zone.ok) throw new Error('expected a zone');
		expect(zone.places).toHaveLength(MAX_PLACES);
		const kept = zone.places.map((place) => place.osmId);
		expect(kept).toEqual(places.slice(0, MAX_PLACES).map((place) => place.osmId));
	});

	it('keeps at least 2 scenes among the 40 even when the nearest are alibis', () => {
		const alibis = Array.from({ length: 45 }, (_, i) =>
			at(`a${String(i).padStart(2, '0')}`, 'school', 50 + i)
		);
		const farScenes = [at('s1', 'bakery', 400), at('s2', 'bakery', 410)];
		const zone = buildZone([...alibis, ...farScenes], catalog, center);
		if (!zone.ok) throw new Error('expected a zone');
		expect(zone.places).toHaveLength(MAX_PLACES);
		expect(zone.places.filter((place) => place.typeId === 'bakery').map((p) => p.osmId)).toEqual([
			's1',
			's2'
		]);
	});

	it('gives up beyond 2 km', () => {
		expect(buildZone(scenes(8, 2500), catalog, center)).toEqual({
			ok: false,
			reason: 'not-enough-places'
		});
	});
});
