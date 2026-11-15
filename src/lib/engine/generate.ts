// Investigation generator: simulate the truth first, then derive facts from it.
import type {
	Catalog,
	Character,
	DayType,
	Difficulty,
	Fact,
	Interval,
	Investigation,
	LieKind,
	LieMotive,
	Place,
	PlaceType,
	Route,
	ScenarioModel,
	Segment,
	TestimonyPrecision,
	TestimonySubject
} from './types';
import { createRandom, type Random } from './random';
import { assertCompleteMatrix, createTravelTime, type TravelTime } from './routes';
import { formatTime, renderRevelation, renderSituation, renderTemplate } from './render';
import { checkRules, fitsInHours, openingHours, type RuleContext } from './rules';
import { contradicts, solve, toSolverInput } from './solver';

export interface GenerationOptions {
	seed: number;
	difficulty: Difficulty;
}

export type GenerationFailure = 'no-scene' | 'difficulty-unreachable';

export type GenerationResult =
	{ ok: true; investigation: Investigation } | { ok: false; reason: GenerationFailure };

const MAX_ATTEMPTS = 60;
// Share of suspects who get a distant proof: none when easy, then a third, then a half.
const FAR_PROOF_SHARE: Record<Difficulty, number> = { 1: 0, 2: 1 / 3, 3: 1 / 2 };
// Share of those old stays that end just in time to reach the next one: they look like a lie.
const TENSE_SHARE = 1 / 2;
// Spare minutes of a tense stay, on top of the walk to the next one.
const TENSE_MARGIN = 3;
// How the author may lie: the obvious false alibi when easy, a trap for each step up.
const LIE_KINDS: Record<Difficulty, LieKind[]> = {
	1: ['alibi'],
	2: ['alibi', 'framing'],
	3: ['alibi', 'framing', 'closed']
};
// The mystery time is a multiple of this many minutes.
const MYSTERY_STEP = 5;

interface Context {
	places: Place[];
	routes: Route[];
	catalog: Catalog;
	travel: TravelTime;
	// Places that can appear in an investigation: not removed, role scene or alibi.
	usable: Place[];
	dayType: DayType;
	typeOf: (place: Place) => PlaceType;
	// Opening hours on the day of the investigation.
	hoursOf: (place: Place) => Interval[];
	clueIdsOf: (place: Place) => string[];
}

interface Setting {
	scenario: ScenarioModel;
	scene: Place;
	time: number;
	dayType: DayType;
}

// A suspect cleared by a fact, with the fact that clears them.
interface Innocent {
	character: Character;
	place: Place;
	segment: Segment;
	clearingFactId: string;
}

const deriveSeed = (seed: number, attempt: number) => (seed + Math.imul(attempt, 0x9e3779b9)) >>> 0;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function createContext(
	places: Place[],
	routes: Route[],
	catalog: Catalog,
	dayType: DayType = 'weekday'
): Context {
	const typeById = new Map(catalog.placeTypes.map((type) => [type.id, type]));
	const typeOf = (place: Place) => typeById.get(place.typeId)!;
	return {
		places,
		routes,
		catalog,
		travel: createTravelTime(routes),
		usable: places.filter((place) => {
			const type = typeById.get(place.typeId);
			return !place.removed && type !== undefined && type.role !== 'excluded';
		}),
		dayType,
		typeOf,
		hoursOf: (place) => openingHours(place, typeOf(place), dayType),
		clueIdsOf: (place) => catalog.compatibilities[place.typeId] ?? []
	};
}

function forDay(ctx: Context, dayType: DayType): Context {
	return {
		...ctx,
		dayType,
		hoursOf: (place) => openingHours(place, ctx.typeOf(place), dayType)
	};
}

// Picks the day, the scenario, the scene and the mystery time. A scene closed that day is skipped.
function chooseSetting(base: Context, rng: Random): Setting | null {
	for (const dayType of rng.shuffle<DayType>(['weekday', 'weekend'])) {
		const setting = chooseSettingOn(forDay(base, dayType), rng);
		if (setting) return setting;
	}
	return null;
}

