<script lang="ts">
	import type { Catalog } from '../../engine/types.js';
	import type { PublicFact } from '../projection.js';
	import Head from './Head.svelte';

	let {
		fact,
		catalog,
		speakerName,
		selected = false,
		onclick
	}: {
		fact: PublicFact;
		catalog: Catalog;
		speakerName: string;
		selected?: boolean;
		onclick?: () => void;
	} = $props();

	const clue = $derived(
		fact.source.kind === 'clue'
			? catalog.clueTypes.find(
					(type) => type.id === (fact.source as { clueTypeId: string }).clueTypeId
				)
			: undefined
	);
</script>

<button class="piece" class:selected {onclick} type="button">
	{#if fact.source.kind === 'testimony'}
		<Head id={fact.source.speakerId} size={40} />
		<span>{speakerName}</span>
	{:else}
		<img src="/pieces/{clue?.icon ?? 'npc'}.svg" alt="" width="40" height="40" />
		<span>{clue?.label ?? '?'}</span>
	{/if}
</button>

<style>
	.piece {
		display: grid;
		justify-items: center;
		gap: 2px;
		width: 4.6rem;
		padding: 0.3rem 0.2rem;
		background: var(--paper);
		border: 3px solid var(--frame);
		cursor: pointer;
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
		line-height: 1.1;
		text-align: center;
	}
	.piece.selected {
		background: var(--solid);
		color: var(--on-solid);
		box-shadow: 3px 3px 0 var(--shadow);
	}
	img {
		background: #fff;
	}
</style>
