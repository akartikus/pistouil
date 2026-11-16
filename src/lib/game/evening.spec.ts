import { describe, it, expect } from 'vitest';
import { positionAt, type Evening } from './evening';

const t = (hours: number, minutes: number) => hours * 60 + minutes;

const evening = (overrides: Partial<Evening> = {}): Evening => ({
	places: {
		cafe: { lat: 0, lon: 0 },
		mairie: { lat: 0, lon: 0.02 },
		poste: { lat: 0.02, lon: 0.02 }
	},
	characters: [
		{
			id: 'lea',
			firstName: 'Léa',
			stays: [
				{ placeId: 'cafe', from: t(20, 0), to: t(20, 30) },
				{ placeId: 'mairie', from: t(20, 50), to: t(21, 10) }
			]
		}
	],
	routes: [{ placeA: 'cafe', placeB: 'mairie', distanceM: 2000, minutes: 24, approximate: true }],
	...overrides
});

describe('positionAt', () => {
	it('is at the place of the stay during a stay', () => {
		expect(positionAt(evening(), 'lea', t(20, 15))).toEqual([0, 0]);
		expect(positionAt(evening(), 'lea', t(21, 0))).toEqual([0.02, 0]);
	});

	it('walks a straight line for a route without geometry, in proportion to the time', () => {
		// Between 20:30 and 20:50, halfway at 20:40.
		const [lon, lat] = positionAt(evening(), 'lea', t(20, 40))!;
		expect(lon).toBeCloseTo(0.01, 6);
		expect(lat).toBeCloseTo(0, 6);
	});

	it('follows the geometry of the route', () => {
		const geometry: [number, number][] = [
			[0, 0],
			[0, 0.01],
			[0.02, 0.01]
		];
		const data = evening({
			routes: [{ placeA: 'cafe', placeB: 'mairie', distanceM: 3000, minutes: 36, geometry }]
		});
		const [, lat] = positionAt(data, 'lea', t(20, 31))!;
		expect(lat).toBeGreaterThan(0);
		const end = positionAt(data, 'lea', t(20, 50))!;
		expect(end[0]).toBeCloseTo(0.02, 6);
	});

	it('walks the geometry backwards when the route is stored the other way', () => {
		const data = evening({
			characters: [
				{
					id: 'lea',
					firstName: 'Léa',
					stays: [
						{ placeId: 'mairie', from: t(20, 0), to: t(20, 30) },
						{ placeId: 'cafe', from: t(20, 50), to: t(21, 10) }
					]
				}
			]
		});
		const [lon] = positionAt(data, 'lea', t(20, 40))!;
		expect(lon).toBeCloseTo(0.01, 6);
		expect(positionAt(data, 'lea', t(20, 31))![0]).toBeGreaterThan(0.015);
	});

	it('waits at the first place before the evening and stays at the last one after it', () => {
		expect(positionAt(evening(), 'lea', t(18, 0))).toEqual([0, 0]);
		expect(positionAt(evening(), 'lea', t(23, 0))).toEqual([0.02, 0]);
	});

	it('sorts the stays, since the true evening is not always in order', () => {
		const data = evening();
		data.characters[0].stays.reverse();
		expect(positionAt(data, 'lea', t(20, 15))).toEqual([0, 0]);
	});

	it('gives the same position for the same time', () => {
		expect(positionAt(evening(), 'lea', t(20, 40))).toEqual(
			positionAt(evening(), 'lea', t(20, 40))
		);
	});
});
