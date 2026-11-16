import type { Reply, Request } from './protocol';

// Talks to the Worker: one answer per request, in order.
export interface GameClient {
	request(request: Request): Promise<Reply>;
	stop(): void;
}

export function createGameClient(): GameClient {
	const worker = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
	const waiting: ((reply: Reply) => void)[] = [];
	worker.onmessage = (event: MessageEvent<Reply>) => waiting.shift()?.(event.data);
	return {
		request: (request) =>
			new Promise((resolve) => {
				waiting.push(resolve);
				worker.postMessage(request);
			}),
		stop: () => worker.terminate()
	};
}
