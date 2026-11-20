// Opening hours written in the OpenStreetMap syntax (`Mo-Sa 08:30-20:00; PH off`), in plain French.
// Only the common forms are understood; anything else keeps its text, with its known words translated.

const DAYS: Record<string, string> = {
	Mo: 'lun.',
	Tu: 'mar.',
	We: 'mer.',
	Th: 'jeu.',
	Fr: 'ven.',
	Sa: 'sam.',
	Su: 'dim.'
};
const SHORT_MONTHS: Record<string, string> = {
	Jan: 'janv.',
	Feb: 'févr.',
	Mar: 'mars',
	Apr: 'avr.',
	May: 'mai',
	Jun: 'juin',
	Jul: 'juil.',
	Aug: 'août',
	Sep: 'sept.',
	Oct: 'oct.',
	Nov: 'nov.',
	Dec: 'déc.'
};
const LONG_MONTHS: Record<string, string> = {
	Jan: 'janvier',
	Feb: 'février',
	Mar: 'mars',
	Apr: 'avril',
	May: 'mai',
	Jun: 'juin',
	Jul: 'juillet',
	Aug: 'août',
	Sep: 'septembre',
	Oct: 'octobre',
	Nov: 'novembre',
	Dec: 'décembre'
};
const SPECIAL: Record<string, string> = { PH: 'jours fériés', SH: 'vacances scolaires' };

const DAY = '(?:Mo|Tu|We|Th|Fr|Sa|Su)';
const MONTH = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
const TIME = '\\d{1,2}:\\d{2}';
const RANGE = `${TIME}-${TIME}`;
const DAY_ITEM = `(?:${DAY}(?:-${DAY})?(?:\\[\\d\\])?|PH|SH)`;

// 08:30 is 8h30 and 20:00 is 20h, as everywhere in the game.
function time(text: string): string {
	const [hours, minutes] = text.split(':');
	return minutes === '00' ? `${Number(hours)}h` : `${Number(hours)}h${minutes}`;
}

const range = (text: string) => text.split('-').map(time).join('–');

function dayItem(item: string): string {
	const [, first, last, nth] = item.match(/^(\w{2})(?:-(\w{2}))?(?:\[(\d)\])?$/)!;
	const days = last ? `${DAYS[first]}–${DAYS[last]}` : DAYS[first];
	return nth ? `${nth === '1' ? '1er' : `${nth}e`} ${days}` : days;
}

// One rule (`Mo-Fr 09:00-12:00,14:00-17:30`), or null when its shape is not one we understand.
function formatRule(rule: string): string | null {
	if (rule === '24/7') return 'ouvert tout le temps';

	const date = rule.match(new RegExp(`^(?:(\\d{4}) )?(${MONTH}) (\\d{1,2}) (?:off|closed)$`));
	if (date) {
		const [, year, month, day] = date;
		return `fermé le ${Number(day) === 1 ? '1er' : Number(day)} ${LONG_MONTHS[month]}${year ? ` ${year}` : ''}`;
	}

	let rest = rule;
	let season = '';
	const months = rest.match(new RegExp(`^(${MONTH})(?:-(${MONTH}))? (?=[A-Z0-9])`));
	if (months) {
		season = `${SHORT_MONTHS[months[1]]}${months[2] ? `–${SHORT_MONTHS[months[2]]}` : ''} : `;
		rest = rest.slice(months[0].length);
	}

	const days: string[] = [];
	const special: string[] = [];
	const selector = rest.match(new RegExp(`^(${DAY_ITEM}(?:,${DAY_ITEM})*)(?: |$)`));
	if (selector) {
		for (const item of selector[1].split(',')) {
			if (item in SPECIAL) special.push(SPECIAL[item]);
			else days.push(dayItem(item));
		}
		rest = rest.slice(selector[0].length);
	}

	const closed = rest === 'off' || rest === 'closed';
	const slots = rest.match(new RegExp(`^${RANGE}(?:, ?${RANGE})*$`));
	if (!closed && !slots) return null;

	const dayText = days.join(', ');
	const when =
		dayText && special.length
			? `${dayText} et ${special.join(' et ')}`
			: dayText || special.join(' et ');
	if (closed) {
		if (!when) return `${season}fermé`;
		return `${season}${dayText ? `${when} fermé` : `fermé les ${when}`}`;
	}
	const hours = rest.split(/, ?/).map(range);
	const slotText =
		hours.length > 2 ? `${hours.slice(0, -1).join(', ')} et ${hours.at(-1)}` : hours.join(' et ');
	return `${season}${when ? `${when} ` : ''}${slotText}`;
}

// The known words of a rule we do not understand, translated; the rest stays as written.
function translateWords(text: string): string {
	return text
		.replace(new RegExp(`(${TIME})-(${TIME})`, 'g'), (_, a, b) => `${time(a)}–${time(b)}`)
		.replace(new RegExp(TIME, 'g'), time)
		.replace(new RegExp(`\\b(${DAY})-(${DAY})\\b`, 'g'), (_, a, b) => `${DAYS[a]}–${DAYS[b]}`)
		.replace(new RegExp(`\\b${DAY}\\b`, 'g'), (day) => DAYS[day])
		.replace(new RegExp(`\\b${MONTH}\\b`, 'g'), (month) => SHORT_MONTHS[month])
		.replace(/\b(PH|SH)\b/g, (word) => SPECIAL[word])
		.replace(/\b(?:off|closed)\b/gi, 'fermé')
		.replace(/,(?=[a-zéû])/g, ', ');
}

export function formatOpeningHours(raw: string): string {
	return raw
		.split(';')
		.map((rule) => rule.trim())
		.filter(Boolean)
		.map((rule) => formatRule(rule) ?? translateWords(rule))
		.join(' ; ');
}
