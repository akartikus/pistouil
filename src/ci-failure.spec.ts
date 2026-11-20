import { expect, it } from 'vitest';

it('fails on purpose to check the CI', () => {
	expect(1).toBe(2);
});
