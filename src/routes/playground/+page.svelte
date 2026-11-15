<script lang="ts">
	import { validateCatalog } from '#lib/engine/catalog.js';
	import { rawStarterCatalog, richPlaces, richRoutes } from '#lib/engine/fixtures.js';
	import { LIE_MOTIVES, type Difficulty, type LieMotive } from '#lib/engine/types.js';
	import {
		checkAccusation,
		describeScenarios,
		describeSnapshot,
		discoveredFactIds,
		runPlayground
	} from '#lib/playground/playground.js';

	const catalog = validateCatalog(rawStarterCatalog);
	const scenarios = describeScenarios(catalog);

	let seed = $state(1);
	let difficulty = $state<Difficulty>(2);
	let scenarioId = $state('');
	let motive = $state('');
	let activePlaceIds = $state(richPlaces.map((place) => place.osmId));
	let tab = $state<'simulation' | 'snapshot'>('simulation');
	let allPlaces = $state(false);
	let reveal = $state(false);
	let opened = $state<string[]>([]);
	let accused = $state<string | null>(null);

	const motives = $derived(
		scenarios.find((scenario) => scenario.id === scenarioId)?.motives ?? [...LIE_MOTIVES]
	);

	const run = $derived(
		runPlayground(richPlaces, richRoutes, catalog, {
			seed: Number(seed) || 0,
			difficulty,
			scenarioId: scenarioId || null,
			motive: (motive || null) as LieMotive | null,
			activePlaceIds
		})
	);

	// A new investigation starts a new attempt.
	$effect(() => {
		void run;
		opened = [];
		accused = null;
	});

	// The places of the investigation by default; every active place on request or on failure.
	const matrix = $derived(run.ok && !allPlaces ? run.retainedMatrix : run.matrix);

	const discovered = $derived(run.ok ? discoveredFactIds(run.investigation, opened) : []);
	const verdict = $derived(run.ok && accused ? checkAccusation(run.investigation, accused) : null);

	function pickScenario() {
		// Keep the motive only if the new scenario supports it.
		if (motive && !motives.includes(motive as LieMotive)) motive = '';
	}

	function randomSeed() {
		seed = Math.floor(Math.random() * 1_000_000_000);
	}

	function toggle(placeId: string) {
		opened = opened.includes(placeId)
			? opened.filter((id) => id !== placeId)
			: [...opened, placeId];
	}

	function restart() {
		opened = [];
		accused = null;
	}
</script>

