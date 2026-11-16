import { describe, it, expect } from 'vitest';
import { checkAccusation, discoveredFactIds } from './discovery';
import { generateInvestigation } from '../engine/generate';
import { validateCatalog } from '../engine/catalog';
import { rawStarterCatalog, richPlaces, richRoutes } from '../engine/fixtures';
import type { Difficulty, Investigation } from '../engine/types';

const catalog = validateCatalog(structuredClone(rawStarterCatalog));

const generate = (difficulty: Difficulty) =>
	generateInvestigation(richPlaces, richRoutes, catalog, { seed: 3, difficulty });

describe('discoveredFactIds', () => {
	const investigation = (): Investigation => {
		const result = generate(2);
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
		const result = generate(1);
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
