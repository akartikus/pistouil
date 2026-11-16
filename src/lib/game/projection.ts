import type { Difficulty, DayType, Investigation, Place } from '../engine/types';
import { discoveredFactIds } from './discovery';

// What the interface may know of an investigation: never the author, a lie, a motive,
// the true evening or the revelation text.
export interface PublicPlace {
	osmId: string;
	name: string;
	lat: number;
	lon: number;
	typeId: string;
	// Display number, from 1, in the order of the investigation.
	number: number;
}

export interface PublicSuspect {
	id: string;
	firstName: string;
}

export interface PublicInvestigation {
	seed: number;
	difficulty: Difficulty;
	mysteryTime: number;
	dayType: DayType;
	situationText: string;
	sceneId: string;
	places: PublicPlace[];
	suspects: PublicSuspect[];
}

export type PublicSource =
	{ kind: 'clue'; clueTypeId: string } | { kind: 'testimony'; speakerId: string };

// A fact of an opened place, as the player reads it.
export interface PublicFact {
	id: string;
	placeId: string;
	// The suspect the fact is about.
	characterId: string;
	from: number;
	to: number;
	departure: boolean;
	text: string;
	source: PublicSource;
}

export function project(investigation: Investigation, places: Place[]): PublicInvestigation {
	const byId = new Map(places.map((place) => [place.osmId, place]));
	return {
		seed: investigation.seed,
		difficulty: investigation.difficulty,
		mysteryTime: investigation.mysteryTime,
		dayType: investigation.dayType,
		situationText: investigation.situationText,
		sceneId: investigation.sceneId,
		places: investigation.placeIds.map((id, index) => {
			const place = byId.get(id)!;
			return {
				osmId: place.osmId,
				name: place.name,
				lat: place.lat,
				lon: place.lon,
				typeId: place.typeId,
				number: index + 1
			};
		}),
		suspects: investigation.characters.map((character) => ({
			id: character.id,
			firstName: character.firstName
		}))
	};
}

export function factsOfPlaces(
	investigation: Investigation,
	openedPlaceIds: string[]
): PublicFact[] {
	const found = new Set(discoveredFactIds(investigation, openedPlaceIds));
	return investigation.facts
		.filter((fact) => found.has(fact.id))
		.map((fact) => ({
			id: fact.id,
			placeId: fact.placeId,
			characterId: fact.characterId,
			from: fact.from,
			to: fact.to,
			departure: fact.departure,
			text: fact.source.renderedText,
			source:
				fact.source.kind === 'clue'
					? { kind: 'clue', clueTypeId: fact.source.clueTypeId }
					: { kind: 'testimony', speakerId: fact.source.speakerId }
		}));
}
