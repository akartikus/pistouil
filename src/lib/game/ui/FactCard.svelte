<script lang="ts">
	import { formatTime } from '../../engine/render.js';
	import type { Catalog } from '../../engine/types.js';
	import type { PublicFact } from '../projection.js';
	import { texts } from '../texts.js';
	import Head from './Head.svelte';

	let {
		fact,
		catalog,
		names,
		hatched = false,
		onfile
	}: {
		fact: PublicFact;
		catalog: Catalog;
		// First names by suspect id.
		names: Record<string, string>;
		hatched?: boolean;
		// Opens the file of a suspect.
		onfile?: (suspectId: string) => void;
	} = $props();

	const clue = $derived(
		fact.source.kind === 'clue'
			? catalog.clueTypes.find(
					(type) => type.id === (fact.source as { clueTypeId: string }).clueTypeId
				)
			: undefined
	);
	const when = $derived(
		fact.from === fact.to
			? formatTime(fact.from)
			: `${formatTime(fact.from)}–${formatTime(fact.to)}`
	);
	const title = $derived(
		fact.source.kind === 'testimony'
			? texts.piece.testimony(names[fact.source.speakerId])
			: (clue?.label ?? '')
	);
</script>

<article class="box card" class:hatched>
	<header>
		<span>{title}</span>
		<span class="when">{when}</span>
	</header>
	<div class="body">
		{#if fact.source.kind === 'testimony'}
			{#if onfile}
				<button
					class="avatar"
					onclick={() => onfile(fact.source.kind === 'testimony' ? fact.source.speakerId : '')}
					aria-label={texts.map.openFile(names[fact.source.speakerId])}
				>
					<Head id={fact.source.speakerId} size={46} />
				</button>
			{:else}
				<Head id={fact.source.speakerId} size={46} />
			{/if}
		{:else}
			<img src="/pieces/{clue?.icon ?? 'npc'}.svg" alt="" width="46" height="46" />
		{/if}
		<div>
			<p class="about label">{texts.piece.about(names[fact.characterId])}</p>
			<p class="text">{fact.text}</p>
		</div>
	</div>
</article>

<style>
	.card {
		box-shadow: 3px 3px 0 var(--shadow);
	}
	.card.hatched {
		outline: 6px solid transparent;
		background-image: repeating-linear-gradient(45deg, var(--ink) 0 2px, transparent 2px 6px);
		background-color: var(--paper);
		padding: 5px;
	}
	.card.hatched > * {
		background: var(--paper);
	}
	.card.hatched > header {
		background: var(--strong);
	}
	header {
		display: flex;
		justify-content: space-between;
		padding: 3px 8px;
		background: var(--strong);
		color: var(--on-strong);
		font-weight: 700;
		font-size: 11px;
		text-transform: uppercase;
	}
	.when {
		color: var(--accent);
	}
	.body {
		display: flex;
		gap: 0.6rem;
		padding: 0.5rem 0.6rem;
		align-items: flex-start;
	}
	.about,
	.text {
		margin: 0 0 4px;
	}
	.text {
		font-size: 13px;
	}
	.avatar {
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
		flex: none;
	}
	img {
		background: #fff;
		flex: none;
	}
</style>
