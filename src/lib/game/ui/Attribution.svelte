<script lang="ts">
	import { onMount } from 'svelte';
	import { texts } from '../texts.js';

	const OPEN_SECONDS = 5;
	// The licence asks for this credit wherever the map shows: open when the screen appears,
	// folded after a few seconds or on a touch elsewhere (even on a pin, which stops the click),
	// and always one touch away.
	let open = $state(true);
	let root: HTMLElement;

	onMount(() => {
		const timer = setTimeout(() => (open = false), OPEN_SECONDS * 1000);
		return () => clearTimeout(timer);
	});
</script>

<svelte:window
	onclickcapture={(event) => root && !root.contains(event.target as Node) && (open = false)}
/>

<span bind:this={root}>
	<button
		class="i"
		type="button"
		aria-label={texts.map.attributionLabel}
		aria-expanded={open}
		onclick={() => (open = !open)}>i</button
	>
	{#if open}<p class="credit" role="status">{texts.map.attribution}</p>{/if}
</span>

<style>
	.i {
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border: 2px solid var(--on-strong);
		border-radius: 50%;
		background: transparent;
		color: var(--on-strong);
		font-weight: 700;
		cursor: pointer;
	}
	/* Under the header, which is its positioned ancestor. */
	.credit {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0.8rem;
		max-width: calc(100% - 1.6rem);
		margin: 0;
		padding: 0.3rem 0.6rem;
		background: var(--paper);
		color: var(--ink);
		border: 2px solid var(--frame);
		box-shadow: 3px 3px 0 var(--shadow);
		font-size: 11px;
		z-index: 30;
	}
</style>
