import { describe, it, expect } from 'vitest';
import { generateInvestigation, repairInvestigation } from './generate';
import { validateCatalog } from './catalog';
import { checkRules } from './rules';
import { solve, toSolverInput } from './solver';
import { createTravelTime } from './routes';
import {
	fixturePlaces,
	fixtureRoutes,
	rawStarterCatalog,
	richPlaces,
	richRoutes
} from './fixtures';
import type { Difficulty, Investigation } from './types';

const catalog = validateCatalog(structuredClone(rawStarterCatalog));
const difficulties: Difficulty[] = [1, 2, 3];

function generate(seed: number, difficulty: Difficulty): Investigation {
	const result = generateInvestigation(fixturePlaces, fixtureRoutes, catalog, { seed, difficulty });
	if (!result.ok) throw new Error(`seed ${seed}, difficulty ${difficulty}: ${result.reason}`);
	return result.investigation;
}

describe('generateInvestigation', () => {
	it('gives the same investigation for the same inputs', () => {
		expect(generate(7, 2)).toEqual(generate(7, 2));
	});

	it('gives different investigations for different seeds', () => {
		expect(generate(1, 1)).not.toEqual(generate(2, 1));
	});

	it('rejects an incomplete route matrix', () => {
		expect(() =>
			generateInvestigation(fixturePlaces, fixtureRoutes.slice(1), catalog, {
				seed: 1,
				difficulty: 1
			})
		).toThrow(/Missing route/);
	});

	it('creates difficulty + 2 suspects', () => {
		for (const difficulty of difficulties) {
			expect(generate(3, difficulty).characters).toHaveLength(difficulty + 2);
		}
	});

	it('puts the author on the scene at the mystery time with realistic evenings', () => {
		const travel = createTravelTime(fixtureRoutes);
		for (let seed = 1; seed <= 50; seed++) {
			const investigation = generate(seed, 2);
			const author = investigation.characters.find((c) => c.author)!;
			expect(
				author.segments.some(
					(s) =>
						s.placeId === investigation.sceneId &&
						s.from <= investigation.mysteryTime &&
						investigation.mysteryTime <= s.to
				)
			).toBe(true);
			for (const character of investigation.characters) {
				const [first, second] = character.segments;
				if (second)
					expect(second.from - first.to).toBeGreaterThanOrEqual(
						travel(first.placeId, second.placeId)
					);
			}
		}
	});

	it('derives every true fact from a segment', () => {
		const investigation = generate(11, 3);
		for (const fact of investigation.facts) {
			const lie = fact.source.kind === 'testimony' && fact.source.lie;
			expect(fact.segment === null).toBe(lie);
		}
	});

	it('makes exactly one lie, by the author, with a motive of the scenario', () => {
		for (let seed = 1; seed <= 50; seed++) {
			const investigation = generate(seed, 1);
			const scenario = catalog.scenarios.find((s) => s.id === investigation.scenarioId)!;
			const author = investigation.characters.find((c) => c.author)!;
			const lies = investigation.facts.flatMap((fact) =>
				fact.source.kind === 'testimony' && fact.source.lie ? [fact.source] : []
			);
			expect(lies).toHaveLength(1);
			expect(lies[0].speakerId).toBe(author.id);
			expect(scenario.lieMotives).toContain(lies[0].motive);
		}
	});

	it('never signals the lie in a text', () => {
		for (let seed = 1; seed <= 50; seed++) {
			for (const fact of generate(seed, 2).facts) {
				expect(fact.source.renderedText).not.toMatch(/mens|faux|menti/i);
			}
		}
	});

	it('respects the roles of the places', () => {
		const roles = new Map(catalog.placeTypes.map((type) => [type.id, type.role]));
		const byId = new Map(fixturePlaces.map((place) => [place.osmId, place]));
		for (let seed = 1; seed <= 50; seed++) {
			const investigation = generate(seed, 3);
			expect(roles.get(byId.get(investigation.sceneId)!.typeId)).toBe('scene');
			for (const id of investigation.placeIds) {
				const place = byId.get(id)!;
				expect(place.removed).toBe(false);
				expect(roles.get(place.typeId)).not.toBe('excluded');
			}
		}
	});

	it('reports when no scene is available', () => {
		const places = fixturePlaces.filter((p) => p.typeId === 'playground' || p.removed);
		const routes = fixtureRoutes.filter(
			(r) => places.some((p) => p.osmId === r.placeA) && places.some((p) => p.osmId === r.placeB)
		);
		const result = generateInvestigation(places, routes, catalog, { seed: 1, difficulty: 1 });
		expect(result).toEqual({ ok: false, reason: 'no-scene' });
	});

	it('reports when the difficulty cannot be reached with these places', () => {
		const places = fixturePlaces.filter((p) => ['fountain', 'school'].includes(p.typeId));
		const routes = fixtureRoutes.filter(
			(r) => places.some((p) => p.osmId === r.placeA) && places.some((p) => p.osmId === r.placeB)
		);
		const result = generateInvestigation(places, routes, catalog, { seed: 1, difficulty: 3 });
		expect(result).toEqual({ ok: false, reason: 'difficulty-unreachable' });
	});
});

