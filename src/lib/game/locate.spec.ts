import type { PermissionState } from '@capacitor/core';
import { describe, expect, it } from 'vitest';
import { locate, needsExplanation, type GeoPort } from './locate';

const geo = (permission: PermissionState | 'error', refuse = false): GeoPort => ({
	checkPermissions: async () => {
		if (permission === 'error') throw new Error('not available');
		return { location: permission };
	},
	getCurrentPosition: async () => {
		if (refuse) throw new Error('denied');
		return { coords: { latitude: 43.45, longitude: 5.56 } };
	}
});

describe('needsExplanation', () => {
	it('explains before asking, unless the player already agreed', async () => {
		expect(await needsExplanation(geo('prompt'))).toBe(true);
		expect(await needsExplanation(geo('denied'))).toBe(true);
		expect(await needsExplanation(geo('error'))).toBe(true);
		expect(await needsExplanation(geo('granted'))).toBe(false);
	});
});

describe('locate', () => {
	it('gives the position, kept on the device', async () => {
		expect(await locate(geo('granted'))).toEqual({ lat: 43.45, lon: 5.56 });
	});

	it('gives nothing when the player refuses', async () => {
		expect(await locate(geo('prompt', true))).toBeNull();
	});
});
