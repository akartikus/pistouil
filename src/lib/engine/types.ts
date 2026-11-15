// Types of the data model. Source of truth: docs/reference/DATA-MODEL.md.
// Times are minutes since midnight, distances are whole meters.

export interface Interval {
	from: number;
	to: number;
}

export type Difficulty = 1 | 2 | 3;

export type PlaceRole = 'scene' | 'alibi' | 'excluded';
export type ClueNature = 'proof' | 'npc';
export type CluePrecision = 'instant' | 'interval';
export type TestimonyPrecision = 'instant' | 'interval' | 'departure';
export type TestimonySubject = 'self' | 'other';

export const LIE_MOTIVES = [
	'surprise',
	'modesty',
	'clumsiness',
	'misunderstanding',
	'mistake'
] as const;
export type LieMotive = (typeof LIE_MOTIVES)[number];

// Catalog layer

export interface PlaceType {
	id: string;
	// Outer list is an OR, each inner list is an AND of OSM tags.
	osmTags: string[][];
	// null means always open.
	typicalHours: Interval[] | null;
	role: PlaceRole;
	icon?: string;
}

export interface ClueType {
	id: string;
	nature: ClueNature;
	precision: CluePrecision;
	textTemplate: string;
}

export interface ScenarioModel {
	id: string;
	title: string;
	situation: string;
	sceneTypeIds: string[];
	timeRange: Interval;
	lieMotives: LieMotive[];
	revelations: Partial<Record<LieMotive, string>>;
}

export interface TestimonyTemplate {
	id: string;
	precision: TestimonyPrecision;
	subject: TestimonySubject;
	textTemplate: string;
}

export interface Catalog {
	placeTypes: PlaceType[];
	clueTypes: ClueType[];
	// Place type id -> compatible clue type ids.
	compatibilities: Record<string, string[]>;
	scenarios: ScenarioModel[];
	firstNames: string[];
	testimonyTemplates: TestimonyTemplate[];
}

// Places and routes (inputs of the engine)

export interface Place {
	osmId: string;
	name: string;
	lat: number;
	lon: number;
	typeId: string;
	// Overrides the type's typical hours when present.
	actualHours?: Interval[];
	removed: boolean;
}

export interface Route {
	placeA: string;
	placeB: string;
	distanceM: number;
	minutes: number;
	geometry?: [number, number][];
}

// Investigation layer

export interface Segment {
	placeId: string;
	from: number;
	to: number;
}

export interface Character {
	id: string;
	firstName: string;
	// Private: never read by the solver.
	author: boolean;
	// The true evening, hidden from the player.
	segments: Segment[];
}

export interface Clue {
	kind: 'clue';
	clueTypeId: string;
	renderedText: string;
}

export interface Testimony {
	kind: 'testimony';
	speakerId: string;
	renderedText: string;
	// Private: never read by the solver.
	lie: boolean;
	motive: LieMotive | null;
}

export type Source = Clue | Testimony;

export interface Fact {
	id: string;
	characterId: string;
	placeId: string;
	from: number;
	to: number;
	// The person was there at that instant and left right after (from = to).
	departure: boolean;
	// Index in the character's segments; null only for the author's lie.
	segment: number | null;
	// A fact without link is visible from the start.
	unlockedBy: string | null;
	source: Source;
}

export interface Investigation {
	seed: number;
	difficulty: Difficulty;
	mysteryTime: number;
	scenarioId: string;
	situationText: string;
	// Private: shown only after the accusation.
	revelationText: string;
	sceneId: string;
	placeIds: string[];
	characters: Character[];
	facts: Fact[];
	routes: Route[];
}

export interface Progress {
	discoveredFactIds: string[];
	annotations: { placeId: string; text: string }[];
	notes: string;
	accusation: string | null;
	resolutionDate: string | null;
}
