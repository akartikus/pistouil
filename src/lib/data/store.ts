import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

// The downloaded zones on the device. The Filesystem plugin keeps files on the native file
// system in the apps and in IndexedDB on the web: this is the only place that knows it.
export interface ZoneStore {
	// Text, or bytes as base64 when `bytes` is set; null when the file is missing.
	read(path: string, bytes?: boolean): Promise<string | null>;
	write(path: string, data: string, bytes?: boolean): Promise<void>;
	// A file or a whole folder; nothing happens when it is missing.
	remove(path: string): Promise<void>;
	// Names in a folder; empty when the folder is missing.
	list(path: string): Promise<string[]>;
}

export type FsPort = Pick<
	typeof Filesystem,
	'readFile' | 'writeFile' | 'deleteFile' | 'rmdir' | 'readdir'
>;

export function createFileStore(fs: FsPort = Filesystem): ZoneStore {
	const at = (path: string) => ({ path, directory: Directory.Data });
	// Without an encoding, the plugin writes base64 as bytes and reads bytes as base64.
	const encoding = (bytes?: boolean) => (bytes ? {} : { encoding: Encoding.UTF8 });
	return {
		async read(path, bytes) {
			try {
				return (await fs.readFile({ ...at(path), ...encoding(bytes) })).data as string;
			} catch {
				return null;
			}
		},
		async write(path, data, bytes) {
			await fs.writeFile({ ...at(path), data, recursive: true, ...encoding(bytes) });
		},
		async remove(path) {
			await fs
				.deleteFile(at(path))
				.catch(() => fs.rmdir({ ...at(path), recursive: true }).catch(() => {}));
		},
		async list(path) {
			try {
				return (await fs.readdir(at(path))).files.map((file) => file.name);
			} catch {
				return [];
			}
		}
	};
}

type StorageManagerPort = Pick<StorageManager, 'persisted' | 'persist'>;

// Asks the browser not to clear the data on its own; true when it agreed.
export async function persistStorage(storage: StorageManagerPort | undefined): Promise<boolean> {
	if (!storage?.persist) return false;
	return (await storage.persisted()) || (await storage.persist());
}

// The native apps keep their files; only the browser needs asking (or, with `ask` unset,
// only tells whether it already agreed).
export async function keepData(ask = true): Promise<boolean> {
	if (Capacitor.isNativePlatform()) return true;
	const storage = globalThis.navigator?.storage;
	return ask ? persistStorage(storage) : ((await storage?.persisted?.()) ?? false);
}