describe('mystery time', () => {
	const hoursOf = (placeId: string, places: typeof fixturePlaces) => {
		const place = places.find((p) => p.osmId === placeId)!;
		const type = catalog.placeTypes.find((t) => t.id === place.typeId)!;
		return place.actualHours ?? type.typicalHours ?? [{ from: 0, to: 1440 }];
	};

	const check = (places: typeof fixturePlaces, routes: typeof fixtureRoutes) => {
		for (const difficulty of difficulties) {
			for (let seed = 1; seed <= 100; seed++) {
				const result = generateInvestigation(places, routes, catalog, { seed, difficulty });
				if (!result.ok) throw new Error(`seed ${seed}, difficulty ${difficulty}: ${result.reason}`);
				const { mysteryTime, scenarioId, sceneId } = result.investigation;
				expect(mysteryTime % 5).toBe(0);
				const range = catalog.scenarios.find((s) => s.id === scenarioId)!.timeRange;
				expect(mysteryTime).toBeGreaterThanOrEqual(range.from);
				expect(mysteryTime).toBeLessThanOrEqual(range.to);
				expect(
					hoursOf(sceneId, places).some((h) => h.from <= mysteryTime && mysteryTime <= h.to)
				).toBe(true);
			}
		}
	};

	it('is a multiple of 5 minutes, in the scenario range and the scene hours', () => {
		check(fixturePlaces, fixtureRoutes);
	});

	it('stays round on the rich places', () => {
		check(richPlaces, richRoutes);
	});

	it('skips a scenario whose range holds no multiple of 5 minutes', () => {
		const narrow = { ...catalog.scenarios[0], timeRange: { from: 601, to: 604 } };
		const only = { ...catalog, scenarios: [narrow] };
		const none = generateInvestigation(richPlaces, richRoutes, only, { seed: 1, difficulty: 1 });
		expect(none).toEqual({ ok: false, reason: 'no-scene' });

		const mixed = { ...catalog, scenarios: [narrow, catalog.scenarios[1]] };
		for (let seed = 1; seed <= 30; seed++) {
			const result = generateInvestigation(richPlaces, richRoutes, mixed, { seed, difficulty: 1 });
			if (!result.ok) throw new Error(result.reason);
			expect(result.investigation.scenarioId).toBe(catalog.scenarios[1].id);
			expect(result.investigation.mysteryTime % 5).toBe(0);
		}
	});
});

