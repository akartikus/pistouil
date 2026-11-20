import type { FileReply, FileRequest, Reply, Request } from './protocol';

// Talks to the Worker: one answer per request, in order. The Worker may ask for files of
// the downloaded zones on the way; `readFile` reads them on the device.
export interface GameClient {
	request(request: Request): Promise<Reply>;
	stop(): void;
}

export function createGameClient(readFile: (path: string) => Promise<string | null>): GameClient {
	const worker = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
	const waiting: ((reply: Reply) => void)[] = [];
	worker.onmessage = async (event: MessageEvent<Reply | FileRequest>) => {
		const message = event.data;
		if (message.type !== 'read') return waiting.shift()?.(message);
		const text = await readFile(message.path);
		worker.postMessage({ type: 'file', id: message.id, text } satisfies FileReply);
	};
	return {
		request: (request) =>
			new Promise((resolve) => {
				waiting.push(resolve);
				worker.postMessage(request);
			}),
		stop: () => worker.terminate()
	};
}
