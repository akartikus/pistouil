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
	actualHours: open,
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
	motive: lie ? ('surprise' as const) : null
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
	scenarioId: 'music',
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
			segments: [{ placeId: 'bakery', from: 1240, to: 1275 }]
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
		fact('f2', 'paul', 'bakery', 1240, 1275, 0, testimony('paul')),
		fact('f3', 'ines', 'cafe', 1230, 1280, 0, testimony('ines')),
		fact('f4', 'lucie', 'cafe', 1250, 1250, 0, testimony('ines'), true),
		fact('f5', 'paul', 'bakery', 1263, 1263, 0, clue('receipt')),
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
				c.places[1].actualHours = [{ from: 420, to: 1170 }];
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
			'truths-uncontradicted',
			(i) => {
				byId(i, 'f2').placeId = 'cafe';
				byId(i, 'f2').from = 1258;
				byId(i, 'f2').to = 1258;
			}
		]
	];

	it.each(violations)('detects a violation of %s', (rule, mutate) => {
		const investigation = base();
		const ctx = context();
		mutate(investigation, ctx);
		expect(checkRules(investigation, ctx)).toContain(rule);
	});
});