function chooseSettingOn(ctx: Context, rng: Random): Setting | null {
	for (const scenario of rng.shuffle(ctx.catalog.scenarios)) {
		const scenes = ctx.usable.filter(
			(place) => ctx.typeOf(place).role === 'scene' && scenario.sceneTypeIds.includes(place.typeId)
		);
		for (const scene of rng.shuffle(scenes)) {
			// The mystery time is a multiple of 5 minutes: keep the multiples inside each window.
			const slots = ctx
				.hoursOf(scene)
				.map((hours) => ({
					from: Math.ceil(Math.max(hours.from, scenario.timeRange.from) / MYSTERY_STEP),
					to: Math.floor(Math.min(hours.to, scenario.timeRange.to) / MYSTERY_STEP)
				}))
				.filter((slot) => slot.from <= slot.to);
			if (slots.length > 0) {
				const slot = rng.pick(slots);
				return {
					scenario,
					scene,
					time: rng.int(slot.from, slot.to) * MYSTERY_STEP,
					dayType: ctx.dayType
				};
			}
		}
	}
	return null;
}

// A stay at `place` that clears the suspect. It ends within a trip of the mystery time, so a
// proof dated at the end of the stay clears the suspect too.
function nearSegment(ctx: Context, rng: Random, place: Place, scene: Place, time: number) {
	const trip = ctx.travel(place.osmId, scene.osmId);
	for (let tries = 0; tries < 30; tries++) {
		const to = rng.int(time - trip + 1, time + trip - 1);
		const from = to - rng.int(20, 75);
		if (from >= 0 && fitsInHours(ctx.hoursOf(place), from, to)) {
			return { placeId: place.osmId, from, to };
		}
	}
	return null;
}

interface AuthorPlan {
	leave: number;
	stay: Segment;
	atScene: Segment;
	witnessStay: Segment;
}

// The author leaves `place` too late to be cleared; a witness stays there past the departure.
function planAuthor(ctx: Context, rng: Random, place: Place, scene: Place, time: number) {
	const trip = ctx.travel(place.osmId, scene.osmId);
	const sceneHours = ctx.hoursOf(scene).find((hours) => hours.from <= time && time <= hours.to)!;
	for (let tries = 0; tries < 20; tries++) {
		const leave = time - trip - rng.int(3, 15);
		const stay = { placeId: place.osmId, from: leave - rng.int(20, 60), to: leave };
		const witnessStay = {
			placeId: place.osmId,
			from: leave - rng.int(5, 40),
			// Ends within a trip of the mystery time (and after the author leaves).
			to: rng.int(time - trip + 1, time + trip - 1)
		};
		const hours = ctx.hoursOf(place);
		if (stay.from < 0 || witnessStay.from < 0) continue;
		if (!fitsInHours(hours, stay.from, stay.to)) continue;
		if (!fitsInHours(hours, witnessStay.from, witnessStay.to)) continue;
		const atScene = {
			placeId: scene.osmId,
			from: Math.max(time - rng.int(1, 3), sceneHours.from),
			to: Math.min(time + rng.int(1, 4), sceneHours.to)
		};
		return { leave, stay, atScene, witnessStay } satisfies AuthorPlan;
	}
	return null;
}

// The false alibi: believed, it would clear the author; a reliable departure contradicts it.
function planLie(
	ctx: Context,
	rng: Random,
	plan: AuthorPlan,
	stayPlace: Place,
	scene: Place,
	time: number
): Segment | null {
	const trip = ctx.travel(stayPlace.osmId, scene.osmId);
	const timeLie = (): Segment | null => {
		for (let tries = 0; tries < 10; tries++) {
			const to = rng.int(Math.max(plan.leave + 1, time - trip + 1), time + 5);
			if (fitsInHours(ctx.hoursOf(stayPlace), plan.stay.from, to)) {
				return { placeId: stayPlace.osmId, from: plan.stay.from, to };
			}
		}
		return null;
	};
	const placeLie = (): Segment | null => {
		const others = ctx.usable.filter((p) => p.osmId !== scene.osmId && p.osmId !== stayPlace.osmId);
		for (const other of rng.shuffle(others)) {
			const from = plan.leave - rng.int(5, 20);
			const to = time + rng.int(0, 10);
			if (from >= 0 && fitsInHours(ctx.hoursOf(other), from, to)) {
				return { placeId: other.osmId, from, to };
			}
		}
		return null;
	};
	return rng.next() < 0.5 ? (timeLie() ?? placeLie()) : (placeLie() ?? timeLie());
}