<main>
	<h1>Playground du moteur</h1>
	<p class="note">Outil de développement : générer, résoudre et déboguer le moteur.</p>

	<section class="controls">
		<label>
			Seed
			<input type="number" bind:value={seed} />
		</label>
		<button type="button" onclick={randomSeed}>Seed aléatoire</button>
		<label>
			Difficulté
			<select bind:value={difficulty}>
				{#each [1, 2, 3] as level (level)}
					<option value={level}>{level}</option>
				{/each}
			</select>
		</label>
		<label>
			Scénario
			<select bind:value={scenarioId} onchange={pickScenario}>
				<option value="">n’importe lequel</option>
				{#each scenarios as scenario (scenario.id)}
					<option value={scenario.id}>{scenario.id}</option>
				{/each}
			</select>
		</label>
		<label>
			Motif
			<select bind:value={motive}>
				<option value="">n’importe lequel</option>
				{#each motives as option (option)}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</label>
	</section>

	<fieldset>
		<legend>Lieux actifs</legend>
		<div class="buttons">
			<button type="button" onclick={() => (activePlaceIds = richPlaces.map((p) => p.osmId))}>
				Tout cocher
			</button>
			<button type="button" onclick={() => (activePlaceIds = [])}>Tout décocher</button>
		</div>
		{#each richPlaces as place (place.osmId)}
			<label class="place">
				<input type="checkbox" bind:group={activePlaceIds} value={place.osmId} />
				{place.name} <small>({place.typeId}{place.removed ? ', retiré' : ''})</small>
			</label>
		{/each}
	</fieldset>

	<nav class="tabs">
		<button type="button" class:active={tab === 'simulation'} onclick={() => (tab = 'simulation')}>
			Simulation
		</button>
		<button type="button" class:active={tab === 'snapshot'} onclick={() => (tab = 'snapshot')}>
			Snapshot
		</button>
	</nav>

	{#if tab === 'simulation'}
		{#if !run.ok}
			<p class="error">Génération échouée : <code>{run.reason}</code></p>
		{:else}
			{@const view = run.view}
			<section>
				<h2>Mystère</h2>
				<p>{view.situation}</p>
				<p>
					À <strong>{view.mysteryTime}</strong>, scène : <strong>{view.sceneName}</strong>.
					Difficulté mesurée : <strong>{view.measuredDifficulty}</strong> (demandée : {difficulty}).
					{#if view.violations.length === 0}
						<span class="ok">Toutes les règles de cohérence sont respectées.</span>
					{:else}
						<span class="error">Règles violées : {view.violations.join(', ')}</span>
					{/if}
				</p>
			</section>
		{/if}

		<section>
			<h2>Distances entre les lieux</h2>
			<label>
				<input type="checkbox" bind:checked={allPlaces} />
				Tous les lieux actifs
			</label>
			<div class="scroll">
				<table class="matrix">
					<thead>
						<tr>
							<th></th>
							{#each matrix.places as place (place.id)}
								<th class:scene={place.isScene}>{place.name}{place.isScene ? ' ★' : ''}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each matrix.places as row, i (row.id)}
							<tr>
								<th class:scene={row.isScene}>{row.name}{row.isScene ? ' ★' : ''}</th>
								{#each matrix.cells[i] as cell, j (j)}
									<td class:diagonal={cell === null}>{cell ?? '—'}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="note">★ scène du mystère. Marche à 5 km/h.</p>
		</section>

		{#if run.ok}
			{@const view = run.view}
			<section>
				<h2>Enquêter</h2>
				<p>
					<strong>{view.dayLabel}</strong> : les horaires indiqués sont ceux de ce jour. Ouvrez un lieu
					pour voir ses faits, puis accusez un suspect.
				</p>
				<div class="buttons">
					{#each view.places as place (place.id)}
						<button
							type="button"
							class:active={opened.includes(place.id)}
							onclick={() => toggle(place.id)}
						>
							{opened.includes(place.id) ? '✓' : '+'}
							{place.name}
							<small>({place.hours})</small>
						</button>
					{/each}
				</div>

				{#if discovered.length === 0}
					<p class="note">Aucun fait découvert.</p>
				{:else}
					<table>
						<thead>
							<tr><th>sur</th><th>lieu</th><th>heure</th><th>source</th><th>texte</th></tr>
						</thead>
						<tbody>
							{#each view.facts.filter((fact) => discovered.includes(fact.id)) as fact (fact.id)}
								<tr>
									<td>{fact.about}</td>
									<td>{fact.place}</td>
									<td>{fact.time}</td>
									<td>{fact.kind}{fact.speaker ? ` (${fact.speaker})` : ''}</td>
									<td>{fact.text}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}

				<h3>Suspects</h3>
				<div class="buttons">
					{#each view.suspects as suspect (suspect.id)}
						<button
							type="button"
							class:active={accused === suspect.id}
							onclick={() => (accused = suspect.id)}
						>
							Accuser {suspect.firstName}
						</button>
					{/each}
					<button type="button" onclick={restart}>Recommencer</button>
				</div>
				{#if verdict}
					<p class={verdict.correct ? 'ok' : 'error'}>
						{verdict.correct ? 'Bonne accusation' : 'Mauvaise accusation'} : l’auteur est
						<strong>{verdict.authorName}</strong>.
					</p>
				{/if}
			</section>

			<section>
				<label>
					<input type="checkbox" bind:checked={reveal} />
					Afficher la solution et le détail du moteur
				</label>
			</section>

			{#if reveal}
				<section>
					<h2>Solution</h2>
					<p>
						Auteur : <strong>{view.reveal.authorName}</strong>. Mensonge ({view.reveal.lie.factId},
						motif <code>{view.reveal.lie.motive}</code>) : {view.reveal.lie.text}
					</p>
					<p>{view.reveal.revelation}</p>
					<h3>Vraie soirée</h3>
					<ul>
						{#each view.reveal.evenings as evening (evening.name)}
							<li>{evening.name} : {evening.segments.join(' → ')}</li>
						{/each}
					</ul>
				</section>

				<section>
					<h2>Solveur</h2>
					<ol>
						{#each view.reveal.rounds as round (round.round)}
							<li>Tour {round.round} : innocentés {round.cleared.join(', ')}</li>
						{/each}
					</ol>
					<p>Suspects restants : {view.reveal.possibleSuspects.join(', ') || 'aucun'}</p>
				</section>

				<section>
					<h2>Faits ({view.facts.length})</h2>
					<table>
						<thead>
							<tr>
								<th>id</th>
								<th>sur</th>
								<th>lieu</th>
								<th>heure</th>
								<th>source</th>
								<th>texte</th>
								<th>débloqué par</th>
								<th>statut</th>
							</tr>
						</thead>
						<tbody>
							{#each view.facts as fact (fact.id)}
								{@const detail = view.reveal.facts[fact.id]}
								<tr class:lie={fact.id === view.reveal.lie.factId}>
									<td>{fact.id}</td>
									<td>{fact.about}</td>
									<td>{fact.place}</td>
									<td>{fact.time}</td>
									<td>{fact.kind}{fact.speaker ? ` (${fact.speaker})` : ''}</td>
									<td>{fact.text}</td>
									<td>{detail.unlockedBy ?? 'visible au départ'}</td>
									<td>
										{#if !detail.reachable}inatteignable{:else if detail.reliable}fiable{:else}non
											fiable{/if}
										{#if detail.verdict}· {detail.verdict}{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</section>
			{/if}
		{/if}

		<section>
			<h2>Scénarios du catalogue ({scenarios.length})</h2>
			<ul>
				{#each scenarios as scenario (scenario.id)}
					<li>{scenario.title} <code>{scenario.id}</code></li>
				{/each}
			</ul>
		</section>
	{:else}
		<section>
			<h2>Snapshot du moteur</h2>
			<p class="note">Ce que le moteur a choisi. Contient la solution.</p>
			{#if !run.ok}
				<p class="error">Génération échouée : <code>{run.reason}</code></p>
			{:else}
				{@const snapshot = describeSnapshot(run.investigation, richPlaces)}
				<h3>Choix</h3>
				<table>
					<tbody>
						{#each snapshot.choices as choice (choice.name)}
							<tr><th>{choice.name}</th><td>{choice.value}</td></tr>
						{/each}
					</tbody>
				</table>

				<h3>Suspects et vraie soirée</h3>
				<table>
					<thead>
						<tr><th>id</th><th>prénom</th><th>auteur</th><th>soirée (lieu from–to)</th></tr>
					</thead>
					<tbody>
						{#each snapshot.suspects as suspect (suspect.id)}
							<tr>
								<td>{suspect.id}</td>
								<td>{suspect.firstName}</td>
								<td>{suspect.author ? 'oui' : 'non'}</td>
								<td>{suspect.evening}</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<h3>Faits</h3>
				<table>
					<thead>
						<tr>
							<th>id</th><th>sur</th><th>lieu</th><th>from</th><th>to</th><th>départ</th><th
								>segment</th
							>
							<th>débloqué par</th><th>source</th><th>témoin</th><th>mensonge</th>
						</tr>
					</thead>
					<tbody>
						{#each snapshot.facts as fact (fact.id)}
							<tr class:lie={fact.lie}>
								<td>{fact.id}</td>
								<td>{fact.characterId}</td>
								<td>{fact.placeId}</td>
								<td>{fact.from}</td>
								<td>{fact.to}</td>
								<td>{fact.departure ? 'oui' : 'non'}</td>
								<td>{fact.segment ?? '—'}</td>
								<td>{fact.unlockedBy ?? '—'}</td>
								<td>{fact.kind}</td>
								<td>{fact.speakerId ?? '—'}</td>
								<td>{fact.lie ? 'oui' : 'non'}</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<details>
					<summary>Enquête brute (JSON)</summary>
					<pre>{JSON.stringify(run.investigation, null, 2)}</pre>
				</details>
			{/if}
		</section>
	{/if}
</main>

<style>
	main {
		max-width: 70rem;
		margin: 0 auto;
		padding: 1rem;
		font-family: system-ui, sans-serif;
		line-height: 1.4;
	}
	.note {
		color: #666;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: end;
		margin-bottom: 1rem;
	}
	.controls label {
		display: flex;
		flex-direction: column;
		font-size: 0.85rem;
	}
	.place {
		display: inline-block;
		margin-right: 1rem;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		font-size: 0.85rem;
	}
	th,
	td {
		border: 1px solid #ccc;
		padding: 0.25rem 0.5rem;
		text-align: left;
		vertical-align: top;
	}
	tr.lie {
		background: #fff1cc;
	}
	.scroll {
		overflow-x: auto;
	}
	.tabs {
		display: flex;
		gap: 0.5rem;
		margin: 1rem 0;
	}
	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	button.active {
		background: #d0e8ff;
	}
	.matrix th.scene {
		background: #fff1cc;
	}
	.matrix td.diagonal {
		background: #f0f0f0;
		text-align: center;
	}
	.ok {
		color: #1a7f37;
	}
	.error {
		color: #b42318;
	}
	pre {
		max-height: 24rem;
		overflow: auto;
		background: #f5f5f5;
		padding: 0.5rem;
		font-size: 0.75rem;
	}
</style>
