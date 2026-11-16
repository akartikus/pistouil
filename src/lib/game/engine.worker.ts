// The Worker holds the whole investigation: the interface only gets what `session.ts` replies.
import { validateCatalog } from '../engine/catalog';
import { assembleGraph, pedestrianRoutes } from '../engine/pedestrian';
import { rawStarterCatalog } from '../engine/starter-catalog';
import { createCellLoader, loadCommunes, loadManifest } from '../data/files';
import type { Reply, Request } from './protocol';
import { handle, startSession, type Session, type SessionDeps } from './session';

const base = import.meta.env.VITE_DATA_URL ?? '/dev-data';
const loader = createCellLoader(base, fetch);

const deps: SessionDeps = {
	catalog: validateCatalog(structuredClone(rawStarterCatalog)),
	source: {
		manifest: () => loadManifest(base, fetch),
		communes: () => loadCommunes(base, fetch),
		places: loader.places,
		graph: loader.graph
	},
	computeRoutes: (places, graph) => pedestrianRoutes(places, assembleGraph(graph))
};

let session: Session | null = null;

self.onmessage = async (event: MessageEvent<Request>) => {
	const request = event.data;
	let reply: Reply;
	if (request.type === 'start' || request.type === 'resume') {
		const result = await startSession(deps, request);
		if (result.ok) session = result.session;
		reply = result.ok ? { type: 'started', view: result.view } : result.reply;
	} else if (session) {
		const step = handle(session, request);
		session = step.session;
		reply = step.reply;
	} else {
		reply = { type: 'refused', reason: 'no investigation in progress' };
	}
	self.postMessage(reply);
};
