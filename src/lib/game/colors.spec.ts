import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GAME_COLORS } from '../map/theme';

// The colours of src/lib/game/app.css, by theme.
const css = readFileSync('src/lib/game/app.css', 'utf8');

function variables(selector: string): Record<string, string> {
	const start = css.indexOf(`${selector} {`);
	const end = css.indexOf('}', start);
	const found: Record<string, string> = {};
	for (const [, name, value] of css
		.slice(start, end)
		.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6});/g)) {
		found[name] = value.toLowerCase();
	}
	return found;
}

const light = variables(':root');
const dark = variables(":root[data-theme='dark']");

function luminance(hex: string): number {
	const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
	const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

// WCAG contrast ratio between two colours.
function contrast(a: string, b: string): number {
	const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (high + 0.05) / (low + 0.05);
}

describe('the dark theme', () => {
	const pairs: [string, string, string, number][] = [
		['text on a panel', 'ink', 'paper', 7],
		['secondary text on a panel', 'dim', 'paper', 4.5],
		['a frame on a panel', 'frame', 'paper', 3],
		['a frame on the background', 'frame', 'bg', 3],
		['the accent on a panel', 'accent', 'paper', 7],
		['the accent on a bar', 'accent', 'strong', 4.5],
		['text on a bar', 'on-strong', 'strong', 7],
		['text on a solid button', 'on-solid', 'solid', 7]
	];

	it.each(pairs)('has enough contrast for %s', (_, foreground, background, minimum) => {
		expect(contrast(dark[foreground], dark[background])).toBeGreaterThanOrEqual(minimum);
	});

	it('keeps the shadows visible against the background, without glare', () => {
		const ratio = contrast(dark.shadow, dark.bg);
		expect(ratio).toBeGreaterThanOrEqual(1.5);
		expect(ratio).toBeLessThan(4);
	});

	it('has no pure white frame, bar or button', () => {
		for (const name of ['frame', 'strong', 'solid', 'paper', 'shadow']) {
			expect(dark[name], name).not.toBe('#ffffff');
		}
	});

	it('gives the map the colours of the interface', () => {
		const colors = GAME_COLORS.dark;
		expect(colors.ink.toLowerCase()).toBe(dark.ink);
		expect(colors.paper.toLowerCase()).toBe(dark.paper);
		expect(colors.shadow.toLowerCase()).toBe(dark.shadow);
		expect(colors.frame.toLowerCase()).toBe(dark.frame);
	});
});

describe('the light theme', () => {
	it('keeps its colours', () => {
		expect(light).toMatchObject({
			bg: '#f2efe7',
			paper: '#ffffff',
			ink: '#000000',
			accent: '#ff8a00',
			mystery: '#e0007a',
			route: '#1f4fff',
			shadow: '#000000',
			dim: '#555555',
			frame: '#000000',
			strong: '#000000',
			'on-strong': '#ffffff',
			solid: '#000000',
			'on-solid': '#ffffff'
		});
	});
});
