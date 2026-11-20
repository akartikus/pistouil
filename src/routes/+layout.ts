import { offline } from '#lib/game/offline.svelte.js';
import { settings } from '#lib/game/settings.svelte.js';

export const ssr = false;

// The settings and the downloaded zones, before any page reads them.
export const load = async () => {
	await settings.load();
	await offline.load();
};
