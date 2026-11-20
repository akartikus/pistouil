import type { Difficulty } from '../engine/types';
import type { GameProgress } from './progress';
import type { Center } from './zone';

export const SAVE_VERSION = 2;
const KEY = 'pistouil.save';

// Only what regenerates the investigation (the seed and the zone) and what the player did.
// Never the author, a lie or the revelation text.
export interface SavedGame {
	version: number;
	seed: number;
	difficulty: Difficulty;
	zone: { center: Center; radiusM: number; name: string };
	// The data the investigation was generated from: another extract gives another investigation.
	dataVersion: string;
	progress: GameProgress;
}

// Key-value storage, so that tests and the app (Capacitor preferences) share the logic.
export interface StoragePort {
	get(key: string): Promise<string | null>;
	set(key: string, value: string): Promise<void>;
	remove(key: string): Promise<void>;
}

export const saveGame = (port: StoragePort, game: SavedGame) => port.set(KEY, JSON.stringify(game));

export const clearGame = (port: StoragePort) => port.remove(KEY);

export type LoadResult =
	{ status: 'none' } | { status: 'unreadable' } | { status: 'ok'; game: SavedGame };

export async function loadGame(port: StoragePort): Promise<LoadResult> {
	const raw = await port.get(KEY);
	if (raw === null) return { status: 'none' };
	try {
		const game = JSON.parse(raw) as SavedGame;
		return game.version === SAVE_VERSION ? { status: 'ok', game } : { status: 'unreadable' };
	} catch {
		return { status: 'unreadable' };
	}
}

// The accusation is final: a game with one is over, whatever else is in the save.
export const isFinished = (game: SavedGame) => game.progress.accusation !== null;

export const dataVersionOf = (manifest: { source: string; extractDate: string | null }) =>
	manifest.extractDate ? `${manifest.source}@${manifest.extractDate}` : manifest.source;

export const dataChanged = (game: SavedGame, currentDataVersion: string) =>
	game.dataVersion !== currentDataVersion;