// What the author says falsely, and who it is about.
interface LiePlan {
	kind: LieKind;
	subject: Character;
	place: Place;
	precision: 'interval' | 'departure';
	from: number;
	to: number;
	// Only the false alibi has a witness who saw the author leave.
	witnessSawAuthor: boolean;
}

// An alibi at a place that is closed at that time and day: only the opening hours betray it.
function planClosedLie(
	ctx: Context,
	rng: Random,
	plan: AuthorPlan,
	scene: Place,
	time: number,
	author: Character
): LiePlan | null {
	const otherDay: DayType = ctx.dayType === 'weekday' ? 'weekend' : 'weekday';
	const others = ctx.usable.filter((place) => place.osmId !== scene.osmId);
	for (const place of rng.shuffle(others)) {
		const from = plan.leave - rng.int(5, 20);
		const to = time + rng.int(0, 10);
		if (from < 0 || fitsInHours(ctx.hoursOf(place), from, to)) continue;
		// Credible: the place opens at that time the other day, or at least opens that day.
		const opensOtherDay = fitsInHours(openingHours(place, ctx.typeOf(place), otherDay), from, to);
		if (!opensOtherDay && ctx.hoursOf(place).length === 0) continue;
		return {
			kind: 'closed',
			subject: author,
			place,
			precision: 'interval',
			from,
			to,
			witnessSawAuthor: false
		};
	}
	return null;
}

// The author says an innocent left earlier than they did, enough to have reached the scene.
function planFramingLie(
	ctx: Context,
	rng: Random,
	scene: Place,
	time: number,
	targets: { character: Character; place: Place; segment: Segment; clue: Fact }[]
): LiePlan | null {
	for (const target of rng.shuffle(targets)) {
		const trip = ctx.travel(target.place.osmId, scene.osmId);
		const earliest = target.segment.from;
		const latest = Math.min(target.segment.to - 1, time - trip);
		if (earliest > latest) continue;
		const left = rng.int(earliest, latest);
		const probe = {
			characterId: target.character.id,
			placeId: target.place.osmId,
			from: left,
			to: left,
			departure: true
		};
		// A reliable fact about the accused must contradict the lie, or nobody could unmask it.
		if (!contradicts(probe, target.clue, ctx.travel)) continue;
		return {
			kind: 'framing',
			subject: target.character,
			place: target.place,
			precision: 'departure',
			from: left,
			to: left,
			witnessSawAuthor: false
		};
	}
	return null;
}

