import type { PublicFact } from './projection';

// Small readings of the discovered facts, shared by the screens.

export const namesById = (suspects: { id: string; firstName: string }[]) =>
	Object.fromEntries(suspects.map((suspect) => [suspect.id, suspect.firstName]));

const byTime = (a: PublicFact, b: PublicFact) => a.from - b.from || a.to - b.to;

export const chronological = (facts: PublicFact[]) => [...facts].sort(byTime);

// The three versions of a suspect's file.
export function versionsOf(facts: PublicFact[], suspectId: string) {
	const about = facts.filter((fact) => fact.characterId === suspectId);
	return {
		saysHimself: about.filter(
			(fact) => fact.source.kind === 'testimony' && fact.source.speakerId === suspectId
		),
		othersSay: about.filter(
			(fact) => fact.source.kind === 'testimony' && fact.source.speakerId !== suspectId
		),
		proofs: about.filter((fact) => fact.source.kind === 'clue')
	};
}
