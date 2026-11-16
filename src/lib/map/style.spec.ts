import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { rawStarterCatalog } from '../engine/fixtures';

const staticDir = new URL('../../../static/map/', import.meta.url);
const read = (name: string) => JSON.parse(readFileSync(new URL(name, staticDir), 'utf8'));

interface Layer {
	id: string;
	type: string;
	source?: string;
	layout?: { 'text-font'?: string[] };
}
interface Style {
	version: number;
	glyphs?: string;
	sprite?: string;
	sources: Record<string, { url?: string; tiles?: string[]; attribution?: string }>;
	layers: Layer[];
}

const styles: Record<string, Style> = {
	light: read('style-light.json'),
	dark: read('style-dark.json')
};

describe.each(Object.entries(styles))('%s style', (_, style) => {
	it('is a version 8 style whose layers use declared sources', () => {
		expect(style.version).toBe(8);
		for (const layer of style.layers) {
			if (layer.type !== 'background') expect(style.sources[layer.source!]).toBeDefined();
		}
	});

	it('has unique layer ids', () => {
		const ids = style.layers.map((layer) => layer.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('points to no other server than ours', () => {
		const addresses = [
			style.glyphs,
			style.sprite,
			...Object.values(style.sources).flatMap((source) => [source.url, ...(source.tiles ?? [])])
		].filter((address): address is string => typeof address === 'string');
		for (const address of addresses) expect(address).not.toMatch(/https?:\/\//);
	});

	it('has glyphs for every font it uses', () => {
		const fonts = new Set(style.layers.flatMap((layer) => layer.layout?.['text-font'] ?? []));
		expect(fonts.size).toBeGreaterThan(0);
		for (const font of fonts) {
			expect(existsSync(new URL(`fonts/${font}/0-255.pbf`, staticDir)), font).toBe(true);
		}
	});

	it('credits OpenStreetMap and Protomaps in the tile source', () => {
		const attribution = Object.values(style.sources)
			.map((source) => source.attribution ?? '')
			.join(' ');
		expect(attribution).toMatch(/OpenStreetMap/);
		expect(attribution).toMatch(/Protomaps/);
	});
});

describe('light and dark styles', () => {
	it('share their sources, layers and glyphs so that tiles stay loaded', () => {
		expect(styles.dark.sources).toEqual(styles.light.sources);
		expect(styles.dark.layers.map((layer) => layer.id)).toEqual(
			styles.light.layers.map((layer) => layer.id)
		);
		// Glyph and sprite changes cannot be diffed by MapLibre.
		expect(styles.dark.glyphs).toBe(styles.light.glyphs);
		expect(styles.dark.sprite).toBe(styles.light.sprite);
	});
});

describe('icons', () => {
	it('exist for every family of the catalog, plus the generic one', () => {
		const families = new Set(rawStarterCatalog.placeTypes.map((type) => type.icon));
		families.add('generic');
		for (const family of families) {
			for (const suffix of ['', '@2x']) {
				const file = new URL(`icons/${family}${suffix}.png`, staticDir);
				expect(existsSync(file), `${family}${suffix}`).toBe(true);
			}
		}
	});
});
