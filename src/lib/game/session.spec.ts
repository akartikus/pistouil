import { describe, it, expect } from 'vitest';
import { handle, startSession, type DataSource, type SessionDeps } from './session';
import { dataVersionOf } from './save';
import { validateCatalog } from '../engine/catalog';
import { rawStarterCatalog, richSpecs } from '../engine/fixtures';
import { estimateRoutes } from '../playground/real-places';
import type { RawPlace } from '../data/places';
import { OutsideZone } from '../data/files';
import type { Request } from './protocol';

const catalog = validateCatalog(structuredClone(rawStarterCatalog));
const HIDDEN_KEYS = ['author', 'lie', 'motive', 'lieKind', 'segments', 'revelationText'];
const manifest = {
	source: 'test.osm.pbf',
	extractDate: '2026-11-14T21:20:00Z',
	grid: { latStepE5: 1800, lonStepE5: 2500 }
};
const center = { lat: 43.4436, lon: 5.5548 };

// The fictional places of the engine fixtures, laid out around Fuveau (metres to degrees).
const raw: RawPlace[] = richSpecs.map(([osmId, name, type, x, y], i) => ({
	osmId,
	name,
	type,
	lat: 43.44 + y / 111195,
	lon: 5.55 + x / (111195 * Math.cos((43.44 * Math.PI) / 180)),
	...(i === richSpecs.length - 1 ? { removed: true } : {}),
	...(type === 'cafe' ? { openingHours: 'Mo-Sa 07:00-20:00' } : {})
}));

const source = (places: RawPlace[] = raw, overrides: Partial<DataSource> = {}): DataSource => ({
	manifest: async () => manifest,
	communes: async () => [
		{ name: 'Fuveau', insee: '13040', center },
		{ name: 'Rousset', insee: '13086', center: { lat: 43.48, lon: 5.62 } }
	],
	places: async () => places,
	graph: async () => [],
	...overrides
});

const deps = (data: DataSource = source()): SessionDeps => ({
	catalog,
	source: data,
	computeRoutes: (places) => estimateRoutes(places)
});

const startRequest = (seed = 5, difficulty: 1 | 2 | 3 = 2): Request => ({
	type: 'start',
	center,
	name: 'Fuveau',
	difficulty,
	seed
});

async function started(seed = 5) {
	const result = await startSession(
		deps(),
		startRequest(seed) as Extract<Request, { type: 'start' }>
	);
	if (!result.ok) throw new Error(result.reply.reason);
	return result;
}

const keysOf = (value: unknown): string[] =>
	Array.isArray(value)
		? value.flatMap(keysOf)
		: value && typeof value === 'object'
			? Object.entries(value).flatMap(([key, inner]) => [key, ...keysOf(inner)])
			: [];

describe('startSession', () => {
	it('gives the interface a view with nothing hidden', async () => {
		const { view } = await started();
		expect(view.revelation).toBeNull();
		expect(view.facts).toEqual([]);
		expect(view.progress.openedPlaceIds).toEqual([]);
		expect(view.decor.length).toBeGreaterThan(view.investigation.places.length);
		const keys = keysOf(view);
		for (const hidden of HIDDEN_KEYS) expect(keys).not.toContain(hidden);
	});

	it('keeps the raw opening hours of a place for the decor', async () => {
		const { view } = await started();
		expect(view.decor.find((place) => place.typeId === 'cafe')?.hours).toBe('Mo-Sa 07:00-20:00');
	});

	it('retains at most 40 places and numbers them', async () => {
		const { view } = await started();
		expect(view.investigation.places.length).toBeLessThanOrEqual(40);
		expect(view.investigation.places[0].number).toBe(1);
	});

	it('fails with neighbouring communes when the zone is too empty', async () => {
		const request = { ...startRequest(), insee: '13040' } as Extract<Request, { type: 'start' }>;
		const result = await startSession(deps(source([])), request);
		expect(result).toMatchObject({
			ok: false,
			reply: { type: 'failed', reason: 'not-enough-places' }
		});
		if (result.ok) return;
		if (result.reply.type !== 'failed') throw new Error('expected a failure');
		expect(result.reply.neighbors.map((commune) => commune.name)).toEqual(['Rousset']);
	});

	it('fails when the data is missing', async () => {
		const data = source(raw, { manifest: async () => Promise.reject(new Error('no manifest')) });
		const result = await startSession(
			deps(data),
			startRequest() as Extract<Request, { type: 'start' }>
		);
		expect(result).toMatchObject({ ok: false, reply: { reason: 'data-missing' } });
	});
});