// A true proof from an earlier stay, dated at its end and too far from the mystery time to clear.
function addDistantProofs(
	ctx: Context,
	rng: Random,
	people: Character[],
	facts: Fact[],
	scene: Place,
	time: number,
	difficulty: Difficulty,
	nextId: () => string
) {
	for (const character of people) {
		if (rng.next() >= FAR_PROOF_SHARE[difficulty]) continue;
		const tenseWanted = rng.next() < TENSE_SHARE;
		const next = [...character.segments].sort((a, b) => a.from - b.from)[0];
		const nextPlace = ctx.places.find((place) => place.osmId === next.placeId)!;
		for (const place of rng.shuffle(ctx.usable.filter((p) => p.osmId !== scene.osmId))) {
			const proofIds = ctx
				.clueIdsOf(place)
				.filter((id) => ctx.catalog.clueTypes.find((type) => type.id === id)?.nature === 'proof');
			if (proofIds.length === 0) continue;
			// Far enough not to clear, and early enough to reach the first stay.
			const farEnough = time - ctx.travel(place.osmId, scene.osmId) - 15;
			const walk = ctx.travel(place.osmId, nextPlace.osmId);
			const tenseTo = next.from - walk - rng.int(0, TENSE_MARGIN);
			const tense = tenseWanted && tenseTo <= farEnough;
			const to = tense ? tenseTo : Math.min(farEnough, next.from - walk - 10) - rng.int(0, 30);
			const from = to - rng.int(10, 40);
			if (from < 0 || !fitsInHours(ctx.hoursOf(place), from, to)) continue;

			const clueType = ctx.catalog.clueTypes.find((type) => type.id === rng.pick(proofIds))!;
			const proof: Fact = {
				id: nextId(),
				characterId: character.id,
				placeId: place.osmId,
				from: to,
				to,
				departure: true,
				segment: character.segments.length,
				unlockedBy: null,
				source: {
					kind: 'clue',
					clueTypeId: clueType.id,
					renderedText: renderTemplate(clueType.textTemplate, {
						firstName: character.firstName,
						place: place.name,
						time: formatTime(to),
						from: formatTime(to),
						to: formatTime(to)
					})
				}
			};
			// A tense stay is followed by the person's own word on arriving at the next one.
			const arrival = tense
				? testimonyFact(ctx, rng, {
						id: nextId(),
						speaker: character,
						subject: character,
						place: nextPlace,
						precision: 'instant',
						from: next.from,
						to: next.from,
						segment: character.segments.indexOf(next),
						unlockedBy: null
					})
				: null;
			// Never contradict another fact of this person, the lie included.
			const added = arrival ? [proof, arrival] : [proof];
			if (
				facts.some(
					(fact) =>
						fact.characterId === character.id &&
						added.some((candidate) => contradicts(fact, candidate, ctx.travel))
				)
			) {
				continue;
			}
			character.segments.push({ placeId: place.osmId, from, to });
			facts.push(...added);
			break;
		}
	}
}

function renderTestimony(
	ctx: Context,
	rng: Random,
	precision: TestimonyPrecision,
	subject: TestimonySubject,
	values: Record<string, string>
) {
	const options = ctx.catalog.testimonyTemplates.filter(
		(template) => template.precision === precision && template.subject === subject
	);
	return renderTemplate(rng.pick(options).textTemplate, values);
}

// Instant inside the stay and close enough to the mystery time to clear the suspect.
function clearingInstant(rng: Random, segment: Segment, trip: number, time: number) {
	return rng.int(Math.max(segment.from, time - trip + 1), Math.min(segment.to, time + trip - 1));
}

function clueFact(
	ctx: Context,
	rng: Random,
	id: string,
	character: Character,
	place: Place,
	segment: Segment,
	segmentIndex: number,
	scene: Place,
	time: number,
	unlockedBy: string | null = null
): Fact | null {
	const trip = ctx.travel(place.osmId, scene.osmId);
	// A proof is dated at the end of the stay: it only clears the suspect if that end is near.
	const options = ctx.catalog.clueTypes.filter(
		(type) =>
			ctx.clueIdsOf(place).includes(type.id) &&
			(type.nature !== 'proof' || Math.abs(segment.to - time) < trip)
	);
	if (options.length === 0) return null;
	const clueType = rng.pick(options);
	const proof = clueType.nature === 'proof';
	const instant = clueType.precision === 'instant';
	const from = proof
		? segment.to
		: instant
			? clearingInstant(rng, segment, trip, time)
			: segment.from;
	const to = instant ? from : segment.to;
	return {
		id,
		characterId: character.id,
		placeId: place.osmId,
		from,
		to,
		departure: proof,
		segment: segmentIndex,
		unlockedBy,
		source: {
			kind: 'clue',
			clueTypeId: clueType.id,
			renderedText: renderTemplate(clueType.textTemplate, {
				firstName: character.firstName,
				place: place.name,
				time: formatTime(from),
				from: formatTime(from),
				to: formatTime(to)
			})
		}
	};
}

