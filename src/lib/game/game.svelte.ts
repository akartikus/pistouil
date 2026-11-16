import { Preferences } from '@capacitor/preferences';
import type { Difficulty, Route } from '../engine/types';
import { createGameClient, type GameClient } from './client';
import { measuredKey, minutesByPair, type MeasuredMinutes } from './deduction';
import {
	accuse,
	annotate,
	measureRoute,
	openPlace,
	readFact,
	setAlibiStatus,
	setNotes,
	type AlibiStatus,
	type GameProgress
} from './progress';
import type { PublicFact } from './projection';
import type { FailureReason, Revelation, SessionView } from './protocol';
import {
	SAVE_VERSION,
	clearGame,
	loadGame,
	saveGame,
	type LoadResult,
	type SavedGame,
	type StoragePort
} from './save';
import type { Center, CommuneSummary } from './zone';

// Capacitor preferences keep the save on the device (the browser storage on the web).
const storage: StoragePort = {
	get: async (key) => (await Preferences.get({ key })).value,
	set: (key, value) => Preferences.set({ key, value }),
	remove: (key) => Preferences.remove({ key })
};

export interface Failure {
	reason: FailureReason;
	neighbors: CommuneSummary[];
}

// The state of the interface: the projection from the Worker, and what the player did.
export class Game {
	phase = $state<'idle' | 'loading' | 'playing' | 'failed'>('idle');
	failure = $state.raw<Failure | null>(null);
	view = $state.raw<SessionView | null>(null);
	progress = $state.raw<GameProgress | null>(null);
	facts = $state.raw<PublicFact[]>([]);
	measured = $state.raw<Route[]>([]);
	revelation = $state.raw<Revelation | null>(null);

	private client: GameClient | null = null;
	private seed = 0;
	private difficulty: Difficulty = 2;
	zone = $state<{ center: Center; name: string }>({ center: { lat: 0, lon: 0 }, name: '' });

	// The facts the player has read, by touching their piece.
	readFacts = $derived(this.facts.filter((fact) => this.progress?.readFactIds.includes(fact.id)));

	// Minutes of the trips the player measured, by pair of places.
	measuredMinutes = $derived<MeasuredMinutes>(minutesByPair(this.measured));

	// What explains the game: every trip, known only once the game is over. During the game
	// nothing is concluded for the player.
	conclusionMinutes = $derived<MeasuredMinutes>(
		this.revelation ? minutesByPair(this.revelation.trips) : {}
	);

	private worker() {
		return (this.client ??= createGameClient());
	}

	loadSave(): Promise<LoadResult> {
		return loadGame(storage);
	}

	async start(center: Center, name: string, insee: string | undefined, difficulty: Difficulty) {
		// A random seed is fine here: the interface is not the engine.
		const seed = Math.floor(Math.random() * 1_000_000_000);
		this.zone = { center, name };
		await this.begin({ type: 'start', center, name, insee, difficulty, seed }, seed, difficulty);
	}

	async resume(saved: SavedGame) {
		this.zone = { center: saved.zone.center, name: saved.zone.name };
		await this.begin({ type: 'resume', saved }, saved.seed, saved.difficulty);
	}

	private async begin(
		request: Parameters<GameClient['request']>[0],
		seed: number,
		difficulty: Difficulty
	) {
		this.phase = 'loading';
		this.failure = null;
		this.seed = seed;
		this.difficulty = difficulty;
		const reply = await this.worker().request($state.snapshot(request) as typeof request);
		if (reply.type !== 'started') {
			this.phase = 'failed';
			this.failure = reply.type === 'failed' ? reply : { reason: 'data-missing', neighbors: [] };
			return;
		}
		this.view = reply.view;
		this.progress = reply.view.progress;
		this.facts = reply.view.facts;
		this.measured = reply.view.measured;
		this.revelation = reply.view.revelation;
		this.phase = 'playing';
		await this.persist();
	}

	async open(placeId: string) {
		const reply = await this.worker().request({ type: 'open', placeId });
		if (reply.type !== 'opened' || !this.progress) return;
		this.facts = [
			...this.facts,
			...reply.facts.filter((fact) => !this.facts.some((known) => known.id === fact.id))
		];
		this.progress = openPlace(this.progress, placeId);
		await this.persist();
	}

	// The route between two retained places; it is noted as measured.
	async measure(a: string, b: string): Promise<Route | null> {
		const reply = await this.worker().request({ type: 'measure', a, b });
		if (reply.type !== 'measured' || !this.progress) return null;
		if (
			!this.measured.some((route) => measuredKey(route.placeA, route.placeB) === measuredKey(a, b))
		) {
			this.measured = [...this.measured, reply.route];
		}
		this.progress = measureRoute(this.progress, a, b);
		await this.persist();
		return reply.route;
	}

	read(factId: string) {
		if (this.progress) this.progress = readFact(this.progress, factId);
		return this.persist();
	}

	setAlibi(suspectId: string, status: AlibiStatus) {
		if (this.progress) this.progress = setAlibiStatus(this.progress, suspectId, status);
		return this.persist();
	}

	annotate(placeId: string, text: string) {
		if (this.progress) this.progress = annotate(this.progress, placeId, text);
		return this.persist();
	}

	setNotes(notes: string) {
		if (this.progress) this.progress = setNotes(this.progress, notes);
		return this.persist();
	}

	async accuse(suspectId: string) {
		const reply = await this.worker().request({ type: 'accuse', suspectId });
		if (reply.type !== 'accused' || !this.progress) return;
		this.revelation = reply.revelation;
		this.progress = accuse(this.progress, suspectId);
		await this.persist();
	}

	// Leave the failure screen without touching the save.
	dismiss() {
		this.phase = 'idle';
		this.failure = null;
	}

	async forget() {
		await clearGame(storage);
		this.client?.stop();
		this.client = null;
		this.phase = 'idle';
		this.view = null;
		this.progress = null;
		this.facts = [];
		this.measured = [];
		this.revelation = null;
	}

	private async persist() {
		if (!this.view || !this.progress) return;
		await saveGame(storage, {
			version: SAVE_VERSION,
			seed: this.seed,
			difficulty: this.difficulty,
			zone: { ...this.zone, radiusM: this.view.radiusM },
			dataVersion: this.view.dataVersion,
			progress: this.progress
		});
	}
}

export const game = new Game();
