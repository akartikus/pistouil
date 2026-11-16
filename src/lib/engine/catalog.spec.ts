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

describe('catalog items', () => {
	it('have a unique id, at least one tag and both forms', () => {
		const { items } = validateCatalog(clone());
		expect(items.length).toBeGreaterThanOrEqual(20);
		expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
		for (const item of items) {
			expect(item.tags.length).toBeGreaterThan(0);
			expect(item.indefinite).toBeTruthy();
			expect(item.definite).toBeTruthy();
		}
	});

	it('accepts a scenario without items', () => {
		const scenario = validateCatalog(clone()).scenarios.find((s) => s.id === 'library_swap')!;
		expect(scenario.itemCount).toEqual({ min: 0, max: 0 });
	});

	it('gives every composable scenario enough items for its tags', () => {
		const catalog = validateCatalog(clone());
		for (const scenario of catalog.scenarios) {
			const pool = catalog.items.filter((item) =>
				item.tags.some((tag) => scenario.itemTags.includes(tag))
			);
			expect(pool.length).toBeGreaterThanOrEqual(scenario.itemCount.max);
		}
	});
});

describe('validateCatalog, composable scenarios', () => {
	const scenarioOf = (raw: ReturnType<typeof clone>, id: string) =>
		raw.scenarios.find((scenario) => scenario.id === id)!;

	it('rejects a minimum above the maximum', () => {
		const raw = clone();
		scenarioOf(raw, 'statue_makeover').itemCount = { min: 2, max: 1 };
		expect(() => validateCatalog(raw)).toThrow(/statue_makeover/);
	});

	it('rejects a scenario that asks for more items than its tags offer', () => {
		const raw = clone();
		scenarioOf(raw, 'statue_makeover').itemCount = { min: 1, max: 999 };
		expect(() => validateCatalog(raw)).toThrow(/statue_makeover/);
	});

	it('rejects an item variable in a scenario without items', () => {
		const raw = clone();
		scenarioOf(raw, 'library_swap').situation += ' {items}';
		expect(() => validateCatalog(raw)).toThrow(/library_swap/);
	});

	it('rejects a situation without the item list when the scenario asks for items', () => {
		const raw = clone();
		scenarioOf(raw, 'statue_makeover').situation = 'À {time}, à {place}, la statue est là.';
		expect(() => validateCatalog(raw)).toThrow(/statue_makeover/);
	});

	it('rejects an item placed right after « de » or « à »', () => {
		const afterDe = clone();
		scenarioOf(afterDe, 'statue_makeover').revelations.surprise = '{author} rêvait de {item}.';
		expect(() => validateCatalog(afterDe)).toThrow(/statue_makeover/);

		const afterA = clone();
		scenarioOf(afterA, 'statue_makeover').situation = 'À {time}, {place} ressemble à {items}.';
		expect(() => validateCatalog(afterA)).toThrow(/statue_makeover/);
	});

	it('rejects a duplicate item id', () => {
		const raw = clone();
		raw.items.push({ ...raw.items[0] });
		expect(() => validateCatalog(raw)).toThrow(/duplicate/);
	});

	it('rejects an item without a tag or without a form', () => {
		const noTag = clone();
		noTag.items[0].tags = [];
		expect(() => validateCatalog(noTag)).toThrow(CatalogError);

		const noForm = clone();
		noForm.items[0].definite = '';
		expect(() => validateCatalog(noForm)).toThrow(CatalogError);
	});
});

describe('natural testimony wording', () => {
	it('rejects a template that says goodbye to a place', () => {
		const raw = clone();
		raw.testimonyTemplates[0].textTemplate =
			'{speaker} : « À {time}, j’ai dit au revoir à {place}. »';
		expect(() => validateCatalog(raw)).toThrow(new RegExp(raw.testimonyTemplates[0].id));
	});

	it('rejects a template that insists on precision', () => {
		const raw = clone();
		raw.testimonyTemplates[1].textTemplate =
			'{speaker} : « {firstName} est parti à {time} précisément. »';
		expect(() => validateCatalog(raw)).toThrow(new RegExp(raw.testimonyTemplates[1].id));
	});

	it('rejects a clue template with a forbidden phrase', () => {
		const raw = clone();
		raw.clueTypes[0].textTemplate += ' précisément';
		expect(() => validateCatalog(raw)).toThrow(/précisément/);
	});

	it('is free of forbidden phrases in the starter catalog', () => {
		const catalog = validateCatalog(clone());
		const texts = [
			...catalog.testimonyTemplates.map((t) => t.textTemplate),
			...catalog.clueTypes.map((c) => c.textTemplate)
		];
		for (const text of texts) expect(text).not.toMatch(/au revoir à|précisément/i);
	});
});

