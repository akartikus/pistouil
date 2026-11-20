import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatOpeningHours } from './opening-hours';

describe('formatOpeningHours', () => {
	const cases: [string, string][] = [
		['Mo-Sa 08:30-20:00; Su 08:30-12:30', 'lun.–sam. 8h30–20h ; dim. 8h30–12h30'],
		['Mo-Fr 09:00-12:00,14:00-17:30', 'lun.–ven. 9h–12h et 14h–17h30'],
		['Tu-Sa 06:00-13:00, 16:00-20:00; Su 06:00-13:00', 'mar.–sam. 6h–13h et 16h–20h ; dim. 6h–13h'],
		['Mo,We-Fr 09:00-12:00', 'lun., mer.–ven. 9h–12h'],
		['We 14:00-17:00; Sa[2] 14:00-17:00', 'mer. 14h–17h ; 2e sam. 14h–17h'],
		['10:30-16:15', '10h30–16h15'],
		['Mo-Su 00:00-01:00,09:00-24:00', 'lun.–dim. 0h–1h et 9h–24h'],
		['Mo-Fr 08:30-12:00; PH off', 'lun.–ven. 8h30–12h ; fermé les jours fériés'],
		['Mo-Su,PH 06:00-23:00', 'lun.–dim. et jours fériés 6h–23h'],
		['Tu-Sa 08:30-12:00; Mo off', 'mar.–sam. 8h30–12h ; lun. fermé'],
		[
			'Mo-Sa 08:45-11:00; Su off; PH off',
			'lun.–sam. 8h45–11h ; dim. fermé ; fermé les jours fériés'
		],
		['Tu-Fr 12:00-15:00; Su-Mo off', 'mar.–ven. 12h–15h ; dim.–lun. fermé'],
		['Mo-Sa 09:00-12:00; 2024 May 20 off', 'lun.–sam. 9h–12h ; fermé le 20 mai 2024'],
		[
			'Mo-Sa 08:30-20:00; PH 08:30-18:00; May 1 off',
			'lun.–sam. 8h30–20h ; jours fériés 8h30–18h ; fermé le 1er mai'
		],
		['24/7', 'ouvert tout le temps'],
		['off', 'fermé'],
		['closed', 'fermé'],
		['Mar-Sep Su 14:00-18:00', 'mars–sept. : dim. 14h–18h'],
		[
			'Mar-Sep Su 14:00-18:00; Oct-Feb Su 14:00-17:30',
			'mars–sept. : dim. 14h–18h ; oct.–févr. : dim. 14h–17h30'
		],
		['Apr,Sep 09:00-19:30', 'avr., sept. 9h–19h30'],
		['sur rendez-vous', 'sur rendez-vous'],
		['', '']
	];

	it.each(cases)('writes %s in French', (raw, expected) => {
		expect(formatOpeningHours(raw)).toBe(expected);
	});

	it('translates what it can of a complex rule and drops nothing', () => {
		const text = formatOpeningHours('Jul 09-Aug 31: Tu 15:00-18:00; Su-Mo off');
		expect(text).toContain('juil.');
		expect(text).toContain('août');
		expect(text).toContain('mar.');
		expect(text).toContain('15h–18h');
		expect(text).toContain('dim.–lun.');
		expect(text).toContain('fermé');
		expect(text).toContain('09');
		expect(text).toContain('31');
	});
});

describe('the opening hours of Fuveau', () => {
	const dir = 'static/data/fuveau/places';
	const hours = new Set<string>();
	for (const file of readdirSync(dir)) {
		for (const place of JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'))) {
			if (place.openingHours) hours.add(place.openingHours);
		}
	}

	it('are read from the data', () => {
		expect(hours.size).toBeGreaterThan(50);
	});

	it('keep no English day, month, keyword or 24-hour time once written in French', () => {
		const english =
			/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH|SH|off|closed|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b|\d{1,2}:\d{2}/;
		for (const raw of hours) {
			const text = formatOpeningHours(raw);
			expect(text, raw).not.toBe('');
			expect(text, raw).not.toMatch(english);
		}
	});
});
