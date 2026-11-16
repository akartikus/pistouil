<script lang="ts">
	import GameMap from '#lib/map/Map.svelte';
	import { validateCatalog } from '#lib/engine/catalog.js';
	import { rawStarterCatalog } from '#lib/engine/fixtures.js';
	import type { GraphCell } from '#lib/engine/pedestrian.js';
	import type { Place } from '#lib/engine/types.js';
	import { placeFeatures } from '#lib/map/features.js';
	import { routeFeatures } from '#lib/map/route-line.js';
	import type { Theme } from '#lib/map/theme.js';
	import {
		cellsCovering,
		communeMask,
		communeOutline,
		zoneBounds,
		type Commune
	} from '#lib/map/zone.js';
	import {
		nearestPlaces,
		routesFor,
		toPlaces,
		type Grid,
		type RawPlace
	} from '#lib/playground/real-places.js';

	const catalog = validateCatalog(structuredClone(rawStarterCatalog));
	const roles = new Map(catalog.placeTypes.map((type) => [type.id, type.role]));
	const tilesUrl = import.meta.env.VITE_TILES_URL ?? '/dev-data/map/zone.pmtiles';
	const SAMPLES = ['Fuveau', 'Marseille', 'Aiglun'];
	// How far the player can pan beyond the commune.
	const MARGIN_M = 1000;
	const INVESTIGATION_SIZE = 6;
	const SPREAD = 6;

	let communes = $state<Commune[]>([]);
	let name = $state('Fuveau');
	let theme = $state<Theme>('light');
	let data = $state<{
		status: 'loading' | 'missing' | 'ready';
		places: Place[];
		hours: Record<string, string>;
		graph: GraphCell[];
	}>({ status: 'loading', places: [], hours: {}, graph: [] });
	let loadToken = 0;

	const commune = $derived(communes.find((c) => c.name === name));

	async function readJson<T>(url: string): Promise<T | null> {
		try {
			const response = await fetch(url);
			return response.ok ? ((await response.json()) as T) : null;
		} catch {
			return null; // missing file, or the dev server answered with a page
		}
	}

	$effect(() => {
		readJson<Commune[]>('/dev-data/communes.json').then((list) => (communes = list ?? []));
	});

	// Places and graph cells of the commune, from static/dev-data.
	$effect(() => {
		const current = commune;
		if (!current) return;
		const token = ++loadToken;
		data = { status: 'loading', places: [], hours: {}, graph: [] };
		(async () => {
			const manifest = await readJson<{ grid: Grid }>('/dev-data/manifest.json');
			if (!manifest) return token === loadToken ? (data = { ...data, status: 'missing' }) : null;
			const cells = cellsCovering(manifest.grid, current.bbox);
			const [raws, graph] = await Promise.all([
				Promise.all(cells.map((cell) => readJson<RawPlace[]>(`/dev-data/places/${cell}.json`))),
				Promise.all(cells.map((cell) => readJson<GraphCell>(`/dev-data/graph/${cell}.json`)))
			]);
			if (token !== loadToken) return;
			const found = raws.flatMap((file) => file ?? []);
			data = {
				status: 'ready',
				places: toPlaces(found, catalog),
				hours: Object.fromEntries(
					found.filter((raw) => raw.openingHours).map((raw) => [raw.osmId, raw.openingHours!])
				),
				graph: graph.filter((cell) => cell !== null)
			};
		})();
	});

	// A sample investigation: places near the centre, the first scene as the mystery.
	const investigation = $derived.by(() => {
		if (!commune) return [];
		const usable = data.places.filter((p) => !p.removed && roles.get(p.typeId) !== 'excluded');
		// Every few places of the nearest ones, so that the sample is not one cluster.
		return nearestPlaces(usable, commune.center, INVESTIGATION_SIZE * SPREAD).filter(
			(_, index) => index % SPREAD === 0
		);
	});
	const mysteryId = $derived(investigation.find((p) => roles.get(p.typeId) === 'scene')?.osmId);
	const routes = $derived(routesFor(investigation, data.graph));
	const features = $derived(
		placeFeatures(data.places, catalog, {
			investigationIds: investigation.map((p) => p.osmId),
			mysteryId,
			hours: data.hours
		})
	);
	const route = $derived.by(() => {
		const first = routes.routes[0];
		// Without graph files every duration is a straight-line estimate.
		const estimate = first && (first.approximate || !routes.network);
		return first ? routeFeatures({ ...first, approximate: estimate }, investigation) : null;
	});
	// Sample chips and clicks, to check the events of the map.
	let clicked = $state('');
	const chips = $derived(
		investigation.slice(0, 3).map((place, index) => ({
			id: `s${index}`,
			initial: 'ABC'[index],
			lon: place.lon,
			lat: place.lat,
			conflict: index === 1
		}))
	);
	const maxBounds = $derived(commune ? zoneBounds(commune.bbox, MARGIN_M) : null);
	const focus = $derived(commune ? zoneBounds(commune.bbox, 0) : null);
	const mask = $derived(commune ? communeMask(commune.contour) : null);
	const outline = $derived(commune ? communeOutline(commune.contour) : null);
</script>

<h1>Carte</h1>
<p>
	Outil de développement : la carte sur une commune de <code>static/dev-data/communes.json</code>,
	avec les lieux de <code>static/dev-data/places/</code> et les tuiles de
	<code>{tilesUrl}</code> (voir <code>tools/map-tiles/README.md</code>).
</p>

<section class="controls">
	<label>
		Commune
		<input list="communes" bind:value={name} />
		<datalist id="communes">
			{#each communes as option (option.insee)}
				<option value={option.name}></option>
			{/each}
		</datalist>
	</label>
	{#each SAMPLES as sample (sample)}
		<button type="button" onclick={() => (name = sample)}>{sample}</button>
	{/each}
	<label>
		Thème
		<select bind:value={theme}>
			<option value="light">Clair</option>
			<option value="dark">Sombre</option>
		</select>
	</label>
</section>

{#if !commune}
	<p class="error">
		{communes.length === 0
			? 'Aucune commune : copier communes.json dans static/dev-data/ (voir tools/data-preparation/README.md).'
			: `Commune inconnue : ${name}`}
	</p>
{:else}
	<p class="note">
		{commune.name} : {data.status === 'ready' ? `${features.features.length} lieux` : data.status}
		; enquête de {investigation.length} lieux{route
			? `, trajet ${route.label.properties.approximate ? 'estimé' : 'sur les rues'} de ${route.label.properties.text}`
			: ''}.
	</p>
	{#if clicked}<p class="note">Dernier toucher : {clicked}</p>{/if}
	{#if data.status === 'missing'}
		<p class="error">
			Aucun lieu : copier manifest.json et places/ dans static/dev-data/ (voir
			tools/data-preparation/README.md).
		</p>
	{/if}
	{#if maxBounds && focus && mask && outline}
		<div class="frame">
			<GameMap
				{tilesUrl}
				{theme}
				{maxBounds}
				{focus}
				places={features}
				{route}
				{mask}
				{outline}
				suspects={chips}
				onplace={(id) => (clicked = `lieu ${id}`)}
				onsuspect={(id) => (clicked = `suspect ${id}`)}
			/>
		</div>
	{/if}
{/if}

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: end;
		margin-bottom: 0.5rem;
	}
	.frame {
		height: 70vh;
		border: 3px solid #000;
	}
	.error {
		color: #b00020;
	}
	.note {
		margin: 0.25rem 0;
	}
</style>
