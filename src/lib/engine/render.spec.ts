import { describe, it, expect } from 'vitest';
import { formatTime, renderTemplate, hasUnresolvedVariable } from './render';

describe('formatTime', () => {
	it('renders minutes since midnight as hours and minutes', () => {
		expect(formatTime(1265)).toBe('21h05');
		expect(formatTime(5)).toBe('0h05');
		expect(formatTime(1230)).toBe('20h30');
	});
});

describe('renderTemplate', () => {
	const values = { speaker: 'Inès', firstName: 'Lucie', place: 'Café', time: '20h50' };
	const template = '{speaker} : « J’ai vu {firstName} quitter {place} à {time}. »';

	it('fills every variable', () => {
		const text = renderTemplate(template, values);
		expect(text).toBe('Inès : « J’ai vu Lucie quitter Café à 20h50. »');
		expect(hasUnresolvedVariable(text)).toBe(false);
	});

	it('gives the same text for the same template and values', () => {
		expect(renderTemplate(template, values)).toBe(renderTemplate(template, { ...values }));
	});

	it('fails when a variable has no value', () => {
		expect(() => renderTemplate('{speaker} à {time}', { speaker: 'Inès' })).toThrow(/time/);
	});

	it('gives a true and a lying testimony the same shape', () => {
		const shape = 'J’étais à {place} de {from} à {to}.';
		const truth = renderTemplate(shape, { place: 'Café', from: '20h30', to: '20h50' });
		const lie = renderTemplate(shape, { place: 'Café', from: '20h30', to: '21h00' });
		expect(truth.replace(/\d+h\d+/g, 'H')).toBe(lie.replace(/\d+h\d+/g, 'H'));
	});
});
