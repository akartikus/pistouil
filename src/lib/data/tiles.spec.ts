import { describe, expect, it } from 'vitest';
import { zxyToTileId, type Source } from 'pmtiles';
import { fromBase64, planTiles, storedTiles, StoredPMTiles, tilesIn, toBase64 } from './tiles';
import type { ZoneStore } from './store';

// A small uncompressed archive, laid out as the PMTiles v3 specification says.
function archive(tiles: { z: number; x: number; y: number; size: number }[]) {
	const varints: number[] = [];
	const varint = (value: number) => {
		while (value >= 0x80) {
			varints.push((value & 0x7f) | 0x80);
			value = Math.floor(value / 0x80);
		}
		varints.push(value);
	};
	const entries = tiles
		.map((tile) => ({ id: zxyToTileId(tile.z, tile.x, tile.y), size: tile.size }))
		.sort((a, b) => a.id - b.id);
	varint(entries.length);
	let last = 0;
	for (const entry of entries) {
		varint(entry.id - last);
		last = entry.id;
	}
	for (let i = 0; i < entries.length; i++) varint(1);
	for (const entry of entries) varint(entry.size);
	let offset = 0;
	for (const entry of entries) {
		varint(offset + 1);
		offset += entry.size;
	}

	const root = Uint8Array.from(varints);
	const dataOffset = 127 + root.length;
	const bytes = new Uint8Array(dataOffset + offset).fill(7, dataOffset);
	const view = new DataView(bytes.buffer);
	bytes.set([0x50, 0x4d, 0x54, 0x69, 0x6c, 0x65, 0x73, 3]);
	const u64 = (at: number, value: number) => view.setUint32(at, value, true);
	u64(8, 127);
	u64(16, root.length);
	u64(24, dataOffset);
	u64(40, dataOffset);
	u64(56, dataOffset);
	u64(64, offset);
	bytes.set([0, 1, 1, 1, 0, 2], 96);
	bytes.set(root, 127);
	return bytes;
}

function source(bytes: Uint8Array, asked: [number, number][] = []): Source {
	return {
		getKey: () => 'tiles.pmtiles',
		getBytes: async (offset, length) => {
			asked.push([offset, length]);
			return { data: bytes.slice(offset, offset + length).buffer };
		}
	};
}

function memoryStore(): ZoneStore & { files: Map<string, string> } {
	const files = new Map<string, string>();
	return {
		files,
		read: async (path) => files.get(path) ?? null,
		write: async (path, data) => void files.set(path, data),
		remove: async () => {},
		list: async () => []
	};
}

// Around Fuveau: tile 32/23 at zoom 6.
const box = { minLat: 43.43, minLon: 5.54, maxLat: 43.46, maxLon: 5.58 };

describe('tilesIn', () => {
	it('gives the tiles touching a rectangle', () => {
		expect(tilesIn(box, 0)).toEqual([[0, 0, 0]]);
		expect(tilesIn(box, 6)).toEqual([[6, 32, 23]]);
		expect(tilesIn(box, 15).length).toBeGreaterThan(4);
	});
});

describe('planTiles', () => {
	it('lists the header and the tiles of the rectangle, with their size, without the others', async () => {
		const bytes = archive([
			{ z: 0, x: 0, y: 0, size: 10 },
			{ z: 1, x: 1, y: 0, size: 20 },
			{ z: 1, x: 0, y: 0, size: 30 },
			{ z: 2, x: 2, y: 1, size: 40 }
		]);
		const asked: [number, number][] = [];
		const plan = await planTiles(source(bytes, asked), box);
		expect(plan.ranges[0]).toEqual([0, 16384]);
		expect(plan.ranges.slice(1).map(([, length]) => length)).toEqual([10, 20, 40]);
		expect(plan.bytes).toBe(bytes.length + 10 + 20 + 40);
		// Only the header was read: the tiles are measured, not downloaded.
		expect(asked).toEqual([[0, 16384]]);
	});
});

describe('storedTiles', () => {
	it('reads the downloaded parts of the archive, and refuses the others', async () => {
		const store = memoryStore();
		store.files.set('zones/13040/tiles/0-3', toBase64(Uint8Array.from([1, 2, 3]).buffer));
		const tiles = storedTiles(store, 'tiles.pmtiles', ['zones/13040']);
		expect(tiles.getKey()).toBe('tiles.pmtiles');
		expect([...new Uint8Array((await tiles.getBytes(0, 3)).data)]).toEqual([1, 2, 3]);
		await expect(tiles.getBytes(3, 5)).rejects.toThrow();
	});

	it('serves a downloaded tile offline, and an empty tile for a missing one', async () => {
		const bytes = archive([
			{ z: 1, x: 1, y: 0, size: 20 },
			{ z: 2, x: 2, y: 1, size: 40 }
		]);
		const plan = await planTiles(source(bytes), box);
		const store = memoryStore();
		for (const [offset, length] of plan.ranges.slice(0, -1)) {
			const part = bytes.slice(offset, offset + length).buffer;
			store.files.set(`zones/13040/tiles/${offset}-${length}`, toBase64(part));
		}
		const tiles = new StoredPMTiles(storedTiles(store, 'tiles.pmtiles', ['zones/13040']));
		expect((await tiles.getZxy(1, 1, 0))?.data.byteLength).toBe(20);
		expect(await tiles.getZxy(2, 2, 1)).toBeUndefined();
	});

	it('keeps bytes intact through base64', () => {
		const bytes = Uint8Array.from({ length: 70000 }, (_, i) => (i * 7) % 256);
		expect(new Uint8Array(fromBase64(toBase64(bytes.buffer)))).toEqual(bytes);
	});
});
