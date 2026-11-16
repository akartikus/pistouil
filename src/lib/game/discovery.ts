import type { Investigation } from '../engine/types';

// A fact is discovered once its place is open and the fact that unlocks it is discovered.
export function discoveredFactIds(
	investigation: Investigation,
	openedPlaceIds: string[]
): string[] {
	const opened = new Set(openedPlaceIds);
	const found = new Set<string>();
	let changed = true;
	while (changed) {
		changed = false;
		for (const fact of investigation.facts) {
			const unlocked = fact.unlockedBy === null || found.has(fact.unlockedBy);
			if (!found.has(fact.id) && opened.has(fact.placeId) && unlocked) {
				found.add(fact.id);
				changed = true;
			}
		}
	}
	return investigation.facts.filter((fact) => found.has(fact.id)).map((fact) => fact.id);
}

export function checkAccusation(investigation: Investigation, suspectId: string) {
	const author = investigation.characters.find((character) => character.author)!;
	return { correct: author.id === suspectId, authorName: author.firstName };
}
