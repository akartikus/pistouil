<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Geolocation } from '@capacitor/geolocation';
	import { onMount } from 'svelte';
	import { zoneContaining, type ZoneEntry, type ZonePlan } from '#lib/data/zones.js';
	import type { Difficulty } from '#lib/engine/types.js';
	import { game } from '#lib/game/game.svelte.js';
	import { locate as locateDevice, needsExplanation } from '#lib/game/locate.js';
	import { offline } from '#lib/game/offline.svelte.js';
	import { isFinished, type SavedGame } from '#lib/game/save.js';
	import { settings } from '#lib/game/settings.svelte.js';
	import { texts } from '#lib/game/texts.js';
	import { neighborCommunes, type Center, type CommuneSummary } from '#lib/game/zone.js';
	import type { Commune } from '#lib/map/zone.js';

	let communes = $state<Commune[]>([]);
	let query = $state('');
	let difficulty = $state<Difficulty>(2);
	let saved = $state<SavedGame | null>(null);
	let message = $state('');
	let locating = $state(false);
	let explaining = $state(false);
	// Offline mode: the commune to download first, its plan once measured, the progress.
	let proposed = $state<CommuneSummary | null>(null);
	let plan = $state.raw<ZonePlan | null>(null);
	let progress = $state<number | null>(null);
	let downloading: AbortController | null = null;

	const plain = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
	const matches = $derived(
		query.trim().length < 2
			? []
			: communes.filter((c) => plain(c.name).startsWith(plain(query.trim()))).slice(0, 6)
	);

	onMount(async () => {
		communes = await offline.communes();
		const result = await game.loadSave();
		saved = result.status === 'ok' ? result.game : null;
	});

	async function play(center: Center, name: string, insee?: string, zone?: ZoneEntry) {
		await game.start(center, name, insee, difficulty, zone);
		if (game.phase === 'playing') await goto(resolve('/play/carte'));
	}

	// Offline, an investigation is centred on a downloaded commune, downloaded first if needed.
	async function begin(commune: CommuneSummary) {
		message = '';
		if (!settings.offline) return play(commune.center, commune.name, commune.insee);
		const zone = offline.zones.find((candidate) => candidate.insee === commune.insee);
		if (zone) return play(zone.center, zone.name, zone.insee, zone);
		await propose(commune);
	}

	async function propose(commune: CommuneSummary) {
		proposed = commune;
		plan = null;
		try {
			plan = await offline.plan(commune);
		} catch {
			proposed = null;
			message = texts.start.downloadFailed;
		}
	}

	async function download() {
		if (!plan) return;
		downloading = new AbortController();
		progress = 0;
		try {
			await offline.download(plan, (done, total) => (progress = done / total), downloading.signal);
			const commune = plan.commune;
			proposed = null;
			await begin(commune);
		} catch {
			if (!downloading.signal.aborted) message = texts.start.downloadFailed;
		} finally {
			progress = null;
			downloading = null;
		}
	}

	function cancel() {
		downloading?.abort();
		proposed = null;
		plan = null;
	}

	async function locate() {
		message = '';
		explaining = false;
		locating = true;
		const point = await locateDevice(Geolocation);
		locating = false;
		if (!point) {
			message = texts.start.locationRefused;
			return;
		}
		if (!settings.offline) return play(point, texts.start.locate);
		const zone = zoneContaining(offline.zones, point);
		if (zone) return play(zone.center, zone.name, zone.insee, zone);
		const [nearest] = neighborCommunes(communes, point, '', 1);
		if (!nearest) return;
		await propose(nearest);
		message = texts.start.outsideZones(nearest.name);
	}

	async function askLocation() {
		if (await needsExplanation(Geolocation)) explaining = true;
		else await locate();
	}

	// A finished investigation opens on its revelation, an ongoing one on the map.
	async function resume() {
		if (!saved) return;
		const finished = isFinished(saved);
		await game.resume(saved);
		if (game.phase === 'playing') await goto(resolve(finished ? '/play/reveal' : '/play/carte'));
	}

	async function startOver() {
		await game.forget();
		saved = null;
	}
