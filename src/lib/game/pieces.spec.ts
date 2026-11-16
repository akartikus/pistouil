import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { rawStarterCatalog } from '../engine/fixtures';

describe('piece icons', () => {
	it('exist for every icon of the clue types', () => {
		const icons = new Set(rawStarterCatalog.clueTypes.map((type) => type.icon));
		for (const icon of icons) {
			const file = new URL(`../../../static/pieces/${icon}.svg`, import.meta.url);
			expect(existsSync(file), String(icon)).toBe(true);
		}
	});
});
