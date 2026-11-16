import { Preferences } from '@capacitor/preferences';

const KEY = 'pistouil.tour';
export const TOUR_STEPS = 3;

// The three first steps, shown once and skippable; the next step comes with the player's action.
class Tour {
	// 1 to 3 while the guide shows, null otherwise.
	step = $state<number | null>(null);
	private finished = true;
	private loaded = false;

	async begin() {
		if (!this.loaded) {
			this.finished = (await Preferences.get({ key: KEY })).value === 'done';
			this.loaded = true;
		}
		if (!this.finished && this.step === null) this.step = 1;
	}

	// Moves on only when the action matches the step on screen.
	advance(from: number) {
		if (this.step !== from) return;
		if (from >= TOUR_STEPS) return this.finish();
		this.step = from + 1;
	}

	finish() {
		this.step = null;
		this.finished = true;
		return Preferences.set({ key: KEY, value: 'done' });
	}

	async restart() {
		await Preferences.remove({ key: KEY });
		this.finished = false;
		this.loaded = true;
		this.step = null;
	}
}

export const tour = new Tour();
