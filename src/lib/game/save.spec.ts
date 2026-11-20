import { describe, it, expect } from 'vitest';
import {
	SAVE_VERSION,
	dataChanged,
	dataVersionOf,
	isFinished,
	loadGame,
	saveGame,
	type SavedGame,
	type StoragePort
} from './save';
import { accuse, initialProgress, openPlace } from './progress';

const memory = (): StoragePort & { values: Map<string, string> } => {
	const values = new Map<string, string>();
	return {
		values,
		get: async (key) => values.get(key) ?? null,
		set: async (key, value) => void values.set(key, value),
		remove: async (key) => void values.delete(key)
	};
};

const game = (): SavedGame => ({
	version: SAVE_VERSION,
	seed: 4821,
	difficulty: 2,
	zone: { center: { lat: 43.4539, lon: 5.5609 }, radiusM: 500, name: 'Fuveau' },
	dataVersion: 'provence.osm.pbf@2026-11-14T21:20:00Z',
	progress: openPlace(initialProgress(['lea', 'mael']), 'a')
});

describe('saveGame and loadGame', () => {
	it('gives back what was saved', async () => {
		const port = memory();
		await saveGame(port, game());
		expect(await loadGame(port)).toEqual({ status: 'ok', game: game() });
	});

	it('finds nothing when nothing was saved', async () => {
		expect(await loadGame(memory())).toEqual({ status: 'none' });
	});

	it('refuses a save it cannot read', async () => {
		const port = memory();
		port.values.set('pistouil.save', '{not json');
		expect(await loadGame(port)).toEqual({ status: 'unreadable' });
		port.values.set('pistouil.save', JSON.stringify({ ...game(), version: SAVE_VERSION + 1 }));
		expect(await loadGame(port)).toEqual({ status: 'unreadable' });
	});

	it('keeps only what regenerates the investigation and what the player did', async () => {
		const port = memory();
		await saveGame(port, game());
		const saved = JSON.parse(port.values.get('pistouil.save')!);
		expect(Object.keys(saved).sort()).toEqual(
			['dataVersion', 'difficulty', 'progress', 'seed', 'version', 'zone'].sort()
		);
		for (const hidden of ['author', 'lie', 'motive', 'lieKind', 'segments', 'revelationText']) {
			expect(port.values.get('pistouil.save')).not.toContain(`"${hidden}"`);
		}
	});
});

describe('data version', () => {
	it('is built from the source and the date of the extract', () => {
		expect(dataVersionOf({ source: 'a.osm.pbf', extractDate: '2026-11-14T21:20:00Z' })).toBe(
			'a.osm.pbf@2026-11-14T21:20:00Z'
		);
		expect(dataVersionOf({ source: 'a.osm.pbf', extractDate: null })).toBe('a.osm.pbf');
	});

	it('tells when the data changed since the save', () => {
		expect(dataChanged(game(), game().dataVersion)).toBe(false);
		expect(dataChanged(game(), 'provence.osm.pbf@2026-12-01T00:00:00Z')).toBe(true);
	});
});

describe('isFinished', () => {
	it('is true once the player has accused, whatever else was done', () => {
		const ongoing = game();
		expect(isFinished(ongoing)).toBe(false);
		const finished = { ...ongoing, progress: accuse(ongoing.progress, 'mael') };
		expect(isFinished(finished)).toBe(true);
	});
});