describe('scenario items', () => {
	const itemOf = (id: string) => catalog.items.find((item) => item.id === id)!;
	const only = (scenarioId: string) => ({
		...catalog,
		scenarios: catalog.scenarios.filter((scenario) => scenario.id === scenarioId)
	});

	it('match the scenario: count, tags, all different, listed in the situation', () => {
		let withItems = 0;
		for (const difficulty of difficulties) {
			for (let seed = 1; seed <= 60; seed++) {
				const result = generateInvestigation(richPlaces, richRoutes, catalog, { seed, difficulty });
				if (!result.ok) throw new Error(result.reason);
				const { itemIds, scenarioId, situationText } = result.investigation;
				const scenario = catalog.scenarios.find((s) => s.id === scenarioId)!;
				expect(itemIds.length).toBeGreaterThanOrEqual(scenario.itemCount.min);
				expect(itemIds.length).toBeLessThanOrEqual(scenario.itemCount.max);
				expect(new Set(itemIds).size).toBe(itemIds.length);
				for (const id of itemIds) {
					withItems++;
					expect(itemOf(id).tags.some((tag) => scenario.itemTags.includes(tag))).toBe(true);
					expect(situationText).toContain(itemOf(id).indefinite);
				}
			}
		}
		expect(withItems).toBeGreaterThan(0);
	});

	it('are the same for the same seed', () => {
		const draw = () => {
			const result = generateInvestigation(richPlaces, richRoutes, catalog, {
				seed: 42,
				difficulty: 2
			});
			if (!result.ok) throw new Error(result.reason);
			return result.investigation.itemIds;
		};
		expect(draw()).toEqual(draw());
	});

	it('vary from one seed to another for the same scenario', () => {
		const combinations = new Set<string>();
		for (let seed = 1; seed <= 60; seed++) {
			const result = generateInvestigation(richPlaces, richRoutes, only('statue_makeover'), {
				seed,
				difficulty: 1
			});
			if (!result.ok) throw new Error(result.reason);
			combinations.add(result.investigation.itemIds.join('+'));
		}
		expect(combinations.size).toBeGreaterThan(10);
	});

	it('stay empty for a scenario without items', () => {
		for (let seed = 1; seed <= 20; seed++) {
			const result = generateInvestigation(richPlaces, richRoutes, only('library_swap'), {
				seed,
				difficulty: 1
			});
			if (!result.ok) throw new Error(result.reason);
			expect(result.investigation.itemIds).toEqual([]);
		}
	});

	it('put the definite form of the first item in the revelation when it cites one', () => {
		let cited = 0;
		for (let seed = 1; seed <= 60; seed++) {
			const result = generateInvestigation(richPlaces, richRoutes, only('statue_makeover'), {
				seed,
				difficulty: 1
			});
			if (!result.ok) throw new Error(result.reason);
			const { itemIds, revelationText } = result.investigation;
			const lie = result.investigation.facts.find(
				(fact) => fact.source.kind === 'testimony' && fact.source.lie
			)!;
			const motive = lie.source.kind === 'testimony' ? lie.source.motive! : 'surprise';
			const template = only('statue_makeover').scenarios[0].revelations[motive]!;
			if (!template.includes('{item}')) continue;
			cited++;
			expect(revelationText).toContain(itemOf(itemIds[0]).definite);
		}
		expect(cited).toBeGreaterThan(0);
	});
});

describe('proofs', () => {
	it('are dated at the end of the stay they concern', () => {
		const natureOf = new Map(catalog.clueTypes.map((type) => [type.id, type.nature]));
		let proofs = 0;
		for (const difficulty of difficulties) {
			for (let seed = 1; seed <= 60; seed++) {
				const investigation = generate(seed, difficulty);
				for (const fact of investigation.facts) {
					if (fact.source.kind !== 'clue' || natureOf.get(fact.source.clueTypeId) !== 'proof')
						continue;
					proofs++;
					const character = investigation.characters.find((c) => c.id === fact.characterId)!;
					expect(fact.departure).toBe(true);
					expect(fact.from).toBe(fact.to);
					expect(fact.to).toBe(character.segments[fact.segment!].to);
				}
			}
		}
		expect(proofs).toBeGreaterThan(0);
	});
});

describe('repairInvestigation', () => {
	it('adds a clue for a suspect who cannot be cleared', () => {
		const context = { places: fixturePlaces, routes: fixtureRoutes, catalog };
		const investigation = generate(5, 1);
		const referenced = new Set(investigation.facts.map((f) => f.unlockedBy));
		const loose = investigation.facts.find(
			(f) => f.source.kind === 'clue' && !referenced.has(f.id)
		)!;
		const broken = { ...investigation, facts: investigation.facts.filter((f) => f !== loose) };
		expect(checkRules(broken, context)).toContain('unique-solution');

		const repaired = repairInvestigation(broken, context)!;
		expect(checkRules(repaired, context)).toEqual([]);
	});
});

