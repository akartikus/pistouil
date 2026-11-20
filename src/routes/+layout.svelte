<script lang="ts">
	import '#lib/game/app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { settings } from '#lib/game/settings.svelte.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	$effect(() => {
		document.documentElement.dataset.theme = settings.theme;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
