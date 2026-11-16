<script lang="ts">
	import { headTraits } from '../heads.js';

	let {
		id,
		size = 44,
		hatched = false
	}: { id: string; size?: number; hatched?: boolean } = $props();

	const traits = $derived(headTraits(id));
	const line =
		'stroke: var(--ink); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round;';
</script>

<svg viewBox="-24 -24 48 48" width={size} height={size} role="img" aria-label="Suspect {id}">
	{#if traits.hair === 'long'}
		<path d="M-19 -2 V16 H-13 V0 M19 -2 V16 H13 V0" style="fill: var(--ink); stroke: none" />
	{/if}
	<circle r="19" style="fill: var(--paper); {line}" />
	{#if hatched}
		<circle r="19" fill="none" style="stroke: var(--ink); stroke-width: 3; stroke-dasharray: 2 3" />
	{/if}
	{#if traits.hair === 'short'}
		<path d="M-17 -6 Q0 -26 17 -6 Q0 -14 -17 -6 Z" style="fill: var(--ink); stroke: none" />
	{/if}
	{#if traits.hat === 'cap'}
		<path d="M-18 -8 Q0 -30 18 -8 Z M-18 -8 H24" style="fill: var(--ink); {line}" />
	{:else if traits.hat === 'tall'}
		<path d="M-11 -14 V-30 H11 V-14 M-20 -14 H20" style="fill: var(--ink); {line}" />
	{/if}
	<circle cx="-7" cy="-2" r="2" style="fill: var(--ink)" />
	<circle cx="7" cy="-2" r="2" style="fill: var(--ink)" />
	{#if traits.glasses}
		<circle cx="-7" cy="-2" r="5" fill="none" style={line} />
		<circle cx="7" cy="-2" r="5" fill="none" style={line} />
		<path d="M-2 -2 H2" style={line} />
	{/if}
	{#if traits.mouth === 'smile'}
		<path d="M-7 8 Q0 15 7 8" fill="none" style={line} />
	{:else if traits.mouth === 'flat'}
		<path d="M-6 10 H6" style={line} />
	{:else}
		<ellipse cy="10" rx="4" ry="3" fill="none" style={line} />
	{/if}
</svg>
