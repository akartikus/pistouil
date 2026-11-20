import type { Source } from 'pmtiles';
import { haversineM } from '../engine/pedestrian';
import { cellsCovering, zoneBounds, type BBox, type Commune } from '../map/zone';
import type { Manifest } from './files';
import type { ZoneStore } from './store';
import { planTiles, rangeFile, toBase64, type Range } from './tiles';

// A downloaded zone: the disk of this radius around the centre of a commune.
export const ZONE_RADIUS_M = 2000;
// The session reads places and the graph 1 km beyond the radius, and shows those places.
const DATA_MARGIN_M = 1000;
// The game map goes 300 m beyond the places it shows.
const MAP_MARGIN_M = 300;
// Size counted for a data file when the host does not give it.
const ESTIMATED_FILE_BYTES = 35_000;

const INDEX = 'zones.json';
const COMMUNES = 'communes.json';
export const zoneDir = (insee: string) => `zones/${insee}`;

export interface ZoneCommune {
	name: string;
	insee: string;
	center: { lat: number; lon: number };
}

export interface ZoneEntry extends ZoneCommune {
	// Cells of the grid the zone covers, those without a file included (they are empty).
	cells: string[];
	bytes: number;
	dataVersion: string;
}

// The part of `fetch` used here, so that tests can give a fake host.
export type Fetcher = (
	url: string,
	init?: { method?: string; signal?: AbortSignal }
) => Promise<{ ok: boolean; headers: Headers; text(): Promise<string> }>;

export interface Remote {
	// Address of the data files.
	base: string;
	fetchFn: Fetcher;
	// The tiles archive on the network.
	tiles: Source;
}

export interface ZonePlan {
	commune: ZoneCommune;
	manifest: Manifest;
	cells: string[];
	// Data files, relative to the data address.
	files: string[];
	ranges: Range[];
	withCommunes: boolean;
	bytes: number;
	// True when some sizes are guesses.
	estimated: boolean;
}

const square = (center: ZoneCommune['center'], marginM: number): BBox => {
	const [[minLon, minLat], [maxLon, maxLat]] = zoneBounds(
		{ minLat: center.lat, minLon: center.lon, maxLat: center.lat, maxLon: center.lon },
		marginM
	);
	return { minLat, minLon, maxLat, maxLon };
};

// A missing file, or a dev server answering with a page, is no file.
const byteLength = (text: string) => new TextEncoder().encode(text).length;

const isJson = (response: { ok: boolean; headers: Headers }) =>
	response.ok && (response.headers.get('content-type') ?? '').includes('json');

export async function listZones(store: ZoneStore): Promise<ZoneEntry[]> {
	return JSON.parse((await store.read(INDEX)) ?? '[]');
}

// What downloading the zone of a commune would bring, and its size, without downloading it.
export async function planZone(
	store: ZoneStore,
	commune: ZoneCommune,
	remote: Remote,
	tilesOf: (source: Source, box: BBox) => Promise<{ ranges: Range[]; bytes: number }> = planTiles
): Promise<ZonePlan> {
	const { base, fetchFn } = remote;
	const manifestText = await (await fetchFn(`${base}/manifest.json`)).text();
	const manifest: Manifest = JSON.parse(manifestText);
	const cells = cellsCovering(manifest.grid, square(commune.center, ZONE_RADIUS_M + DATA_MARGIN_M));
	const withCommunes = (await store.read(COMMUNES)) === null;
	const files = [
		...cells.flatMap((cell) => [`places/${cell}.json`, `graph/${cell}.json`]),
		...(withCommunes ? [COMMUNES] : [])
	];
	let estimated = false;
	const sizes = await Promise.all(
		files.map(async (file) => {
			const response = await fetchFn(`${base}/${file}`, { method: 'HEAD' });
			if (!isJson(response)) return 0;
			const length = response.headers.get('content-length');
			if (length === null) estimated = true;
			return length === null ? ESTIMATED_FILE_BYTES : Number(length);
		})
	);
	const tiles = await tilesOf(
		remote.tiles,
		square(commune.center, ZONE_RADIUS_M + DATA_MARGIN_M + MAP_MARGIN_M)
	);
	const bytes = byteLength(manifestText) + sizes.reduce((sum, size) => sum + size, 0) + tiles.bytes;
	return { commune, manifest, cells, files, ranges: tiles.ranges, withCommunes, bytes, estimated };
}

// Downloads a zone once. The list of zones is written last: an interrupted download leaves
// no zone, and its files are removed.
export async function downloadZone(
	store: ZoneStore,
	plan: ZonePlan,
	remote: Remote,
	onProgress?: (done: number, total: number) => void,
	signal?: AbortSignal
): Promise<ZoneEntry> {
	const zones = await listZones(store);
	const existing = zones.find((zone) => zone.insee === plan.commune.insee);
	if (existing) return existing;

	const dir = zoneDir(plan.commune.insee);
	const total = plan.files.length + plan.ranges.length;
	let done = 0;
	let bytes = 0;
	const step = () => {
		signal?.throwIfAborted();
		onProgress?.(++done, total);
	};
	try {
		const manifestText = JSON.stringify(plan.manifest);
		await store.write(`${dir}/manifest.json`, manifestText);
		bytes += byteLength(manifestText);
		for (const file of plan.files) {
			signal?.throwIfAborted();
			const response = await remote.fetchFn(`${remote.base}/${file}`, { signal });
			if (isJson(response)) {
				const text = await response.text();
				await store.write(file === COMMUNES ? COMMUNES : `${dir}/${file}`, text);
				bytes += byteLength(text);
			}
			step();
		}
		for (const range of plan.ranges) {
			signal?.throwIfAborted();
			const { data } = await remote.tiles.getBytes(range[0], range[1], signal);
			await store.write(`${dir}/${rangeFile(range)}`, toBase64(data), true);
			bytes += data.byteLength;
			step();
		}
	} catch (error) {
		await store.remove(dir);
		if (plan.withCommunes) await store.remove(COMMUNES);
		throw error;
	}

	const { source, extractDate } = plan.manifest;
	const zone: ZoneEntry = {
		...plan.commune,
		cells: plan.cells,
		bytes,
		dataVersion: extractDate ? `${source}@${extractDate}` : source
	};
	await store.write(INDEX, JSON.stringify([...zones, zone]));
	return zone;
}

// The list is updated first: a deletion stopped halfway leaves files that cleanZones removes.
export async function deleteZone(store: ZoneStore, insee: string): Promise<void> {
	const zones = (await listZones(store)).filter((zone) => zone.insee !== insee);
	await store.write(INDEX, JSON.stringify(zones));
	await store.remove(zoneDir(insee));
	if (zones.length === 0) await store.remove(COMMUNES);
}

// Removes the files of zones that are not in the list (an interrupted download or deletion).
export async function cleanZones(store: ZoneStore): Promise<void> {
	const kept = new Set((await listZones(store)).map((zone) => zone.insee));
	for (const insee of await store.list('zones')) {
		if (!kept.has(insee)) await store.remove(zoneDir(insee));
	}
}

// The nearest downloaded zone whose disk holds the point.
export function zoneContaining(
	zones: ZoneEntry[],
	point: { lat: number; lon: number }
): ZoneEntry | undefined {
	return zones
		.map((zone) => ({ zone, distance: haversineM(point, zone.center) }))
		.filter((entry) => entry.distance <= ZONE_RADIUS_M)
		.sort((a, b) => a.distance - b.distance)[0]?.zone;
}

export const readCommunes = async (store: ZoneStore): Promise<Commune[]> =>
	JSON.parse((await store.read(COMMUNES)) ?? '[]');
