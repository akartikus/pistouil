import type { PublicFact } from './projection';

// Small readings of the discovered facts, shared by the screens.

export const namesById = (suspects: { id: string; firstName: string }[]) =>
	Object.fromEntries(suspects.map((suspect) => [suspect.id, suspect.firstName]));

const byTime = (a: PublicFact, b: PublicFact) => a.from - b.from || a.to - b.to;

export const chronological = (facts: PublicFact[]) => [...facts].sort(byTime);

// The facts the notebook lists. Once the game is over (`all` given) it explains every fact of
// the investigation, those the player never read marked as not seen.
export function explainedFacts(read: PublicFact[], all: PublicFact[] | null) {
	const seen = new Set(read.map((fact) => fact.id));
	return chronological(all ?? read).map((fact) => ({ fact, seen: seen.has(fact.id) }));
}

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
