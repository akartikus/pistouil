<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { validateCatalog } from '#lib/engine/catalog.js';
	import { formatTime } from '#lib/engine/render.js';
	import { rawStarterCatalog } from '#lib/engine/starter-catalog.js';
	import type { Place } from '#lib/engine/types.js';
	import { findInconsistencies, measuredKey, positionsAt } from '#lib/game/deduction.js';
	import { namesById } from '#lib/game/derive.js';
	import { game } from '#lib/game/game.svelte.js';
	import { shippedCommune, shippedTiles } from '#lib/game/shipped.js';
	import { asPlaces, boxOf, hoursOf } from '#lib/game/mapdata.js';
	import { settings } from '#lib/game/settings.svelte.js';
	import { texts } from '#lib/game/texts.js';
	import { ui } from '#lib/game/ui.svelte.js';
	import FactCard from '#lib/game/ui/FactCard.svelte';
	import Head from '#lib/game/ui/Head.svelte';
	import Piece from '#lib/game/ui/Piece.svelte';
	import Tour from '#lib/game/ui/Tour.svelte';
	import { tour } from '#lib/game/tour.svelte.js';
	import GameMap from '#lib/map/Map.svelte';
	import { placeFeatures } from '#lib/map/features.js';
	import { routeFeatures } from '#lib/map/route-line.js';
	import { communeMask, communeOutline, zoneBounds, type Commune } from '#lib/map/zone.js';
	import { TILES_URL } from '#lib/data/files.js';

	const catalog = validateCatalog(structuredClone(rawStarterCatalog));

	const view = $derived(game.view);
	const investigation = $derived(view?.investigation);
	const names = $derived(namesById(investigation?.suspects ?? []));
	let shipped = $state<Commune | null>(null);

	// Before the slider is bound: binding a null value would set it to the minimum.
	if (game.view && ui.time === null) ui.time = game.view.investigation.mysteryTime;

	onMount(async () => {
		tour.begin();
		shipped = await shippedCommune();
	});

	const retained = $derived<Place[]>(asPlaces(investigation?.places ?? []));
	const decor = $derived<Place[]>(asPlaces(view?.decor ?? []));
	const features = $derived(
		placeFeatures(decor, catalog, {
			investigationIds: retained.map((place) => place.osmId),
			mysteryId: investigation?.sceneId,
			hours: hoursOf(view?.decor ?? [])
		})
	);

	const focus = $derived(retained.length ? zoneBounds(boxOf(retained), 250) : null);
	const maxBounds = $derived(decor.length ? zoneBounds(boxOf(decor), 300) : null);
	const commune = $derived(shipped?.name === game.zone.name ? shipped : null);
	const mask = $derived(commune ? communeMask(commune.contour) : null);
	const outline = $derived(commune ? communeOutline(commune.contour) : null);

	const inconsistencies = $derived(findInconsistencies(game.readFacts, game.conclusionMinutes));
	const chips = $derived.by(() => {
		if (!investigation || ui.time === null) return [];
		const positions = positionsAt(
			game.readFacts,
			investigation.suspects.map((s) => s.id),
			ui.time
		);
		return investigation.suspects.flatMap((suspect) => {
			const [placeId] = positions[suspect.id].placeIds;
			const place = retained.find((p) => p.osmId === placeId);
			if (!place) return [];
			return [
				{
					id: suspect.id,
					initial: suspect.firstName[0],
					lon: place.lon,
					lat: place.lat,
					conflict: inconsistencies.some((item) => item.characterId === suspect.id),
					selected: ui.selectedSuspectId === suspect.id
				}
			];
		});
	});
	const route = $derived(ui.route ? routeFeatures(ui.route, retained) : null);

	// The slider covers the mystery and every discovered fact; the times where something
	// happens are marked on it.
	const moments = $derived.by(() => {
		if (!investigation) return [];
		const times = [{ at: investigation.mysteryTime, mystery: true }];
		for (const fact of game.readFacts) {
			for (const at of [fact.from, fact.to]) {
				if (!times.some((time) => time.at === at)) times.push({ at, mystery: false });
			}
		}
		return times;
	});
	const timeRange = $derived.by(() => {
		const all = moments.map((moment) => moment.at);
		if (all.length === 0) return { min: 0, max: 0 };
		return {
			min: Math.floor((Math.min(...all) - 15) / 5) * 5,
			max: Math.ceil((Math.max(...all) + 15) / 5) * 5
		};
	});
	const percent = (at: number) =>
		((at - timeRange.min) / (timeRange.max - timeRange.min || 1)) * 100;

	const place = $derived(retained.find((p) => p.osmId === ui.selectedPlaceId));
	const placeNumber = $derived(
		investigation?.places.find((p) => p.osmId === ui.selectedPlaceId)?.number
	);
	const pieces = $derived(game.facts.filter((fact) => fact.placeId === ui.selectedPlaceId));
	const piece = $derived(pieces.find((fact) => fact.id === ui.selectedPieceId));
	const others = $derived(
		[...retained]
			.filter((p) => p.osmId !== ui.selectedPlaceId)
			.sort(
				(a, b) =>
					Number(b.osmId === investigation?.sceneId) - Number(a.osmId === investigation?.sceneId)
			)
	);
	const suspect = $derived(investigation?.suspects.find((s) => s.id === ui.selectedSuspectId));
	const suspectPlace = $derived.by(() => {
		if (!suspect || ui.time === null) return null;
		const [placeId] = positionsAt(game.readFacts, [suspect.id], ui.time)[suspect.id].placeIds;
		return retained.find((p) => p.osmId === placeId) ?? null;
	});

	async function openPlace(id: string) {
		tour.advance(1);
		ui.selectedSuspectId = null;
		ui.selectedPlaceId = id;
		ui.selectedPieceId = null;
		ui.chooser = false;
		await game.open(id);
	}

	// The sheet makes room for the map: touching the map, or showing a route, closes it.
	function closePanels() {
		ui.selectedPlaceId = null;
		ui.selectedSuspectId = null;
		ui.selectedPieceId = null;
		ui.chooser = false;
	}

	function select(factId: string) {
		tour.advance(2);
		ui.selectedPieceId = factId;
		game.read(factId);
	}

	function openSuspect(id: string) {
		ui.selectedPlaceId = null;
		ui.chooser = false;
		ui.selectedSuspectId = id;
	}

	async function measure(a: string, b: string) {
		const result = await game.measure(a, b);
		if (result) {
			tour.advance(3);
			ui.route = result;
			closePanels();
		}
	}

	const minutes = (a: string, b: string) => game.measuredMinutes[measuredKey(a, b)];
	const toFile = (id: string) => goto(resolve('/play/suspects/[id]', { id }));
