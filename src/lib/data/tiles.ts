import { PMTiles, findTile, zxyToTileId, type Entry, type Source } from 'pmtiles';
import type { BBox } from '../map/zone';
import type { ZoneStore } from './store';

// A part of the archive as PMTiles reads it: [offset, length].
export type Range = [number, number];

export const rangeFile = ([offset, length]: Range) => `tiles/${offset}-${length}`;

const tileX = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const tileY = (lat: number, z: number) => {
	const rad = (lat * Math.PI) / 180;
	return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z);
};

// The [z, x, y] tiles of a zoom level touching a rectangle.
export function tilesIn(box: BBox, z: number): [number, number, number][] {
	const tiles: [number, number, number][] = [];
	for (let x = tileX(box.minLon, z); x <= tileX(box.maxLon, z); x++) {
		for (let y = tileY(box.maxLat, z); y <= tileY(box.minLat, z); y++) tiles.push([z, x, y]);
	}
	return tiles;
}

// The parts of the archive the map reads for the tiles of a rectangle, at every zoom level,
// and their size. Only the header and directories are read, the way PMTiles reads them.
export async function planTiles(
	source: Source,
	box: BBox
): Promise<{ ranges: Range[]; bytes: number }> {
	const ranges = new Map<string, Range>();
	let bytes = 0;
	const add = (range: Range, size: number) => {
		const key = rangeFile(range);
		if (ranges.has(key)) return;
		ranges.set(key, range);
		bytes += size;
	};
	const recording: Source = {
		getKey: () => source.getKey(),
		getBytes: async (offset, length, signal, etag) => {
			const response = await source.getBytes(offset, length, signal, etag);
			add([offset, length], response.data.byteLength);
			return response;
		}
	};
	const archive = new PMTiles(recording);
	const header = await archive.getHeader();
	for (let z = header.minZoom; z <= header.maxZoom; z++) {
		for (const [, x, y] of tilesIn(box, z)) {
			const id = zxyToTileId(z, x, y);
			let [offset, length] = [header.rootDirectoryOffset, header.rootDirectoryLength];
			// Same walk as PMTiles.getZxy, without reading the tile itself.
			for (let depth = 0; depth <= 3; depth++) {
				const entries: Entry[] = await archive.cache.getDirectory(
					recording,
					offset,
					length,
					header
				);
				const entry = findTile(entries, id);
				if (!entry) break;
				if (entry.runLength > 0) {
					add([header.tileDataOffset + entry.offset, entry.length], entry.length);
					break;
				}
				[offset, length] = [header.leafDirectoryOffset + entry.offset, entry.length];
			}
		}
	}
	return { ranges: [...ranges.values()], bytes };
}

// The archive as downloaded with the zones: a part that was not downloaded is an error.
export function storedTiles(store: ZoneStore, key: string, zoneDirs: string[]): Source {
	return {
		getKey: () => key,
		getBytes: async (offset, length) => {
			for (const dir of zoneDirs) {
				const data = await store.read(`${dir}/${rangeFile([offset, length])}`, true);
				if (data !== null) return { data: fromBase64(data) };
			}
			throw new Error('Not downloaded');
		}
	};
}

// A missing tile is an empty tile: the map keeps the plain background there.
export class StoredPMTiles extends PMTiles {
	override async getZxy(z: number, x: number, y: number, signal?: AbortSignal) {
		try {
			return await super.getZxy(z, x, y, signal);
		} catch {
			return undefined;
		}
	}
}

export function toBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	// By slices: one call with every byte would exceed the arguments limit.
	for (let i = 0; i < bytes.length; i += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	}
	return btoa(binary);
}

export function fromBase64(text: string): ArrayBuffer {
	return Uint8Array.from(atob(text), (char) => char.charCodeAt(0)).buffer;
}