describe('opening hours by day', () => {
	const catalog = () => validateCatalog(clone());
	const typeOf = (id: string) => catalog().placeTypes.find((type) => type.id === id)!;

	it('gives every place type hours for the weekday and the weekend', () => {
		for (const type of catalog().placeTypes) {
			expect('weekday' in type.typicalHours).toBe(true);
			expect('weekend' in type.typicalHours).toBe(true);
		}
	});

	it('closes the town hall and the school on the weekend', () => {
		expect(typeOf('town_hall').typicalHours.weekend).toEqual([]);
		expect(typeOf('school').typicalHours.weekend).toEqual([]);
		expect(typeOf('town_hall').typicalHours.weekday).not.toEqual([]);
	});

	it('has places whose hours differ between the two days', () => {
		const differing = catalog().placeTypes.filter(
			(type) =>
				JSON.stringify(type.typicalHours.weekday) !== JSON.stringify(type.typicalHours.weekend)
		);
		expect(differing.length).toBeGreaterThanOrEqual(10);
		expect(typeOf('bakery').typicalHours.weekend).toEqual([{ from: 420, to: 780 }]);
	});

	it('keeps parks and fountains always open', () => {
		expect(typeOf('park').typicalHours).toEqual({ weekday: null, weekend: null });
		expect(typeOf('fountain').typicalHours).toEqual({ weekday: null, weekend: null });
	});

	it('rejects a place type without hours for one day', () => {
		const raw = clone();
		delete (raw.placeTypes[0].typicalHours as Record<string, unknown>).weekend;
		expect(() => validateCatalog(raw)).toThrow(new RegExp(raw.placeTypes[0].id));
	});

	it('rejects hours that are not a list of increasing intervals', () => {
		const raw = clone();
		(raw.placeTypes[0].typicalHours as Record<string, unknown>).weekday = [{ from: 900, to: 800 }];
		expect(() => validateCatalog(raw)).toThrow(new RegExp(raw.placeTypes[0].id));
	});
});

describe('place types for the map', () => {
	const families = [
		'health',
		'food',
		'shop',
		'culture',
		'service',
		'nature',
		'transport',
		'leisure',
		'neutral'
	];

	it('give every starter type an icon family and a label', () => {
		for (const type of rawStarterCatalog.placeTypes) {
			expect(families, `icon of ${type.id}`).toContain(type.icon);
			expect(type.label?.trim(), `label of ${type.id}`).toBeTruthy();
		}
	});

	it('show excluded types with the neutral icon', () => {
		for (const type of rawStarterCatalog.placeTypes.filter((t) => t.role === 'excluded')) {
			expect(type.icon).toBe('neutral');
		}
	});

	it('accept a type without icon or label', () => {
		const raw = structuredClone(rawStarterCatalog);
		for (const type of raw.placeTypes) {
			delete (type as { icon?: string }).icon;
			delete (type as { label?: string }).label;
		}
		expect(() => validateCatalog(raw)).not.toThrow();
	});
});

describe('clue types for the pieces', () => {
	const icons = ['receipt', 'bill', 'transport_ticket', 'loan_slip', 'postal_receipt', 'npc'];

	it('give every starter type an icon and a label', () => {
		for (const type of rawStarterCatalog.clueTypes) {
			expect(icons, `icon of ${type.id}`).toContain(type.icon);
			expect(type.label?.trim(), `label of ${type.id}`).toBeTruthy();
		}
	});

	it('use an object for a proof and the person pictogram for a PNJ', () => {
		for (const type of rawStarterCatalog.clueTypes) {
			expect(type.icon === 'npc').toBe(type.nature === 'npc');
		}
	});

	it('accept a type without icon or label', () => {
		const raw = structuredClone(rawStarterCatalog);
		for (const type of raw.clueTypes) {
			delete (type as { icon?: string }).icon;
			delete (type as { label?: string }).label;
		}
		expect(() => validateCatalog(raw)).not.toThrow();
	});
});
