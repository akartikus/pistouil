import { settings } from '#lib/game/settings.svelte.js';

export const ssr = false;

// The settings, before any page reads them.
export const load = async () => {
	await settings.load();
};
