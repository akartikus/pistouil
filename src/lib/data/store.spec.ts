import { describe, expect, it } from 'vitest';
import { createFileStore, persistStorage, type FsPort } from './store';

// The part of the Filesystem plugin the store uses, kept in memory like the web plugin does.
function fakeFs(): FsPort & { files: Map<string, string> } {
	const files = new Map<string, string>();
	const missing = () => Promise.reject(new Error('File does not exist.'));
	return {
		files,
		readFile: async ({ path }) => (files.has(path) ? { data: files.get(path)! } : missing()),
		writeFile: async ({ path, data }) => {
			files.set(path, data as string);
			return { uri: path };
		},
		deleteFile: async ({ path }) => {
			if (!files.delete(path)) return missing();
		},
		rmdir: async ({ path }) => {
			for (const key of [...files.keys()]) if (key.startsWith(`${path}/`)) files.delete(key);
		},
		readdir: async ({ path }) => {
			const names = new Set(
				[...files.keys()]
					.filter((key) => key.startsWith(`${path}/`))
					.map((key) => key.slice(path.length + 1).split('/')[0])
			);
			return {
				files: [...names].map((name) => ({
					name,
					type: 'file' as const,
					size: 0,
					mtime: 0,
					uri: name
				}))
			};
		}
	};
}

describe('file store', () => {
	it('gives back what was written, text or bytes', async () => {
		const store = createFileStore(fakeFs());
		await store.write('zones/13040/manifest.json', '{"a":1}');
		await store.write('zones/13040/tiles/0-3', 'AAEC', true);
		expect(await store.read('zones/13040/manifest.json')).toBe('{"a":1}');
		expect(await store.read('zones/13040/tiles/0-3', true)).toBe('AAEC');
	});

	it('reads a missing file as null', async () => {
		expect(await createFileStore(fakeFs()).read('zones.json')).toBeNull();
	});

	it('lists a folder and removes a file or a whole folder', async () => {
		const fs = fakeFs();
		const store = createFileStore(fs);
		await store.write('zones/13040/manifest.json', '{}');
		await store.write('zones/13086/manifest.json', '{}');
		await store.write('zones.json', '[]');
		expect((await store.list('zones')).sort()).toEqual(['13040', '13086']);
		await store.remove('zones/13040');
		await store.remove('zones.json');
		expect([...fs.files.keys()]).toEqual(['zones/13086/manifest.json']);
	});

	it('lists a missing folder as empty and ignores removing what is not there', async () => {
		const store = createFileStore(fakeFs());
		expect(await store.list('zones')).toEqual([]);
		await expect(store.remove('zones/13040')).resolves.toBeUndefined();
	});
});

describe('persistStorage', () => {
	it('asks the browser and tells whether it agreed', async () => {
		expect(await persistStorage({ persisted: async () => false, persist: async () => true })).toBe(
			true
		);
		expect(await persistStorage({ persisted: async () => false, persist: async () => false })).toBe(
			false
		);
	});

	it('does not ask again once granted, and says no when the browser cannot', async () => {
		let asked = false;
		const granted = {
			persisted: async () => true,
			persist: async () => (asked = true)
		};
		expect(await persistStorage(granted)).toBe(true);
		expect(asked).toBe(false);
		expect(await persistStorage(undefined)).toBe(false);
	});
});
