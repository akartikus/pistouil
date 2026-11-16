import type { Route } from '../engine/types';
import type { PublicFact } from './projection';

// Minutes of the trips the player has measured, by sorted pair of places.
export type MeasuredMinutes = Record<string, number>;

export const measuredKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

// Minutes of routes by sorted pair of places.
export const minutesByPair = (routes: Route[]): MeasuredMinutes =>
	Object.fromEntries(
		routes.map((route) => [measuredKey(route.placeA, route.placeB), route.minutes])
	);

const gapBetween = (a: PublicFact, b: { from: number; to: number }) =>
	Math.max(a.from - b.to, b.from - a.to, 0);

export interface Position {
	placeIds: string[];
	factIds: string[];
}

// Where each suspect is at a time, according to the discovered facts that cover it.
export function positionsAt(
	facts: PublicFact[],
	suspectIds: string[],
	time: number
): Record<string, Position> {
	return Object.fromEntries(
		suspectIds.map((id) => {
			const covering = facts.filter(
				(fact) => fact.characterId === id && fact.from <= time && time <= fact.to
			);
			return [
				id,
				{
					placeIds: [...new Set(covering.map((fact) => fact.placeId))],
					factIds: covering.map((fact) => fact.id)
				}
			];
		})
	);
}

// Two facts of one suspect that cannot both be true, once the player has measured the trip
// between their two places. Nothing is flagged before: the player does that reading.
export interface Inconsistency {
	factIds: [string, string];
	characterId: string;
	tripMinutes: number;
	gapMinutes: number;
}

export function findInconsistencies(
	facts: PublicFact[],
	measured: MeasuredMinutes
): Inconsistency[] {
	const found: Inconsistency[] = [];
	for (let i = 0; i < facts.length; i++) {
		for (let j = i + 1; j < facts.length; j++) {
			const a = facts[i];
			const b = facts[j];
			if (a.characterId !== b.characterId || a.placeId === b.placeId) continue;
			const trip = measured[measuredKey(a.placeId, b.placeId)];
			const gap = gapBetween(a, b);
			if (trip !== undefined && gap < trip) {
				found.push({
					factIds: [a.id, b.id],
					characterId: a.characterId,
					tripMinutes: trip,
					gapMinutes: gap
				});
			}
		}
	}
	return found;
}

export interface AlibiVerdict {
	factId: string;
	characterId: string;
	tripMinutes: number;
	gapMinutes: number;
	// If the fact is true, can the suspect be at the scene at the time of the mystery?
	canReachScene: boolean;
}

// For each discovered fact away from the scene, once the trip to the scene is measured.
export function findSufficientAlibis(
	facts: PublicFact[],
	sceneId: string,
	mysteryTime: number,
	measured: MeasuredMinutes
): AlibiVerdict[] {
	const verdicts: AlibiVerdict[] = [];
	for (const fact of facts) {
		if (fact.placeId === sceneId) continue;
		const trip = measured[measuredKey(fact.placeId, sceneId)];
		if (trip === undefined) continue;
		const gap = gapBetween(fact, { from: mysteryTime, to: mysteryTime });
		verdicts.push({
			factId: fact.id,
			characterId: fact.characterId,
			tripMinutes: trip,
			gapMinutes: gap,
			canReachScene: gap >= trip
		});
	}
	return verdicts;
}
