import { describe, it, expect } from 'vitest';
import {
	findInconsistencies,
	findSufficientAlibis,
	measuredKey,
	minutesByPair,
	positionsAt
} from './deduction';
import type { PublicFact } from './projection';

let counter = 0;
const fact = (
	characterId: string,
	placeId: string,
	from: number,
	to: number,
	overrides: Partial<PublicFact> = {}
): PublicFact => ({
	id: `f${++counter}`,
	placeId,
	characterId,
	from,
	to,
	departure: false,
	text: '',
	source: { kind: 'clue', clueTypeId: 'receipt' },
	...overrides
});

// 20:00 is 1200 minutes.
const t = (hours: number, minutes: number) => hours * 60 + minutes;
const measured = (pairs: [string, string, number][]) =>
	Object.fromEntries(pairs.map(([a, b, minutes]) => [measuredKey(a, b), minutes]));

describe('positionsAt', () => {
	const facts = [
		fact('lea', 'mairie', t(20, 15), t(20, 50)),
		fact('mael', 'poste', t(21, 0), t(21, 0)),
		fact('mael', 'cafe', t(20, 30), t(20, 45))
	];

	it('places a suspect where a discovered fact covers the time', () => {
		expect(positionsAt(facts, ['lea', 'mael'], t(20, 30)).lea.placeIds).toEqual(['mairie']);
	});

	it('includes the limits of an interval and an instant', () => {
		expect(positionsAt(facts, ['lea'], t(20, 15)).lea.placeIds).toEqual(['mairie']);
		expect(positionsAt(facts, ['lea'], t(20, 50)).lea.placeIds).toEqual(['mairie']);
		expect(positionsAt(facts, ['mael'], t(21, 0)).mael.placeIds).toEqual(['poste']);
	});

	it('leaves a suspect unknown when no fact covers the time', () => {
		expect(positionsAt(facts, ['lea', 'mael'], t(23, 0))).toEqual({
			lea: { placeIds: [], factIds: [] },
			mael: { placeIds: [], factIds: [] }
		});
	});
});

describe('findInconsistencies', () => {
	it('flags nothing before a trip is measured, even for two places at the same instant', () => {
		const a = fact('mael', 'mairie', t(20, 40), t(20, 40));
		const b = fact('mael', 'poste', t(20, 40), t(20, 40));
		const c = fact('mael', 'boulangerie', t(20, 0), t(20, 38));
		expect(findInconsistencies([a, b, c], {})).toEqual([]);
	});

	it('flags two places once the trip is measured and too long for the gap', () => {
		const a = fact('mael', 'boulangerie', t(20, 0), t(20, 38));
		const b = fact('mael', 'mairie', t(20, 40), t(20, 50));
		const result = findInconsistencies([a, b], measured([['mairie', 'boulangerie', 6]]));
		expect(result).toEqual([
			{ factIds: [a.id, b.id], characterId: 'mael', tripMinutes: 6, gapMinutes: 2 }
		]);
	});

	it('flags two places at the same instant once their trip is measured', () => {
		const a = fact('mael', 'mairie', t(20, 40), t(20, 40));
		const b = fact('mael', 'poste', t(20, 40), t(20, 40));
		expect(findInconsistencies([a, b], measured([['mairie', 'poste', 3]]))).toHaveLength(1);
	});

	it('does not flag a measured trip that fits the gap', () => {
		const a = fact('mael', 'boulangerie', t(20, 0), t(20, 30));
		const b = fact('mael', 'mairie', t(20, 40), t(20, 50));
		expect(findInconsistencies([a, b], measured([['mairie', 'boulangerie', 6]]))).toEqual([]);
	});

	it('leaves two facts in the same place to the player', () => {
		const a = fact('mael', 'cafe', t(20, 30), t(20, 30), { departure: true });
		const b = fact('mael', 'cafe', t(20, 38), t(20, 38), { departure: true });
		expect(findInconsistencies([a, b], measured([['cafe', 'mairie', 5]]))).toEqual([]);
	});

	it('never compares two different suspects', () => {
		const a = fact('lea', 'mairie', t(20, 40), t(20, 40));
		const b = fact('mael', 'poste', t(20, 40), t(20, 40));
		expect(findInconsistencies([a, b], measured([['mairie', 'poste', 3]]))).toEqual([]);
	});
});

describe('findSufficientAlibis', () => {
	const mystery = t(21, 0);

	it('says nothing before the trip to the scene is measured', () => {
		const a = fact('lea', 'poste', t(20, 0), t(20, 50));
		expect(findSufficientAlibis([a], 'scene', mystery, {})).toEqual([]);
	});

	it('says the suspect cannot reach the scene when the gap is shorter than the trip', () => {
		const a = fact('lea', 'poste', t(20, 0), t(20, 50));
		const result = findSufficientAlibis([a], 'scene', mystery, measured([['poste', 'scene', 12]]));
		expect(result).toEqual([
			{ factId: a.id, characterId: 'lea', tripMinutes: 12, gapMinutes: 10, canReachScene: false }
		]);
	});

	it('says the suspect could reach the scene when the gap is long enough', () => {
		const a = fact('lea', 'poste', t(20, 0), t(20, 40));
		const [verdict] = findSufficientAlibis(
			[a],
			'scene',
			mystery,
			measured([['poste', 'scene', 12]])
		);
		expect(verdict.canReachScene).toBe(true);
	});

	it('ignores a fact at the scene itself', () => {
		const a = fact('lea', 'scene', t(20, 0), t(21, 0));
		expect(findSufficientAlibis([a], 'scene', mystery, measured([['poste', 'scene', 12]]))).toEqual(
			[]
		);
	});

	it('gives the same verdicts for the same inputs', () => {
		const a = fact('lea', 'poste', t(20, 0), t(20, 50));
		const trips = measured([['poste', 'scene', 12]]);
		expect(findSufficientAlibis([a], 'scene', mystery, trips)).toEqual(
			findSufficientAlibis([a], 'scene', mystery, trips)
		);
	});
});

describe('minutesByPair', () => {
	it('gives the minutes of each route by sorted pair of places', () => {
		const routes = [{ placeA: 'b', placeB: 'a', distanceM: 100, minutes: 3 }];
		expect(minutesByPair(routes)).toEqual({ [measuredKey('a', 'b')]: 3 });
	});
});
