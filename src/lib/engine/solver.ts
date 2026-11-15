// Solver: reads only what the player can see (never author, lie or motive).
import type { Investigation } from './types';
import type { TravelTime } from './routes';

export interface SolverFact {
	id: string;
	characterId: string;
	placeId: string;
	from: number;
	to: number;
	departure: boolean;
	unlockedBy: string | null;
	// Null for a clue (always reliable); a testimony is reliable once its speaker is cleared.
	speakerId: string | null;
}

export interface SolverInput {
	suspectIds: string[];
	sceneId: string;
	mysteryTime: number;
	facts: SolverFact[];
	travelTime: TravelTime;
}

export interface SolveResult {
	possible: string[];
	// Number of rounds in which at least one suspect is cleared.
	difficulty: number;
	clearedAtRound: Record<string, number>;
	reachableFactIds: string[];
	reliableFactIds: string[];
}

export type TestimonyVerdict = 'contradicted' | 'corroborated' | 'unverified';

export function toSolverInput(investigation: Investigation, travelTime: TravelTime): SolverInput {
	return {
		suspectIds: investigation.characters.map((character) => character.id),
		sceneId: investigation.sceneId,
		mysteryTime: investigation.mysteryTime,
		travelTime,
		facts: investigation.facts.map((fact) => ({
			id: fact.id,
			characterId: fact.characterId,
			placeId: fact.placeId,
			from: fact.from,
			to: fact.to,
			departure: fact.departure,
			unlockedBy: fact.unlockedBy,
			speakerId: fact.source.kind === 'testimony' ? fact.source.speakerId : null
		}))
	};
}

type Timed = Pick<SolverFact, 'characterId' | 'placeId' | 'from' | 'to' | 'departure'>;

const gap = (a: Timed, b: Timed) => Math.max(a.from - b.to, b.from - a.to, 0);

// A character leaves a place once: two departures at different times cannot both be true.
const differentDepartures = (a: Timed, b: Timed) => a.departure && b.departure && a.from !== b.from;

// A departure interrupts a continuous presence at the same place.
const interrupts = (departure: Timed, presence: Timed) =>
	departure.departure &&
	!presence.departure &&
	presence.from <= departure.from &&
	departure.from < presence.to;

export function contradicts(a: Timed, b: Timed, travelTime: TravelTime): boolean {
	if (a.characterId !== b.characterId) return false;
	if (a.placeId !== b.placeId) return gap(a, b) < travelTime(a.placeId, b.placeId);
	return interrupts(a, b) || interrupts(b, a) || differentDepartures(a, b);
}

export function reachableFacts(facts: SolverFact[]): SolverFact[] {
	const reachable = new Set<string>();
	let changed = true;
	while (changed) {
		changed = false;
		for (const fact of facts) {
			if (reachable.has(fact.id)) continue;
			if (fact.unlockedBy === null || reachable.has(fact.unlockedBy)) {
				reachable.add(fact.id);
				changed = true;
			}
		}
	}
	return facts.filter((fact) => reachable.has(fact.id));
}

export function solve(input: SolverInput): SolveResult {
	const facts = reachableFacts(input.facts);
	const reliable = new Set(facts.filter((fact) => fact.speakerId === null).map((fact) => fact.id));
	const clearedAtRound: Record<string, number> = {};
	let round = 0;

	for (;;) {
		const cleared = input.suspectIds.filter(
			(id) =>
				!(id in clearedAtRound) &&
				facts.some(
					(fact) =>
						reliable.has(fact.id) &&
						fact.characterId === id &&
						fact.placeId !== input.sceneId &&
						gap(fact, { ...fact, from: input.mysteryTime, to: input.mysteryTime }) <
							input.travelTime(fact.placeId, input.sceneId)
				)
		);
		if (cleared.length === 0) break;
		round++;
		for (const id of cleared) clearedAtRound[id] = round;
		for (const fact of facts) {
			if (fact.speakerId !== null && fact.speakerId in clearedAtRound) reliable.add(fact.id);
		}
	}

	return {
		possible: input.suspectIds.filter((id) => !(id in clearedAtRound)),
		difficulty: round,
		clearedAtRound,
		reachableFactIds: facts.map((fact) => fact.id),
		reliableFactIds: [...reliable]
	};
}

// A testimony is judged against the reliable facts at the end of the resolution.
export function judgeTestimony(
	fact: SolverFact,
	input: SolverInput,
	result: SolveResult
): TestimonyVerdict {
	const reliable = input.facts.filter(
		(other) => other.id !== fact.id && result.reliableFactIds.includes(other.id)
	);
	if (reliable.some((other) => contradicts(fact, other, input.travelTime))) return 'contradicted';
	const overlaps = reliable.some(
		(other) =>
			other.characterId === fact.characterId &&
			other.placeId === fact.placeId &&
			other.from <= fact.to &&
			fact.from <= other.to
	);
	return overlaps ? 'corroborated' : 'unverified';
}
