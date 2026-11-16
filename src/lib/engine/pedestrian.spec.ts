import { describe, it, expect } from 'vitest';
import { assembleGraph, pedestrianRoutes, pointAlong, type GraphCell } from './pedestrian';
import { assertCompleteMatrix } from './routes';
import type { Place } from './types';

const place = (osmId: string, lat = 43.45, lon = 5.54): Place => ({
	osmId,
	name: osmId,
	typeId: 'bakery',
	lat,
	lon,
	removed: false
});

// Node coordinates only matter for tracks: node n sits at 43.45 + n/1000 degrees north.
const node = (id: number): [number, number, number] => [id, 4345000 + id * 100, 554000];
const edge = (
	a: number,
	b: number,
	length: number,
	shape: [number, number][] = []
): GraphCell['edges'][number] => [a, b, length, shape];

const cell = (nodeIds: number[], edges: GraphCell['edges'], access: GraphCell['access'] = {}) => ({
	nodes: nodeIds.map(node),
	edges,
	access
});

describe('assembleGraph', () => {
	it('counts an edge listed in two cells once', () => {
		const graph = assembleGraph([cell([1], [edge(1, 2, 100)]), cell([2], [edge(1, 2, 100)])]);
		expect(graph.edges).toHaveLength(1);
	});

	it('ignores an edge whose node is in no given cell', () => {
		const graph = assembleGraph([cell([1], [edge(1, 2, 100)])]);
		expect(graph.edges).toHaveLength(0);
	});
});

