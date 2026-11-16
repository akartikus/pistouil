import type { Place, Route } from './types';

// One grid cell of the pedestrian graph file (see tools/data-preparation/README.md).
export interface GraphCell {
	// [OSM node id, lat × 1e5, lon × 1e5]
	nodes: [number, number, number][];
	// [node a, node b, length in metres, shape points [lat × 1e5, lon × 1e5] from a to b]
	edges: [number, number, number, [number, number][]][];
	// Per place: [node a, node b, access m, position from a m, edge length m]
	access: Record<string, [number, number, number, number, number]>;
}

interface Edge {
	a: number;
	b: number;
	length: number;
	shape: [number, number][];
}

interface Step {
	to: number;
	length: number;
	edge: Edge;
}

export interface Graph {
	coords: Map<number, [number, number]>;
	edges: Edge[];
	steps: Map<number, Step[]>;
	access: Map<string, [number, number, number, number, number]>;
}

const EARTH_RADIUS_M = 6371000;
const METRES_PER_MINUTE = 83.3;
const DETOUR = 1.3;

export function haversineM(
	a: { lat: number; lon: number },
	b: { lat: number; lon: number }
): number {
	const rad = Math.PI / 180;
	const dLat = (b.lat - a.lat) * rad;
	const dLon = (b.lon - a.lon) * rad;
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
	return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export const minutesFor = (distanceM: number) =>
	Math.max(1, Math.ceil(distanceM / METRES_PER_MINUTE));

const edgeKey = (a: number, b: number, length: number) => `${a}|${b}|${length}`;

// Nodes are merged by id and an edge shared by two cells is kept once. An edge whose node
// is in no given cell is dropped, and so is an attachment to a dropped edge.
export function assembleGraph(cells: GraphCell[]): Graph {
	const coords = new Map<number, [number, number]>();
	for (const cell of cells) for (const [id, lat, lon] of cell.nodes) coords.set(id, [lat, lon]);

	const unique = new Map<string, Edge>();
	for (const cell of cells) {
		for (const [a, b, length, shape] of cell.edges) {
			if (!coords.has(a) || !coords.has(b)) continue;
			const key = `${edgeKey(a, b, length)}|${shape.join(';')}`;
			if (!unique.has(key)) unique.set(key, { a, b, length, shape });
		}
	}
	// Sorted so that the result does not depend on the order of the cells.
	const edges = [...unique.entries()]
		.sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0))
		.map(([, e]) => e);

	const steps = new Map<number, Step[]>();
	const known = new Set<string>();
	for (const edge of edges) {
		known.add(edgeKey(edge.a, edge.b, edge.length));
		if (!steps.has(edge.a)) steps.set(edge.a, []);
		if (!steps.has(edge.b)) steps.set(edge.b, []);
		steps.get(edge.a)!.push({ to: edge.b, length: edge.length, edge });
		steps.get(edge.b)!.push({ to: edge.a, length: edge.length, edge });
	}

	const access = new Map<string, [number, number, number, number, number]>();
	for (const cell of cells) {
		for (const [osmId, entry] of Object.entries(cell.access)) {
			if (known.has(edgeKey(entry[0], entry[1], entry[4]))) access.set(osmId, entry);
		}
	}
	return { coords, edges, steps, access };
}

// Binary heap ordered by (distance, node id).
class Heap {
	private items: [number, number][] = [];
	get size() {
		return this.items.length;
	}
	private less(i: number, j: number) {
		const [d1, n1] = this.items[i];
		const [d2, n2] = this.items[j];
		return d1 < d2 || (d1 === d2 && n1 < n2);
	}
	private swap(i: number, j: number) {
		[this.items[i], this.items[j]] = [this.items[j], this.items[i]];
	}
	push(distance: number, node: number) {
		this.items.push([distance, node]);
		let i = this.items.length - 1;
		while (i > 0 && this.less(i, (i - 1) >> 1)) {
			this.swap(i, (i - 1) >> 1);
			i = (i - 1) >> 1;
		}
	}
	pop(): [number, number] {
		const top = this.items[0];
		const last = this.items.pop()!;
		if (this.items.length > 0) {
			this.items[0] = last;
			let i = 0;
			for (;;) {
				let m = i;
				for (const c of [2 * i + 1, 2 * i + 2]) {
					if (c < this.items.length && this.less(c, m)) m = c;
				}
				if (m === i) break;
				this.swap(i, m);
				i = m;
			}
		}
		return top;
	}
}

interface Search {
	dist: Map<number, number>;
	prev: Map<number, { node: number; edge: Edge }>;
	settled: Set<number>;
}

