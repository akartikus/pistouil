import { describe, it, expect } from 'vitest';
import {
	restrictCatalog,
	filterPlaces,
	runPlayground,
	describeScenarios,
	describeMatrix,
	describeSnapshot,
	formatOpeningHours,
	discoveredFactIds,
	checkAccusation,
	type PlaygroundOptions
} from './playground';
import { validateCatalog } from '../engine/catalog';
import {
	fixturePlaces,
	fixtureRoutes,
	rawStarterCatalog,
	richPlaces,
	richRoutes
} from '../engine/fixtures';
import { missingPairs } from '../engine/routes';
import { formatTime } from '../engine/render';
import type { Investigation } from '../engine/types';

const catalog = validateCatalog(structuredClone(rawStarterCatalog));
const allPlaceIds = fixturePlaces.map((place) => place.osmId);

const options = (overrides: Partial<PlaygroundOptions> = {}): PlaygroundOptions => ({
	seed: 7,
	difficulty: 2,
	scenarioId: null,
	motive: null,
	activePlaceIds: allPlaceIds,
	...overrides
});

const run = (overrides: Partial<PlaygroundOptions> = {}) =>
	runPlayground(fixturePlaces, fixtureRoutes, catalog, options(overrides));

describe('restrictCatalog', () => {
	it('keeps only the chosen scenario and motive', () => {
		const restricted = restrictCatalog(catalog, 'rubber_ducks', 'mistake');
		expect(restricted.scenarios.map((s) => s.id)).toEqual(['rubber_ducks']);
		expect(restricted.scenarios[0].lieMotives).toEqual(['mistake']);
	});

	it('applies a motive to every scenario that supports it', () => {
		const restricted = restrictCatalog(catalog, null, 'modesty');
		expect(restricted.scenarios).toHaveLength(catalog.scenarios.length);
		for (const scenario of restricted.scenarios) expect(scenario.lieMotives).toEqual(['modesty']);
	});

	it('leaves the catalog as is without any choice and never mutates it', () => {
		expect(restrictCatalog(catalog, null, null)).toEqual(catalog);
		restrictCatalog(catalog, 'rubber_ducks', 'mistake');
		expect(catalog.scenarios.find((s) => s.id === 'rubber_ducks')!.lieMotives).toHaveLength(5);
	});
});

describe('filterPlaces', () => {
	it('keeps a complete route matrix on the active places', () => {
		const active = ['p1', 'p2', 'p3', 'p4'];
		const filtered = filterPlaces(fixturePlaces, fixtureRoutes, active);
		expect(filtered.places.map((p) => p.osmId)).toEqual(active);
		expect(
			missingPairs(
				filtered.places.map((p) => p.osmId),
				filtered.routes
			)
		).toEqual([]);
		expect(filtered.routes).toHaveLength(6);
	});
});

describe('runPlayground', () => {
	it('gives the same investigation for the same choices', () => {
		expect(run()).toEqual(run());
	});

	it('uses the chosen scenario and motive', () => {
		const result = run({ scenarioId: 'rubber_ducks', motive: 'mistake' });
		if (!result.ok) throw new Error(result.reason);
		expect(result.investigation.scenarioId).toBe('rubber_ducks');
		expect(result.view.reveal.lie.motive).toBe('mistake');
	});

	it('reports a failed generation as is', () => {
		const sceneIds = fixturePlaces
			.filter((p) => ['fountain', 'park', 'cafe', 'bakery'].includes(p.typeId))
			.map((p) => p.osmId);
		const active = allPlaceIds.filter((id) => !sceneIds.includes(id));
		const activeCount = active.length;
		const result = run({ activePlaceIds: active });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.reason).toBe('no-scene');
			expect(result.matrix.places).toHaveLength(activeCount);
		}
	});

	it('describes a valid investigation', () => {
		const result = run({ difficulty: 2 });
		if (!result.ok) throw new Error(result.reason);
		const { view, investigation } = result;
		expect(view.violations).toEqual([]);
		expect(view.measuredDifficulty).toBe(2);
		expect(view.suspects).toHaveLength(4);
		expect(view.reveal.rounds).toHaveLength(2);
		expect(view.facts).toHaveLength(investigation.facts.length);
		expect(view.situation).toBe(investigation.situationText);
		expect(view.sceneName).toBeTruthy();
		const unlocked = Object.values(view.reveal.facts).find((fact) => fact.unlockedBy !== null)!;
		expect(view.facts.some((fact) => fact.id === unlocked.unlockedBy)).toBe(true);
	});

	it('keeps the hidden data in the reveal section only', () => {
		const result = run();
		if (!result.ok) throw new Error(result.reason);
		const { reveal, ...visible } = result.view;
		const text = JSON.stringify(visible);
		expect(text).not.toMatch(
			/"(author|lie|motive|segments|revelation|unlockedBy|verdict|reliable)/i
		);
		expect(text).not.toContain(reveal.authorName + '*');
		expect(text).not.toContain(result.investigation.revelationText);
		expect(reveal.authorName).toBeTruthy();
		expect(reveal.revelation).toBe(result.investigation.revelationText);
		expect(reveal.evenings).toHaveLength(result.view.suspects.length);
		expect(reveal.lie.factId).toBeTruthy();
		expect(reveal.rounds.length).toBe(result.view.measuredDifficulty);
		expect(reveal.possibleSuspects).toEqual([reveal.authorName]);
		expect(Object.keys(reveal.facts)).toHaveLength(result.view.facts.length);
	});
});

