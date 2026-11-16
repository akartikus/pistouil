<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { validateCatalog } from '#lib/engine/catalog.js';
	import { rawStarterCatalog } from '#lib/engine/starter-catalog.js';
	import { namesById, versionsOf } from '#lib/game/derive.js';
	import { game } from '#lib/game/game.svelte.js';
	import type { AlibiStatus } from '#lib/game/progress.js';
	import { texts } from '#lib/game/texts.js';
	import FactCard from '#lib/game/ui/FactCard.svelte';
	import Head from '#lib/game/ui/Head.svelte';

	const catalog = validateCatalog(structuredClone(rawStarterCatalog));
	const STATUSES: AlibiStatus[] = ['to-check', 'doubtful', 'verified'];

	const investigation = $derived(game.view?.investigation);
	const suspect = $derived(investigation?.suspects.find((s) => s.id === page.params.id));
	const names = $derived(namesById(investigation?.suspects ?? []));
	const versions = $derived(versionsOf(game.readFacts, page.params.id ?? ''));
	let confirming = $state(false);

	const sections = $derived([
		{ title: texts.suspects.saysHimself, facts: versions.saysHimself },
		{ title: texts.suspects.othersSay, facts: versions.othersSay },
		{ title: texts.suspects.proofs, facts: versions.proofs }
	]);

	async function accuse() {
		if (!suspect) return;
		await game.accuse(suspect.id);
		await goto(resolve('/play/reveal'));
	}
	const toFile = (id: string) => goto(resolve('/play/suspects/[id]', { id }));
</script>

{#if suspect && investigation}
	<div class="page">
		<a class="back" href={resolve('/play/suspects')}>‹ {texts.nav.suspects}</a>
		<section class="box top">
			<Head
				id={suspect.id}
				size={72}
				hatched={game.progress?.alibiStatuses[suspect.id] === 'doubtful'}
			/>
			<div>
				<h2>{suspect.firstName}</h2>
				<p class="label">{texts.suspects.alibi}</p>
				<div class="statuses">
					{#each STATUSES as status (status)}
						<button
							class="btn small"
							class:solid={game.progress?.alibiStatuses[suspect.id] === status}
							onclick={() => game.setAlibi(suspect.id, status)}
						>
							{texts.suspects.statuses[status]}
						</button>
					{/each}
				</div>
				<p class="label">
					{texts.suspects.explored(
						game.progress?.openedPlaceIds.length ?? 0,
						investigation.places.length
					)}
				</p>
			</div>
		</section>

		{#each sections as section (section.title)}
			<h3 class="label">{section.title}</h3>
			{#if section.facts.length === 0}
				<div class="empty">
					<strong>{texts.suspects.nothing}</strong>
					<div>{texts.suspects.fillsUp}</div>
				</div>
			{:else}
				{#each section.facts as fact (fact.id)}
					<FactCard {fact} {catalog} {names} onfile={toFile} />
				{/each}
			{/if}
		{/each}

		{#if game.revelation === null}
			{#if confirming}
				<section class="box confirm">
					<h3>{texts.suspects.confirmTitle(suspect.firstName)}</h3>
					<p>{texts.suspects.confirmText}</p>
					<div class="row">
						<button class="btn solid" onclick={accuse}>{texts.suspects.confirm}</button>
						<button class="btn" onclick={() => (confirming = false)}>{texts.suspects.cancel}</button
						>
					</div>
				</section>
			{:else}
				<button class="btn solid accuse" onclick={() => (confirming = true)}>
					{texts.suspects.accuse(suspect.firstName)}
					<small>{texts.suspects.definitive}</small>
				</button>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.page {
		padding: 0.7rem;
		display: grid;
		gap: 0.6rem;
		align-content: start;
	}
	.back {
		color: var(--ink);
		font-weight: 700;
	}
	.top {
		display: flex;
		gap: 0.9rem;
		padding: 0.7rem;
		align-items: center;
	}
	.statuses {
		display: flex;
		gap: 0.3rem;
		flex-wrap: wrap;
		margin-bottom: 0.3rem;
	}
	.small {
		padding: 2px 6px;
		font-size: 10px;
	}
	.accuse {
		display: grid;
		gap: 2px;
		padding: 0.8rem;
		font-size: 1.1rem;
		margin-top: 0.5rem;
		background-image: repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 6px);
		background-size: 100% 12px;
		background-repeat: no-repeat;
	}
	.accuse small {
		font-size: 10px;
	}
	.confirm {
		padding: 0.8rem;
		display: grid;
		gap: 0.5rem;
	}
	.row {
		display: flex;
		gap: 0.5rem;
	}
</style>
