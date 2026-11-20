// The Worker holds the whole investigation: the interface only gets what `session.ts` replies.
import { validateCatalog } from '../engine/catalog';
import { assembleGraph, pedestrianRoutes } from '../engine/pedestrian';
import { rawStarterCatalog } from '../engine/starter-catalog';
import { createCellLoader, DATA_BASE, loadManifest } from '../data/files';
import type { Reply, Request } from './protocol';
import { handle, startSession, type DataSource, type Session, type SessionDeps } from './session';

const loader = createCellLoader(DATA_BASE, fetch);

const source: DataSource = {
	manifest: () => loadManifest(DATA_BASE, fetch),
	places: loader.places,
	graph: loader.graph
};

const catalog = validateCatalog(structuredClone(rawStarterCatalog));

const deps: SessionDeps = {
	catalog,
	source,
	computeRoutes: (places, graph) => pedestrianRoutes(places, assembleGraph(graph))
};

let session: Session | null = null;

self.onmessage = async (event: MessageEvent<Request>) => {
	const message = event.data;
	let reply: Reply;
	if (message.type === 'start' || message.type === 'resume') {
		const result = await startSession(deps, message);
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
