import { describe, it, expect } from 'vitest';
import {
	formatTime,
	hasUnresolvedVariable,
	joinList,
	renderRevelation,
	renderSituation,
	renderTemplate
} from './render';
import { validateCatalog } from './catalog';
import { rawStarterCatalog } from './fixtures';

describe('formatTime', () => {
	it('renders minutes since midnight as hours and minutes', () => {
		expect(formatTime(1265)).toBe('21h05');
		expect(formatTime(5)).toBe('0h05');
		expect(formatTime(1230)).toBe('20h30');
	});
});

describe('renderTemplate', () => {
	const values = { speaker: 'Inès', firstName: 'Lucie', place: 'Café', time: '20h50' };
	const template = '{speaker} : « J’ai vu {firstName} quitter {place} à {time}. »';

	it('fills every variable', () => {
		const text = renderTemplate(template, values);
		expect(text).toBe('Inès : « J’ai vu Lucie quitter Café à 20h50. »');
		expect(hasUnresolvedVariable(text)).toBe(false);
	});

	it('gives the same text for the same template and values', () => {
		expect(renderTemplate(template, values)).toBe(renderTemplate(template, { ...values }));
	});

	it('fails when a variable has no value', () => {
		expect(() => renderTemplate('{speaker} à {time}', { speaker: 'Inès' })).toThrow(/time/);
	});

	it('gives a true and a lying testimony the same shape', () => {
		const shape = 'J’étais à {place} de {from} à {to}.';
		const truth = renderTemplate(shape, { place: 'Café', from: '20h30', to: '20h50' });
		const lie = renderTemplate(shape, { place: 'Café', from: '20h30', to: '21h00' });
		expect(truth.replace(/\d+h\d+/g, 'H')).toBe(lie.replace(/\d+h\d+/g, 'H'));
	});
});

describe('joinList', () => {
	it('joins one, two and three items the French way', () => {
		expect(joinList(['a'])).toBe('a');
		expect(joinList(['a', 'b'])).toBe('a et b');
		expect(joinList(['a', 'b', 'c'])).toBe('a, b et c');
		expect(joinList([])).toBe('');
	});
});

describe('scenario texts', () => {
	const catalog = validateCatalog(structuredClone(rawStarterCatalog));
	const item = (id: string) => catalog.items.find((i) => i.id === id)!;
	const makeover = catalog.scenarios.find((s) => s.id === 'statue_makeover')!;

	it('lists the items of the situation with their indefinite forms', () => {
		const text = renderSituation(
			makeover,
			[item('sunglasses'), item('pink_wig')],
			'Statue du Poète',
			615
		);
		expect(text).toContain('des lunettes de soleil et une perruque rose');
		expect(text).toContain('10h15');
	});

	it('cites the first item of the revelation with its definite form', () => {
		const text = renderRevelation(
			makeover,
			'clumsiness',
			[item('pink_wig'), item('sunglasses')],
			'Lucie',
			'Statue du Poète'
		);
		expect(text).toContain('la perruque');
		expect(text).not.toContain('lunettes');
	});

	// Safety net: every scenario with every item of its pool, in every text.
	it('never leaves a variable or an uncontracted article, whatever the item', () => {
		let rendered = 0;
		for (const scenario of catalog.scenarios) {
			const pool = catalog.items.filter((i) =>
				i.tags.some((tag) => scenario.itemTags.includes(tag))
			);
			const lists =
				pool.length === 0
					? [[]]
					: pool.map((first) => {
							const others = pool.filter((i) => i !== first).slice(0, scenario.itemCount.max - 1);
							return [first, ...others];
						});
			for (const items of lists) {
				const texts = [
					renderSituation(scenario, items, 'Place des Tilleuls', 615),
					...scenario.lieMotives.map((motive) =>
						renderRevelation(scenario, motive, items, 'Lucie', 'Place des Tilleuls')
					)
				];
				for (const text of texts) {
					rendered++;
					expect(hasUnresolvedVariable(text)).toBe(false);
					expect(text).not.toMatch(/(?<!\p{L})(?:de|à) (?:le|les)(?!\p{L})/iu);
					expect(text).not.toMatch(/ {2}|undefined/);
				}
			}
		}
		expect(rendered).toBeGreaterThan(150);
	});
});
