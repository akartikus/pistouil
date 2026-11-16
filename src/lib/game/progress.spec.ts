import { describe, it, expect } from 'vitest';
import {
	accuse,
	annotate,
	initialProgress,
	isMeasured,
	measureRoute,
	openPlace,
	readFact,
	setAlibiStatus,
	setNotes
} from './progress';

const start = () => initialProgress(['lea', 'mael', 'jade']);

describe('initialProgress', () => {
	it('starts empty, with every alibi to check', () => {
		expect(start()).toEqual({
			openedPlaceIds: [],
			readFactIds: [],
			measuredRoutes: [],
			annotations: [],
			notes: '',
			alibiStatuses: { lea: 'to-check', mael: 'to-check', jade: 'to-check' },
			accusation: null
		});
	});
});

describe('openPlace', () => {
	it('remembers the places in the order they were opened, once', () => {
		const progress = openPlace(openPlace(openPlace(start(), 'b'), 'a'), 'b');
		expect(progress.openedPlaceIds).toEqual(['b', 'a']);
	});

	it('never changes an alibi status', () => {
		expect(openPlace(start(), 'a').alibiStatuses).toEqual(start().alibiStatuses);
	});
});

describe('readFact', () => {
	it('remembers a fact once it is read, once', () => {
		const progress = readFact(readFact(readFact(start(), 'f2'), 'f1'), 'f2');
		expect(progress.readFactIds).toEqual(['f2', 'f1']);
	});

	it('is not set by opening a place', () => {
		expect(openPlace(start(), 'a').readFactIds).toEqual([]);
	});
});

describe('measureRoute', () => {
	it('notes a pair once, whatever the direction', () => {
		const progress = measureRoute(measureRoute(start(), 'b', 'a'), 'a', 'b');
		expect(progress.measuredRoutes).toEqual([['a', 'b']]);
		expect(isMeasured(progress, 'a', 'b')).toBe(true);
		expect(isMeasured(progress, 'b', 'a')).toBe(true);
	});

	it('does not know a pair that was not measured', () => {
		expect(isMeasured(measureRoute(start(), 'a', 'b'), 'a', 'c')).toBe(false);
	});
});

describe('setAlibiStatus', () => {
	it('sets the status of one suspect only, as the player chooses', () => {
		const progress = setAlibiStatus(start(), 'mael', 'doubtful');
		expect(progress.alibiStatuses).toEqual({ lea: 'to-check', mael: 'doubtful', jade: 'to-check' });
	});
});

describe('annotate and setNotes', () => {
	it('keeps one annotation per place and removes it when emptied', () => {
		let progress = annotate(annotate(start(), 'a', 'premier'), 'a', 'second');
		expect(progress.annotations).toEqual([{ placeId: 'a', text: 'second' }]);
		progress = annotate(progress, 'a', '');
		expect(progress.annotations).toEqual([]);
	});

	it('keeps the free notes', () => {
		expect(setNotes(start(), 'Qui avait un motif ?').notes).toBe('Qui avait un motif ?');
	});
});

describe('accuse', () => {
	it('records the accusation once and keeps the first', () => {
		const first = accuse(start(), 'lea');
		expect(first.accusation).toBe('lea');
		expect(accuse(first, 'mael').accusation).toBe('lea');
	});
});
