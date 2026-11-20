import { generateInvestigation } from '../engine/generate';
import { haversineM } from '../engine/pedestrian';
import type { GraphCell } from '../engine/pedestrian';
import type { Catalog, Investigation, Place, Route } from '../engine/types';
import { toPlaces, type RawPlace } from '../data/places';
import type { Manifest } from '../data/files';
import { cellsCovering, zoneBounds } from '../map/zone';
import { checkAccusation } from './discovery';
import type { Evening } from './evening';
import { accuse, initialProgress, measureRoute, openPlace, type GameProgress } from './progress';
import { factsOfPlaces, project } from './projection';
import type {
	DecorPlace,
	FailureReason,
	Reply,
	Request,
	Revelation,
	SessionView
} from './protocol';
import { dataChanged, dataVersionOf } from './save';
import { buildZone, RADII_M } from './zone';

// Where the game data comes from (the real one reads files; tests give their own).
export interface DataSource {
	manifest(): Promise<Manifest>;
	places(cells: string[]): Promise<RawPlace[]>;
	graph(cells: string[]): Promise<GraphCell[]>;
}

export interface SessionDeps {
	catalog: Catalog;
	source: DataSource;
	computeRoutes(places: Place[], graph: GraphCell[]): Route[];
}

// Everything of a game in progress, hidden parts included: it never leaves the Worker.
export interface Session {
	catalog: Catalog;
	investigation: Investigation;
	places: Place[];
	routes: Route[];
	progress: GameProgress;
}

type StartRequest = Extract<Request, { type: 'start' }>;
type ResumeRequest = Extract<Request, { type: 'resume' }>;
type PlayRequest = Exclude<Request, StartRequest | ResumeRequest>;
type Failure = { ok: false; reply: Extract<Reply, { type: 'failed' }> };

// Places of the zone are read once more per radius step (a bit more of the map each time).
const GRAPH_MARGIN_M = 1000;

const pairOf = (route: Route) => [route.placeA, route.placeB].sort().join('|');

function evening(session: Session): Evening {
	const places: Evening['places'] = {};
	const used = new Set<string>();
	const characters = session.investigation.characters.map((character) => {
		for (const segment of character.segments) used.add(segment.placeId);
		return { id: character.id, firstName: character.firstName, stays: character.segments };
	});
	for (const place of session.places) if (used.has(place.osmId)) places[place.osmId] = place;
	const routes = session.routes.filter((route) => used.has(route.placeA) && used.has(route.placeB));
	return { places, characters, routes };
}

function revelation(session: Session, suspectId: string): Revelation {
	const { correct, authorName } = checkAccusation(session.investigation, suspectId);
	return {
		correct,
		authorName,
		revelationText: session.investigation.revelationText,
		evening: evening(session),
		facts: factsOfPlaces(session.investigation, session.investigation.placeIds),
		trips: session.routes.filter(
			(route) =>
				session.investigation.placeIds.includes(route.placeA) &&
				session.investigation.placeIds.includes(route.placeB)
		)
	};
}

function failure(reason: FailureReason): Failure {
	return { ok: false, reply: { type: 'failed', reason } };
}

function viewOf(
	session: Session,
	decor: DecorPlace[],
	radiusM: number,
	dataVersion: string
): SessionView {
	const { investigation, progress } = session;
	const measuredPairs = new Set(progress.measuredRoutes.map(([a, b]) => `${a}|${b}`));
	return {
		investigation: project(investigation, session.places),
		decor,
		radiusM,
		dataVersion,
		progress,
		facts: factsOfPlaces(investigation, progress.openedPlaceIds),
		measured: session.routes.filter((route) => measuredPairs.has(pairOf(route))),
		revelation: progress.accusation ? revelation(session, progress.accusation) : null
	};
}

export type StartResult = { ok: true; session: Session; view: SessionView } | Failure;

// Loads the zone, calculates the routes and generates the investigation, from a new game
// or from a save (same seed, same data: same investigation).
export async function startSession(
	deps: SessionDeps,
	request: StartRequest | ResumeRequest
): Promise<StartResult> {
	return load(deps, request);
}

