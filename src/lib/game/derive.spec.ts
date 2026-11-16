import { describe, it, expect } from 'vitest';
import { chronological, namesById, versionsOf } from './derive';
import type { PublicFact } from './projection';

const fact = (
	id: string,
	characterId: string,
	from: number,
	source: PublicFact['source']
): PublicFact => ({
	id,
	placeId: 'p',
	characterId,
	from,
	to: from,
	departure: false,
	text: '',
	source
});

describe('versionsOf', () => {
	const facts = [
		fact('a', 'mael', 100, { kind: 'testimony', speakerId: 'mael' }),
		fact('b', 'mael', 90, { kind: 'testimony', speakerId: 'jade' }),
		fact('c', 'mael', 80, { kind: 'clue', clueTypeId: 'receipt' }),
		fact('d', 'lea', 70, { kind: 'clue', clueTypeId: 'bill' })
	];

	it('splits what a suspect says, what others say and the proofs', () => {
		const versions = versionsOf(facts, 'mael');
		expect(versions.saysHimself.map((f) => f.id)).toEqual(['a']);
		expect(versions.othersSay.map((f) => f.id)).toEqual(['b']);
		expect(versions.proofs.map((f) => f.id)).toEqual(['c']);
	});

	it('is empty for a suspect nothing is known about', () => {
		expect(versionsOf(facts, 'noe')).toEqual({ saysHimself: [], othersSay: [], proofs: [] });
	});
});

describe('chronological and namesById', () => {
	it('sorts the facts by time', () => {
		const facts = [
			fact('x', 'a', 30, { kind: 'clue', clueTypeId: 'r' }),
			fact('y', 'a', 10, { kind: 'clue', clueTypeId: 'r' })
		];
		expect(chronological(facts).map((f) => f.id)).toEqual(['y', 'x']);
	});

	it('maps suspect ids to first names', () => {
		expect(namesById([{ id: 'c1', firstName: 'Léa' }])).toEqual({ c1: 'Léa' });
	});
});
