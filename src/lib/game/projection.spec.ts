import { describe, it, expect } from 'vitest';
import { factsOfPlaces, project } from './projection';
import { generateInvestigation } from '../engine/generate';
import { validateCatalog } from '../engine/catalog';
import { rawStarterCatalog, richPlaces, richRoutes } from '../engine/fixtures';
import type { Investigation } from '../engine/types';

const catalog = validateCatalog(structuredClone(rawStarterCatalog));
const HIDDEN_KEYS = ['author', 'lie', 'motive', 'lieKind', 'segments', 'segment', 'revelationText'];

const generate = (): Investigation => {
	const result = generateInvestigation(richPlaces, richRoutes, catalog, { seed: 5, difficulty: 2 });
	if (!result.ok) throw new Error(result.reason);
	return result.investigation;
};

function keysOf(value: unknown): string[] {
	if (Array.isArray(value)) return value.flatMap(keysOf);
	if (value && typeof value === 'object') {
		return Object.entries(value).flatMap(([key, inner]) => [key, ...keysOf(inner)]);
	}
	return [];
}

describe('project', () => {
	const investigation = generate();
	const view = project(investigation, richPlaces);

	it('carries no hidden key and no revelation text', () => {
		const keys = keysOf(view);
		for (const hidden of HIDDEN_KEYS) expect(keys).not.toContain(hidden);
		expect(JSON.stringify(view)).not.toContain(investigation.revelationText);
	});

	it('gives the situation, the day, the mystery time and the scene', () => {
		expect(view).toMatchObject({
			seed: investigation.seed,
			difficulty: investigation.difficulty,
			mysteryTime: investigation.mysteryTime,
			dayType: investigation.dayType,
			situationText: investigation.situationText,
			sceneId: investigation.sceneId
		});
	});

	it('lists the suspects by id and first name only', () => {
		expect(view.suspects).toEqual(
			investigation.characters.map((character) => ({
				id: character.id,
				firstName: character.firstName
			}))
		);
	});

	it('numbers the retained places in the order of the investigation', () => {
		expect(view.places.map((place) => place.osmId)).toEqual(investigation.placeIds);
		expect(view.places.map((place) => place.number)).toEqual(
			investigation.placeIds.map((_, i) => i + 1)
		);
	});

	it('does not announce any fact before a place is opened', () => {
		expect(JSON.stringify(view)).not.toContain('"facts"');
	});
});

describe('factsOfPlaces', () => {
	const investigation = generate();

	it('is empty while every place is closed', () => {
		expect(factsOfPlaces(investigation, [])).toEqual([]);
	});

	it('gives the facts of an opened place with only what the player may see', () => {
		const placeId = investigation.facts[0].placeId;
		const facts = factsOfPlaces(investigation, [placeId]);
		expect(facts.length).toBeGreaterThan(0);
		for (const fact of facts) {
			expect(fact.placeId).toBe(placeId);
			for (const hidden of HIDDEN_KEYS) expect(keysOf(fact)).not.toContain(hidden);
		}
		const source = facts.find((fact) => fact.source.kind === 'testimony');
		if (source) expect(source.source).toEqual({ kind: 'testimony', speakerId: expect.any(String) });
	});

	it('gives a clue by its type and a testimony by its speaker', () => {
		const facts = factsOfPlaces(investigation, investigation.placeIds);
		const clue = facts.find((fact) => fact.source.kind === 'clue');
		expect(clue?.source).toEqual({ kind: 'clue', clueTypeId: expect.any(String) });
	});

	it('discovers every fact when every place is open', () => {
		expect(factsOfPlaces(investigation, investigation.placeIds)).toHaveLength(
			investigation.facts.length
		);
	});
});
