// Logic of the engine playground page: a development tool, not part of the game.
import type { Catalog, Difficulty, Investigation, LieMotive, Place, Route } from '../engine/types';
import { generateInvestigation, type GenerationFailure } from '../engine/generate';
import { checkRules, type RuleName } from '../engine/rules';
import { createTravelTime } from '../engine/routes';
import { formatTime } from '../engine/render';
import { judgeTestimony, solve, toSolverInput } from '../engine/solver';

export interface PlaygroundOptions {
	seed: number;
	difficulty: Difficulty;
	scenarioId: string | null;
	motive: LieMotive | null;
	activePlaceIds: string[];
}

// What a player can see about a fact once it is discovered.
export interface FactView {
	id: string;
	about: string;
	place: string;
	time: string;
	kind: 'clue' | 'testimony';
	speaker: string | null;
	text: string;
}

// What only the engine knows about a fact: shown on request.
export interface FactDetail {
	unlockedBy: string | null;
	reachable: boolean;
	reliable: boolean;
	// Only for testimonies, judged against the reliable facts at the end of the resolution.
	verdict: 'contradicted' | 'corroborated' | 'unverified' | null;
}

export interface InvestigationView {
	situation: string;
	mysteryTime: string;
	sceneName: string;
	measuredDifficulty: number;
	violations: RuleName[];
	suspects: { id: string; firstName: string }[];
	// Places retained by the investigation.
	places: { id: string; name: string }[];
	facts: FactView[];
	// Hidden from the player: shown only on request.
	reveal: {
		authorName: string;
		lie: { factId: string; text: string; motive: LieMotive | null };
		evenings: { name: string; segments: string[] }[];
		revelation: string;
		possibleSuspects: string[];
		rounds: { round: number; cleared: string[] }[];
		facts: Record<string, FactDetail>;
	};
}

export interface MatrixView {
	places: { id: string; name: string; isScene: boolean; retained: boolean }[];
	// cells[row][column]: "12 min (996 m)", null on the diagonal.
	cells: (string | null)[][];
}

export type PlaygroundRun =
	| {
			ok: true;
			investigation: Investigation;
			view: InvestigationView;
			// Distances between all active places, and between the places of the investigation only.
			matrix: MatrixView;
			retainedMatrix: MatrixView;
	  }
	| { ok: false; reason: GenerationFailure; matrix: MatrixView };

export interface ScenarioView {
	id: string;
	title: string;
	motives: LieMotive[];
}

// Forces a scenario and/or a motive by narrowing the catalog the engine receives.
export function restrictCatalog(
	catalog: Catalog,
	scenarioId: string | null,
	motive: LieMotive | null
): Catalog {
	const scenarios = catalog.scenarios
		.filter((scenario) => scenarioId === null || scenario.id === scenarioId)
		.filter((scenario) => motive === null || scenario.lieMotives.includes(motive))
		.map((scenario) =>
			motive === null ? scenario : { ...scenario, lieMotives: [motive] as LieMotive[] }
		);
	return { ...catalog, scenarios };
}

export function filterPlaces(places: Place[], routes: Route[], activeIds: string[]) {
	const active = new Set(activeIds);
	return {
		places: places.filter((place) => active.has(place.osmId)),
		routes: routes.filter((route) => active.has(route.placeA) && active.has(route.placeB))
	};
}

export function describeInvestigation(
	investigation: Investigation,
	places: Place[],
	routes: Route[],
	catalog: Catalog
): InvestigationView {
	const placeName = (id: string) => places.find((place) => place.osmId === id)?.name ?? id;
	const nameOf = (id: string) =>
		investigation.characters.find((character) => character.id === id)?.firstName ?? id;
	const travelTime = createTravelTime(routes);
	const input = toSolverInput(investigation, travelTime);
	const result = solve(input);
	const lieFact = investigation.facts.find(
		(fact) => fact.source.kind === 'testimony' && fact.source.lie
	)!;
	const author = investigation.characters.find((character) => character.author)!;

	const rounds = Array.from({ length: result.difficulty }, (_, i) => ({
		round: i + 1,
		cleared: Object.entries(result.clearedAtRound)
			.filter(([, round]) => round === i + 1)
			.map(([id]) => nameOf(id))
	}));

	const details: Record<string, FactDetail> = {};
	for (const fact of investigation.facts) {
		const solverFact = input.facts.find((f) => f.id === fact.id)!;
		details[fact.id] = {
			unlockedBy: fact.unlockedBy,
			reachable: result.reachableFactIds.includes(fact.id),
			reliable: result.reliableFactIds.includes(fact.id),
			verdict: fact.source.kind === 'testimony' ? judgeTestimony(solverFact, input, result) : null
		};
	}

	return {
		situation: investigation.situationText,
		mysteryTime: formatTime(investigation.mysteryTime),
		sceneName: placeName(investigation.sceneId),
		measuredDifficulty: result.difficulty,
		violations: checkRules(investigation, { places, routes, catalog }),
		suspects: investigation.characters.map(({ id, firstName }) => ({ id, firstName })),
		places: investigation.placeIds.map((id) => ({ id, name: placeName(id) })),
		facts: investigation.facts.map((fact) => ({
			id: fact.id,
			about: nameOf(fact.characterId),
			place: placeName(fact.placeId),
			time:
				fact.from === fact.to
					? formatTime(fact.from)
					: `${formatTime(fact.from)}–${formatTime(fact.to)}`,
			kind: fact.source.kind,
			speaker: fact.source.kind === 'testimony' ? nameOf(fact.source.speakerId) : null,
			text: fact.source.renderedText
		})),
		reveal: {
			authorName: author.firstName,
			lie: {
				factId: lieFact.id,
				text: lieFact.source.renderedText,
				motive: lieFact.source.kind === 'testimony' ? lieFact.source.motive : null
			},
			evenings: investigation.characters.map((character) => ({
				name: character.firstName,
				segments: character.segments.map(
					(segment) =>
						`${placeName(segment.placeId)} ${formatTime(segment.from)}–${formatTime(segment.to)}`
				)
			})),
			revelation: investigation.revelationText,
			possibleSuspects: result.possible.map(nameOf),
			rounds,
			facts: details
		}
	};
}