describe('describeScenarios', () => {
	it('lists every scenario by title only', () => {
		const scenarios = describeScenarios(catalog);
		expect(scenarios).toHaveLength(catalog.scenarios.length);
		expect(scenarios[0].title).toBeTruthy();
		const text = JSON.stringify(scenarios);
		for (const scenario of catalog.scenarios) {
			expect(text).not.toContain(scenario.situation);
		}
	});
});

describe('describeMatrix', () => {
	const active = filterPlaces(fixturePlaces, fixtureRoutes, ['p1', 'p2', 'p3']);

	it('is complete and the same in both directions', () => {
		const matrix = describeMatrix(active.places, active.routes);
		expect(matrix.cells).toHaveLength(3);
		for (let i = 0; i < 3; i++) {
			expect(matrix.cells[i][i]).toBeNull();
			for (let j = 0; j < 3; j++) {
				if (i !== j) expect(matrix.cells[i][j]).toMatch(/^\d+ min \(\d+ m\)$/);
				expect(matrix.cells[i][j]).toBe(matrix.cells[j][i]);
			}
		}
	});

	it('marks the scene and leaves out a disabled place', () => {
		const result = run();
		if (!result.ok) throw new Error(result.reason);
		expect(result.matrix.places.filter((p) => p.isScene).map((p) => p.id)).toEqual([
			result.investigation.sceneId
		]);
		const without = run({ activePlaceIds: allPlaceIds.filter((id) => id !== 'p5') });
		expect(without.matrix.places.map((p) => p.id)).not.toContain('p5');
		expect(without.matrix.cells).toHaveLength(allPlaceIds.length - 1);
	});
});

describe('describeMatrix restricted to the investigation', () => {
	it('keeps only the places of the investigation and marks the scene', () => {
		const result = run();
		if (!result.ok) throw new Error(result.reason);
		const { investigation, retainedMatrix, matrix } = result;
		expect(retainedMatrix.places.map((p) => p.id).sort()).toEqual(
			[...investigation.placeIds].sort()
		);
		expect(retainedMatrix.cells).toHaveLength(investigation.placeIds.length);
		expect(retainedMatrix.places.filter((p) => p.isScene).map((p) => p.id)).toEqual([
			investigation.sceneId
		]);
		// The full matrix still lists every active place.
		expect(matrix.places).toHaveLength(allPlaceIds.length);
		expect(retainedMatrix.places.length).toBeLessThan(matrix.places.length);
	});

	it('gives the same distance as the full matrix', () => {
		const result = run();
		if (!result.ok) throw new Error(result.reason);
		const { matrix, retainedMatrix } = result;
		const full = (a: string, b: string) =>
			matrix.cells[matrix.places.findIndex((p) => p.id === a)][
				matrix.places.findIndex((p) => p.id === b)
			];
		const [first, second] = retainedMatrix.places;
		expect(retainedMatrix.cells[0][1]).toBe(full(first.id, second.id));
	});
});

