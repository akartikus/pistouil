import { error } from '@sveltejs/kit';

// Development tool: not available in production builds.
export function load() {
	if (!import.meta.env.DEV) error(404, 'Not found');
}