export function describeMatrix(
	allPlaces: Place[],
	routes: Route[],
	investigation: Investigation | null = null,
	onlyRetained = false
): MatrixView {
	const places =
		onlyRetained && investigation
			? allPlaces.filter((place) => investigation.placeIds.includes(place.osmId))
			: allPlaces;
	const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
	const byPair = new Map(routes.map((route) => [key(route.placeA, route.placeB), route]));
	return {
		places: places.map((place) => ({
			id: place.osmId,
			name: place.name,
			isScene: investigation?.sceneId === place.osmId,
			retained: investigation?.placeIds.includes(place.osmId) ?? false
		})),
		cells: places.map((row) =>
			places.map((column) => {
				if (row.osmId === column.osmId) return null;
				const route = byPair.get(key(row.osmId, column.osmId))!;
				return `${route.minutes} min (${route.distanceM} m)`;
			})
		)
	};
}

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

export function runPlayground(
	places: Place[],
	routes: Route[],
	catalog: Catalog,
	options: PlaygroundOptions
): PlaygroundRun {
	const active = filterPlaces(places, routes, options.activePlaceIds);
	const restricted = restrictCatalog(catalog, options.scenarioId, options.motive);
	const result = generateInvestigation(active.places, active.routes, restricted, {
		seed: options.seed,
		difficulty: options.difficulty
	});
	if (!result.ok) {
		return { ...result, matrix: describeMatrix(active.places, active.routes) };
	}
	return {
		ok: true,
		investigation: result.investigation,
		view: describeInvestigation(result.investigation, active.places, active.routes, restricted),
		matrix: describeMatrix(active.places, active.routes, result.investigation),
		retainedMatrix: describeMatrix(active.places, active.routes, result.investigation, true)
	};
}

export function describeScenarios(catalog: Catalog): ScenarioView[] {
	return catalog.scenarios.map((scenario) => ({
		id: scenario.id,
		title: scenario.title,
		motives: scenario.lieMotives
	}));
}

export interface SnapshotView {
	choices: { name: string; value: string }[];
	suspects: { id: string; firstName: string; author: boolean; evening: string }[];
	facts: {
		id: string;
		characterId: string;
		placeId: string;
		// "16h56 (1016)": readable time, then raw minutes.
		from: string;
		to: string;
		departure: boolean;
		segment: number | null;
		unlockedBy: string | null;
		kind: 'clue' | 'testimony';
		speakerId: string | null;
		lie: boolean;
	}[];
}

const clock = (minutes: number) => `${formatTime(minutes)} (${minutes})`;

// What the engine chose, as plain values. It contains the solution.

export function describeSnapshot(investigation: Investigation, places: Place[]): SnapshotView {
	const author = investigation.characters.find((character) => character.author)!;
	const scene = places.find((place) => place.osmId === investigation.sceneId);
	const lie = investigation.facts
		.map((fact) => fact.source)
		.find((source) => source.kind === 'testimony' && source.lie);
	return {
		choices: [
			{ name: 'seed', value: String(investigation.seed) },
			{ name: 'difficulty', value: String(investigation.difficulty) },
			{ name: 'scenario', value: investigation.scenarioId },
			{ name: 'motive', value: (lie?.kind === 'testimony' && lie.motive) || '' },
			{ name: 'scene', value: `${investigation.sceneId} (${scene?.name}, ${scene?.typeId})` },
			{
				name: 'mysteryTime',
				value: clock(investigation.mysteryTime)
			},
			{ name: 'author', value: `${author.id} (${author.firstName})` },
			{ name: 'retainedPlaces', value: investigation.placeIds.join(', ') },
			{ name: 'situationText', value: investigation.situationText },
			{ name: 'revelationText', value: investigation.revelationText }
		],
		suspects: investigation.characters.map((character) => ({
			id: character.id,
			firstName: character.firstName,
			author: character.author,
			evening: character.segments
				.map((segment) => `${segment.placeId} ${clock(segment.from)}–${clock(segment.to)}`)
				.join(' → ')
		})),
		facts: investigation.facts.map((fact) => ({
			id: fact.id,
			characterId: fact.characterId,
			placeId: fact.placeId,
			from: clock(fact.from),
			to: clock(fact.to),
			departure: fact.departure,
			segment: fact.segment,
			unlockedBy: fact.unlockedBy,
			kind: fact.source.kind,
			speakerId: fact.source.kind === 'testimony' ? fact.source.speakerId : null,
			lie: fact.source.kind === 'testimony' && fact.source.lie
		}))
	};
}