interface TestimonyArgs {
	id: string;
	speaker: Character;
	subject: Character;
	place: Place;
	precision: TestimonyPrecision;
	from: number;
	to: number;
	segment: number | null;
	unlockedBy: string | null;
	lie?: LieMotive;
	lieKind?: LieKind;
}

function testimonyFact(ctx: Context, rng: Random, args: TestimonyArgs): Fact {
	const { speaker, subject, place, from, to } = args;
	const text = renderTestimony(
		ctx,
		rng,
		args.precision,
		speaker.id === subject.id ? 'self' : 'other',
		{
			speaker: speaker.firstName,
			firstName: subject.firstName,
			place: place.name,
			time: formatTime(from),
			from: formatTime(from),
			to: formatTime(to)
		}
	);
	return {
		id: args.id,
		characterId: subject.id,
		placeId: place.osmId,
		from,
		to,
		departure: args.precision === 'departure',
		segment: args.segment,
		unlockedBy: args.unlockedBy,
		source: {
			kind: 'testimony',
			speakerId: speaker.id,
			renderedText: text,
			lie: args.lie !== undefined,
			motive: args.lie ?? null,
			lieKind: args.lieKind ?? null
		}
	};
}

// What a testimony says about a stay, in the given precision.
function statement(
	rng: Random,
	precision: TestimonyPrecision,
	segment: Segment,
	trip: number,
	time: number
) {
	if (precision === 'interval') return { from: segment.from, to: segment.to };
	if (precision === 'departure') return { from: segment.to, to: segment.to };
	const at = clearingInstant(rng, segment, trip, time);
	return { from: at, to: at };
}

function clearsSuspect(
	precision: TestimonyPrecision,
	segment: Segment,
	trip: number,
	time: number
) {
	return precision !== 'departure' || Math.abs(segment.to - time) < trip;
}

