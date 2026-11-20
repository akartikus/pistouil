import type { Source } from 'pmtiles';
import { DATA_BASE, loadCommune, TILES_URL } from '../data/files';
import { wholeFileSource } from '../data/whole-file-source';
import type { Commune } from '../map/zone';

// What the interface reads of the data shipped with the application (Fuveau, for now).
let commune: Promise<Commune> | undefined;
export const shippedCommune = () => (commune ??= loadCommune(DATA_BASE, fetch));

let tiles: Source | undefined;
export const shippedTiles = () =>
	(tiles ??= wholeFileSource(new URL(TILES_URL, location.href).href));
