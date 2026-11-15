import { describe, it, expect } from 'vitest';
import {
	solve,
	contradicts,
	judgeTestimony,
	toSolverInput,
	type SolverFact,
	type SolverInput
} from './solver';
import { createTravelTime } from './routes';
import type { Investigation } from './types';

// Reference example, docs/reference/DATA-MODEL.md section 8.
const travelTime = createTravelTime([
	{ placeA: 'cafe', placeB: 'park', distanceM: 1000, minutes: 12 },
	{ placeA: 'bakery', placeB: 'park', distanceM: 330, minutes: 4 },
	{ placeA: 'cafe', placeB: 'bakery', distanceM: 830, minutes: 10 }
]);

const fact = (
	id: string,
	characterId: string,
	placeId: string,
	from: number,
	to: number,
	speakerId: string | null,
	extra: Partial<SolverFact> = {}
): SolverFact => ({
	id,
	characterId,
	placeId,
	from,
	to,
	departure: false,
	unlockedBy: null,
	speakerId,
	...extra
});

const lucieLie = fact('lie', 'lucie', 'cafe', 1230, 1260, 'lucie');
const paulTestimony = fact('paul-t', 'paul', 'bakery', 1240, 1263, 'paul');
const inesTestimony = fact('ines-t', 'ines', 'cafe', 1230, 1280, 'ines');
const lucieLeaves = fact('lucie-leaves', 'lucie', 'cafe', 1250, 1250, 'ines', { departure: true });
const ticket = fact('ticket', 'paul', 'bakery', 1263, 1263, null, { departure: true });
const waiter = fact('waiter', 'ines', 'cafe', 1230, 1280, null);

const reference = (): SolverInput => ({
	suspectIds: ['lucie', 'paul', 'ines'],
	sceneId: 'park',
	mysteryTime: 1265,
	travelTime,
	facts: [lucieLie, paulTestimony, inesTestimony, lucieLeaves, ticket, waiter]
});

describe('solve, reference example', () => {
	it('finds Lucie as the only possible suspect with difficulty 1', () => {
		const result = solve(reference());
		expect(result.possible).toEqual(['lucie']);
		expect(result.difficulty).toBe(1);
		expect(result.clearedAtRound).toEqual({ paul: 1, ines: 1 });
	});

	it('finds two possible suspects without the receipt', () => {
		const input = reference();
		input.facts = input.facts.filter((f) => f.id !== 'ticket');
		expect(solve(input).possible.sort()).toEqual(['lucie', 'paul']);
	});

	it('does not clear a suspect with a fact at the scene', () => {
		const input = reference();
		input.facts.push(fact('lucie-park', 'lucie', 'park', 1265, 1265, null));
		expect(solve(input).possible).toEqual(['lucie']);
	});

	it('does not read the author, the lie or the motive', () => {
		const investigation = (authorId: string, lie: boolean): Investigation => ({
			seed: 1,
			difficulty: 1,
			mysteryTime: 1265,
			scenarioId: 's',
			itemIds: [],
			situationText: '',
			revelationText: '',
			sceneId: 'park',
			placeIds: [],
			routes: [],
			characters: ['lucie', 'paul', 'ines'].map((id) => ({
				id,
				firstName: id,
				author: id === authorId,
				segments: []
			})),
			facts: reference().facts.map((f) => ({
				id: f.id,
				characterId: f.characterId,
				placeId: f.placeId,
				from: f.from,
				to: f.to,
				departure: f.departure,
				segment: null,
				unlockedBy: null,
				source:
					f.speakerId === null
						? { kind: 'clue', clueTypeId: 'x', renderedText: '' }
						: {
								kind: 'testimony',
								speakerId: f.speakerId,
								renderedText: '',
								lie,
								motive: lie ? 'surprise' : null
							}
			}))
		});
		const a = solve(toSolverInput(investigation('lucie', true), travelTime));
		const b = solve(toSolverInput(investigation('paul', false), travelTime));
		expect(a).toEqual(b);
	});
});

describe('solve, reachability and chains', () => {
	it('ignores a fact that is never unlocked', () => {
		const input = reference();
		input.facts = input.facts.map((f) => (f.id === 'ticket' ? { ...f, unlockedBy: 'ghost' } : f));
		expect(solve(input).possible.sort()).toEqual(['lucie', 'paul']);
	});

	it('ignores facts in an unlock cycle', () => {
		const input = reference();
		input.facts = input.facts.map((f) =>
			f.id === 'ticket'
				? { ...f, unlockedBy: 'waiter-copy' }
				: f.id === 'waiter'
					? { ...f, id: 'waiter-copy', unlockedBy: 'ticket' }
					: f
		);
		expect(solve(input).possible).toContain('paul');
	});

	it('needs the testimony of a cleared suspect to clear another one: difficulty 2', () => {
		const input = reference();
		input.suspectIds.push('zoe');
		input.facts.push(fact('zoe-by-paul', 'zoe', 'bakery', 1260, 1270, 'paul'));
		const result = solve(input);
		expect(result.possible).toEqual(['lucie']);
		expect(result.clearedAtRound.zoe).toBe(2);
		expect(result.difficulty).toBe(2);
	});
});

describe('contradicts', () => {
	it('detects a departure that interrupts a continuous presence', () => {
		expect(contradicts(lucieLie, lucieLeaves, travelTime)).toBe(true);
	});

	it('does not contradict a departure at the end of the presence', () => {
		const leaves = fact('d', 'lucie', 'cafe', 1260, 1260, null, { departure: true });
		expect(contradicts(lucieLie, leaves, travelTime)).toBe(false);
	});

	it('detects two places too far apart for the time between facts', () => {
		const atCafe = fact('a', 'paul', 'cafe', 1250, 1250, null);
		const atBakery = fact('b', 'paul', 'bakery', 1255, 1255, null);
		expect(contradicts(atCafe, atBakery, travelTime)).toBe(true);
		const later = fact('c', 'paul', 'bakery', 1261, 1261, null);
		expect(contradicts(atCafe, later, travelTime)).toBe(false);
	});

	it('never contradicts facts about two different people', () => {
		const other = fact('x', 'ines', 'bakery', 1250, 1250, null);
		expect(contradicts(fact('a', 'paul', 'cafe', 1250, 1250, null), other, travelTime)).toBe(false);
	});
});

describe('judgeTestimony', () => {
	const input = reference();
	const result = solve(input);

	it('contradicts the lie of Lucie', () => {
		expect(judgeTestimony(lucieLie, input, result)).toBe('contradicted');
	});

	it('corroborates the testimony of Paul with his receipt', () => {
		expect(judgeTestimony(paulTestimony, input, result)).toBe('corroborated');
	});

	it('leaves a testimony without any matching reliable fact unverified', () => {
		const lone = fact('lone', 'paul', 'park', 1100, 1110, 'paul');
		expect(judgeTestimony(lone, input, result)).toBe('unverified');
	});
});
