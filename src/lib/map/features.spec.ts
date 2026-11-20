import { describe, it, expect } from 'vitest';
import { placeFeatures } from './features';
import { validateCatalog } from '../engine/catalog';
import { rawStarterCatalog } from '../engine/fixtures';
import type { Place } from '../engine/types';

const catalog = validateCatalog(structuredClone(rawStarterCatalog));

const place = (osmId: string, typeId: string, overrides: Partial<Place> = {}): Place => ({
	osmId,
	name: `Lieu ${osmId}`,
	typeId,
	lat: 43.45,
	lon: 5.56,
	removed: false,
	...overrides
});

const byId = (features: ReturnType<typeof placeFeatures>) =>
	Object.fromEntries(features.features.map((f) => [f.properties.osmId, f.properties]));

describe('placeFeatures', () => {
	const places = [
		place('a', 'bakery'),
		place('b', 'pharmacy'),
		place('c', 'cafe'),
		place('d', 'bakery')
	];

	it('numbers the investigation places in order and gives the mystery its own role', () => {
		const result = byId(
			placeFeatures(places, catalog, { investigationIds: ['b', 'a', 'c'], mysteryId: 'c' })
		);
		expect(result.b).toMatchObject({ role: 'investigation', number: 1 });
		expect(result.a).toMatchObject({ role: 'investigation', number: 2 });
		expect(result.c).toMatchObject({ role: 'mystery', number: 3 });
	});

	it('shows every other place as decor with the icon and label of its type', () => {
		const result = byId(placeFeatures(places, catalog, { investigationIds: ['b'] }));
		expect(result.d).toMatchObject({ role: 'decor', icon: 'food', label: 'Boulangerie' });
		expect(result.d.number).toBeUndefined();
	});

	it('gives the generic icon to a type without a known icon family', () => {
		const odd = structuredClone(catalog);
		odd.placeTypes.find((type) => type.id === 'bakery')!.icon = 'unknown';
		const result = byId(placeFeatures(places, odd, { investigationIds: [] }));
		expect(result.a.icon).toBe('generic');
		const unknownType = byId(
			placeFeatures([place('x', 'no_such_type')], catalog, { investigationIds: [] })
		);
		expect(unknownType.x).toMatchObject({ role: 'decor', icon: 'generic', label: 'no_such_type' });
	});

	it('shows an excluded place as neutral decor, never highlighted', () => {
		const dwelling = place('h', 'dwelling');
		const result = byId(placeFeatures([dwelling], catalog, { investigationIds: ['h'] }));
		expect(result.h).toMatchObject({ role: 'neutral', icon: 'neutral' });
		expect(result.h.number).toBeUndefined();
	});

	it('leaves out removed places', () => {
		const result = placeFeatures([place('r', 'bakery', { removed: true })], catalog, {
			investigationIds: []
		});
		expect(result.features).toHaveLength(0);
	});

	it('writes the opening hours in French and puts coordinates in [lon, lat] order', () => {
		const [feature] = placeFeatures([place('a', 'bakery')], catalog, {
			investigationIds: [],
			hours: { a: 'Mo-Sa 07:00-19:30' }
		}).features;
		expect(feature.properties.hours).toBe('lun.–sam. 7h–19h30');
		expect(feature.geometry.coordinates).toEqual([5.56, 43.45]);
	});
});
