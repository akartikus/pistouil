// Consistency rules of the model (docs/reference/DATA-MODEL.md section 6).
import type { Catalog, Fact, Interval, Investigation, Place, PlaceType, Route } from './types';
import { createTravelTime, missingPairs, assertCompleteMatrix } from './routes';
import { contradicts, reachableFacts, solve, toSolverInput, type SolverFact } from './solver';
import { hasUnresolvedVariable } from './render';

export type RuleName =
	| 'scene-role'
	| 'excluded-places-unused'
	| 'clue-compatibility'
	| 'clue-hours'
	| 'realistic-routes'
	| 'true-facts-derived'
	| 'only-author-lies'
	| 'distinct-first-names'
	| 'complete-texts'
	| 'unique-solution'
	| 'reachable-solution'
	| 'complete-route-matrix'
	| 'suspect-count'
	| 'unlock-acyclic'
	| 'mystery-time-rounded'
	| 'proof-at-departure'
	| 'lie-detectable'
	| 'truths-uncontradicted';

export interface RuleContext {
	// All places given to the engine, not only the retained ones.
	places: Place[];
	routes: Route[];
	catalog: Catalog;
}

const ALWAYS_OPEN: Interval[] = [{ from: 0, to: 1440 }];

export function openingHours(place: Place, type: PlaceType): Interval[] {
	return place.actualHours ?? type.typicalHours ?? ALWAYS_OPEN;
}

export function fitsInHours(hours: Interval[], from: number, to: number): boolean {
	return hours.some((interval) => interval.from <= from && to <= interval.to);
}

