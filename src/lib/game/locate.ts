import type { PermissionState } from '@capacitor/core';
import type { Center } from './zone';

// The part of @capacitor/geolocation used here.
export interface GeoPort {
	checkPermissions(): Promise<{ location: PermissionState }>;
	getCurrentPosition(): Promise<{ coords: { latitude: number; longitude: number } }>;
}

// The player reads why the position is asked before the system asks, unless already granted.
export async function needsExplanation(geo: GeoPort): Promise<boolean> {
	try {
		return (await geo.checkPermissions()).location !== 'granted';
	} catch {
		return true;
	}
}

// The position only picks the centre of the investigation: it never leaves the device.
export async function locate(geo: GeoPort): Promise<Center | null> {
	try {
		const { coords } = await geo.getCurrentPosition();
		return { lat: coords.latitude, lon: coords.longitude };
	} catch {
		return null;
	}
}
