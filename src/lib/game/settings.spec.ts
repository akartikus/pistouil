import { beforeEach, describe, expect, it, vi } from 'vitest';

const saved = new Map<string, string>();
vi.mock('@capacitor/preferences', () => ({
	Preferences: {
		get: async ({ key }: { key: string }) => ({ value: saved.get(key) ?? null }),
		set: async ({ key, value }: { key: string; value: string }) => void saved.set(key, value)
	}
}));

const { settings } = await import('./settings.svelte');

describe('offline mode setting', () => {
	beforeEach(() => saved.clear());

	it('is off by default', async () => {
		await settings.load();
		expect(settings.offline).toBe(false);
	});

	it('is kept on the device', async () => {
		await settings.setOffline(true);
		settings.offline = false;
		await settings.load();
		expect(settings.offline).toBe(true);
	});
});
