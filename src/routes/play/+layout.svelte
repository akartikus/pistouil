<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { game } from '#lib/game/game.svelte.js';
	import { texts } from '#lib/game/texts.js';
	import Attribution from '#lib/game/ui/Attribution.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// After a reload the state is gone: the start screen offers to resume.
	onMount(() => {
		if (game.phase !== 'playing') goto(resolve('/'));
	});

	const tabs = $derived([
		{ href: resolve('/play/carte'), name: texts.nav.map, count: 0 },
		{ href: resolve('/play/carnet'), name: texts.nav.notebook, count: game.readFacts.length },
		{
			href: resolve('/play/suspects'),
			name: texts.nav.suspects,
			count: game.view?.investigation.suspects.length ?? 0
		}
	]);
	// The credit of the map shows wherever the map does.
	const showsMap = $derived(
		!page.url.pathname.includes('/carnet') && !page.url.pathname.includes('/suspects')
	);
	const title = $derived(
		page.url.pathname.includes('/carnet')
			? texts.nav.notebook
			: page.url.pathname.includes('/suspects')
				? texts.nav.suspects
				: page.url.pathname.includes('/reveal')
					? texts.reveal.title
					: texts.nav.map
	);
</script>

{#if game.phase === 'playing'}
	<div class="shell">
		<header>
			<div class="title">
				<h1>{title}</h1>
				{#if showsMap}<Attribution />{/if}
			</div>
			<div class="actions">
				<a class="new" href={resolve('/')} aria-label={texts.nav.newFull}>{texts.nav.newShort}</a>
				<a class="gear" href={resolve('/reglages')} aria-label={texts.nav.settings}>⚙</a>
			</div>
		</header>
		<div class="content">{@render children()}</div>
		<nav>
			{#each tabs as tab (tab.href)}
				<a href={tab.href} class:active={page.url.pathname.startsWith(tab.href)}>
					{tab.name}
					{#if tab.count > 0}<span class="badge">{tab.count}</span>{/if}
				</a>
			{/each}
		</nav>
	</div>
{/if}

<style>
	.shell {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		max-width: 48rem;
		margin: 0 auto;
	}
	.title {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	header {
		position: relative;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.8rem;
		background: var(--strong);
		color: var(--on-strong);
		border-bottom: 3px solid var(--frame);
	}
	h1 {
		font-size: 1.1rem;
	}
	.actions {
		display: flex;
		align-items: stretch;
		gap: 0.4rem;
	}
	.gear,
	.new {
		background: var(--paper);
		color: var(--ink);
		padding: 0 0.5rem;
		text-decoration: none;
		display: flex;
		align-items: center;
	}
	.gear {
		font-size: 1.2rem;
	}
	.new {
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.content {
		flex: 1;
		min-height: 0;
		position: relative;
		overflow: auto;
	}
	nav {
		display: flex;
		border-top: 3px solid var(--frame);
		background: var(--paper);
	}
	nav a {
		flex: 1;
		text-align: center;
		padding: 0.8rem 0.2rem;
		font-weight: 700;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--ink);
		border-right: 3px solid var(--frame);
		position: relative;
	}
	nav a:last-child {
		border-right: 0;
	}
	nav a.active {
		background: var(--accent);
		color: #000;
	}
	.badge {
		margin-left: 4px;
		padding: 0 5px;
		background: var(--strong);
		color: var(--on-strong);
		font-size: 11px;
	}
</style>