</script>

{#if view && investigation && maxBounds && focus}
	<div class="stage">
		<GameMap
			tilesUrl={TILES_URL}
			source={shippedTiles()}
			theme={settings.theme}
			{maxBounds}
			{focus}
			places={features}
			{route}
			{mask}
			{outline}
			suspects={chips}
			onplace={openPlace}
			onsuspect={openSuspect}
			onmapclick={closePanels}
		/>

		<div class="overlay">
			<section class="cursor box">
				<span class="time">{formatTime(ui.time ?? investigation.mysteryTime)}</span>
				<div class="track">
					<div class="marks" aria-hidden="true">
						{#each moments as moment (moment.at)}
							<span class="mark" class:mystery={moment.mystery} style:left="{percent(moment.at)}%"
							></span>
						{/each}
					</div>
					<input
						type="range"
						min={timeRange.min}
						max={timeRange.max}
						step="1"
						bind:value={ui.time}
						aria-label={texts.map.cursor}
					/>
				</div>
			</section>

			<section class="situation box">
				<p class="label">{formatTime(investigation.mysteryTime)}</p>
				<p>{investigation.situationText}</p>
			</section>

			<Tour />

			{#if place && placeNumber}
				<section class="sheet box">
					<header class="mystery-head" class:mystery={place.osmId === investigation.sceneId}>
						<strong>{placeNumber} · {place.name}</strong>
						<button
							class="close"
							onclick={() => (ui.selectedPlaceId = null)}
							aria-label={texts.map.close}>×</button
						>
					</header>
					<div class="inner">
						{#if ui.chooser}
							<p class="label">{texts.map.tripFrom(place.name)}</p>
							{#each others as other (other.osmId)}
								<button class="btn row" onclick={() => measure(place.osmId, other.osmId)}>
									<span class="num"
										>{investigation.places.find((p) => p.osmId === other.osmId)?.number}</span
									>
									<span class="grow">
										{other.name}
										{#if other.osmId === investigation.sceneId}<span class="tag"
												>{texts.map.mystery}</span
											>{/if}
									</span>
									<span
										>{minutes(place.osmId, other.osmId)
											? `${minutes(place.osmId, other.osmId)} min`
											: '—'}</span
									>
								</button>
							{/each}
							<p class="label">{texts.map.onlyRetained} {texts.map.noted}</p>
						{:else}
							<p class="label">{texts.map.pieces}</p>
							{#if pieces.length === 0}
								<p class="empty">{texts.map.nothingHere}</p>
							{:else}
								<div class="pieces">
									{#each pieces as fact (fact.id)}
										<Piece
											{fact}
											{catalog}
											speakerName={fact.source.kind === 'testimony'
												? names[fact.source.speakerId]
												: ''}
											selected={fact.id === ui.selectedPieceId}
											onclick={() => select(fact.id)}
										/>
									{/each}
								</div>
							{/if}
							{#if piece}
								<FactCard fact={piece} {catalog} {names} onfile={toFile} />
							{/if}
							<p class="label">{texts.map.routeLabel}</p>
							<div class="actions">
								{#if place.osmId !== investigation.sceneId}
									<button
										class="btn solid"
										onclick={() => measure(place.osmId, investigation.sceneId)}
									>
										{texts.map.toMystery}
									</button>
								{/if}
								<button class="btn" onclick={() => (ui.chooser = true)}>{texts.map.tripTo}</button>
							</div>
						{/if}
					</div>
				</section>
			{:else if suspect}
				<section class="sheet box">
					<header class="mystery-head">
						<strong>{suspect.firstName}</strong>
						<button
							class="close"
							onclick={() => (ui.selectedSuspectId = null)}
							aria-label={texts.map.close}>×</button
						>
					</header>
					<div class="inner suspect">
						<Head id={suspect.id} size={54} />
						<div>
							<p>
								{suspectPlace
									? `${formatTime(ui.time ?? 0)} · ${suspectPlace.name}`
									: texts.map.notAnywhere}
							</p>
							{#each inconsistencies.filter((item) => item.characterId === suspect.id) as item (item.factIds.join())}
								<p class="alert hatch">
									<span>{texts.verdict.measured(item.tripMinutes, item.gapMinutes)}</span>
								</p>
							{/each}
							<button class="btn solid" onclick={() => toFile(suspect.id)}
								>{texts.map.openFile(suspect.firstName)}</button
							>
						</div>
					</div>
				</section>
			{/if}
		</div>
	</div>
{/if}

<style>
	.stage {
		position: absolute;
		inset: 0;
	}
	.stage :global(.map) {
		position: absolute;
		inset: 0;
		min-height: 0;
	}
	.overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 0.5rem;
		gap: 0.5rem;
	}
	.overlay > * {
		pointer-events: auto;
	}
	.situation {
		font-size: 12px;
		padding: 0.4rem 0.6rem;
		max-height: 5.5rem;
		overflow: auto;
	}
	.situation p {
		margin: 0;
	}
	/* One thin row at the top: the time, then the track with its marks. */
	.cursor {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.2rem 0.5rem;
		box-shadow: 3px 3px 0 var(--shadow);
	}
	.time {
		background: var(--strong);
		color: var(--on-strong);
		padding: 0 0.4rem;
		font-weight: 700;
		font-size: 0.95rem;
	}
	.track {
		position: relative;
		flex: 1;
		padding-top: 8px;
	}
	input[type='range'] {
		display: block;
		width: 100%;
		height: 16px;
		margin: 0;
		accent-color: var(--frame);
	}
	.marks {
		position: absolute;
		inset: 0 8px auto 8px;
		height: 8px;
	}
	.mark {
		position: absolute;
		bottom: 0;
		width: 3px;
		height: 8px;
		margin-left: -1.5px;
		background: var(--accent);
		border: 1.5px solid var(--frame);
		box-sizing: border-box;
	}
	.mark.mystery {
		width: 7px;
		height: 10px;
		margin-left: -3.5px;
		background: var(--mystery);
	}
	.alert {
		margin: 0.3rem 0 0;
		padding: 3px;
		font-weight: 700;
		font-size: 11px;
	}
	.alert span {
		display: block;
		background: var(--paper);
		padding: 2px 6px;
	}
	.sheet {
		margin-top: auto;
		max-height: 52%;
		overflow: auto;
	}
	.mystery-head {
		display: flex;
		justify-content: space-between;
		padding: 0.3rem 0.6rem;
		background: var(--accent);
		color: #000;
		text-transform: uppercase;
	}
	.mystery-head.mystery {
		background: var(--mystery);
		color: #fff;
	}
	.close {
		border: 0;
		background: transparent;
		font-size: 1.3rem;
		line-height: 1;
		cursor: pointer;
	}
	.inner {
		padding: 0.5rem 0.6rem;
		display: grid;
		gap: 0.5rem;
	}
	.inner.suspect {
		grid-template-columns: auto 1fr;
		align-items: start;
	}
	.pieces {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-align: left;
	}
	.grow {
		flex: 1;
	}
	.num {
		background: var(--strong);
		color: var(--on-strong);
		padding: 0 6px;
	}
</style>