export function checkRules(investigation: Investigation, context: RuleContext): RuleName[] {
	const { places, routes, catalog } = context;
	const placeById = new Map(places.map((place) => [place.osmId, place]));
	const typeById = new Map(catalog.placeTypes.map((type) => [type.id, type]));
	const typeOf = (placeId: string) => {
		const place = placeById.get(placeId);
		return place ? typeById.get(place.typeId) : undefined;
	};
	const author = investigation.characters.find((character) => character.author);
	const lieFacts = investigation.facts.filter(
		(fact) => fact.source.kind === 'testimony' && fact.source.lie
	);
	const trueFacts = investigation.facts.filter((fact) => !lieFacts.includes(fact));
	const clueFacts = investigation.facts.filter((fact) => fact.source.kind === 'clue');

	let travelTime: ReturnType<typeof createTravelTime> | null = null;
	try {
		travelTime = createTravelTime(routes);
	} catch {
		travelTime = null;
	}

	const violated: RuleName[] = [];
	const check = (name: RuleName, ok: () => boolean) => {
		try {
			if (ok()) return;
		} catch {
			// A rule that cannot be evaluated counts as violated.
		}
		violated.push(name);
	};

	check('scene-role', () => typeOf(investigation.sceneId)?.role === 'scene');

	check('excluded-places-unused', () => {
		const used = new Set([
			investigation.sceneId,
			...investigation.placeIds,
			...investigation.characters.flatMap((c) => c.segments.map((s) => s.placeId)),
			...investigation.facts.map((fact) => fact.placeId)
		]);
		return [...used].every((id) => {
			const place = placeById.get(id);
			const type = typeOf(id);
			return place && type && !place.removed && type.role !== 'excluded';
		});
	});

	check('clue-compatibility', () =>
		clueFacts.every((fact) => {
			const type = typeOf(fact.placeId);
			return (
				fact.source.kind === 'clue' &&
				type !== undefined &&
				(catalog.compatibilities[type.id] ?? []).includes(fact.source.clueTypeId)
			);
		})
	);

	check('clue-hours', () =>
		clueFacts.every((fact) => {
			const place = placeById.get(fact.placeId);
			const type = typeOf(fact.placeId);
			return place && type && fitsInHours(openingHours(place, type), fact.from, fact.to);
		})
	);

	check('realistic-routes', () =>
		investigation.characters.every((character) => {
			const segments = [...character.segments].sort((a, b) => a.from - b.from);
			return segments.every(
				(segment, i) =>
					i === 0 ||
					segment.from - segments[i - 1].to >= travelTime!(segments[i - 1].placeId, segment.placeId)
			);
		})
	);

	check('true-facts-derived', () =>
		trueFacts.every((fact) => {
			const character = investigation.characters.find((c) => c.id === fact.characterId);
			const segment = fact.segment === null ? undefined : character?.segments[fact.segment];
			return (
				segment !== undefined &&
				segment.placeId === fact.placeId &&
				segment.from <= fact.from &&
				fact.to <= segment.to
			);
		})
	);

	check(
		'only-author-lies',
		() =>
			investigation.characters.filter((c) => c.author).length === 1 &&
			lieFacts.length === 1 &&
			lieFacts[0].source.kind === 'testimony' &&
			lieFacts[0].source.speakerId === author?.id
	);

	check(
		'distinct-first-names',
		() =>
			new Set(investigation.characters.map((c) => c.firstName)).size ===
			investigation.characters.length
	);

	check('complete-texts', () =>
		[
			investigation.situationText,
			investigation.revelationText,
			...investigation.facts.map((fact) => fact.source.renderedText)
		].every((text) => text.length > 0 && !hasUnresolvedVariable(text))
	);

	const solverInput = toSolverInput(investigation, travelTime ?? (() => 1));
	const onlyAuthor = (input: typeof solverInput) => {
		const { possible } = solve(input);
		return possible.length === 1 && possible[0] === author?.id;
	};

	check('unique-solution', () =>
		onlyAuthor({
			...solverInput,
			facts: solverInput.facts.map((fact) => ({ ...fact, unlockedBy: null }))
		})
	);
	check('reachable-solution', () => onlyAuthor(solverInput));

	check('complete-route-matrix', () => {
		assertCompleteMatrix(places, routes);
		return (
			missingPairs(
				places.map((place) => place.osmId),
				routes
			).length === 0
		);
	});

	check(
		'suspect-count',
		() =>
			[1, 2, 3].includes(investigation.difficulty) &&
			investigation.characters.length === investigation.difficulty + 2
	);

	check(
		'unlock-acyclic',
		() => reachableFacts(solverInput.facts).length === solverInput.facts.length
	);

	// With an incomplete route matrix the solver cannot run: dependent rules then fail.
	let reliableIds: string[] = [];
	try {
		reliableIds = solve(solverInput).reliableFactIds;
	} catch {
		reliableIds = [];
	}
	const reliable: SolverFact[] = solverInput.facts.filter((fact) => reliableIds.includes(fact.id));

	// A mystery happens at 10h15 or 8h05, never at 7h57.
	check('mystery-time-rounded', () => investigation.mysteryTime % 5 === 0);

	// A proof (receipt, bill, ticket) is bought or validated on the way out.
	check('proof-at-departure', () =>
		clueFacts.every((fact) => {
			if (fact.source.kind !== 'clue') return true;
			const clueTypeId = fact.source.clueTypeId;
			const type = catalog.clueTypes.find((clueType) => clueType.id === clueTypeId);
			if (type?.nature !== 'proof') return true;
			const character = investigation.characters.find((c) => c.id === fact.characterId);
			const segment = fact.segment === null ? undefined : character?.segments[fact.segment];
			return (
				fact.departure && fact.from === fact.to && segment !== undefined && fact.to === segment.to
			);
		})
	);

	check('lie-detectable', () => {
		const lie = solverInput.facts.find((fact) => fact.id === lieFacts[0]?.id);
		return (
			lie !== undefined &&
			reliable.some(
				(other) => other.speakerId !== author?.id && contradicts(lie, other, travelTime!)
			)
		);
	});

	check('truths-uncontradicted', () =>
		trueFacts.every((fact: Fact) => {
			const own = solverInput.facts.find((f) => f.id === fact.id)!;
			return !reliable.some((other) => other.id !== own.id && contradicts(own, other, travelTime!));
		})
	);

	return violated;
}
