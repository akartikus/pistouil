import { describe, it, expect } from 'vitest';
import { validateCatalog, CatalogError } from './catalog';
import { rawStarterCatalog } from './fixtures';

const clone = () => structuredClone(rawStarterCatalog);

describe('starter catalog', () => {
	it('is accepted by the validation', () => {
		const catalog = validateCatalog(clone());
		expect(catalog.scenarios.length).toBeGreaterThanOrEqual(3);
		expect(catalog.firstNames.length).toBeGreaterThanOrEqual(12);
	});

	it('gives every place type a role', () => {
		for (const type of validateCatalog(clone()).placeTypes) {
			expect(['scene', 'alibi', 'excluded']).toContain(type.role);
		}
	});

	it('puts sensitive places in alibi and never lists them as scenes', () => {
		const catalog = validateCatalog(clone());
		for (const id of ['school', 'place_of_worship', 'hospital', 'cemetery', 'war_memorial']) {
			expect(catalog.placeTypes.find((type) => type.id === id)?.role).toBe('alibi');
			for (const scenario of catalog.scenarios) {
				expect(scenario.sceneTypeIds).not.toContain(id);
			}
		}
	});
});

describe('starter catalog variety', () => {
	const catalog = validateCatalog(clone());
	const role = (id: string) => catalog.placeTypes.find((type) => type.id === id)?.role;

	it('has bars, post offices, cinemas and performance halls as scenes', () => {
		for (const id of ['bar', 'post_office', 'cinema', 'performance_hall']) {
			expect(role(id)).toBe('scene');
		}
	});

	it('has a music school as a sensitive alibi place', () => {
		expect(role('music_school')).toBe('alibi');
	});

	it('has at least five kinds of shops', () => {
		const shops = [
			'butcher',
			'greengrocer',
			'florist',
			'bookshop',
			'clothes_shop',
			'hairdresser',
			'tobacconist',
			'supermarket'
		];
		expect(shops.filter((id) => role(id) === 'scene').length).toBeGreaterThanOrEqual(5);
	});

	it('only gives a PNJ clue to long-stay places such as the cinema', () => {
		const natures = new Map(catalog.clueTypes.map((type) => [type.id, type.nature]));
		for (const id of ['cinema', 'performance_hall']) {
			const clues = catalog.compatibilities[id];
			expect(clues.length).toBeGreaterThan(0);
			for (const clue of clues) expect(natures.get(clue)).toBe('npc');
		}
	});
});

describe('validateCatalog', () => {
	it('rejects a motive without revelation', () => {
		const raw = clone();
		delete (raw.scenarios[0].revelations as Record<string, string>).surprise;
		expect(() => validateCatalog(raw)).toThrow(/laundry_line.*surprise/);
	});

	it('rejects a scene type that is not a scene role', () => {
		const raw = clone();
		raw.scenarios[0].sceneTypeIds.push('school');
		expect(() => validateCatalog(raw)).toThrow(/laundry_line.*school/);
	});

	it('rejects a compatibility with an unknown clue type', () => {
		const raw = clone();
		raw.compatibilities.bakery.push('ghost');
		expect(() => validateCatalog(raw)).toThrow(/ghost/);
	});

	it('rejects a compatibility with an unknown place type', () => {
		const raw = clone();
		(raw.compatibilities as Record<string, string[]>).nowhere = ['receipt'];
		expect(() => validateCatalog(raw)).toThrow(/nowhere/);
	});

	it('rejects fewer than 12 first names', () => {
		const raw = clone();
		raw.firstNames = raw.firstNames.slice(0, 11);
		expect(() => validateCatalog(raw)).toThrow(CatalogError);
	});

	it('rejects a missing testimony template for a precision and subject', () => {
		const raw = clone();
		raw.testimonyTemplates = raw.testimonyTemplates.filter(
			(template) => !(template.precision === 'departure' && template.subject === 'other')
		);
		expect(() => validateCatalog(raw)).toThrow(/departure \/ other/);
	});

	it('rejects an unknown variable in a template', () => {
		const raw = clone();
		raw.clueTypes[0].textTemplate += ' {mystery}';
		expect(() => validateCatalog(raw)).toThrow(/mystery/);
	});
});
