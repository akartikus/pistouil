<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Geolocation } from '@capacitor/geolocation';
	import { onMount } from 'svelte';
	import { loadCommunes } from '#lib/data/files.js';
	import type { Difficulty } from '#lib/engine/types.js';
	import { game } from '#lib/game/game.svelte.js';
	import type { SavedGame } from '#lib/game/save.js';
	import { texts } from '#lib/game/texts.js';
	import type { Commune } from '#lib/map/zone.js';

	const base = import.meta.env.VITE_DATA_URL ?? '/dev-data';

	let communes = $state<Commune[]>([]);
	let query = $state('');
	let difficulty = $state<Difficulty>(2);
	let saved = $state<SavedGame | null>(null);
	let message = $state('');
	let locating = $state(false);

	const plain = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
	const matches = $derived(
		query.trim().length < 2
			? []
			: communes.filter((c) => plain(c.name).startsWith(plain(query.trim()))).slice(0, 6)
	);

	onMount(async () => {
		communes = await loadCommunes(base, fetch);
		const result = await game.loadSave();
		saved = result.status === 'ok' ? result.game : null;
	});

	async function begin(center: { lat: number; lon: number }, name: string, insee?: string) {
		message = '';
		await game.start(center, name, insee, difficulty);
		if (game.phase === 'playing') await goto(resolve('/play/carte'));
	}

	async function locate() {
		message = '';
		locating = true;
		try {
			const { coords } = await Geolocation.getCurrentPosition();
			await begin({ lat: coords.latitude, lon: coords.longitude }, texts.start.locate);
		} catch {
			message = texts.start.locationRefused;
		} finally {
			locating = false;
		}
	}

	async function resume() {
		if (!saved) return;
		await game.resume(saved);
		if (game.phase === 'playing') await goto(resolve('/play/carte'));
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
				<button class="btn" onclick={() => begin(neighbor.center, neighbor.name, neighbor.insee)}>
					{neighbor.name}
				</button>
			{/each}
			{#if game.failure.reason === 'data-changed'}
				<button class="btn solid" onclick={startOver}>{texts.start.newInvestigation}</button>
			{/if}
			<button class="btn" onclick={() => game.dismiss()}>{texts.failure.back}</button>
		</section>
	{:else}
		{#if saved}
			<section class="box pad">
				<p class="label">{texts.start.resumeIn(saved.zone.name)}</p>
				<button class="btn solid" onclick={resume}>{texts.start.resume}</button>
			</section>
		{/if}

		<section class="box pad">
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

		<section class="box pad">
			<button class="btn solid wide" onclick={locate} disabled={locating}>
				{locating ? texts.start.locating : texts.start.locate}
			</button>
			<p class="label">{texts.start.searchCommune}</p>
			<input bind:value={query} placeholder={texts.start.communePlaceholder} />
			{#each matches as commune (commune.insee)}
				<button class="btn wide" onclick={() => begin(commune.center, commune.name, commune.insee)}>
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
	.error {
		color: var(--mystery);
		font-weight: 700;
		margin: 0;
	}
</style>
