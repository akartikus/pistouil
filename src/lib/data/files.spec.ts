import { describe, it, expect } from 'vitest';
import { createCellLoader, loadCommunes, loadManifest, type FetchLike } from './files';

const manifest = {
	source: 'a.osm.pbf',
	extractDate: '2026-11-14T21:20:00Z',
	grid: { latStepE5: 1800, lonStepE5: 2500 }
};

// A fake host: path -> JSON, anything else is a 404. Counts the requests.
function host(files: Record<string, unknown>) {
	const requests: string[] = [];
	const fetchFn: FetchLike = async (url) => {
		requests.push(url);
		const path = url.replace('https://data.example', '');
		return path in files
			? { ok: true, json: async () => files[path] }
			: { ok: false, json: async () => Promise.reject(new Error('not found')) };
	};
	return { fetchFn, requests };
}

describe('loadManifest', () => {
	it('reads the manifest from the base address', async () => {
		const { fetchFn } = host({ '/manifest.json': manifest });
		expect(await loadManifest('https://data.example', fetchFn)).toEqual(manifest);
	});

	it('fails with a clear message when the data is not there', async () => {
		const { fetchFn } = host({});
		await expect(loadManifest('https://data.example', fetchFn)).rejects.toThrow(/manifest/);
	});
});

describe('loadCommunes', () => {
	it('reads the index of communes, empty when it is missing', async () => {
		const list = [{ name: 'Fuveau', insee: '13040' }];
		expect(
			await loadCommunes('https://data.example', host({ '/communes.json': list }).fetchFn)
		).toEqual(list);
		expect(await loadCommunes('https://data.example', host({}).fetchFn)).toEqual([]);
	});
});

describe('createCellLoader', () => {
	const files = {
		'/places/2413_221.json': [{ osmId: 'n1' }],
		'/places/2413_222.json': [{ osmId: 'n2' }],
		'/graph/2413_221.json': { nodes: [], edges: [], access: {} }
	};

	it('reads the cells it is asked for and treats a missing one as empty', async () => {
		const { fetchFn } = host(files);
		const loader = createCellLoader('https://data.example', fetchFn);
		const places = await loader.places(['2413_221', '2413_222', '2414_221']);
		expect(places.map((place) => place.osmId)).toEqual(['n1', 'n2']);
		expect(await loader.graph(['2413_221', '2414_221'])).toEqual([
			{ nodes: [], edges: [], access: {} }
		]);
	});

	it('asks for each file once', async () => {
		const { fetchFn, requests } = host(files);
		const loader = createCellLoader('https://data.example', fetchFn);
		await loader.places(['2413_221']);
		await loader.places(['2413_221', '2413_222']);
		expect(requests.filter((url) => url.endsWith('/places/2413_221.json'))).toHaveLength(1);
	});

	it('treats an answer that is not JSON as an empty cell', async () => {
		const fetchFn: FetchLike = async () => ({
			ok: true,
			json: async () => Promise.reject(new SyntaxError('html'))
		});
		const loader = createCellLoader('https://data.example', fetchFn);
		expect(await loader.places(['2413_221'])).toEqual([]);
	});
});
