export type Theme = 'light' | 'dark';

export const styleUrl = (theme: Theme) => `/map/style-${theme}.json`;

// Colours of the game layers (docs/design/direction.md). The background colours stay in the style files.
export const GAME_COLORS = {
	light: {
		investigation: '#FF8A00',
		mystery: '#E0007A',
		route: '#1F4FFF',
		ink: '#000000',
		paper: '#FFFFFF',
		shadow: '#000000',
		frame: '#000000',
		numberFill: '#000000',
		numberInk: '#FFFFFF',
		mysteryNumberInk: '#FFFFFF',
		mask: '#2B2B2B',
		maskOpacity: 0.13,
		outline: '#555555',
		text: '#2B2B2B',
		halo: '#F2EFE7'
	},
	dark: {
		investigation: '#FFD400',
		mystery: '#FF4FA3',
		route: '#5CC8FF',
		ink: '#E6ECF2',
		paper: '#0B1218',
		shadow: '#3B4E63',
		frame: '#8195AA',
		numberFill: '#FFD400',
		numberInk: '#000000',
		mysteryNumberInk: '#000000',
		mask: '#000000',
		maskOpacity: 0.32,
		outline: '#9BB0C8',
		text: '#C9D4E0',
		halo: '#15202B'
	}
} satisfies Record<Theme, Record<string, string | number>>;
