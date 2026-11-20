import type { Difficulty, Route } from '../engine/types';
import type { Evening } from './evening';
import type { GameProgress } from './progress';
import type { PublicFact, PublicInvestigation } from './projection';
import type { SavedGame } from './save';
import type { Center, CommuneSummary } from './zone';

// Messages between the interface and the Worker. Nothing hidden crosses before the accusation.

// In offline mode, the downloaded zone the data is read from (see data/zones.ts).
export interface OfflineZone {
	insee: string;
	cells: string[];
}

// The Worker cannot reach the device storage: it asks the interface for a file.
export type FileRequest = { type: 'read'; id: number; path: string };
export type FileReply = { type: 'file'; id: number; text: string | null };

export type Request =
	| {
			type: 'start';
			center: Center;
			name: string;
			// Code of the chosen commune, if any: it is left out of the neighbours to propose.
			insee?: string;
			difficulty: Difficulty;
			seed: number;
			zone?: OfflineZone;
	  }
	| { type: 'resume'; saved: SavedGame; zone?: OfflineZone }
	| { type: 'open'; placeId: string }
	| { type: 'measure'; a: string; b: string }
	| { type: 'accuse'; suspectId: string };

// A recognised place of the zone, for the decor of the map.
export interface DecorPlace {
	osmId: string;
	name: string;
	typeId: string;
	lat: number;
	lon: number;
	hours?: string;
}

export interface Revelation {
	correct: boolean;
	authorName: string;
	revelationText: string;
	evening: Evening;
	// Every trip between the places of the investigation, to explain the game at the end.
	trips: Route[];
	// Every fact of the investigation, those of the places never opened included.
	facts: PublicFact[];
}

// The session as the interface first sees it, at the start or after a resume.
export interface SessionView {
	investigation: PublicInvestigation;
	decor: DecorPlace[];
	radiusM: number;
	dataVersion: string;
	progress: GameProgress;
	// Facts of the places already opened.
	facts: PublicFact[];
	// Routes already measured.
	measured: Route[];
	// Present only when the investigation was already concluded.
	revelation: Revelation | null;
}

export type FailureReason =
	| 'data-missing'
	| 'not-enough-places'
	| 'no-scene'
	| 'difficulty-unreachable'
	| 'data-changed'
	// Offline mode: the investigation needs data outside the downloaded zones.
	| 'needs-connection';

export type Reply =
	| { type: 'started'; view: SessionView }
	| { type: 'failed'; reason: FailureReason; neighbors: CommuneSummary[] }
	| { type: 'opened'; placeId: string; facts: PublicFact[] }
	| { type: 'measured'; route: Route }
	| { type: 'accused'; revelation: Revelation }
	| { type: 'refused'; reason: string };
