<script lang="ts">
	import { formatTime } from '#lib/engine/render.js';
	import { validateCatalog } from '#lib/engine/catalog.js';
	import { rawStarterCatalog } from '#lib/engine/starter-catalog.js';
	import { findInconsistencies, findSufficientAlibis } from '#lib/game/deduction.js';
	import { explainedFacts, namesById } from '#lib/game/derive.js';
	import { game } from '#lib/game/game.svelte.js';
	import { texts } from '#lib/game/texts.js';
	import FactCard from '#lib/game/ui/FactCard.svelte';

	const catalog = validateCatalog(structuredClone(rawStarterCatalog));

	let tab = $state<'chronology' | 'notes'>('chronology');
	let annotationPlace = $state('');
	let annotationText = $state('');

	const investigation = $derived(game.view?.investigation);
	const names = $derived(namesById(investigation?.suspects ?? []));
	const placeName = (id: string) => investigation?.places.find((p) => p.osmId === id)?.name ?? id;
	// Once the game is over, every fact is explained, those the player never read included.
	const items = $derived(explainedFacts(game.readFacts, game.revelation?.facts ?? null));
	const facts = $derived(items.map((item) => item.fact));
	const unseen = $derived(new Set(items.filter((item) => !item.seen).map((item) => item.fact.id)));
	const inconsistencies = $derived(findInconsistencies(facts, game.conclusionMinutes));
	const hatched = (id: string) => inconsistencies.some((item) => item.factIds.includes(id));
	const verdicts = $derived(
		investigation
			? findSufficientAlibis(
					facts,
					investigation.sceneId,
					investigation.mysteryTime,
					game.conclusionMinutes
				)
			: []
	);

	function addAnnotation() {
		if (!annotationPlace || !annotationText.trim()) return;
		game.annotate(annotationPlace, annotationText.trim());
		annotationText = '';
	}
</script>

<div class="page">
	<div class="tabs">
		<button class="btn" class:solid={tab === 'chronology'} onclick={() => (tab = 'chronology')}>
			{texts.notebook.chronology}
		</button>
		<button class="btn" class:solid={tab === 'notes'} onclick={() => (tab = 'notes')}>
			{texts.notebook.notes}
		</button>
	</div>

	{#if tab === 'chronology'}
		{#if game.revelation}
			<p class="box explained">{texts.notebook.explained}</p>
		{/if}
		{#if facts.length === 0}
			<p class="empty">{texts.notebook.empty}</p>
		{/if}
		<ol class="timeline">
			{#each facts as fact (fact.id)}
				<li>
					<span class="at">{formatTime(fact.from)}</span>
					<div>
						<FactCard {fact} {catalog} {names} hatched={hatched(fact.id)} />
						{#if unseen.has(fact.id)}<p class="tag link">{texts.notebook.unseen}</p>{/if}
						{#each inconsistencies.filter((item) => item.factIds[1] === fact.id) as item (item.factIds.join())}
							<p class="tag link">
								≠ {texts.notebook.inconsistency} ·
								{texts.verdict.measured(item.tripMinutes, item.gapMinutes)}
							</p>
						{/each}
						{#each verdicts.filter((v) => v.factId === fact.id) as verdict (verdict.factId)}
							<p class="verdict">
								{(verdict.canReachScene ? texts.verdict.couldReach : texts.verdict.tooFar)(
									names[verdict.characterId],
									verdict.tripMinutes,
									verdict.gapMinutes
								)}
							</p>
						{/each}
					</div>
				</li>
			{/each}
		</ol>

		{#if game.measured.length > 0}
			<h2 class="label">{texts.notebook.measured}</h2>
			<ul class="plain">
				{#each game.measured as route (route.placeA + route.placeB)}
					<li>
						{placeName(route.placeA)} ↔ {placeName(route.placeB)} :
						<strong>{route.approximate ? '~' : ''}{route.minutes} min</strong>
					</li>
				{/each}
			</ul>
		{/if}
	{:else}
		<label class="label" for="note">{texts.notebook.freeNote}</label>
		<textarea
			id="note"
			class="box"
			rows="5"
			placeholder={texts.notebook.notePlaceholder}
			value={game.progress?.notes ?? ''}
			oninput={(event) => game.setNotes(event.currentTarget.value)}></textarea>

		<h2 class="label">{texts.notebook.annotations}</h2>
		<div class="annotate">
			<select bind:value={annotationPlace} class="box">
				<option value="">—</option>
				{#each investigation?.places ?? [] as place (place.osmId)}
					<option value={place.osmId}>{place.number} · {place.name}</option>
				{/each}
			</select>
			<input class="box" bind:value={annotationText} />
			<button class="btn solid" onclick={addAnnotation}>+</button>
		</div>
		<ul class="plain">
			{#each game.progress?.annotations ?? [] as note (note.placeId)}
				<li>
					<strong>{placeName(note.placeId)}</strong> : {note.text}
					<button
						class="btn small"
						onclick={() => game.annotate(note.placeId, '')}
						aria-label="Supprimer">×</button
					>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.page {
		padding: 0.7rem;
		display: grid;
		gap: 0.7rem;
		align-content: start;
	}
	.explained {
		margin: 0;
		padding: 0.5rem 0.7rem;
		font-weight: 700;
	}
	.tabs {
		display: flex;
		gap: 0.5rem;
	}
	.tabs .btn {
		flex: 1;
	}
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0 0 0 4.2rem;
		display: grid;
		gap: 0.7rem;
		border-left: 3px solid var(--frame);
		margin-left: 3.4rem;
	}
	.timeline li {
		position: relative;
	}
	.at {
		position: absolute;
		left: -4.8rem;
		width: 3.8rem;
		text-align: right;
		font-weight: 700;
	}
	.tag.link {
		margin: 4px 0 0;
		text-transform: none;
	}
	.verdict {
		margin: 4px 0 0;
		padding: 0.3rem 0.5rem;
		border: 2.5px solid var(--frame);
		font-size: 12px;
		font-weight: 700;
	}
	textarea,
	input,
	select {
		padding: 0.5rem;
		box-shadow: none;
	}
	.annotate {
		display: flex;
		gap: 0.4rem;
	}
	.annotate input {
		flex: 1;
		min-width: 0;
	}
	.plain {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.4rem;
	}
	.small {
		padding: 0 0.4rem;
	}
</style>
