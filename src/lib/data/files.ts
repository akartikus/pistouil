import type { GraphCell } from '../engine/pedestrian';
import type { Commune } from '../map/zone';
import type { Grid, RawPlace } from './places';

// The part of `fetch` we use, so that tests can give a fake host.
export type FetchLike = (url: string) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

export interface Manifest {
	source: string;
	extractDate: string | null;
	grid: Grid;
}

// A missing file, or a dev server answering with a page, gives null.
async function readJson<T>(fetchFn: FetchLike, url: string): Promise<T | null> {
	try {
		const response = await fetchFn(url);
		return response.ok ? ((await response.json()) as T) : null;
	} catch {
		return null;
	}
}

export async function loadManifest(base: string, fetchFn: FetchLike): Promise<Manifest> {
	const manifest = await readJson<Manifest>(fetchFn, `${base}/manifest.json`);
	if (!manifest) throw new Error(`No manifest.json at ${base}: the game data is missing`);
	return manifest;
}

export async function loadCommunes(base: string, fetchFn: FetchLike): Promise<Commune[]> {
	return (await readJson<Commune[]>(fetchFn, `${base}/communes.json`)) ?? [];
}

// Reads the place and graph files of grid cells once; a missing cell is empty.
export function createCellLoader(base: string, fetchFn: FetchLike) {
	const cache = new Map<string, Promise<unknown>>();
	const read = <T>(kind: 'places' | 'graph', cell: string) => {
		const url = `${base}/${kind}/${cell}.json`;
		if (!cache.has(url)) cache.set(url, readJson<T>(fetchFn, url));
		return cache.get(url) as Promise<T | null>;
	};
	return {
		async places(cells: string[]): Promise<RawPlace[]> {
			const files = await Promise.all(cells.map((cell) => read<RawPlace[]>('places', cell)));
			return files.flatMap((file) => file ?? []);
		},
		async graph(cells: string[]): Promise<GraphCell[]> {
			const files = await Promise.all(cells.map((cell) => read<GraphCell>('graph', cell)));
			return files.filter((file): file is GraphCell => file !== null);
		}
	};
}
