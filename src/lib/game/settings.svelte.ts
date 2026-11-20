import { Preferences } from '@capacitor/preferences';
import type { Theme } from '../map/theme';

const KEY = 'pistouil.theme';

// The theme chosen by the player, kept on the device.
class Settings {
	theme = $state<Theme>('light');

	async load() {
		const saved = (await Preferences.get({ key: KEY })).value;
		if (saved === 'light' || saved === 'dark') this.theme = saved;
	}

	async setTheme(theme: Theme) {
		this.theme = theme;
		await Preferences.set({ key: KEY, value: theme });
	}
}

export const settings = new Settings();
