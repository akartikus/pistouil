import { describe, expect, it } from 'vitest';
import { dataDateText, texts } from './texts';

// Every text of the interface, the functions called with example arguments.
function allTexts(value: unknown): string[] {
	if (typeof value === 'string') return [value];
	if (typeof value === 'function')
		return allTexts((value as (...args: unknown[]) => unknown)('Nom', 12, 34));
	if (value && typeof value === 'object') return Object.values(value).flatMap(allTexts);
	return [];
}

// The words of the engine and the code, not the player's (see docs/design/wording.md).
const INTERNAL_TERMS = /graine|pi[èe]ces?|sc[èe]ne|\.pbf/i;

describe('texts', () => {
	it('use no internal term', () => {
		const found = allTexts(texts).filter((text) => INTERNAL_TERMS.test(text));
		expect(found).toEqual([]);
	});
});

describe('dataDateText', () => {
	it('writes the date of the data in French', () => {
		expect(dataDateText('provence-alpes-cote-d-azur-latest.osm.pbf@2026-11-15T21:22:28Z')).toBe(
			'15 novembre 2026'
		);
	});

	it('gives the version as it is when it holds no date', () => {
		expect(dataDateText('test.osm.pbf')).toBe('test.osm.pbf');
		expect(dataDateText('test.osm.pbf@not-a-date')).toBe('test.osm.pbf@not-a-date');
	});
});
