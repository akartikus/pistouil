export type AlibiStatus = 'to-check' | 'doubtful' | 'verified';

// What the player has done: everything the interface may know, nothing hidden.
export interface GameProgress {
	openedPlaceIds: string[];
	// Facts the player has read, by touching their piece: only these join the notebook,
	// the files and the time cursor.
	readFactIds: string[];
	// Pairs of place ids, each in sorted order.
	measuredRoutes: [string, string][];
	annotations: { placeId: string; text: string }[];
	notes: string;
	// Chosen by the player only: the game never sets it.
	alibiStatuses: Record<string, AlibiStatus>;
	accusation: string | null;
}

export function initialProgress(suspectIds: string[]): GameProgress {
	return {
		openedPlaceIds: [],
		readFactIds: [],
		measuredRoutes: [],
		annotations: [],
		notes: '',
		alibiStatuses: Object.fromEntries(suspectIds.map((id) => [id, 'to-check' as AlibiStatus])),
		accusation: null
	};
}

const pair = (a: string, b: string): [string, string] => (a < b ? [a, b] : [b, a]);

export function openPlace(progress: GameProgress, placeId: string): GameProgress {
	if (progress.openedPlaceIds.includes(placeId)) return progress;
	return { ...progress, openedPlaceIds: [...progress.openedPlaceIds, placeId] };
}

export function readFact(progress: GameProgress, factId: string): GameProgress {
	if (progress.readFactIds.includes(factId)) return progress;
	return { ...progress, readFactIds: [...progress.readFactIds, factId] };
}

export function isMeasured(progress: GameProgress, a: string, b: string): boolean {
	const [first, second] = pair(a, b);
	return progress.measuredRoutes.some(([x, y]) => x === first && y === second);
}

export function measureRoute(progress: GameProgress, a: string, b: string): GameProgress {
	if (isMeasured(progress, a, b)) return progress;
	return { ...progress, measuredRoutes: [...progress.measuredRoutes, pair(a, b)] };
}

export function setAlibiStatus(
	progress: GameProgress,
	suspectId: string,
	status: AlibiStatus
): GameProgress {
	return { ...progress, alibiStatuses: { ...progress.alibiStatuses, [suspectId]: status } };
}

// One annotation per place; an empty text removes it.
export function annotate(progress: GameProgress, placeId: string, text: string): GameProgress {
	const others = progress.annotations.filter((note) => note.placeId !== placeId);
	return { ...progress, annotations: text ? [...others, { placeId, text }] : others };
}

export function setNotes(progress: GameProgress, notes: string): GameProgress {
	return { ...progress, notes };
}

// The accusation is final: a second one is ignored.
export function accuse(progress: GameProgress, suspectId: string): GameProgress {
	return progress.accusation === null ? { ...progress, accusation: suspectId } : progress;
}
