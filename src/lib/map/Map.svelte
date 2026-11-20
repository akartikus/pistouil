<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import {
		Map as MapLibre,
		LngLatBounds,
		Marker,
		Popup,
		addProtocol,
		removeProtocol,
		setWorkerUrl,
		type GeoJSONSource,
		type MapLayerMouseEvent,
		type StyleSpecification
	} from 'maplibre-gl';
	import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
	import { PMTiles, Protocol, type Source } from 'pmtiles';
	import { onMount } from 'svelte';
	import type {
		Feature,
		FeatureCollection,
		LineString,
		MultiLineString,
		MultiPolygon,
		Point
	} from 'geojson';
	import { GAME_COLORS, styleUrl, type Theme } from './theme.js';
	import type { PlaceProperties, SuspectChip } from './features.js';
	import type { RouteLabel } from './route-line.js';
	import type { Bounds } from './zone.js';

	interface Props {
		// Address of the PMTiles file.
		tilesUrl: string;
		// The archive read by the app itself; the network address is not used then.
		source?: Source;
		theme: Theme;
		// Limits of the zone: the player cannot pan outside.
		maxBounds: Bounds;
		// What the map shows first (and when it changes).
		focus: Bounds;
		places: FeatureCollection<Point, PlaceProperties>;
		route?: { line: Feature<LineString>; label: Feature<Point, RouteLabel> } | null;
		mask?: Feature<MultiPolygon> | null;
		outline?: Feature<MultiLineString> | null;
		// Suspects at a time, as round chips with their initial.
		suspects?: SuspectChip[];
		onplace?: (osmId: string) => void;
		onsuspect?: (id: string) => void;
		// A touch on the map itself, not on a place, a suspect or a decor icon.
		onmapclick?: () => void;
	}

	let {
		tilesUrl,
		source,
		theme,
		maxBounds,
		focus,
		places,
		route = null,
		mask = null,
		outline = null,
		suspects = [],
		onplace,
		onsuspect,
		onmapclick
	}: Props = $props();

	const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };
	// Highlighting the building of a place only makes sense once buildings are individual.
	const BUILDING_ZOOM = 15;

	let container: HTMLDivElement;
	let map: MapLibre | undefined;
	let ready = $state(false);
	let error = $state('');
	let loadedTheme: Theme | undefined;
	let lastBuildings = '';
	let markers: Marker[] = [];
	const ATTRIBUTION_SECONDS = 5;

	function foldAttribution() {
		container
			?.querySelector('.maplibregl-ctrl-attrib')
			?.classList.remove('maplibregl-compact-show');
	}

	const absolute = (path: string) => new URL(path, location.href).href;

	// The style stays a file: only the addresses of the tiles and glyphs are completed here.
	async function loadStyle(forTheme: Theme): Promise<StyleSpecification> {
		const style = await (await fetch(styleUrl(forTheme))).json();
		// Plain concatenation: URL() would escape the {fontstack} and {range} tokens.
		style.glyphs = `${location.origin}${style.glyphs}`;
		style.sources.protomaps.url = `pmtiles://${source ? source.getKey() : absolute(tilesUrl)}`;
		return style;
	}

	// Source, layers and highlights of the game, above the background style.
	function addGameLayers(m: MapLibre) {
		if (!m.getSource('protomaps') || m.getSource('places')) return;
		const colors = GAME_COLORS[theme];
		for (const id of ['mask', 'outline', 'buildings-highlight', 'route', 'places']) {
			m.addSource(id, { type: 'geojson', data: EMPTY });
		}
		m.addLayer({
			id: 'mask-fill',
			type: 'fill',
			source: 'mask',
			paint: { 'fill-color': colors.mask, 'fill-opacity': colors.maskOpacity }
		});
		m.addLayer({
			id: 'outline-line',
			type: 'line',
			source: 'outline',
			paint: { 'line-color': colors.outline, 'line-width': 1.6, 'line-dasharray': [4, 2.5] }
		});
		m.addLayer({
			id: 'building-shadow',
			type: 'fill',
			source: 'buildings-highlight',
			paint: { 'fill-color': colors.shadow, 'fill-translate': [5, 5] }
		});
		m.addLayer({
			id: 'building-highlight',
			type: 'fill',
			source: 'buildings-highlight',
			paint: { 'fill-color': ['get', 'color'] }
		});
		m.addLayer({
			id: 'building-outline',
			type: 'line',
			source: 'buildings-highlight',
			paint: { 'line-color': colors.ink, 'line-width': 3 }
		});
		m.addLayer({
			id: 'route-line',
			type: 'line',
			source: 'route',
			layout: { 'line-cap': 'round' },
			paint: { 'line-color': colors.route, 'line-width': 4.5, 'line-dasharray': [0.1, 2] }
		});
		m.addLayer({
			id: 'decor-icons',
			type: 'symbol',
			source: 'places',
			filter: ['in', ['get', 'role'], ['literal', ['decor', 'neutral']]],
			layout: {
				'icon-image': ['get', 'icon'],
				'icon-size': 0.55,
				'text-field': ['upcase', ['get', 'name']],
				'text-font': ['IBM Plex Mono Bold'],
				'text-size': 9.5,
				'text-anchor': 'left',
				'text-offset': [1.1, 0],
				'text-max-width': 8,
				'text-optional': true
			},
			paint: { 'text-color': colors.text, 'text-halo-color': colors.halo, 'text-halo-width': 2 }
		});
		lastBuildings = '';
		ready = true;
		sync();
	}

	// Icons are loaded when the style asks for them, so a new style gets them again.
	async function loadIcon(m: MapLibre, id: string) {
		for (const name of [id, 'generic']) {
			try {
				const image = await m.loadImage(`/map/icons/${name}@2x.png`);
				if (!m.hasImage(id)) m.addImage(id, image.data, { pixelRatio: 2 });
				return;
			} catch {
				// try the generic icon next
			}
		}
	}

	function setData(m: MapLibre, id: string, data: object | null) {
		(m.getSource(id) as GeoJSONSource | undefined)?.setData((data ?? EMPTY) as FeatureCollection);
	}

	// Numbered square and framed name for the places of the investigation, label of the route.
	function pin(className: string, parts: [string, string][]) {
		const element = document.createElement('div');
		element.className = className;
		for (const [part, text] of parts) {
			const span = document.createElement('span');
			span.className = part;
			span.textContent = text;
			element.append(span);
		}
		return element;
	}

	function renderMarkers(m: MapLibre) {
		for (const marker of markers) marker.remove();
		markers = [];
		for (const f of places.features) {
			const { role, number, name } = f.properties;
			if (role !== 'investigation' && role !== 'mystery') continue;
			const element = pin(`pin ${role}`, [
				['num', String(number)],
				['name', name.toUpperCase()]
			]);
			element.addEventListener('click', (event) => {
				event.stopPropagation(); // not a touch on the map itself
				onplace?.(f.properties.osmId);
			});
			markers.push(
				new Marker({ element }).setLngLat(f.geometry.coordinates as [number, number]).addTo(m)
			);
		}
		for (const chip of suspects) {
			const element = pin(
				`chip${chip.conflict ? ' conflict' : ''}${chip.selected ? ' selected' : ''}`,
				[['initial', chip.initial]]
			);
			element.addEventListener('click', (event) => {
				event.stopPropagation();
				onsuspect?.(chip.id);
			});
			markers.push(
				new Marker({ element, offset: [18, -18] }).setLngLat([chip.lon, chip.lat]).addTo(m)
			);
		}
		if (route) {
			const element = pin('route-label', [['text', route.label.properties.text]]);
			element.classList.toggle('approximate', route.label.properties.approximate);
			markers.push(
				new Marker({ element })
					.setLngLat(route.label.geometry.coordinates as [number, number])
					.addTo(m)
			);
		}
	}

	// The building that holds the point of a place of the investigation, if the map shows it.
	function updateBuildings() {
		const m = map;
		if (!m || !m.getSource('buildings-highlight')) return;
		const colors = GAME_COLORS[theme];
		const features: Feature[] = [];
		if (m.getZoom() >= BUILDING_ZOOM) {
			for (const f of places.features) {
				const { role } = f.properties;
				if (role !== 'investigation' && role !== 'mystery') continue;
				const [lon, lat] = f.geometry.coordinates;
				const hit = m.queryRenderedFeatures(m.project([lon, lat]), { layers: ['buildings'] })[0];
				if (hit?.geometry.type === 'Polygon' || hit?.geometry.type === 'MultiPolygon') {
					features.push({
						type: 'Feature',
						properties: { color: role === 'mystery' ? colors.mystery : colors.investigation },
						geometry: hit.geometry
					});
				}
			}
		}
		const data = { type: 'FeatureCollection', features };
		const key = JSON.stringify(data);
		if (key === lastBuildings) return;
		lastBuildings = key;
		setData(m, 'buildings-highlight', data);
	}

	function showInfo(event: MapLayerMouseEvent) {
		const feature = event.features?.[0];
		if (!feature || !map) return;
		const { name, label, hours } = feature.properties as PlaceProperties;
		const box = pin('info', [
			['title', name],
			['kind', label],
			...(hours ? ([['hours', hours]] as [string, string][]) : [])
		]);
		new Popup({ closeButton: false, offset: 14, className: 'info-popup' })
			.setLngLat((feature.geometry as Point).coordinates as [number, number])
			.setDOMContent(box)
			.addTo(map);
	}

	function sync() {
		const m = map;
		if (!m || !m.getSource('places')) return;
		setData(m, 'places', places);
		setData(m, 'route', route?.line ?? null);
		setData(m, 'mask', mask);
		setData(m, 'outline', outline);
		renderMarkers(m);
		updateBuildings();
	}

	// Colours of a game layer, for a change in the course of the game.
	export function setPaint(layerId: string, name: string, value: unknown) {
		map?.setPaintProperty(layerId, name as never, value as never);
	}

	onMount(() => {
		// The worker is bundled by Vite, the way MapLibre documents for bundlers.
		setWorkerUrl(workerUrl);
		const protocol = new Protocol();
		if (source) protocol.add(new PMTiles(source));
		addProtocol('pmtiles', protocol.tile);
		let disposed = false;
		(async () => {
			const style = await loadStyle(theme);
			if (disposed) return;
			loadedTheme = theme;
			const m = new MapLibre({
				container,
				style,
				bounds: focus,
				fitBoundsOptions: { padding: 20, animate: false },
				maxBounds,
				maxZoom: 19,
				renderWorldCopies: false,
				dragRotate: false,
				pitchWithRotate: false,
				touchPitch: false,
				// A button « i »: open when the map appears, folded after a few seconds or on the first drag.
				attributionControl: { compact: true }
			});
			map = m;
			m.once('load', () => setTimeout(foldAttribution, ATTRIBUTION_SECONDS * 1000));
			m.on('styledata', () => addGameLayers(m));
			m.setMissingStyleImageResolver((id) => loadIcon(m, id));
			m.on('idle', updateBuildings);
			m.on('click', 'decor-icons', showInfo);
			m.on('click', (event) => {
				if (m.queryRenderedFeatures(event.point, { layers: ['decor-icons'] }).length === 0)
					onmapclick?.();
			});
			m.on('mouseenter', 'decor-icons', () => (m.getCanvas().style.cursor = 'pointer'));
			m.on('mouseleave', 'decor-icons', () => (m.getCanvas().style.cursor = ''));
			m.on('error', (event) => (error = event.error?.message ?? 'Erreur de carte'));
		})().catch((failure) => (error = String(failure)));
		return () => {
			disposed = true;
			map?.remove();
			map = undefined;
			removeProtocol('pmtiles');
		};
	});

	// A new theme swaps the style; the tiles stay, and the layers of the game are added again.
	$effect(() => {
		const next = theme;
		if (!map || !ready || next === loadedTheme) return;
		loadedTheme = next;
		loadStyle(next).then(
			(style) => map?.setStyle(style),
			(failure) => (error = String(failure))
		);
	});

	$effect(() => {
		const [limits, view] = [maxBounds, focus];
		if (!map || !ready) return;
		map.setMaxBounds(limits);
		map.fitBounds(view, { padding: 20, animate: false });
	});

	// A route that starts or ends out of view brings the map to it.
	$effect(() => {
		const line = route?.line.geometry.coordinates;
		if (!map || !ready || !line) return;
		const bounds = map.getBounds();
		const ends = [line[0], line[line.length - 1]] as [number, number][];
		if (ends.every((end) => bounds.contains(end))) return;
		map.fitBounds(
			ends.reduce((box, end) => box.extend(end), new LngLatBounds(ends[0], ends[0])),
			{
				padding: 70,
				maxZoom: 17
			}
		);
	});

	$effect(() => {
		void [places, route, mask, outline, suspects];
		if (ready) sync();
	});

	const colors = $derived(GAME_COLORS[theme]);