// Shortest distances from a place, stopped once every target is final: both of its nodes
// are settled, or its best known distance cannot be improved any more.
function search(
	graph: Graph,
	from: [number, number, number, number, number],
	targets: Place[]
): Search {
	const [a, b, access, position, length] = from;
	const dist = new Map<number, number>();
	const prev = new Map<number, { node: number; edge: Edge }>();
	const settled = new Set<number>();
	const heap = new Heap();
	for (const [node, start] of [
		[a, access + position],
		[b, access + length - position]
	]) {
		if (!dist.has(node) || start < dist.get(node)!) {
			dist.set(node, start);
			heap.push(start, node);
		}
	}

	const ends = targets.map((t) => graph.access.get(t.osmId)!);
	const best = (end: [number, number, number, number, number]) => {
		const [ta, tb, tAccess, tPosition, tLength] = end;
		const viaA = settled.has(ta) ? dist.get(ta)! + tAccess + tPosition : Infinity;
		const viaB = settled.has(tb) ? dist.get(tb)! + tAccess + tLength - tPosition : Infinity;
		return Math.min(viaA, viaB);
	};
	const done = (popped: number) =>
		ends.every((end) => (settled.has(end[0]) && settled.has(end[1])) || best(end) <= popped);

	while (heap.size > 0) {
		const [d, node] = heap.pop();
		if (settled.has(node) || d > dist.get(node)!) continue;
		if (done(d)) break;
		settled.add(node);
		for (const step of graph.steps.get(node) ?? []) {
			if (settled.has(step.to)) continue;
			const next = d + step.length;
			const known = dist.get(step.to);
			const before = prev.get(step.to);
			if (known === undefined || next < known) {
				dist.set(step.to, next);
				prev.set(step.to, { node, edge: step.edge });
				heap.push(next, step.to);
			} else if (next === known && before && node < before.node) {
				prev.set(step.to, { node, edge: step.edge });
			}
		}
	}
	return { dist, prev, settled };
}

const point = (place: Place): [number, number] => [place.lon, place.lat];

// Track of a walk from `node` back to the start of the search, in walking order.
function trackTo(graph: Graph, result: Search, node: number): [number, number][] {
	const nodes: number[] = [node];
	const shapes: Edge[] = [];
	for (let at = node; result.prev.has(at);) {
		const step = result.prev.get(at)!;
		shapes.push(step.edge);
		nodes.push(step.node);
		at = step.node;
	}
	nodes.reverse();
	shapes.reverse();
	const lonLat = (lat: number, lon: number): [number, number] => [lon / 100000, lat / 100000];
	const track: [number, number][] = [lonLat(...graph.coords.get(nodes[0])!)];
	shapes.forEach((edge, i) => {
		const forwards = edge.a === nodes[i];
		const shape = forwards ? edge.shape : [...edge.shape].reverse();
		for (const [lat, lon] of shape) track.push(lonLat(lat, lon));
		track.push(lonLat(...graph.coords.get(nodes[i + 1])!));
	});
	return track;
}

function approximation(a: Place, b: Place): Route {
	const distanceM = Math.max(1, Math.round(haversineM(a, b) * DETOUR));
	return {
		placeA: a.osmId,
		placeB: b.osmId,
		distanceM,
		minutes: minutesFor(distanceM),
		approximate: true
	};
}

// One route per pair of places, a before b in id order. A pair the graph cannot connect
// gets the marked straight-line approximation.
export function pedestrianRoutes(places: Place[], graph: Graph): Route[] {
	const sorted = [...places].sort((p, q) => (p.osmId < q.osmId ? -1 : 1));
	const routes: Route[] = [];
	sorted.forEach((a, i) => {
		const later = sorted.slice(i + 1);
		const from = graph.access.get(a.osmId);
		const attached = from ? later.filter((b) => graph.access.has(b.osmId)) : [];
		const result = from && attached.length > 0 ? search(graph, from, attached) : null;
		for (const b of later) {
			routes.push(
				result && graph.access.has(b.osmId)
					? connect(graph, result, from!, a, b)
					: approximation(a, b)
			);
		}
	});
	return routes;
}

function connect(
	graph: Graph,
	result: Search,
	from: [number, number, number, number, number],
	a: Place,
	b: Place
): Route {
	const [ta, tb, tAccess, tPosition, tLength] = graph.access.get(b.osmId)!;
	// The same edge may give a direct walk between the two places.
	const sameEdge = from[0] === ta && from[1] === tb && from[4] === tLength;
	const direct = sameEdge ? from[2] + Math.abs(from[3] - tPosition) + tAccess : Infinity;

	const viaA = result.settled.has(ta) ? result.dist.get(ta)! + tAccess + tPosition : Infinity;
	const viaB = result.settled.has(tb)
		? result.dist.get(tb)! + tAccess + tLength - tPosition
		: Infinity;
	const walked = Math.min(viaA, viaB);
	if (direct <= walked && direct !== Infinity) {
		return {
			placeA: a.osmId,
			placeB: b.osmId,
			distanceM: direct,
			minutes: minutesFor(direct),
			geometry: [point(a), point(b)]
		};
	}
	if (walked === Infinity) return approximation(a, b);
	const node = viaA <= viaB ? ta : tb;
	return {
		placeA: a.osmId,
		placeB: b.osmId,
		distanceM: walked,
		minutes: minutesFor(walked),
		geometry: [point(a), ...trackTo(graph, result, node), point(b)]
	};
}