describe('pedestrianRoutes', () => {
	it('adds the access of each place to the shortest path', () => {
		const graph = assembleGraph([
			cell([1, 2, 3], [edge(1, 2, 500), edge(2, 3, 100)], {
				a: [1, 2, 20, 100, 500],
				b: [2, 3, 30, 0, 100]
			})
		]);
		const [route] = pedestrianRoutes([place('a', 43.4, 5.5), place('b', 43.5, 5.6)], graph);
		// 20 + 400 to node 2, then 30.
		expect(route.distanceM).toBe(450);
		expect(route.minutes).toBe(6);
		expect(route.approximate).toBeUndefined();
		expect(route.geometry).toEqual([
			[5.5, 43.4],
			[5.54, 43.452],
			[5.6, 43.5]
		]);
	});

	describe('edge shapes', () => {
		const shape: [number, number][] = [
			[4345150, 554100],
			[4345180, 554200]
		];
		const edges = [edge(0, 1, 10), edge(1, 2, 300, shape), edge(2, 3, 10)];

		it('follows the shape in the walking direction', () => {
			const graph = assembleGraph([
				cell([0, 1, 2, 3], edges, { a: [0, 1, 0, 4, 10], b: [2, 3, 0, 4, 10] })
			]);
			const [route] = pedestrianRoutes([place('a', 1, 1), place('b', 2, 2)], graph);
			expect(route.distanceM).toBe(310);
			expect(route.geometry).toEqual([
				[1, 1],
				[5.54, 43.451],
				[5.541, 43.4515],
				[5.542, 43.4518],
				[5.54, 43.452],
				[2, 2]
			]);
		});

		it('follows the shape backwards when walking the other way', () => {
			const graph = assembleGraph([
				cell([0, 1, 2, 3], edges, { a: [2, 3, 0, 4, 10], b: [0, 1, 0, 4, 10] })
			]);
			const [route] = pedestrianRoutes([place('a', 1, 1), place('b', 2, 2)], graph);
			expect(route.geometry).toEqual([
				[1, 1],
				[5.54, 43.452],
				[5.542, 43.4518],
				[5.541, 43.4515],
				[5.54, 43.451],
				[2, 2]
			]);
		});
	});

	it('shortcuts two places on the same edge', () => {
		const graph = assembleGraph([
			cell([1, 2], [edge(1, 2, 400)], { a: [1, 2, 5, 100, 400], b: [1, 2, 5, 150, 400] })
		]);
		const [route] = pedestrianRoutes([place('a'), place('b')], graph);
		expect(route.distanceM).toBe(60);
		expect(route.minutes).toBe(1);
	});

	it('breaks ties with the smallest node id, whatever the cell order', () => {
		const cells = [
			cell([0, 1, 2], [edge(0, 1, 10), edge(1, 2, 100), edge(1, 3, 100)], { a: [0, 1, 0, 5, 10] }),
			cell([3, 4, 5], [edge(2, 4, 100), edge(3, 4, 100), edge(4, 5, 10)], { b: [4, 5, 0, 5, 10] })
		];
		const places = [place('a', 1, 1), place('b', 2, 2)];
		const forwards = pedestrianRoutes(places, assembleGraph(cells));
		const backwards = pedestrianRoutes(places, assembleGraph([...cells].reverse()));
		expect(backwards).toEqual(forwards);
		expect(forwards[0].distanceM).toBe(210);
		expect(forwards[0].geometry?.map(([, lat]) => lat)).toEqual([1, 43.451, 43.452, 43.454, 2]);
	});

	it('returns one symmetric route per pair, accepted by the engine', () => {
		const ids = ['a', 'b', 'c', 'd', 'e'];
		const access = Object.fromEntries(
			ids.map((id, i) => [id, [1, 2, 3, i * 10, 100]])
		) as GraphCell['access'];
		const graph = assembleGraph([cell([1, 2], [edge(1, 2, 100)], access)]);
		const places = ids.map((id) => place(id));
		const routes = pedestrianRoutes([...places].reverse(), graph);
		expect(routes).toHaveLength(10);
		expect(routes.every((route) => route.placeA < route.placeB)).toBe(true);
		expect(() => assertCompleteMatrix(places, routes)).not.toThrow();
	});

	it('falls back to a marked approximation between unconnected parts', () => {
		const graph = assembleGraph([
			cell([1, 2, 3, 4], [edge(1, 2, 100), edge(3, 4, 100)], {
				a: [1, 2, 0, 0, 100],
				b: [3, 4, 0, 0, 100]
			})
		]);
		const [route] = pedestrianRoutes([place('a', 43.45, 5.54), place('b', 43.46, 5.54)], graph);
		expect(route).toEqual({
			placeA: 'a',
			placeB: 'b',
			distanceM: 1446,
			minutes: 18,
			approximate: true
		});
	});

	it('falls back for a place with no valid attachment', () => {
		const graph = assembleGraph([
			cell([1, 2], [edge(1, 2, 100)], { a: [1, 2, 0, 0, 100], c: [7, 8, 0, 0, 100] })
		]);
		const routes = pedestrianRoutes([place('a'), place('b'), place('c')], graph);
		expect(routes.map((route) => route.approximate)).toEqual([true, true, true]);
	});

	it('keeps at least one minute and one metre for an approximation', () => {
		const graph = assembleGraph([]);
		const [route] = pedestrianRoutes([place('a'), place('b')], graph);
		expect(route.distanceM).toBe(1);
		expect(route.minutes).toBe(1);
	});
});

describe('pointAlong', () => {
	const line: [number, number][] = [
		[0, 0],
		[0, 0.01],
		[0.03, 0.01]
	];

	it('gives the ends of the line at 0 and 1', () => {
		expect(pointAlong(line, 0)).toEqual([0, 0]);
		expect(pointAlong(line, 1)).toEqual([0.03, 0.01]);
	});

	it('measures on the ground: a quarter of 4.4 km is 1.1 km, the corner', () => {
		const [lon, lat] = pointAlong(line, 0.25);
		expect(lat).toBeCloseTo(0.01, 4);
		expect(lon).toBeCloseTo(0, 3);
	});

	it('stays inside the line for a fraction out of range', () => {
		expect(pointAlong(line, 2)).toEqual([0.03, 0.01]);
		expect(pointAlong(line, -1)).toEqual([0, 0]);
	});
});
