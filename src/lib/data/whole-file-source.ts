import type { Source } from 'pmtiles';

// The part of `fetch` we use, so that tests can give a fake host.
export type FetchFile = (url: string) => Promise<Pick<Response, 'ok' | 'status' | 'arrayBuffer'>>;

// A PMTiles file read whole, once, and served from memory: no range requests are needed from
// the host (the local server of the apps, the cache of the Service Worker).
export function wholeFileSource(url: string, fetchFn: FetchFile = fetch): Source {
	let file: Promise<ArrayBuffer> | undefined;
	const load = async () => {
		const response = await fetchFn(url);
		if (!response.ok) throw new Error(`Cannot read ${url}: ${response.status}`);
		return response.arrayBuffer();
	};
	return {
		getKey: () => url,
		getBytes: async (offset, length) => {
			file ??= load();
			return { data: (await file).slice(offset, offset + length) };
		}
	};
}
