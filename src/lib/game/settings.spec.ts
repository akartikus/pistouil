import { beforeEach, describe, expect, it, vi } from 'vitest';

const saved = new Map<string, string>();
vi.mock('@capacitor/preferences', () => ({
	Preferences: {
		get: async ({ key }: { key: string }) => ({ value: saved.get(key) ?? null }),
		set: async ({ key, value }: { key: string; value: string }) => void saved.set(key, value)
	}
}));

const { settings } = await import('./settings.svelte');

describe('theme setting', () => {
	beforeEach(() => saved.clear());

	it('is light until the player chooses', async () => {
		await settings.load();
		expect(settings.theme).toBe('light');
	});

	it('is kept on the device', async () => {
		await settings.setTheme('dark');
		settings.theme = 'light';
		await settings.load();
		expect(settings.theme).toBe('dark');
	});
});
