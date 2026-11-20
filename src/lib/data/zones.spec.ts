import { describe, expect, it } from 'vitest';
import type { Source } from 'pmtiles';
import type { ZoneStore } from './store';
import {
	cleanZones,
	deleteZone,
	downloadZone,
	listZones,
	planZone,
	readCommunes,
	zoneContaining,
	type Fetcher,
	type Remote
} from './zones';

const fuveau = { name: 'Fuveau', insee: '13040', center: { lat: 43.4553, lon: 5.5617 } };
const manifest = {
	source: 'paca.osm.pbf',
	extractDate: '2026-11-14',
	grid: { latStepE5: 1800, lonStepE5: 2500 }
};

function memoryStore(): ZoneStore & { files: Map<string, string> } {
	const files = new Map<string, string>();
	const under = (path: string) => [...files.keys()].filter((key) => key.startsWith(`${path}/`));
	return {
		files,
		read: async (path) => files.get(path) ?? null,
		write: async (path, data) => void files.set(path, data),
		remove: async (path) => {
			files.delete(path);
			for (const key of under(path)) files.delete(key);
		},
		list: async (path) => [
			...new Set(under(path).map((key) => key.slice(path.length + 1).split('/')[0]))
		]
	};
}

// A data host: every cell has a places file of 100 bytes, graph files are missing.
function remote(options: { failAfter?: number; noLength?: boolean } = {}) {
	const fetched: string[] = [];
	let count = 0;
	const fetchFn: Fetcher = async (url, init) => {
		if (init?.method !== 'HEAD') {
			fetched.push(url);
			if (options.failAfter !== undefined && ++count > options.failAfter)
				throw new Error('offline');
		}
		const json = url.endsWith('manifest.json')
			? JSON.stringify(manifest)
			: url.endsWith('communes.json')
				? '[]'
				: url.includes('/places/')
					? JSON.stringify([{ osmId: 'n1' }]).padEnd(100)
					: null;
		const headers = new Headers(
			json === null ? { 'content-type': 'text/html' } : { 'content-type': 'application/json' }
		);
		if (json !== null && !options.noLength) headers.set('content-length', String(json.length));
		return { ok: true, headers, text: async () => json ?? '<html>' };
	};
	const tiles: Source = {
		getKey: () => 'tiles.pmtiles',
		getBytes: async (_offset, length) => ({ data: new Uint8Array(length).buffer })
	};
	return { fetched, remote: { base: '/data', fetchFn, tiles } satisfies Remote };
}

const tilesPlan = {
	ranges: [
		[0, 16384],
		[20000, 50]
	] as [number, number][],
	bytes: 16434
};

describe('planZone', () => {
	it('lists the cells of the zone, its tiles and its size, communes index included the first time', async () => {
		const store = memoryStore();
		const { remote: host } = remote();
		const plan = await planZone(store, fuveau, host, async () => tilesPlan);
		// About 6 km a side: 4 rows of 2 km and 3 or 4 columns of 2.5 km.
		expect(plan.cells.length).toBeGreaterThanOrEqual(12);
		expect(plan.cells.length).toBeLessThanOrEqual(20);
		expect(plan.withCommunes).toBe(true);
		expect(plan.bytes).toBe(
			JSON.stringify(manifest).length + plan.cells.length * 100 + 2 + tilesPlan.bytes
		);
		expect(plan.estimated).toBe(false);
	});

	it('estimates the size when the host does not give it', async () => {
		const plan = await planZone(
			memoryStore(),
			fuveau,
			remote({ noLength: true }).remote,
			async () => tilesPlan
		);
		expect(plan.estimated).toBe(true);
		expect(plan.bytes).toBeGreaterThan(tilesPlan.bytes);
	});
});

describe('downloadZone', () => {
	it('keeps the zone and lists it once complete, with its size', async () => {
		const store = memoryStore();
		const { remote: host } = remote();
		const plan = await planZone(store, fuveau, host, async () => tilesPlan);
		const progress: number[] = [];
		const zone = await downloadZone(store, plan, host, (done, total) =>
			progress.push(done / total)
		);
		expect(progress.at(-1)).toBe(1);
		expect(zone).toMatchObject({
			insee: '13040',
			name: 'Fuveau',
			dataVersion: 'paca.osm.pbf@2026-11-14'
		});
		expect(await listZones(store)).toEqual([zone]);
		expect(store.files.has('zones/13040/manifest.json')).toBe(true);
		expect(store.files.has(`zones/13040/places/${plan.cells[0]}.json`)).toBe(true);
		expect(store.files.has(`zones/13040/graph/${plan.cells[0]}.json`)).toBe(false);
		expect(store.files.has('zones/13040/tiles/20000-50')).toBe(true);
		expect(await readCommunes(store)).toEqual([]);
		expect(store.files.has('communes.json')).toBe(true);
		expect(zone.bytes).toBe(
			plan.cells.length * 100 + 2 + 16384 + 50 + JSON.stringify(manifest).length
		);
	});

	it('writes the list of zones last, and leaves nothing when the connection drops', async () => {
		const store = memoryStore();
		const { remote: host } = remote({ failAfter: 3 });
		const plan = await planZone(store, fuveau, host, async () => tilesPlan);
		await expect(downloadZone(store, plan, host)).rejects.toThrow();
		expect(await listZones(store)).toEqual([]);
		expect([...store.files.keys()]).toEqual([]);
	});

	it('leaves nothing when the player cancels', async () => {
		const store = memoryStore();
		const { remote: host } = remote();
		const plan = await planZone(store, fuveau, host, async () => tilesPlan);
		const controller = new AbortController();
		const download = downloadZone(store, plan, host, () => controller.abort(), controller.signal);
		await expect(download).rejects.toThrow();
		expect([...store.files.keys()]).toEqual([]);
	});

	it('does not download a zone again', async () => {
		const store = memoryStore();
		const { remote: host, fetched } = remote();
		await downloadZone(store, await planZone(store, fuveau, host, async () => tilesPlan), host);
		const again = await planZone(store, fuveau, host, async () => tilesPlan);
		expect(again.withCommunes).toBe(false);
		const before = fetched.length;
		await downloadZone(store, again, host);
		expect(fetched.length).toBe(before);
		expect(await listZones(store)).toHaveLength(1);
	});
});

describe('deleteZone and cleanZones', () => {
	it('frees the space of a zone, and the communes index with the last one', async () => {
		const store = memoryStore();
		const { remote: host } = remote();
		await downloadZone(store, await planZone(store, fuveau, host, async () => tilesPlan), host);
		await deleteZone(store, '13040');
		expect(await listZones(store)).toEqual([]);
		expect([...store.files.keys()]).toEqual(['zones.json']);
	});

	it('removes what an interrupted download left', async () => {
		const store = memoryStore();
		store.files.set('zones/13086/manifest.json', '{}');
		await cleanZones(store);
		expect(store.files.size).toBe(0);
	});
});

describe('zoneContaining', () => {
	const zone = { ...fuveau, cells: [], bytes: 0, dataVersion: '' };

	it('finds the zone whose 2 km disk holds a position', () => {
		expect(zoneContaining([zone], { lat: 43.464, lon: 5.5617 })).toBe(zone);
		expect(zoneContaining([zone], { lat: 43.48, lon: 5.5617 })).toBeUndefined();
	});
});