describe('open', () => {
	it('gives the facts of the place and notes it as opened', async () => {
		const { session, view } = await started();
		const placeId = view.investigation.places[0].osmId;
		const { session: next, reply } = handle(session, { type: 'open', placeId });
		if (reply.type !== 'opened') throw new Error('expected opened');
		expect(reply.facts.every((fact) => fact.placeId === placeId)).toBe(true);
		expect(next.progress.openedPlaceIds).toEqual([placeId]);
		const again = handle(next, { type: 'open', placeId });
		expect(again.session.progress.openedPlaceIds).toEqual([placeId]);
	});

	it('refuses a place that is not part of the investigation', async () => {
		const { session } = await started();
		expect(handle(session, { type: 'open', placeId: 'nowhere' }).reply.type).toBe('refused');
	});
});

describe('measure', () => {
	it('gives the route between two retained places and notes it as measured', async () => {
		const { session, view } = await started();
		const [a, b] = view.investigation.places.map((place) => place.osmId);
		const { session: next, reply } = handle(session, { type: 'measure', a: b, b: a });
		if (reply.type !== 'measured') throw new Error('expected measured');
		expect(new Set([reply.route.placeA, reply.route.placeB])).toEqual(new Set([a, b]));
		expect(reply.route.minutes).toBeGreaterThanOrEqual(1);
		expect(next.progress.measuredRoutes).toHaveLength(1);
	});

	it('refuses a place outside the investigation, or the same place twice', async () => {
		const { session, view } = await started();
		const a = view.investigation.places[0].osmId;
		expect(handle(session, { type: 'measure', a, b: 'nowhere' }).reply.type).toBe('refused');
		expect(handle(session, { type: 'measure', a, b: a }).reply.type).toBe('refused');
	});
});

describe('accuse', () => {
	it('reveals the verdict, the author, the text and the evening, once', async () => {
		const { session, view } = await started();
		const suspect = view.investigation.suspects[0].id;
		const { session: next, reply } = handle(session, { type: 'accuse', suspectId: suspect });
		if (reply.type !== 'accused') throw new Error('expected accused');
		expect(typeof reply.revelation.correct).toBe('boolean');
		expect(reply.revelation.revelationText.length).toBeGreaterThan(0);
		expect(reply.revelation.evening.characters).toHaveLength(view.investigation.suspects.length);
		const count = view.investigation.places.length;
		expect(reply.revelation.trips).toHaveLength((count * (count - 1)) / 2);
		expect(next.progress.accusation).toBe(suspect);
		const other = view.investigation.suspects[1].id;
		expect(handle(next, { type: 'accuse', suspectId: other }).reply.type).toBe('refused');
		expect(handle(next, { type: 'accuse', suspectId: other }).session.progress.accusation).toBe(
			suspect
		);
	});

	it('reveals the facts of every place, those the player never opened included', async () => {
		const { session, view } = await started();
		expect(view.facts).toEqual([]);
		const suspect = view.investigation.suspects[0].id;
		const { reply } = handle(session, { type: 'accuse', suspectId: suspect });
		if (reply.type !== 'accused') throw new Error('expected accused');
		const everything = session.investigation.facts.map((fact) => fact.id).sort();
		expect(reply.revelation.facts.map((fact) => fact.id).sort()).toEqual(everything);
		expect(everything.length).toBeGreaterThan(0);
	});

	it('refuses an accusation of someone who is not a suspect', async () => {
		const { session } = await started();
		expect(handle(session, { type: 'accuse', suspectId: 'nobody' }).reply.type).toBe('refused');
	});
});

describe('hidden data', () => {
	it('never crosses before the accusation', async () => {
		const { session, view } = await started();
		const replies: unknown[] = [view];
		let current = session;
		for (const place of view.investigation.places) {
			const step = handle(current, { type: 'open', placeId: place.osmId });
			replies.push(step.reply);
			current = step.session;
		}
		const [a, b] = view.investigation.places;
		replies.push(handle(current, { type: 'measure', a: a.osmId, b: b.osmId }).reply);
		const text = JSON.stringify(replies);
		for (const hidden of HIDDEN_KEYS) expect(text).not.toContain(`"${hidden}"`);
	});
});

