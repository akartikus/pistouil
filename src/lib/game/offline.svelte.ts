import { FetchSource, type Source } from 'pmtiles';
import { loadCommunes } from '../data/files';
import { createFileStore, keepData } from '../data/store';
import { storedTiles } from '../data/tiles';
import {
	cleanZones,
	deleteZone,
	downloadZone,
	listZones,
	planZone,
	readCommunes,
	zoneDir,
	type ZoneCommune,
	type ZoneEntry,
	type ZonePlan
} from '../data/zones';
import type { Commune } from '../map/zone';
import { settings } from './settings.svelte';

const base = import.meta.env.VITE_DATA_URL ?? '/dev-data';
const tilesUrl = import.meta.env.VITE_TILES_URL ?? '/dev-data/map/zone.pmtiles';
const store = createFileStore();

// The zones downloaded for the offline mode, and what reads them.
class Offline {
	zones = $state.raw<ZoneEntry[]>([]);
	// False when the browser may clear the zones on its own.
	kept = $state(true);

	async load() {
		await cleanZones(store);
		this.zones = await listZones(store);
		this.kept = this.zones.length === 0 || (await keepData(false));
	}

	private remote() {
		return { base, fetchFn: fetch, tiles: new FetchSource(new URL(tilesUrl, location.href).href) };
	}

	plan(commune: ZoneCommune): Promise<ZonePlan> {
		return planZone(store, commune, this.remote());
	}

	async download(
		plan: ZonePlan,
		onProgress: (done: number, total: number) => void,
		signal: AbortSignal
	) {
		this.kept = await keepData();
		await downloadZone(store, plan, this.remote(), onProgress, signal);
		this.zones = await listZones(store);
	}

	async remove(insee: string) {
		await deleteZone(store, insee);
		this.zones = await listZones(store);
	}

	read(path: string) {
		return store.read(path);
	}

	// The tiles of the map: from the downloaded zones in offline mode, from the network otherwise.
	tiles(offline: boolean): Source | undefined {
		return offline
			? storedTiles(
					store,
					'zones',
					this.zones.map((zone) => zoneDir(zone.insee))
				)
			: undefined;
	}

	// The communes index: kept on the device in offline mode, read from the network otherwise,
	// or before the first zone is downloaded (it comes with it).
	async communes(): Promise<Commune[]> {
		const kept = settings.offline ? await readCommunes(store) : [];
		return kept.length > 0 ? kept : loadCommunes(base, fetch);
	}
}

export const offline = new Offline();
