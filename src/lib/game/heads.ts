// A simple face for each suspect, drawn by the code from the suspect's id.
// Real illustrations can replace it later without changing the screens.
export interface HeadTraits {
	hat: 'none' | 'cap' | 'tall';
	hair: 'none' | 'short' | 'long';
	glasses: boolean;
	mouth: 'smile' | 'flat' | 'open';
}

// FNV-1a: small, stable, enough to spread a few traits.
function hash(text: string): number {
	let h = 2166136261;
	for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619) >>> 0;
	return h;
}

export function headTraits(id: string): HeadTraits {
	const h = hash(id);
	return {
		hat: (['none', 'cap', 'tall'] as const)[h % 3],
		hair: (['none', 'short', 'long'] as const)[(h >>> 3) % 3],
		glasses: ((h >>> 6) & 1) === 1,
		mouth: (['smile', 'flat', 'open'] as const)[(h >>> 8) % 3]
	};
}