function buildCandidate(
	ctx: Context,
	rng: Random,
	setting: Setting,
	options: GenerationOptions
): Investigation | null {
	const { scenario, scene, time } = setting;
	const { difficulty } = options;
	const motive = rng.pick(scenario.lieMotives);
	// The objects of the prank: distinct items among those the scenario accepts.
	const itemPool = ctx.catalog.items.filter((item) =>
		item.tags.some((tag) => scenario.itemTags.includes(tag))
	);
	const items = rng
		.shuffle(itemPool)
		.slice(0, rng.int(scenario.itemCount.min, scenario.itemCount.max));
	const clueCapable = ctx.usable.filter(
		(place) => place.osmId !== scene.osmId && ctx.clueIdsOf(place).length > 0
	);

	// Suspects, in role order: author, witness, other cleared by a clue, then the chain.
	const names = rng.shuffle(ctx.catalog.firstNames).slice(0, difficulty + 2);
	const people: Character[] = names.map((firstName, i) => ({
		id: `c${i + 1}`,
		firstName,
		author: i === 0,
		segments: []
	}));
	const [author, witness, other, ...chain] = people;

	// The author and the witness share a place where the author leaves before the mystery.
	let stayPlace: Place | null = null;
	let plan: AuthorPlan | null = null;
	for (const place of rng.shuffle(clueCapable)) {
		plan = planAuthor(ctx, rng, place, scene, time);
		if (plan) {
			stayPlace = place;
			break;
		}
	}
	if (!stayPlace || !plan) return null;

	let otherPlace: Place | null = null;
	let otherSegment: Segment | null = null;
	for (const place of rng.shuffle(clueCapable)) {
		otherSegment = nearSegment(ctx, rng, place, scene, time);
		if (otherSegment) {
			otherPlace = place;
			break;
		}
	}
	if (!otherPlace || !otherSegment) return null;

	author.segments = [plan.stay, plan.atScene];
	witness.segments = [plan.witnessStay];
	other.segments = [otherSegment];

	const facts: Fact[] = [];
	let counter = 0;
	const nextId = () => `f${++counter}`;
	const tripOf = (place: Place) => ctx.travel(place.osmId, scene.osmId);

	const witnessClue = clueFact(
		ctx,
		rng,
		nextId(),
		witness,
		stayPlace,
		plan.witnessStay,
		0,
		scene,
		time
	);
	const otherClue = clueFact(ctx, rng, nextId(), other, otherPlace, otherSegment, 0, scene, time);
	if (!witnessClue || !otherClue) return null;
	facts.push(witnessClue, otherClue);

	const cleared: Innocent[] = [
		{
			character: witness,
			place: stayPlace,
			segment: plan.witnessStay,
			clearingFactId: witnessClue.id
		},
		{ character: other, place: otherPlace, segment: otherSegment, clearingFactId: otherClue.id }
	];

	// How the author lies, among the kinds the difficulty allows (the false alibi when easy).
	let liePlan: LiePlan | null = null;
	for (const kind of rng.shuffle(LIE_KINDS[difficulty])) {
		if (kind === 'alibi') {
			const lie = planLie(ctx, rng, plan, stayPlace, scene, time);
			const place = lie && ctx.places.find((candidate) => candidate.osmId === lie.placeId);
			if (lie && place) {
				liePlan = {
					kind,
					subject: author,
					place,
					precision: 'interval',
					from: lie.from,
					to: lie.to,
					witnessSawAuthor: true
				};
			}
		} else if (kind === 'closed') {
			liePlan = planClosedLie(ctx, rng, plan, scene, time, author);
		} else {
			liePlan = planFramingLie(ctx, rng, scene, time, [
				{ character: witness, place: stayPlace, segment: plan.witnessStay, clue: witnessClue },
				{ character: other, place: otherPlace, segment: otherSegment, clue: otherClue }
			]);
		}
		if (liePlan) break;
	}
	if (!liePlan) return null;

	// For the false alibi only: the witness saw the author leave, which contradicts it.
	if (liePlan.witnessSawAuthor) {
		facts.push(
			testimonyFact(ctx, rng, {
				id: nextId(),
				speaker: witness,
				subject: author,
				place: stayPlace,
				precision: 'departure',
				from: plan.leave,
				to: plan.leave,
				segment: 0,
				unlockedBy: witnessClue.id
			})
		);
	}
	facts.push(
		testimonyFact(ctx, rng, {
			id: nextId(),
			speaker: author,
			subject: liePlan.subject,
			place: liePlan.place,
			precision: liePlan.precision,
			from: liePlan.from,
			to: liePlan.to,
			segment: null,
			unlockedBy: null,
			lie: motive,
			lieKind: liePlan.kind
		})
	);

	// Each further suspect is cleared only by the testimony of the previous one.
	let previous = rng.pick(cleared);
	for (const character of chain) {
		const { place, segment: stay } = previous;
		const around = clamp(time, stay.from, stay.to);
		const from = Math.max(stay.from, around - rng.int(3, 25));
		const to = Math.min(stay.to, around + rng.int(3, 25));
		const segment = to > from ? { placeId: place.osmId, from, to } : stay;
		character.segments = [segment];

		const trip = tripOf(place);
		const precisions = (['interval', 'instant', 'departure'] as const).filter((precision) =>
			clearsSuspect(precision, segment, trip, time)
		);
		const precision = rng.pick(precisions);
		const said = statement(rng, precision, segment, trip, time);
		const fact = testimonyFact(ctx, rng, {
			id: nextId(),
			speaker: previous.character,
			subject: character,
			place,
			precision,
			...said,
			segment: 0,
			unlockedBy: previous.clearingFactId
		});
		facts.push(fact);
		previous = { character, place, segment, clearingFactId: fact.id };
		cleared.push(previous);
	}

	// Every cleared suspect also speaks about their own evening.
	for (const { character, place, segment } of cleared) {
		const precision = rng.pick(['interval', 'instant', 'departure'] as const);
		const at = rng.int(segment.from, segment.to);
		const said =
			precision === 'instant' ? { from: at, to: at } : statement(rng, precision, segment, 1, time);
		facts.push(
			testimonyFact(ctx, rng, {
				id: nextId(),
				speaker: character,
				subject: character,
				place,
				precision,
				...said,
				segment: 0,
				unlockedBy: null
			})
		);
	}

	addDistantProofs(ctx, rng, people, facts, scene, time, difficulty, nextId);

	const placeIds = [
		...new Set([
			scene.osmId,
			liePlan.place.osmId,
			...people.flatMap((person) => person.segments.map((segment) => segment.placeId))
		])
	];

	return {
		seed: options.seed,
		difficulty,
		mysteryTime: time,
		dayType: ctx.dayType,
		scenarioId: scenario.id,
		itemIds: items.map((item) => item.id),
		situationText: renderSituation(scenario, items, scene.name, time, ctx.dayType),
		revelationText: renderRevelation(scenario, motive, items, author.firstName, scene.name),
		sceneId: scene.osmId,
		placeIds,
		characters: rng.shuffle(people),
		facts: rng.shuffle(facts),
		routes: ctx.routes.filter(
			(route) => placeIds.includes(route.placeA) && placeIds.includes(route.placeB)
		)
	};
}

