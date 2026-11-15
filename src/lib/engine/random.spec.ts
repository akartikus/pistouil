import { describe, it, expect } from 'vitest';
import { createRandom } from './random';

const draw = (seed: number) => {
	const random = createRandom(seed);
	return Array.from({ length: 10 }, () => random.next());
};

describe('createRandom', () => {
	it('gives the same sequence for the same seed', () => {
		expect(draw(42)).toEqual(draw(42));
	});

	it('gives different sequences for different seeds', () => {
		expect(draw(1)).not.toEqual(draw(2));
	});

	it('draws integers inside the bounds', () => {
		const random = createRandom(7);
		for (let i = 0; i < 200; i++) {
			const value = random.int(3, 6);
			expect(value).toBeGreaterThanOrEqual(3);
			expect(value).toBeLessThanOrEqual(6);
		}
	});

	it('shuffles without losing items and without mutating the input', () => {
		const items = [1, 2, 3, 4, 5];
		const shuffled = createRandom(3).shuffle(items);
		expect([...shuffled].sort()).toEqual(items);
		expect(items).toEqual([1, 2, 3, 4, 5]);
	});
});