describe('discoveredFactIds', () => {
	const investigation = (): Investigation => {
		const result = run({ difficulty: 2 });
		if (!result.ok) throw new Error(result.reason);
		return result.investigation;
	};

	it('finds nothing while every place is closed', () => {
		expect(discoveredFactIds(investigation(), [])).toEqual([]);
	});

	it('shows the facts of an open place that have no unlocking fact', () => {
		const inv = investigation();
		const visible = inv.facts.find((fact) => fact.unlockedBy === null)!;
		const found = discoveredFactIds(inv, [visible.placeId]);
		expect(found).toContain(visible.id);
		for (const id of found) {
			const fact = inv.facts.find((f) => f.id === id)!;
			expect(fact.placeId).toBe(visible.placeId);
		}
	});

	it('shows a locked fact only after its unlocking fact is discovered', () => {
		// The engine only unlocks facts within a place today: build a cross-place link by hand.
		const inv = structuredClone(investigation());
		const unlocker = inv.facts.find((fact) => fact.unlockedBy === null)!;
		const locked = inv.facts.find(
			(fact) => fact.id !== unlocker.id && fact.placeId !== unlocker.placeId
		)!;
		locked.unlockedBy = unlocker.id;
		for (const fact of inv.facts) {
			if (fact.unlockedBy !== null && fact !== locked) fact.unlockedBy = null;
		}
		expect(discoveredFactIds(inv, [locked.placeId])).not.toContain(locked.id);
		expect(discoveredFactIds(inv, [unlocker.placeId])).not.toContain(locked.id);
		const both = discoveredFactIds(inv, [locked.placeId, unlocker.placeId]);
		expect(both).toContain(unlocker.id);
		expect(both).toContain(locked.id);
	});

	it('unlocks a fact in the same place at once', () => {
		const inv = investigation();
		const locked = inv.facts.find((fact) => {
			const unlocker = inv.facts.find((f) => f.id === fact.unlockedBy);
			return unlocker && unlocker.placeId === fact.placeId;
		});
		if (!locked) return;
		expect(discoveredFactIds(inv, [locked.placeId])).toContain(locked.id);
	});

	it('discovers every fact when every place is open', () => {
		const inv = investigation();
		expect(discoveredFactIds(inv, inv.placeIds)).toHaveLength(inv.facts.length);
	});
});

describe('checkAccusation', () => {
	it('tells whether the accused suspect is the author', () => {
		const result = run();
		if (!result.ok) throw new Error(result.reason);
		const { characters } = result.investigation;
		const author = characters.find((c) => c.author)!;
		const other = characters.find((c) => !c.author)!;
		expect(checkAccusation(result.investigation, author.id)).toEqual({
			correct: true,
			authorName: author.firstName
		});
		expect(checkAccusation(result.investigation, other.id)).toEqual({
			correct: false,
			authorName: author.firstName
		});
	});
});

describe('describeSnapshot', () => {
	const snapshot = () => {
		const result = run({ seed: 7, difficulty: 2 });
		if (!result.ok) throw new Error(result.reason);
		return { result, snapshot: describeSnapshot(result.investigation, fixturePlaces) };
	};
	const value = (name: string) =>
		snapshot().snapshot.choices.find((choice) => choice.name === name)?.value;

	it('lists the choices of the engine', () => {
		const { result } = snapshot();
		const inv = result.investigation;
		expect(value('seed')).toBe('7');
		expect(value('difficulty')).toBe('2');
		expect(value('scenario')).toBe(inv.scenarioId);
		expect(value('scene')).toContain(inv.sceneId);
		expect(value('mysteryTime')).toBe(`${result.view.mysteryTime} (${inv.mysteryTime})`);
		expect(value('author')).toContain(inv.characters.find((c) => c.author)!.id);
		expect(value('retainedPlaces')).toBe(inv.placeIds.join(', '));
	});

	it('gives the motive of the lie', () => {
		const lie = snapshot().result.view.reveal.lie;
		expect(value('motive')).toBe(lie.motive);
	});

	it('has one row per suspect with the true evening and one per fact with raw values', () => {
		const { result, snapshot: view } = snapshot();
		const inv = result.investigation;
		expect(view.suspects).toHaveLength(inv.characters.length);
		const author = view.suspects.find((suspect) => suspect.author)!;
		expect(author.evening).toContain(inv.sceneId);
		expect(view.facts).toHaveLength(inv.facts.length);
		const fact = inv.facts[0];
		expect(view.facts[0]).toMatchObject({
			id: fact.id,
			characterId: fact.characterId,
			placeId: fact.placeId,
			from: `${formatTime(fact.from)} (${fact.from})`,
			to: `${formatTime(fact.to)} (${fact.to})`,
			unlockedBy: fact.unlockedBy
		});
	});
});