function isValid(investigation: Investigation, ctx: Context): boolean {
	const ruleContext: RuleContext = { places: ctx.places, routes: ctx.routes, catalog: ctx.catalog };
	if (checkRules(investigation, ruleContext).length > 0) return false;
	return solve(toSolverInput(investigation, ctx.travel)).difficulty === investigation.difficulty;
}

// Adds a clue for each suspect the solver cannot clear yet, when a place allows it.
export function repairInvestigation(
	investigation: Investigation,
	context: RuleContext
): Investigation | null {
	const ctx = createContext(context.places, context.routes, context.catalog, investigation.dayType);
	const scene = ctx.places.find((place) => place.osmId === investigation.sceneId)!;
	const { possible } = solve(toSolverInput(investigation, ctx.travel));
	const rng = createRandom(deriveSeed(investigation.seed, 1000));
	const added: Fact[] = [];

	for (const character of investigation.characters) {
		if (character.author || !possible.includes(character.id)) continue;
		const trip = (place: Place) => ctx.travel(place.osmId, scene.osmId);
		let clue: Fact | null = null;
		character.segments.some((segment, index) => {
			const place = ctx.places.find((p) => p.osmId === segment.placeId)!;
			const distance = Math.max(
				segment.from - investigation.mysteryTime,
				investigation.mysteryTime - segment.to,
				0
			);
			if (place.osmId === scene.osmId || distance >= trip(place)) return false;
			clue = clueFact(
				ctx,
				rng,
				`r${added.length + 1}`,
				character,
				place,
				segment,
				index,
				scene,
				investigation.mysteryTime
			);
			return clue !== null;
		});
		if (!clue) return null;
		added.push(clue);
	}
	return added.length === 0
		? null
		: { ...investigation, facts: [...investigation.facts, ...added] };
}

export function generateInvestigation(
	places: Place[],
	routes: Route[],
	catalog: Catalog,
	options: GenerationOptions
): GenerationResult {
	assertCompleteMatrix(places, routes);
	const base = createContext(places, routes, catalog);
	let foundSetting = false;

	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		const rng = createRandom(deriveSeed(options.seed, attempt));
		const setting = chooseSetting(base, rng);
		if (!setting) break;
		foundSetting = true;

		let candidate = buildCandidate(forDay(base, setting.dayType), rng, setting, options);
		if (candidate && !isValid(candidate, base)) {
			candidate = repairInvestigation(candidate, { places, routes, catalog }) ?? candidate;
		}
		if (candidate && isValid(candidate, base)) return { ok: true, investigation: candidate };
	}
	return { ok: false, reason: foundSetting ? 'difficulty-unreachable' : 'no-scene' };
}
