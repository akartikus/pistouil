// The Worker holds the whole investigation: the interface only gets what `session.ts` replies.
import { validateCatalog } from '../engine/catalog';
import { assembleGraph, pedestrianRoutes } from '../engine/pedestrian';
import { rawStarterCatalog } from '../engine/starter-catalog';
import { createCellLoader, createZoneSource, loadCommunes, loadManifest } from '../data/files';
import type { FileReply, FileRequest, OfflineZone, Reply, Request } from './protocol';
import { handle, startSession, type DataSource, type Session, type SessionDeps } from './session';

const base = import.meta.env.VITE_DATA_URL ?? '/dev-data';
const loader = createCellLoader(base, fetch);

const network: DataSource = {
	manifest: () => loadManifest(base, fetch),
	communes: () => loadCommunes(base, fetch),
	places: loader.places,
	graph: loader.graph
};

// Files of the downloaded zones, read by the interface on the device.
const reading = new Map<number, (text: string | null) => void>();
let lastRead = 0;
const read = (path: string) =>
	new Promise<string | null>((resolve) => {
		const id = ++lastRead;
		reading.set(id, resolve);
		self.postMessage({ type: 'read', id, path } satisfies FileRequest);
	});

const catalog = validateCatalog(structuredClone(rawStarterCatalog));

const deps = (zone?: OfflineZone): SessionDeps => ({
	catalog,
	source: zone ? createZoneSource(zone, read) : network,
	computeRoutes: (places, graph) => pedestrianRoutes(places, assembleGraph(graph))
});

let session: Session | null = null;

self.onmessage = async (event: MessageEvent<Request | FileReply>) => {
	const message = event.data;
	if (message.type === 'file') {
		reading.get(message.id)?.(message.text);
		reading.delete(message.id);
		return;
	}
	let reply: Reply;
	if (message.type === 'start' || message.type === 'resume') {
		const result = await startSession(deps(message.zone), message);
		if (result.ok) session = result.session;
		reply = result.ok ? { type: 'started', view: result.view } : result.reply;
	} else if (session) {
		const step = handle(session, message);
		session = step.session;
		reply = step.reply;
	} else {
		reply = { type: 'refused', reason: 'no investigation in progress' };
	}
	self.postMessage(reply);
};
