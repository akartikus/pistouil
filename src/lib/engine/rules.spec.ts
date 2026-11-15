import { describe, it, expect } from 'vitest';
import { checkRules, type RuleContext, type RuleName } from './rules';
import { validateCatalog } from './catalog';
import { rawStarterCatalog } from './fixtures';
import type { Fact, Investigation, Place } from './types';

// Reference example (DATA-MODEL.md section 8) as a full investigation.
const catalog = validateCatalog(structuredClone(rawStarterCatalog));
const open = [{ from: 0, to: 1440 }];
const place = (osmId: string, name: string, typeId: string, extra: Partial<Place> = {}): Place => ({
	osmId,
	name,
	lat: 0,
	lon: 0,
	typeId,
	removed: false,
	actualHours: { weekday: open, weekend: open },
	...extra
});

const places = [
	place('cafe', 'Café', 'cafe'),
	place('bakery', 'Boulangerie', 'bakery'),
	place('park', 'Parc', 'park')
];
const routes = [
	{ placeA: 'cafe', placeB: 'park', distanceM: 1000, minutes: 12 },
	{ placeA: 'bakery', placeB: 'park', distanceM: 330, minutes: 4 },
	{ placeA: 'cafe', placeB: 'bakery', distanceM: 830, minutes: 10 }
];

const testimony = (speakerId: string, lie = false) => ({
	kind: 'testimony' as const,
	speakerId,
	renderedText: 'Un témoignage.',
	lie,
	motive: lie ? ('surprise' as const) : null,
	lieKind: lie ? ('alibi' as const) : null
});
const clue = (clueTypeId: string) => ({
	kind: 'clue' as const,
	clueTypeId,
	renderedText: 'Un indice.'
});

const base = (): Investigation => ({
	seed: 1,
	difficulty: 1,
	mysteryTime: 1265,
	dayType: 'weekday',
	scenarioId: 'library_swap',
	itemIds: [],
	situationText: 'Une boîte à musique.',
	revelationText: 'Une surprise.',
	sceneId: 'park',
	placeIds: ['cafe', 'bakery', 'park'],
	routes,
	characters: [
		{
			id: 'lucie',
			firstName: 'Lucie',
			author: true,
			segments: [
				{ placeId: 'cafe', from: 1230, to: 1250 },
				{ placeId: 'park', from: 1262, to: 1267 }
			]
		},
		{
			id: 'paul',
			firstName: 'Paul',
			author: false,
			segments: [{ placeId: 'bakery', from: 1240, to: 1263 }]
		},
		{
			id: 'ines',
			firstName: 'Inès',
			author: false,
			segments: [{ placeId: 'cafe', from: 1230, to: 1280 }]
		}
	],
	facts: [
		fact('f1', 'lucie', 'cafe', 1230, 1260, null, testimony('lucie', true)),
		fact('f2', 'paul', 'bakery', 1240, 1263, 0, testimony('paul')),
		fact('f3', 'ines', 'cafe', 1230, 1280, 0, testimony('ines')),
		fact('f4', 'lucie', 'cafe', 1250, 1250, 0, testimony('ines'), true),
		fact('f5', 'paul', 'bakery', 1263, 1263, 0, clue('receipt'), true),
		fact('f6', 'ines', 'cafe', 1230, 1280, 0, clue('waiter'))
	]
});

function fact(
	id: string,
	characterId: string,
	placeId: string,
	from: number,
	to: number,
	segment: number | null,
	source: Fact['source'],
	departure = false
): Fact {
	return { id, characterId, placeId, from, to, departure, segment, unlockedBy: null, source };
}

const context = (): RuleContext => ({ places: structuredClone(places), routes, catalog });
const byId = (investigation: Investigation, id: string) =>
	investigation.facts.find((f) => f.id === id)!;

