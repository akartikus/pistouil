import { readFileSync } from 'node:fs';
import { PMTiles } from 'pmtiles';
import { describe, expect, it } from 'vitest';
import { wholeFileSource } from './whole-file-source';

const bytes = Uint8Array.from({ length: 100 }, (_, i) => i);

function host() {
	const requests: string[] = [];
	const fetchFn = async (url: string) => {
		requests.push(url);
		return { ok: true, status: 200, arrayBuffer: async () => bytes.buffer.slice(0) };
	};
	return { fetchFn, requests };
}

describe('wholeFileSource', () => {
	it('answers each read from the file, fetched only once', async () => {
		const { fetchFn, requests } = host();
		const source = wholeFileSource('https://app.example/data.pmtiles', fetchFn);
		const first = await source.getBytes(10, 5);
		const second = await source.getBytes(95, 5);
		expect(new Uint8Array(first.data)).toEqual(bytes.slice(10, 15));
		expect(new Uint8Array(second.data)).toEqual(bytes.slice(95, 100));
		expect(requests).toEqual(['https://app.example/data.pmtiles']);
	});

	it('is keyed by the address of the file', () => {
		expect(wholeFileSource('https://app.example/data.pmtiles', host().fetchFn).getKey()).toBe(
			'https://app.example/data.pmtiles'
		);
	});

	it('fails when the file cannot be read', async () => {
		const missing = async () => ({
			ok: false,
			status: 404,
			arrayBuffer: async () => new ArrayBuffer(0)
		});
		const source = wholeFileSource('https://app.example/data.pmtiles', missing);
		await expect(source.getBytes(0, 5)).rejects.toThrow(/404/);
	});

	it('serves the tiles of the real archive of Fuveau', async () => {
		const file = readFileSync('static/data/fuveau/fuveau.pmtiles');
		const fetchFn = async () => ({ ok: true, status: 200, arrayBuffer: async () => file.buffer });
		const archive = new PMTiles(wholeFileSource('fuveau', fetchFn));
		const header = await archive.getHeader();
		expect([header.minZoom, header.maxZoom]).toEqual([0, 15]);
		// The tile of the centre of Fuveau at zoom 15.
		const z = 15;
		const lat = (43.45972 * Math.PI) / 180;
		const x = Math.floor(((5.55344 + 180) / 360) * 2 ** z);
		const y = Math.floor(
			((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * 2 ** z
		);
		expect((await archive.getZxy(z, x, y))?.data.byteLength).toBeGreaterThan(0);
		// A tile far away is not in the archive: no data, no error.
		expect(await archive.getZxy(z, 0, 0)).toBeUndefined();
	});
});