async function load(
	deps: SessionDeps,
	request: StartRequest | ResumeRequest
): Promise<StartResult> {
	const { center, difficulty, seed } =
		request.type === 'start' ? request : { center: request.saved.zone.center, ...request.saved };
	const { catalog, source } = deps;

	let manifest: Manifest;
	try {
		manifest = await source.manifest();
	} catch {
		return failure('data-missing');
	}
	const dataVersion = dataVersionOf(manifest);
	if (request.type === 'resume' && dataChanged(request.saved, dataVersion)) {
		return failure('data-changed');
	}

	// Widen the area read from the files until the zone is complete for its radius.
	let raw: RawPlace[] = [];
	let zone = buildZone([], catalog, center);
	for (const [step, radius] of RADII_M.entries()) {
		const [[minLon, minLat], [maxLon, maxLat]] = zoneBounds(
			{ minLat: center.lat, minLon: center.lon, maxLat: center.lat, maxLon: center.lon },
			radius + GRAPH_MARGIN_M
		);
		raw = await source.places(cellsCovering(manifest.grid, { minLat, minLon, maxLat, maxLon }));
		zone = buildZone(toPlaces(raw, catalog), catalog, center);
		if (zone.ok && zone.radiusM <= radius) break;
		if (step === RADII_M.length - 1) break;
	}
	// A save whose centre has no data (another commune than the one shipped) cannot be replayed.
	if (!zone.ok) return failure(request.type === 'resume' ? 'data-changed' : 'not-enough-places');

	const lats = zone.places.map((place) => place.lat);
	const lons = zone.places.map((place) => place.lon);
	const [[minLon, minLat], [maxLon, maxLat]] = zoneBounds(
		{
			minLat: Math.min(...lats),
			minLon: Math.min(...lons),
			maxLat: Math.max(...lats),
			maxLon: Math.max(...lons)
		},
		GRAPH_MARGIN_M
	);
	const graph = await source.graph(
		cellsCovering(manifest.grid, { minLat, minLon, maxLat, maxLon })
	);
	const routes = deps.computeRoutes(zone.places, graph);

	const generated = generateInvestigation(zone.places, routes, catalog, { seed, difficulty });
	if (!generated.ok) return failure(generated.reason);

	const progress =
		request.type === 'resume'
			? request.saved.progress
			: initialProgress(generated.investigation.characters.map((character) => character.id));
	const session: Session = {
		catalog,
		investigation: generated.investigation,
		places: zone.places,
		routes,
		progress
	};

	const hours = new Map(
		raw.filter((place) => place.openingHours).map((place) => [place.osmId, place.openingHours!])
	);
	const decor = toPlaces(raw, catalog)
		.filter((place) => !place.removed && haversineM(center, place) <= zone.radiusM + GRAPH_MARGIN_M)
		.map((place) => ({
			osmId: place.osmId,
			name: place.name,
			typeId: place.typeId,
			lat: place.lat,
			lon: place.lon,
			...(hours.has(place.osmId) ? { hours: hours.get(place.osmId) } : {})
		}));
	return { ok: true, session, view: viewOf(session, decor, zone.radiusM, dataVersion) };
}

// One action of the player on a game in progress.
export function handle(session: Session, request: PlayRequest): { session: Session; reply: Reply } {
	const { investigation, progress } = session;
	const refuse = (reason: string) => ({ session, reply: { type: 'refused', reason } as Reply });
	const retained = (id: string) => investigation.placeIds.includes(id);

	if (request.type === 'open') {
		if (!retained(request.placeId)) return refuse('unknown place');
		return {
			session: { ...session, progress: openPlace(progress, request.placeId) },
			reply: {
				type: 'opened',
				placeId: request.placeId,
				facts: factsOfPlaces(investigation, [request.placeId])
			}
		};
	}
	if (request.type === 'measure') {
		if (!retained(request.a) || !retained(request.b) || request.a === request.b) {
			return refuse('trips are measured between two places of the investigation');
		}
		const wanted = [request.a, request.b].sort().join('|');
		const route = session.routes.find((candidate) => pairOf(candidate) === wanted)!;
		return {
			session: { ...session, progress: measureRoute(progress, request.a, request.b) },
			reply: { type: 'measured', route }
		};
	}
	if (progress.accusation !== null) return refuse('already accused');
	if (!investigation.characters.some((character) => character.id === request.suspectId)) {
		return refuse('not a suspect');
	}
	const next = { ...session, progress: accuse(progress, request.suspectId) };
	return {
		session: next,
		reply: { type: 'accused', revelation: revelation(next, request.suspectId) }
	};
}
