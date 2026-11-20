import { Preferences } from '@capacitor/preferences';
import type { Theme } from '../map/theme';

const KEY = 'pistouil.theme';
const OFFLINE_KEY = 'pistouil.offline';

// The theme and the offline mode chosen by the player, kept on the device.
class Settings {
	theme = $state<Theme>('light');
	offline = $state(false);

	async load() {
		const saved = (await Preferences.get({ key: KEY })).value;
		if (saved === 'light' || saved === 'dark') this.theme = saved;
		this.offline = (await Preferences.get({ key: OFFLINE_KEY })).value === 'on';
	}

	async setTheme(theme: Theme) {
		this.theme = theme;
		await Preferences.set({ key: KEY, value: theme });
	}

	async setOffline(offline: boolean) {
		this.offline = offline;
		await Preferences.set({ key: OFFLINE_KEY, value: offline ? 'on' : 'off' });
	}
}

export const settings = new Settings();
