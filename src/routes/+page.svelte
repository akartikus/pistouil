<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Geolocation } from '@capacitor/geolocation';
	import { onMount } from 'svelte';
	import type { Difficulty } from '#lib/engine/types.js';
	import { game } from '#lib/game/game.svelte.js';
	import { LOCATE_AVAILABLE } from '#lib/game/features.js';
	import { locate as locateDevice, needsExplanation } from '#lib/game/locate.js';
	import { isFinished, type SavedGame } from '#lib/game/save.js';
	import { shippedCommune } from '#lib/game/shipped.js';
	import { texts } from '#lib/game/texts.js';
	import type { Center } from '#lib/game/zone.js';
	import { insideContour, type Commune } from '#lib/map/zone.js';

	let fuveau = $state<Commune | null>(null);
	let difficulty = $state<Difficulty>(2);
	let saved = $state<SavedGame | null>(null);
	// With a saved investigation, the choices of a new one open on the button.
	let choosingNew = $state(false);
	let message = $state('');
	let locating = $state(false);
	let explaining = $state(false);

	onMount(async () => {
		try {
			fuveau = await shippedCommune();
		} catch {
			message = texts.failure['data-missing'];
		}
		const result = await game.loadSave();
		saved = result.status === 'ok' ? result.game : null;
	});

	async function play(center: Center, name: string) {
		await game.start(center, name, difficulty);
		if (game.phase === 'playing') await goto(resolve('/play/carte'));
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
		// Only Fuveau has data for now: a position elsewhere cannot start an investigation.
		if (!fuveau || !insideContour(point, fuveau.contour)) {
			message = texts.start.outsideFuveau;
			return;
		}
		await play(point, fuveau.name);
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
			{#if game.failure.reason === 'data-changed'}
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
				<div class="row choice">
					<button class="btn solid" onclick={resume}>
						{isFinished(saved) ? texts.start.seeReveal : texts.start.resume}
					</button>
					<button class="btn" class:on={choosingNew} onclick={() => (choosingNew = true)}>
						{texts.start.newInvestigation}
					</button>
				</div>
			</section>
		{/if}

		{#if !saved || choosingNew}
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

			<section class="box pad">
				{#if explaining}
					<p>{texts.start.locateWhy}</p>
					<button class="btn solid wide" onclick={locate}>{texts.start.locateContinue}</button>
				{:else}
					<button
						class="btn solid wide"
						onclick={askLocation}
						disabled={locating || !LOCATE_AVAILABLE}
					>
						{locating ? texts.start.locating : texts.start.locate}
					</button>
					{#if !LOCATE_AVAILABLE}<p class="note">{texts.start.locateSoon}</p>{/if}
				{/if}
				<button
					class="btn solid wide"
					onclick={() => fuveau && play(fuveau.center, fuveau.name)}
					disabled={!fuveau}
				>
					{texts.start.fuveau}
				</button>
				{#if message}<p class="error">{message}</p>{/if}
			</section>
		{/if}
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
	.choice .btn {
		flex: 1 1 8rem;
	}
	.wide {
		width: 100%;
		text-align: left;
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
