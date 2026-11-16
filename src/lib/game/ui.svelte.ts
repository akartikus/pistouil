import type { Route } from '../engine/types';

// What is selected on the screens, apart from the game itself.
class Ui {
	selectedPlaceId = $state<string | null>(null);
	selectedPieceId = $state<string | null>(null);
	chooser = $state(false);
	selectedSuspectId = $state<string | null>(null);
	// Time of the cursor, in minutes; null until the map first opens at the mystery time.
	time = $state<number | null>(null);
	route = $state.raw<Route | null>(null);

	reset() {
		this.selectedPlaceId = null;
		this.selectedPieceId = null;
		this.chooser = false;
		this.selectedSuspectId = null;
		this.time = null;
		this.route = null;
	}
}

export const ui = new Ui();
