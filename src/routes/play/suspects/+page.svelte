<script lang="ts">
	import { resolve } from '$app/paths';
	import { game } from '#lib/game/game.svelte.js';
	import { texts } from '#lib/game/texts.js';
	import type { AlibiStatus } from '#lib/game/progress.js';
	import Head from '#lib/game/ui/Head.svelte';

	const suspects = $derived(game.view?.investigation.suspects ?? []);
	const STATUSES: AlibiStatus[] = ['to-check', 'doubtful', 'verified'];
</script>

<div class="page">
	{#each suspects as suspect (suspect.id)}
		<section class="box card">
			<header>
				<strong>{suspect.firstName}</strong>
				<a href={resolve('/play/suspects/[id]', { id: suspect.id })}>{texts.suspects.file} ▸</a>
			</header>
			<div class="body">
				<Head
					id={suspect.id}
					size={52}
					hatched={game.progress?.alibiStatuses[suspect.id] === 'doubtful'}
				/>
				<div>
					<p class="label">{texts.suspects.alibi}</p>
					<div class="statuses">
						{#each STATUSES as status (status)}
							<button
								class="status {status}"
								class:chosen={game.progress?.alibiStatuses[suspect.id] === status}
								onclick={() => game.setAlibi(suspect.id, status)}
							>
								{texts.suspects.statuses[status]}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</section>
	{/each}
</div>

<style>
	.page {
		padding: 0.7rem;
		display: grid;
		gap: 0.9rem;
	}
	header {
		display: flex;
		justify-content: space-between;
		padding: 0.3rem 0.6rem;
		background: var(--ink);
		color: var(--paper);
		text-transform: uppercase;
	}
	header a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 700;
	}
	.body {
		display: flex;
		gap: 0.8rem;
		padding: 0.6rem;
		align-items: center;
	}
	.statuses {
		display: flex;
		gap: 0.3rem;
		flex-wrap: wrap;
	}
	.status {
		padding: 2px 7px;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		background: transparent;
		border: 1.5px solid var(--dim);
		color: var(--dim);
		cursor: pointer;
	}
	.status.chosen {
		color: var(--paper);
		background: var(--ink);
		border: 2px solid var(--ink);
	}
	.status.chosen.to-check {
		background: var(--paper);
		color: var(--ink);
		border-style: dashed;
	}
	.status.chosen.doubtful {
		background: repeating-linear-gradient(45deg, var(--ink) 0 2px, var(--paper) 2px 6px);
		color: var(--ink);
		border-color: var(--ink);
		text-shadow:
			0 0 3px var(--paper),
			0 0 3px var(--paper),
			0 0 3px var(--paper);
	}
</style>