describe('repairInvestigation and proofs', () => {
	const context = { places: fixturePlaces, routes: fixtureRoutes, catalog };

	// An investigation where the only suspect to clear stays long after the mystery time.
	function withLongStay() {
		const investigation = structuredClone(generate(5, 1));
		const referenced = new Set(investigation.facts.map((f) => f.unlockedBy));
		const loose = investigation.facts.find(
			(f) => f.source.kind === 'clue' && !referenced.has(f.id)
		)!;
		const character = investigation.characters.find((c) => c.id === loose.characterId)!;
		character.segments[loose.segment!].to = investigation.mysteryTime + 200;
		investigation.facts = investigation.facts.filter((f) => f !== loose);
		return { investigation, loose };
	}

	it('uses a PNJ clue when the stay ends too long after the mystery time for a proof', () => {
		const { investigation } = withLongStay();
		const repaired = repairInvestigation(investigation, context)!;
		const added = repaired.facts.filter((fact) => fact.id.startsWith('r'));
		expect(added).toHaveLength(1);
		const source = added[0].source;
		if (source.kind !== 'clue') throw new Error('expected a clue');
		expect(catalog.clueTypes.find((type) => type.id === source.clueTypeId)!.nature).toBe('npc');
	});

	it('adds nothing when no clue can clear the suspect', () => {
		const { investigation, loose } = withLongStay();
		const place = fixturePlaces.find((p) => p.osmId === loose.placeId)!;
		const proofId = catalog.clueTypes.find((type) => type.nature === 'proof')!.id;
		const proofOnly = {
			...catalog,
			compatibilities: { ...catalog.compatibilities, [place.typeId]: [proofId] }
		};
		expect(repairInvestigation(investigation, { ...context, catalog: proofOnly })).toBeNull();
	});
});

describe('500 seeds', () => {
	it('produce valid investigations at every difficulty', () => {
		const context = { places: fixturePlaces, routes: fixtureRoutes, catalog };
		const travel = createTravelTime(fixtureRoutes);
		for (const difficulty of difficulties) {
			for (let seed = 1; seed <= 500; seed++) {
				const investigation = generate(seed, difficulty);
				expect(checkRules(investigation, context)).toEqual([]);
				expect(solve(toSolverInput(investigation, travel)).difficulty).toBe(difficulty);
				const names = investigation.characters.map((c) => c.firstName);
				expect(new Set(names).size).toBe(names.length);
				for (const fact of investigation.facts) {
					expect(fact.source.renderedText).not.toMatch(/[{}]/);
				}
			}
		}
	});
});

describe('performance', () => {
	it('generates an investigation in under 200 ms', () => {
		const runs = 30;
		const start = performance.now();
		for (let seed = 1; seed <= runs; seed++) generate(seed, 3);
		expect((performance.now() - start) / runs).toBeLessThan(200);
	});
});

describe('rich places', () => {
	const context = { places: richPlaces, routes: richRoutes, catalog };

	it('give valid investigations at every difficulty', () => {
		const travel = createTravelTime(richRoutes);
		const failures: string[] = [];
		for (const difficulty of difficulties) {
			for (let seed = 1; seed <= 100; seed++) {
				const result = generateInvestigation(richPlaces, richRoutes, catalog, { seed, difficulty });
				if (!result.ok) {
					failures.push(`seed ${seed}, difficulty ${difficulty}: ${result.reason}`);
					continue;
				}
				const { investigation } = result;
				expect(checkRules(investigation, context)).toEqual([]);
				expect(solve(toSolverInput(investigation, travel)).difficulty).toBe(difficulty);
			}
		}
		expect(failures).toEqual([]);
	});

	it('generate in under 200 ms on average', () => {
		const runs = 30;
		const start = performance.now();
		for (let seed = 1; seed <= runs; seed++) {
			generateInvestigation(richPlaces, richRoutes, catalog, { seed, difficulty: 3 });
		}
		expect((performance.now() - start) / runs).toBeLessThan(200);
	});
});
