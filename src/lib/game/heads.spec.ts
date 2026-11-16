import { describe, it, expect } from 'vitest';
import { headTraits } from './heads';

describe('headTraits', () => {
	it('gives the same head to the same suspect', () => {
		expect(headTraits('c3')).toEqual(headTraits('c3'));
	});

	it('gives different heads to different suspects', () => {
		const heads = ['c1', 'c2', 'c3', 'c4', 'c5'].map((id) => JSON.stringify(headTraits(id)));
		expect(new Set(heads).size).toBeGreaterThanOrEqual(4);
	});

	it('only uses the known traits', () => {
		for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) {
			const traits = headTraits(id);
			expect(['none', 'cap', 'tall']).toContain(traits.hat);
			expect(['none', 'short', 'long']).toContain(traits.hair);
			expect(['smile', 'flat', 'open']).toContain(traits.mouth);
			expect(typeof traits.glasses).toBe('boolean');
		}
	});
});