describe('describeSnapshot, scenario items', () => {
	const snapshotOf = (scenarioId: string) => {
		const result = runPlayground(richPlaces, richRoutes, catalog, {
			seed: 3,
			difficulty: 1,
			scenarioId,
			motive: null,
			activePlaceIds: richPlaces.map((place) => place.osmId)
		});
		if (!result.ok) throw new Error(result.reason);
		const snapshot = describeSnapshot(result.investigation, richPlaces);
		return {
			investigation: result.investigation,
			items: snapshot.choices.find((choice) => choice.name === 'items')!.value
		};
	};

	it('lists the items drawn for the scenario', () => {
		const { investigation, items } = snapshotOf('statue_makeover');
		expect(investigation.itemIds.length).toBeGreaterThan(0);
		expect(items).toBe(investigation.itemIds.join(', '));
	});

	it('lists nothing for a scenario without items', () => {
		expect(snapshotOf('library_swap').items).toBe('');
	});
});

describe('day and opening hours', () => {
	const view = () => {
		const result = runPlayground(richPlaces, richRoutes, catalog, {
			seed: 4,
			difficulty: 3,
			scenarioId: null,
			motive: null,
			activePlaceIds: richPlaces.map((place) => place.osmId)
		});
		if (!result.ok) throw new Error(result.reason);
		return result;
	};

	it('gives the day label of the investigation', () => {
		const { view: v, investigation } = view();
		expect(v.dayLabel).toBe(investigation.dayType === 'weekday' ? 'En semaine' : 'Le week-end');
		expect(v.situation.startsWith(v.dayLabel)).toBe(true);
	});

	it('gives the hours of each place of the investigation on that day', () => {
		const { view: v, investigation } = view();
		expect(v.places.map((place) => place.id)).toEqual(investigation.placeIds);
		for (const place of v.places) {
			expect(place.hours).toMatch(
				/^(toujours ouvert|fermé|\d+h\d\d–\d+h\d\d(, \d+h\d\d–\d+h\d\d)*)$/
			);
		}
	});

	it('writes the hours as closed, always open, or a list of intervals', () => {
		expect(formatOpeningHours(null)).toBe('toujours ouvert');
		expect(formatOpeningHours([])).toBe('fermé');
		expect(formatOpeningHours([{ from: 540, to: 750 }])).toBe('9h00–12h30');
		expect(
			formatOpeningHours([
				{ from: 720, to: 870 },
				{ from: 1140, to: 1380 }
			])
		).toBe('12h00–14h30, 19h00–23h00');
	});

	it('lists the true evening in time order, a distant proof included', () => {
		const { view: v, investigation } = view();
		const nameOf = (id: string) => richPlaces.find((place) => place.osmId === id)!.name;
		for (const character of investigation.characters) {
			const expected = [...character.segments]
				.sort((a, b) => a.from - b.from)
				.map(
					(segment) =>
						`${nameOf(segment.placeId)} ${formatTime(segment.from)}–${formatTime(segment.to)}`
				);
			const evening = v.reveal.evenings.find((e) => e.name === character.firstName)!;
			expect(evening.segments).toEqual(expected);
		}
	});

	it('shows the day and the kind of lie in the snapshot', () => {
		const { investigation } = view();
		const snapshot = describeSnapshot(investigation, richPlaces);
		const value = (name: string) => snapshot.choices.find((choice) => choice.name === name)?.value;
		expect(value('dayType')).toBe(investigation.dayType);
		expect(['alibi', 'framing', 'closed']).toContain(value('lieKind'));
	});
});
