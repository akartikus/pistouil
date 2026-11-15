import { LIE_MOTIVES, type Catalog } from './types';

export class CatalogError extends Error {}

const CLUE_VARIABLES = ['firstName', 'place', 'time', 'from', 'to'];
const TESTIMONY_VARIABLES = ['speaker', ...CLUE_VARIABLES];
const SITUATION_VARIABLES = ['day', 'place', 'time', 'items'];
const REVELATION_VARIABLES = ['author', 'place', 'item'];
// An item right after « de » or « à » would need a contracted article.
const ITEM_AFTER_PREPOSITION = /(?<!\p{L})(?:(?:de|à)\s+|d[’'])\{items?\}/iu;
const MIN_FIRST_NAMES = 12;
// Wording that sounds wrong (you do not say goodbye to a place) or points at a testimony.
const FORBIDDEN_PHRASES = [/au revoir à/i, /précisément/i];

function fail(message: string): never {
	throw new CatalogError(message);
}

function checkVariables(owner: string, template: string, allowed: string[]) {
	for (const [, name] of template.matchAll(/\{(\w+)\}/g)) {
		if (!allowed.includes(name)) fail(`${owner}: unknown variable {${name}}`);
	}
}

function checkUniqueIds(label: string, items: { id: string }[]) {
	const seen = new Set<string>();
	for (const { id } of items) {
		if (seen.has(id)) fail(`${label} ${id}: duplicate id`);
		seen.add(id);
	}
}

// The catalog comes from JSON files: validate it before the engine uses it.
export function validateCatalog(raw: unknown): Catalog {
	const catalog = raw as Catalog;
	for (const key of [
		'placeTypes',
		'clueTypes',
		'scenarios',
		'items',
		'firstNames',
		'testimonyTemplates'
	] as const) {
		if (!Array.isArray(catalog?.[key])) fail(`catalog.${key} must be a list`);
	}
	if (typeof catalog.compatibilities !== 'object' || catalog.compatibilities === null) {
		fail('catalog.compatibilities must be an object');
	}

	checkUniqueIds('place type', catalog.placeTypes);
	checkUniqueIds('clue type', catalog.clueTypes);
	checkUniqueIds('scenario', catalog.scenarios);
	checkUniqueIds('testimony template', catalog.testimonyTemplates);
	checkUniqueIds('item', catalog.items);

	for (const item of catalog.items) {
		if (!Array.isArray(item.tags) || item.tags.length === 0) fail(`item ${item.id}: no tag`);
		if (!item.indefinite || !item.definite) fail(`item ${item.id}: missing form`);
	}

	const placeTypes = new Map(catalog.placeTypes.map((type) => [type.id, type]));
	const clueTypeIds = new Set(catalog.clueTypes.map((type) => type.id));

	for (const type of catalog.placeTypes) {
		for (const day of ['weekday', 'weekend'] as const) {
			const hours = type.typicalHours?.[day];
			if (hours === undefined) fail(`place type ${type.id}: no ${day} hours`);
			if (hours === null) continue;
			const valid =
				Array.isArray(hours) &&
				hours.every(
					(interval, i) =>
						interval.from < interval.to && (i === 0 || hours[i - 1].to <= interval.from)
				);
			if (!valid) fail(`place type ${type.id}: invalid ${day} hours`);
		}
	}

	for (const [placeTypeId, clues] of Object.entries(catalog.compatibilities)) {
		if (!placeTypes.has(placeTypeId)) fail(`compatibility: unknown place type ${placeTypeId}`);
		for (const clueId of clues) {
			if (!clueTypeIds.has(clueId))
				fail(`compatibility ${placeTypeId}: unknown clue type ${clueId}`);
		}
	}

	for (const type of catalog.clueTypes) {
		checkVariables(`clue type ${type.id}`, type.textTemplate, CLUE_VARIABLES);
	}
	for (const [label, id, template] of [
		...catalog.clueTypes.map((type) => ['clue type', type.id, type.textTemplate] as const),
		...catalog.testimonyTemplates.map((t) => ['testimony template', t.id, t.textTemplate] as const)
	]) {
		const phrase = FORBIDDEN_PHRASES.find((pattern) => pattern.test(template));
		if (phrase) fail(`${label} ${id}: forbidden phrase ${phrase.source}`);
	}
	for (const template of catalog.testimonyTemplates) {
		checkVariables(`testimony template ${template.id}`, template.textTemplate, TESTIMONY_VARIABLES);
	}

	for (const scenario of catalog.scenarios) {
		checkVariables(`scenario ${scenario.id}`, scenario.situation, SITUATION_VARIABLES);
		for (const typeId of scenario.sceneTypeIds) {
			const type = placeTypes.get(typeId);
			if (!type) fail(`scenario ${scenario.id}: unknown scene type ${typeId}`);
			if (type.role !== 'scene') {
				fail(`scenario ${scenario.id}: type ${typeId} has role ${type.role}, expected scene`);
			}
		}
		const { min, max } = scenario.itemCount ?? { min: NaN, max: NaN };
		const texts = [scenario.situation, ...Object.values(scenario.revelations)];
		if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || min > max) {
			fail(`scenario ${scenario.id}: invalid item count`);
		}
		if (max > 0 && min === 0) fail(`scenario ${scenario.id}: item count must start at 1`);
		const pool = catalog.items.filter((item) =>
			item.tags.some((tag) => scenario.itemTags.includes(tag))
		);
		if (pool.length < max) {
			fail(`scenario ${scenario.id}: needs ${max} items, its tags offer ${pool.length}`);
		}
		if (max === 0 && texts.some((text) => /\{items?\}/.test(text))) {
			fail(`scenario ${scenario.id}: item variable without items`);
		}
		if (!scenario.situation.includes('{day}')) {
			fail(`scenario ${scenario.id}: the situation must say the day with {day}`);
		}
		if (min > 0 && !scenario.situation.includes('{items}')) {
			fail(`scenario ${scenario.id}: the situation must list {items}`);
		}
		if (texts.some((text) => ITEM_AFTER_PREPOSITION.test(text))) {
			fail(`scenario ${scenario.id}: an item cannot follow « de » or « à »`);
		}
		for (const motive of scenario.lieMotives) {
			if (!LIE_MOTIVES.includes(motive)) fail(`scenario ${scenario.id}: unknown motive ${motive}`);
			const text = scenario.revelations[motive];
			if (!text) fail(`scenario ${scenario.id}: motive ${motive} has no revelation`);
			checkVariables(`scenario ${scenario.id} revelation ${motive}`, text, REVELATION_VARIABLES);
		}
	}

	for (const precision of ['instant', 'interval', 'departure']) {
		for (const subject of ['self', 'other']) {
			const found = catalog.testimonyTemplates.some(
				(template) => template.precision === precision && template.subject === subject
			);
			if (!found) fail(`no testimony template for ${precision} / ${subject}`);
		}
	}

	if (catalog.firstNames.length < MIN_FIRST_NAMES) {
		fail(`catalog needs at least ${MIN_FIRST_NAMES} first names, got ${catalog.firstNames.length}`);
	}

	return catalog;
}