describe('resume', () => {
	it('restores the same investigation and the progress', async () => {
		const { session, view } = await started();
		const a = view.investigation.places[0].osmId;
		const b = view.investigation.places[1].osmId;
		const opened = handle(handle(session, { type: 'open', placeId: a }).session, {
			type: 'measure',
			a,
			b
		});
		const saved = {
			version: 1,
			seed: 5,
			difficulty: 2 as const,
			zone: { center, radiusM: view.radiusM, name: 'Fuveau' },
			dataVersion: dataVersionOf(manifest),
			progress: opened.session.progress
		};
		const result = await startSession(deps(), { type: 'resume', saved });
		if (!result.ok) throw new Error(result.reply.type);
		expect(result.view.investigation).toEqual(view.investigation);
		expect(result.view.progress).toEqual(saved.progress);
		expect(result.view.facts.every((fact) => fact.placeId === a)).toBe(true);
		expect(result.view.measured).toHaveLength(1);
		expect(result.view.revelation).toBeNull();
	});

	it('says the data changed instead of replaying another investigation', async () => {
		const { view } = await started();
		const saved = {
			version: 1,
			seed: 5,
			difficulty: 2 as const,
			zone: { center, radiusM: view.radiusM, name: 'Fuveau' },
			dataVersion: 'older@2020',
			progress: view.progress
		};
		const result = await startSession(deps(), { type: 'resume', saved });
		expect(result).toMatchObject({ ok: false, reply: { reason: 'data-changed' } });
	});

	it('gives the revelation again for an investigation already concluded', async () => {
		const { session, view } = await started();
		const suspect = view.investigation.suspects[0].id;
		const done = handle(session, { type: 'accuse', suspectId: suspect });
		const saved = {
			version: 1,
			seed: 5,
			difficulty: 2 as const,
			zone: { center, radiusM: view.radiusM, name: 'Fuveau' },
			dataVersion: dataVersionOf(manifest),
			progress: done.session.progress
		};
		const result = await startSession(deps(), { type: 'resume', saved });
		if (!result.ok) throw new Error(result.reply.type);
		expect(result.view.revelation?.revelationText.length).toBeGreaterThan(0);
	});
});

describe('offline mode', () => {
	const zone = { insee: '13040', cells: [] };
	const offlineStart = { ...startRequest(), zone } as Extract<Request, { type: 'start' }>;

	it('plays from the downloaded zone like from the network', async () => {
		const result = await startSession(deps(), offlineStart);
		expect(result.ok).toBe(true);
	});

	it('does not widen the zone beyond 2 km', async () => {
		// Two scenes nearby, the other usable places 3.5 km away.
		const far = raw.map((place, i) =>
			i < 2 ? place : { ...place, lat: place.lat + 3500 / 111195 }
		);
		const online = await startSession(deps(source(far)), startRequest() as typeof offlineStart);
		expect(online).toMatchObject({ ok: true, view: { radiusM: 4000 } });
		const offline = await startSession(deps(source(far)), offlineStart);
		expect(offline).toMatchObject({ ok: false, reply: { reason: 'not-enough-places' } });
	});

	it('asks for a connection when a cell is outside the downloaded zone', async () => {
		const outside = source(raw, {
			places: async () => Promise.reject(new OutsideZone())
		});
		const result = await startSession(deps(outside), offlineStart);
		expect(result).toMatchObject({ ok: false, reply: { reason: 'needs-connection' } });
	});

	it('asks for a connection rather than replaying a 4 km investigation with fewer places', async () => {
		const { view } = await started();
		const saved = {
			version: 1,
			seed: 5,
			difficulty: 2 as const,
			zone: { center, radiusM: 4000, name: 'Fuveau' },
			dataVersion: dataVersionOf(manifest),
			progress: view.progress
		};
		const result = await startSession(deps(), { type: 'resume', saved, zone });
		expect(result).toMatchObject({ ok: false, reply: { reason: 'needs-connection' } });
	});
});
