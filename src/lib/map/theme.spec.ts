import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { GAME_COLORS, styleUrl } from './theme';

describe('styleUrl', () => {
	it('points to the style file of the theme', () => {
		expect(styleUrl('light')).toBe('/map/style-light.json');
		expect(styleUrl('dark')).toBe('/map/style-dark.json');
	});
});

const iconDir = new URL('../../../static/map/icons/src/', import.meta.url);
const familyColors = readdirSync(iconDir)
	.filter((file) => file.endsWith('.svg'))
	.map((file) => /fill="(#[0-9A-Fa-f]{6})"/.exec(readFileSync(new URL(file, iconDir), 'utf8'))![1])
	.map((color) => color.toUpperCase());

describe('reserved colours', () => {
	it.each(['light', 'dark'] as const)('are distinct from each other in the %s theme', (theme) => {
		const { investigation, mystery, route } = GAME_COLORS[theme];
		expect(new Set([investigation, mystery, route]).size).toBe(3);
	});

	it.each(['light', 'dark'] as const)(
		'are not reused by a place family in the %s theme',
		(theme) => {
			const { investigation, mystery, route } = GAME_COLORS[theme];
			for (const color of [investigation, mystery, route]) {
				expect(familyColors).not.toContain(color.toUpperCase());
			}
		}
	);
});