</script>

<main class="start">
	<h1>{texts.appName}</h1>
	<p class="fiction">{texts.fiction}</p>

	{#if game.phase === 'loading'}
		<p class="box pad">{texts.start.loading}</p>
	{:else if game.phase === 'failed' && game.failure}
		<section class="box pad">
			<p>{texts.failure[game.failure.reason]}</p>
			{#each game.failure.neighbors as neighbor (neighbor.insee)}
				<button class="btn" onclick={() => begin(neighbor)}>
					{neighbor.name}
				</button>
			{/each}
			{#if game.failure.reason === 'data-changed' || game.failure.reason === 'needs-connection'}
				<button class="btn solid" onclick={startOver}>{texts.start.newInvestigation}</button>
			{/if}
			<button class="btn" onclick={() => game.dismiss()}>{texts.failure.back}</button>
		</section>
	{:else}
		{#if saved}
			<section class="box pad">
				<p class="label">
					{(isFinished(saved) ? texts.start.finishedIn : texts.start.resumeIn)(saved.zone.name)}
				</p>
				<button class="btn solid" onclick={resume}>
					{isFinished(saved) ? texts.start.seeReveal : texts.start.resume}
				</button>
			</section>
		{/if}

		<section class="box pad">
			<p class="label">{texts.start.newTitle}</p>
			{#if saved}<p class="note">{texts.start.replaces}</p>{/if}
			<p class="label">{texts.start.difficulty}</p>
			<div class="row">
				{#each [1, 2, 3] as level (level)}
					<button
						class="btn"
						class:on={difficulty === level}
						onclick={() => (difficulty = level as Difficulty)}
					>
						{level} · {texts.start.difficulties[level]}
					</button>
				{/each}
			</div>
		</section>

		{#if proposed}
			<section class="box pad">
				<p>{texts.start.downloadAsk(proposed.name)}</p>
				{#if progress !== null}
					<p class="label">{texts.start.downloading(Math.round(progress * 100))}</p>
				{:else if plan}
					<button class="btn solid wide" onclick={download}>
						{texts.start.download(texts.size(plan.bytes, plan.estimated))}
					</button>
				{:else}
					<p class="label">{texts.start.measuring}</p>
				{/if}
				<button class="btn" onclick={cancel}>{texts.start.cancel}</button>
			</section>
		{/if}

		<section class="box pad">
			{#if settings.offline}<p class="label">{texts.start.offlineOn}</p>{/if}
			{#if explaining}
				<p>{texts.start.locateWhy}</p>
				<button class="btn solid wide" onclick={locate}>{texts.start.locateContinue}</button>
			{:else}
				<button class="btn solid wide" onclick={askLocation} disabled={locating}>
					{locating ? texts.start.locating : texts.start.locate}
				</button>
			{/if}
			<p class="label">{texts.start.searchCommune}</p>
			<input bind:value={query} placeholder={texts.start.communePlaceholder} />
			{#each matches as commune (commune.insee)}
				<button class="btn wide" onclick={() => begin(commune)}>
					{commune.name}
				</button>
			{/each}
			{#if query.trim().length >= 2 && matches.length === 0 && communes.length > 0}
				<p class="label">{texts.start.noCommune}</p>
			{/if}
			{#if message}<p class="error">{message}</p>{/if}
		</section>
	{/if}
</main>

<style>
	.start {
		max-width: 28rem;
		margin: 0 auto;
		padding: 1.5rem 1rem 3rem;
		display: grid;
		gap: 1rem;
	}
	h1 {
		font-size: 2rem;
	}
	.fiction {
		margin: 0;
		font-weight: 700;
	}
	.pad {
		padding: 0.9rem;
		display: grid;
		gap: 0.6rem;
	}
	.row {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.wide {
		width: 100%;
		text-align: left;
	}
	input {
		padding: 0.5rem;
		border: 3px solid var(--ink);
		background: var(--paper);
	}
	.note {
		margin: 0;
	}
	.error {
		color: var(--mystery);
		font-weight: 700;
		margin: 0;
	}
</style>
