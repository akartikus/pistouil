import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cellsCovering, insideContour, zoneBounds, type Commune } from '../map/zone';
import type { Manifest } from './files';

// The data of Fuveau shipped with the application (see tools/embedded-data/README.md).
const dir = 'static/data/fuveau';
// The radius of an investigation (2 km) plus the 1 km margin the zone reads around it.
const MARGIN_M = 3000;
const MAX_BYTES = 50 * 1024 * 1024;

const json = <T>(file: string) => JSON.parse(readFileSync(join(dir, file), 'utf8')) as T;
const names = (kind: 'places' | 'graph') =>
	readdirSync(join(dir, kind)).map((file) => file.replace(/\.json$/, ''));

function sizeOf(path: string): number {
	const stat = statSync(path);
	if (!stat.isDirectory()) return stat.size;
	return readdirSync(path).reduce((total, name) => total + sizeOf(join(path, name)), 0);
}

describe('the data of Fuveau shipped with the application', () => {
	it('has a manifest and the entry of Fuveau', () => {
		const manifest = json<Manifest>('manifest.json');
		const commune = json<Commune>('commune.json');
		expect(manifest.grid.latStepE5).toBeGreaterThan(0);
		expect(commune).toMatchObject({ name: 'Fuveau', insee: '13040' });
		expect(commune.contour.coordinates.length).toBeGreaterThan(0);
	});

	it('has the centre of Fuveau inside its contour and Aix-en-Provence outside', () => {
		const { center, contour } = json<Commune>('commune.json');
		expect(insideContour(center, contour)).toBe(true);
		expect(insideContour({ lat: 43.5297, lon: 5.4474 }, contour)).toBe(false);
	});

	it('holds no file beyond the commune widened by the margin', () => {
		const { grid } = json<Manifest>('manifest.json');
		const { bbox } = json<Commune>('commune.json');
		const [[minLon, minLat], [maxLon, maxLat]] = zoneBounds(bbox, MARGIN_M);
		const allowed = new Set(cellsCovering(grid, { minLat, minLon, maxLat, maxLon }));
		for (const kind of ['places', 'graph'] as const) {
			for (const cell of names(kind)) expect(allowed, `${kind}/${cell}`).toContain(cell);
		}
	});

	// A cell without places is a cell without any (the file is then absent), but a commune has streets everywhere.
	it('has a graph for every cell of the commune itself', () => {
		const { grid } = json<Manifest>('manifest.json');
		const { bbox } = json<Commune>('commune.json');
		for (const cell of cellsCovering(grid, bbox)) {
			expect(names('graph'), `graph/${cell}`).toContain(cell);
		}
	});

	it('keeps the version of the regional data', () => {
		const manifest = json<Manifest>('manifest.json');
		expect(manifest.source).toMatch(/\.osm\.pbf$/);
		expect(manifest.extractDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
	});

	it('has the tiles of the map', () => {
		const file = join(dir, 'fuveau.pmtiles');
		expect(existsSync(file)).toBe(true);
		expect(readFileSync(file).subarray(0, 7).toString('latin1')).toBe('PMTiles');
	});

	it('weighs less than 50 MB', () => {
		expect(sizeOf(dir)).toBeLessThan(MAX_BYTES);
	});
});