</script>

<div
	class="map"
	bind:this={container}
	style:--investigation={colors.investigation}
	style:--mystery={colors.mystery}
	style:--mystery-ink={colors.mysteryNumberInk}
	style:--route={colors.route}
	style:--ink={colors.ink}
	style:--paper={colors.paper}
	style:--shadow={colors.shadow}
	style:--number={colors.numberFill}
	style:--number-ink={colors.numberInk}
	style:--icon-filter={theme === 'dark' ? 'invert(1)' : 'none'}
>
	{#if error}<p class="error">{error}</p>{/if}
</div>

<style>
	.map {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 20rem;
		font-family: 'IBM Plex Mono', 'DejaVu Sans Mono', 'Courier New', monospace;
	}
	.error {
		position: absolute;
		z-index: 2;
		margin: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: #fff;
		color: #b00020;
		border: 3px solid #000;
	}
	/* Brutalist markers and popups are plain DOM, built in the script. */
	.map :global(.pin) {
		position: relative;
		width: 0;
		height: 0;
		font-weight: bold;
	}
	.map :global(.pin .num) {
		position: absolute;
		left: -34px;
		top: -34px;
		min-width: 24px;
		padding: 2px 0;
		text-align: center;
		font-size: 15px;
		background: var(--number);
		color: var(--number-ink);
		border: 2px solid var(--ink);
	}
	.map :global(.pin.mystery .num) {
		background: var(--mystery);
		color: var(--mystery-ink);
	}
	.map :global(.pin .name) {
		position: absolute;
		top: 16px;
		left: 0;
		transform: translateX(-50%);
		padding: 1px 6px;
		white-space: nowrap;
		font-size: 10.5px;
		background: var(--paper);
		color: var(--ink);
		border: 2px solid var(--ink);
		box-shadow: 3px 3px 0 var(--shadow);
	}
	.map :global(.route-label .text) {
		display: block;
		padding: 2px 8px;
		font-size: 12px;
		font-weight: bold;
		background: var(--number);
		color: var(--number-ink);
		border: 2px solid var(--ink);
		box-shadow: 3px 3px 0 var(--shadow);
	}
	.map :global(.route-label.approximate .text::before) {
		content: '~';
	}
	.map :global(.info-popup .maplibregl-popup-content) {
		padding: 0;
		border-radius: 0;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--ink);
		box-shadow: 5px 5px 0 var(--shadow);
	}
	.map :global(.info-popup .maplibregl-popup-tip) {
		display: none;
	}
	.map :global(.info .title) {
		display: block;
		padding: 4px 8px;
		font-weight: bold;
		text-transform: uppercase;
		background: var(--number);
		color: var(--number-ink);
	}
	.map :global(.info .kind),
	.map :global(.info .hours) {
		display: block;
		padding: 3px 8px;
		font-size: 12px;
	}
	/* Chips of the suspects at the time of the cursor. */
	.map :global(.chip) {
		display: block;
		width: 26px;
		height: 26px;
		box-sizing: border-box;
		border-radius: 50%;
		text-align: center;
		line-height: 21px;
		font-size: 13px;
		font-weight: bold;
		background: var(--paper);
		color: var(--ink);
		border: 3px solid var(--ink);
		cursor: pointer;
	}
	.map :global(.chip.conflict) {
		background: repeating-linear-gradient(45deg, var(--ink) 0 2px, var(--paper) 2px 5px);
	}
	.map :global(.chip.conflict .initial) {
		display: inline-block;
		line-height: 14px;
		padding: 1px 4px;
		border-radius: 50%;
		background: var(--paper);
	}
	.map :global(.chip.selected) {
		box-shadow:
			0 0 0 3px var(--paper),
			0 0 0 6px var(--ink);
	}
	.map :global(.pin) {
		cursor: pointer;
	}
	/* Attribution: a button « i » that unfolds the text, in the same register. */
	.map :global(.maplibregl-ctrl-attrib) {
		background: var(--paper);
		color: var(--ink);
		border: 2px solid var(--ink);
		box-shadow: 2px 2px 0 var(--shadow);
		font-family: inherit;
		font-weight: normal;
		font-size: 8px;
		line-height: 1.2;
	}
	.map :global(.maplibregl-ctrl-attrib a) {
		color: inherit;
	}
	.map :global(.maplibregl-ctrl-attrib-inner) {
		padding: 0 4px;
	}
	.map :global(.maplibregl-ctrl-attrib-button) {
		background-color: var(--paper);
		filter: var(--icon-filter);
	}
</style>
