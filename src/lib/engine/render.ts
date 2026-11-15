import type { ItemType, LieMotive, ScenarioModel } from './types';

// Pure template rendering: fills {variable} slots, never reads clock or randomness.

export function formatTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const rest = String(minutes % 60).padStart(2, '0');
	return `${hours}h${rest}`;
}

export function hasUnresolvedVariable(text: string): boolean {
	return /[{}]/.test(text);
}

export function renderTemplate(template: string, values: Record<string, string>): string {
	const text = template.replace(/\{(\w+)\}/g, (_, name: string) => {
		if (!(name in values)) throw new Error(`Missing value for variable {${name}}`);
		return values[name];
	});
	if (hasUnresolvedVariable(text)) throw new Error(`Unresolved variable in "${text}"`);
	return text;
}

// "a", "a et b", "a, b et c".
export function joinList(parts: string[]): string {
	if (parts.length <= 1) return parts.join('');
	return `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}`;
}

// The situation lists the drawn items with their indefinite forms.
export function renderSituation(
	scenario: ScenarioModel,
	items: ItemType[],
	place: string,
	time: number
): string {
	return renderTemplate(scenario.situation, {
		place,
		time: formatTime(time),
		items: joinList(items.map((item) => item.indefinite))
	});
}

// A revelation cites at most one item: the first one drawn, in its definite form.
export function renderRevelation(
	scenario: ScenarioModel,
	motive: LieMotive,
	items: ItemType[],
	author: string,
	place: string
): string {
	return renderTemplate(scenario.revelations[motive]!, {
		author,
		place,
		item: items[0]?.definite ?? ''
	});
}
