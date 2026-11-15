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
