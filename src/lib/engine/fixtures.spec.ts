import { describe, it, expect } from 'vitest';
import { richPlaces, richRoutes, rawStarterCatalog } from './fixtures';
import { assertCompleteMatrix, createTravelTime } from './routes';

describe('rich test places', () => {
	it('have a complete route matrix of at least one minute', () => {
		expect(() => assertCompleteMatrix(richPlaces, richRoutes)).not.toThrow();
		const n = richPlaces.length;
		expect(richRoutes).toHaveLength((n * (n - 1)) / 2);
	});

	it('give the same time in both directions and stay close to a straight walk', () => {
		const travel = createTravelTime(richRoutes);
		for (const a of richPlaces) {
			for (const b of richPlaces) {
				expect(travel(a.osmId, b.osmId)).toBe(travel(b.osmId, a.osmId));
			}
		}
		// Going through a third place is never much quicker than going straight.
		const [a, b, c] = richPlaces;
		expect(travel(a.osmId, b.osmId)).toBeLessThanOrEqual(
			travel(a.osmId, c.osmId) + travel(c.osmId, b.osmId) + 1
		);
	});

	it('have a place of every type of the catalog, and a removed place', () => {
		const types = new Set(richPlaces.map((place) => place.typeId));
		for (const type of rawStarterCatalog.placeTypes) expect(types).toContain(type.id);
		expect(richPlaces.some((place) => place.removed)).toBe(true);
	});

	it('have distinct ids and names', () => {
		expect(new Set(richPlaces.map((p) => p.osmId)).size).toBe(richPlaces.length);
		expect(new Set(richPlaces.map((p) => p.name)).size).toBe(richPlaces.length);
	});
});
