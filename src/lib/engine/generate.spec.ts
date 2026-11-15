import { describe, it, expect } from 'vitest';
import { generateInvestigation, repairInvestigation } from './generate';
import { validateCatalog } from './catalog';
import { checkRules } from './rules';
import { solve, toSolverInput } from './solver';
import { createTravelTime } from './routes';
import { fixturePlaces, fixtureRoutes, rawStarterCatalog } from './fixtures';
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