describe('checkRules', () => {
	it('accepts the reference investigation', () => {
		expect(checkRules(base(), context())).toEqual([]);
	});

	const violations: [RuleName, (i: Investigation, c: RuleContext) => void][] = [
		[
			'scene-role',
			(_, c) => {
				c.places[2].typeId = 'school';
			}
		],
		[
			'excluded-places-unused',
			(_, c) => {
				c.places[1].removed = true;
			}
		],
		[
			'clue-compatibility',
			(i) => {
				(byId(i, 'f5').source as { clueTypeId: string }).clueTypeId = 'bus_driver';
			}
		],
		[
			'clue-hours',
			(_, c) => {
				c.places[1].actualHours = { weekday: [{ from: 420, to: 1170 }], weekend: [] };
			}
		],
		[
			'clue-hours',
			(i, c) => {
				// The café is closed on the weekend, and the investigation is on a weekend.
				i.dayType = 'weekend';
				c.places[0].actualHours = { weekday: open, weekend: [] };
			}
		],
		[
			'facts-within-hours',
			(_, c) => {
				// A true testimony places someone in the café outside its hours.
				c.places[0].actualHours = { weekday: [{ from: 600, to: 1200 }], weekend: open };
			}
		],
		[
			'facts-within-hours',
			(i, c) => {
				// The bakery is open on weekdays only: the facts at the bakery are out on a weekend.
				i.dayType = 'weekend';
				c.places[1].actualHours = { weekday: open, weekend: [] };
			}
		],
		[
			'realistic-routes',
			(i) => {
				i.characters[0].segments[1].from = 1251;
			}
		],
		[
			'true-facts-derived',
			(i) => {
				byId(i, 'f2').segment = null;
			}
		],
		[
			'only-author-lies',
			(i) => {
				(byId(i, 'f2').source as { lie: boolean }).lie = true;
			}
		],
		[
			'distinct-first-names',
			(i) => {
				i.characters[1].firstName = 'Lucie';
			}
		],
		[
			'complete-texts',
			(i) => {
				byId(i, 'f3').source.renderedText = 'Bonjour {firstName}';
			}
		],
		[
			'unique-solution',
			(i) => {
				i.facts = i.facts.filter((f) => f.id !== 'f5');
			}
		],
		[
			'reachable-solution',
			(i) => {
				byId(i, 'f5').unlockedBy = 'f6';
				byId(i, 'f6').unlockedBy = 'f5';
			}
		],
		[
			'complete-route-matrix',
			(_, c) => {
				c.routes = c.routes.slice(1);
			}
		],
		[
			'suspect-count',
			(i) => {
				i.difficulty = 2;
			}
		],
		[
			'unlock-acyclic',
			(i) => {
				byId(i, 'f1').unlockedBy = 'f1';
			}
		],
		[
			'lie-detectable',
			(i) => {
				i.facts = i.facts.filter((f) => f.id !== 'f4');
			}
		],
		[
			'items-match-scenario',
			(i) => {
				// A linen item in a scenario that only accepts wearable items.
				i.scenarioId = 'statue_makeover';
				i.itemIds = ['heart_boxers'];
			}
		],
		[
			'items-match-scenario',
			(i) => {
				i.scenarioId = 'statue_makeover';
				i.itemIds = ['pink_wig', 'pink_wig'];
			}
		],
		[
			'items-match-scenario',
			(i) => {
				i.scenarioId = 'statue_makeover';
				i.itemIds = ['pink_wig', 'sunglasses', 'headphones'];
			}
		],
		[
			'items-match-scenario',
			(i) => {
				i.scenarioId = 'statue_makeover';
				i.itemIds = [];
			}
		],
		[
			'items-match-scenario',
			(i) => {
				i.itemIds = ['ghost'];
			}
		],
		[
			'items-match-scenario',
			(i) => {
				i.scenarioId = 'unknown_scenario';
			}
		],
		[
			'mystery-time-rounded',
			(i) => {
				i.mysteryTime = 477; // 7h57
			}
		],
		[
			'proof-at-departure',
			(i) => {
				byId(i, 'f5').from = 1250;
				byId(i, 'f5').to = 1250;
			}
		],
		[
			'proof-at-departure',
			(i) => {
				byId(i, 'f5').departure = false;
			}
		],
		[
			'truths-uncontradicted',
			(i) => {
				byId(i, 'f2').placeId = 'cafe';
				byId(i, 'f2').from = 1258;
				byId(i, 'f2').to = 1258;
			}
		]
	];

	it('accepts a lie in a closed place even when no fact contradicts it', () => {
		const investigation = base();
		const ctx = context();
		// No witness saw Lucie leave, and her alibi is at the park, which is shut at that hour.
		investigation.facts = investigation.facts.filter((f) => f.id !== 'f4');
		byId(investigation, 'f1').placeId = 'park';
		ctx.places[2].actualHours = { weekday: [{ from: 0, to: 600 }], weekend: open };
		expect(checkRules(investigation, ctx)).not.toContain('lie-detectable');
	});

	it('rejects a lie that nothing contradicts and that falls in the opening hours', () => {
		const investigation = base();
		investigation.facts = investigation.facts.filter((f) => f.id !== 'f4');
		expect(checkRules(investigation, context())).toContain('lie-detectable');
	});

	it('accepts the same facts on a weekend when every place is open', () => {
		const investigation = base();
		investigation.dayType = 'weekend';
		expect(checkRules(investigation, context())).toEqual([]);
	});

	it('accepts items that match the scenario', () => {
		const investigation = base();
		investigation.scenarioId = 'statue_makeover';
		investigation.itemIds = ['pink_wig', 'sunglasses'];
		expect(checkRules(investigation, context())).toEqual([]);
	});

	it.each(violations)('detects a violation of %s', (rule, mutate) => {
		const investigation = base();
		const ctx = context();
		mutate(investigation, ctx);
		expect(checkRules(investigation, ctx)).toContain(rule);
	});
});
