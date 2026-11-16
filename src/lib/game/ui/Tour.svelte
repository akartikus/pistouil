<script lang="ts">
	import { texts } from '../texts.js';
	import { tour } from '../tour.svelte.js';
</script>

{#if tour.step}
	<aside class="box tour" role="status">
		<p>{texts.tour[tour.step as 1 | 2 | 3]}</p>
		<button class="btn small" onclick={() => tour.finish()}>{texts.tour.skip}</button>
	</aside>
{/if}

<style>
	.tour {
		/* The map overlay ignores touches; the guide must receive them. */
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.4rem 0.6rem;
		background: var(--accent);
		color: #000;
		font-weight: 700;
		font-size: 13px;
	}
	.tour p {
		margin: 0;
		flex: 1;
	}
	.small {
		padding: 0.15rem 0.5rem;
		font-size: 11px;
	}
</style>
