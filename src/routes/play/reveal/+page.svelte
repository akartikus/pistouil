<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { formatTime } from '#lib/engine/render.js';
	import { validateCatalog } from '#lib/engine/catalog.js';
	import { rawStarterCatalog } from '#lib/engine/starter-catalog.js';
	import { positionAt } from '#lib/game/evening.js';
	import { game } from '#lib/game/game.svelte.js';
	import { offline } from '#lib/game/offline.svelte.js';
	import { asPlaces, boxOf, hoursOf } from '#lib/game/mapdata.js';
	import { settings } from '#lib/game/settings.svelte.js';
	import { texts } from '#lib/game/texts.js';
	import { ui } from '#lib/game/ui.svelte.js';
	import GameMap from '#lib/map/Map.svelte';
	import { placeFeatures } from '#lib/map/features.js';
	import { zoneBounds } from '#lib/map/zone.js';

	const catalog = validateCatalog(structuredClone(rawStarterCatalog));
	const tilesUrl = import.meta.env.VITE_TILES_URL ?? '/dev-data/map/zone.pmtiles';

	const revelation = $derived(game.revelation);
	const view = $derived(game.view);
	const evening = $derived(revelation?.evening);

	onMount(() => {
		if (!game.revelation) goto(resolve('/play/carte'));
		return () => clearInterval(timer);
	});

	// The clock of the replay, from the first arrival to the last departure.
	const span = $derived.by(() => {
		const stays = evening?.characters.flatMap((c) => c.stays) ?? [];
		return stays.length
			? {
					min: Math.min(...stays.map((s) => s.from)) - 10,
					max: Math.max(...stays.map((s) => s.to)) + 10
				}
			: { min: 0, max: 0 };
	});
	let time = $state(0);
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval>;
	$effect(() => {
		if (time < span.min || time > span.max) time = span.min;
	});

	function toggle() {
		playing = !playing;
		clearInterval(timer);
		if (!playing) return;
		if (time >= span.max) time = span.min;
		timer = setInterval(() => {
			time += 1;
			if (time >= span.max) {
				playing = false;
				clearInterval(timer);
			}
		}, 120);
	}

	const retained = $derived(asPlaces(view?.investigation.places ?? []));
	const decor = $derived(asPlaces(view?.decor ?? []));
	const features = $derived(
		placeFeatures(decor, catalog, {
			investigationIds: retained.map((p) => p.osmId),
			mysteryId: view?.investigation.sceneId,
			hours: hoursOf(view?.decor ?? [])
		})
	);
	const chips = $derived(
		(evening?.characters ?? []).map((character) => {
			const [lon, lat] = positionAt(evening!, character.id, time);
			return { id: character.id, initial: character.firstName[0], lon, lat };
		})
	);
	const focus = $derived(retained.length ? zoneBounds(boxOf(retained), 250) : null);
	const maxBounds = $derived(decor.length ? zoneBounds(boxOf(decor), 300) : null);

	async function again() {
		await game.forget();
		ui.reset();
		await goto(resolve('/'));
	}
</script>

{#if revelation && view && focus && maxBounds}
	<div class="page">
		<section class="box verdict" class:right={revelation.correct}>
			<h2>{revelation.correct ? texts.reveal.right : texts.reveal.wrong}</h2>
			<p class="author">{texts.reveal.author(revelation.authorName)}</p>
			<p>{revelation.revelationText}</p>
		</section>

		<section class="stage">
			<GameMap
				{tilesUrl}
				source={offline.tiles(game.offline)}
				theme={settings.theme}
				{maxBounds}
				{focus}
				places={features}
				suspects={chips}
			/>
		</section>

		<section class="box controls">
			<button class="btn solid" onclick={toggle}
				>{playing ? texts.reveal.pause : texts.reveal.play}</button
			>
			<input
				type="range"
				min={span.min}
				max={span.max}
				step="1"
				bind:value={time}
				aria-label={texts.reveal.replay}
			/>
			<span class="clock">{formatTime(time)}</span>
		</section>

		<a class="btn solid explain" href={resolve('/play/carnet')}>{texts.reveal.explain}</a>
		<button class="btn" onclick={again}>{texts.reveal.newInvestigation}</button>
	</div>
{/if}

<style>
	.page {
		padding: 0.7rem;
		display: grid;
		gap: 0.7rem;
	}
	.verdict {
		padding: 0.8rem;
		display: grid;
		gap: 0.4rem;
	}
	.verdict h2 {
		font-size: 1.4rem;
		background: var(--mystery);
		color: #fff;
		padding: 0 0.5rem;
	}
	.verdict.right h2 {
		background: var(--accent);
		color: #000;
	}
	.verdict p {
		margin: 0;
	}
	.author {
		font-weight: 700;
		text-transform: uppercase;
	}
	.stage {
		position: relative;
		height: 22rem;
		border: 3px solid var(--ink);
	}
	.stage :global(.map) {
		position: absolute;
		inset: 0;
		min-height: 0;
	}
	.controls {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem;
	}
	.controls input {
		flex: 1;
		accent-color: var(--accent);
	}
	.explain {
		text-align: center;
		text-decoration: none;
	}
	.clock {
		background: var(--ink);
		color: var(--paper);
		padding: 0 0.5rem;
		font-weight: 700;
	}
</style>
