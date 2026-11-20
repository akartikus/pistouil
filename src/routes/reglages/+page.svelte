<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { game } from '#lib/game/game.svelte.js';
	import { offline } from '#lib/game/offline.svelte.js';
	import { settings } from '#lib/game/settings.svelte.js';
	import { texts } from '#lib/game/texts.js';
	import { tour } from '#lib/game/tour.svelte.js';
	import { ui } from '#lib/game/ui.svelte.js';

	async function newInvestigation() {
		await game.forget();
		ui.reset();
		await goto(resolve('/'));
	}
</script>

<main class="page">
	<header>
		<h1>{texts.settings.title}</h1>
		<a href={resolve(game.phase === 'playing' ? '/play/carte' : '/')}>‹ {texts.settings.back}</a>
	</header>

	<section class="box pad">
		<p class="label">{texts.settings.theme}</p>
		<div class="row">
			<button
				class="btn"
				class:solid={settings.theme === 'light'}
				onclick={() => settings.setTheme('light')}
			>
				{texts.settings.light}
			</button>
			<button
				class="btn"
				class:solid={settings.theme === 'dark'}
				onclick={() => settings.setTheme('dark')}
			>
				{texts.settings.dark}
			</button>
		</div>
	</section>

	<section class="box pad">
		<p class="label">{texts.settings.offline}</p>
		<p>{texts.settings.offlineText}</p>
		<div class="row">
			<button class="btn" class:solid={settings.offline} onclick={() => settings.setOffline(true)}>
				{texts.settings.on}
			</button>
			<button
				class="btn"
				class:solid={!settings.offline}
				onclick={() => settings.setOffline(false)}
			>
				{texts.settings.off}
			</button>
		</div>
		<p class="label">{texts.settings.zones}</p>
		{#each offline.zones as zone (zone.insee)}
			<div class="row zone">
				<span>{zone.name} · {texts.size(zone.bytes)}</span>
				<button class="btn" onclick={() => offline.remove(zone.insee)}
					>{texts.settings.remove}</button
				>
			</div>
		{:else}
			<p>{texts.settings.noZone}</p>
		{/each}
		{#if !offline.kept}<p class="warning">{texts.settings.notKept}</p>{/if}
	</section>

	<section class="box pad">
		<button class="btn" onclick={() => tour.restart()}>{texts.tour.replay}</button>
	</section>

	{#if game.view}
		<section class="box pad">
			<p class="label">{texts.settings.investigation}</p>
			<p>
				{game.zone.name} · {texts.start.difficulties[game.view.investigation.difficulty]} · {texts
					.settings.seed}
				{game.view.investigation.seed}
			</p>
			<p>{texts.settings.dataVersion} : {game.view.dataVersion}</p>
			<button class="btn solid" onclick={newInvestigation}>{texts.settings.newInvestigation}</button
			>
		</section>
	{/if}

	<section class="box about">
		<h2>{texts.settings.about}</h2>
		<div class="text">
			<h3>{texts.settings.fictionTitle}</h3>
			<p>{texts.fiction}</p>
			<h3>{texts.settings.dataTitle}</h3>
			<p>{texts.settings.dataText}</p>
			<h3>{texts.settings.mapTitle}</h3>
			<p>{texts.settings.mapText}</p>
			<h3>{texts.settings.fontTitle}</h3>
			<p>{texts.settings.fontText}</p>
		</div>
	</section>
</main>

<style>
	.page {
		max-width: 28rem;
		margin: 0 auto;
		padding: 1rem;
		display: grid;
		gap: 1rem;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	header a {
		color: var(--ink);
		font-weight: 700;
	}
	.pad {
		padding: 0.8rem;
		display: grid;
		gap: 0.5rem;
	}
	.pad p {
		margin: 0;
	}
	.row {
		display: flex;
		gap: 0.5rem;
	}
	.zone {
		justify-content: space-between;
		align-items: center;
	}
	.warning {
		color: var(--mystery);
		font-weight: 700;
	}
	.about h2 {
		background: var(--ink);
		color: var(--paper);
		padding: 0.3rem 0.8rem;
		font-size: 1rem;
	}
	.text {
		padding: 0.8rem;
	}
	.text h3 {
		font-size: 0.8rem;
		margin-top: 0.7rem;
	}
	.text p {
		margin: 0.2rem 0 0;
	}
</style>
