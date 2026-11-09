<script>
  import SiteHeader from '$lib/SiteHeader.svelte';
  import { activeDivision, activeTeams, bracketResults, divisions, notice, noticeType, recordMatch, switchDivision, tournament, matchDetails, assignMatchDetails, undoLastResult } from '$lib/tournament.js';

  /** @type {Record<string, { a?: string, b?: string }>} */
  let scoreInputs = {};
  /** @type {Record<string, { court?: string, time?: string }>} */
  let scheduleInputs = {};
  $: active = divisions.find((division) => division.id === $activeDivision) || divisions[0];
  $: teamsForBracket = [...$activeTeams].sort((a, b) => (a.seed || a.rank) - (b.seed || b.rank)).slice(0, 4);
  $: semifinalMatches = teamsForBracket.length >= 4 ? [
    { id: `${$activeDivision}-semi-1`, round: 'Semifinal 1', teamA: teamsForBracket[0].name, teamB: teamsForBracket[2].name },
    { id: `${$activeDivision}-semi-2`, round: 'Semifinal 2', teamA: teamsForBracket[1].name, teamB: teamsForBracket[3].name }
  ] : [];
  $: completedSemis = semifinalMatches.map((match) => ({ ...match, result: $bracketResults.find((result) => result.id === match.id) }));
  $: finalMatch = { id: `${$activeDivision}-final`, round: 'Final', teamA: completedSemis[0]?.result?.winner || '', teamB: completedSemis[1]?.result?.winner || '' };
  $: finalResult = $bracketResults.find((result) => result.id === finalMatch.id);
  $: courtOptions = Array.from({ length: $tournament.courts }, (_, index) => index + 1);

  /** @param {string} id */
  function scoreFor(id) {
    return scoreInputs[id] || {};
  }

  /** @param {string} id */
  function scheduleFor(id) {
    return scheduleInputs[id] || {};
  }

  /** @param {string} id */
  function detailsFor(id) {
    const details = /** @type {Record<string, { court?: number, time?: string }>} */ ($matchDetails);
    return details[id];
  }

  /** @param {string} id @param {'a'|'b'} side @param {string} value */
  function setScore(id, side, value) {
    scoreInputs = { ...scoreInputs, [id]: { ...scoreInputs[id], [side]: value } };
  }

  /** @param {{ id: string, round: string, teamA: string, teamB: string }} match */
  function submitMatch(match) {
    const scores = scoreInputs[match.id] || {};
    const schedule = scheduleInputs[match.id] || {};
    if (!assignMatchDetails(match.id, schedule.court || '1', schedule.time)) return;
    if (recordMatch({ ...match, scoreA: scores.a, scoreB: scores.b })) {
      scoreInputs = { ...scoreInputs, [match.id]: { a: '', b: '' } };
      scheduleInputs = { ...scheduleInputs, [match.id]: { court: schedule.court || '1', time: schedule.time } };
    }
  }

  /** @param {string} id @param {'court'|'time'} field @param {string} value */
  function setSchedule(id, field, value) {
    scheduleInputs = { ...scheduleInputs, [id]: { ...scheduleInputs[id], [field]: value } };
  }
</script>

<SiteHeader />
<main>
  <section class="hero page-hero"><div><p class="eyebrow">LIVE TOURNAMENT VIEW</p><h1>The bracket.</h1><p class="hero-copy">Select a division, record scores, and watch winners advance.</p></div><div class="bracket-heading-actions"><span class="status-badge {$tournament.status}">{$tournament.status}</span>{#if $bracketResults.length}<button class="outline-button" on:click={undoLastResult}>Undo last result</button>{/if}</div></section>
  <section class="division-tabs" aria-label="Choose a division">{#each divisions as division}<button class:active-tab={$activeDivision === division.id} class="division-tab {division.color}" on:click={() => switchDivision(division.id)}><span class="tab-icon">{division.id === 'girls' ? '♧' : division.id === 'boys' ? '♤' : '♡'}</span><span>{division.label}</span></button>{/each}</section>
  {#if $notice}<div class="notice" class:notice-error={$noticeType === 'error'} role="status">{$notice}</div>{/if}

  {#if teamsForBracket.length < 4}
    <section class="panel empty-bracket"><p class="eyebrow">{active.label.toUpperCase()}</p><h2>Not enough teams yet</h2><p>Add at least four teams to generate a bracket for this division.</p><a class="primary-button" href="/teams">Manage teams</a></section>
  {:else}
    <section class="panel bracket-page"><div class="panel-heading"><div><p class="eyebrow">{active.label.toUpperCase()} · {$tournament.venue}</p><h2>Championship path</h2></div><span class="card-label">{finalResult ? 'COMPLETE' : 'LIVE'}</span></div><div class="bracket bracket-large">
      <div class="round"><small>SEMIFINALS</small>{#each completedSemis as match}<div class:complete={match.result} class:upcoming={!match.result} class="bracket-match score-match"><span>{match.teamA}</span><b>{match.result ? match.result.scoreA : '—'}</b><span>{match.teamB}</span><b>{match.result ? match.result.scoreB : '—'}</b>{#if match.result}<em>✓</em>{/if}</div>{#if match.result}<small class="match-meta">Court {detailsFor(match.id)?.court || '—'} · {detailsFor(match.id)?.time || '—'}</small>{:else}<form class="score-form" on:submit|preventDefault={() => submitMatch(match)}><label>{match.teamA}<input type="number" min="0" step="1" value={scoreFor(match.id).a || ''} on:input={(event) => setScore(match.id, 'a', event.currentTarget.value)} /></label><label>{match.teamB}<input type="number" min="0" step="1" value={scoreFor(match.id).b || ''} on:input={(event) => setScore(match.id, 'b', event.currentTarget.value)} /></label><label>Court<select value={scheduleFor(match.id).court || '1'} on:change={(event) => setSchedule(match.id, 'court', event.currentTarget.value)}>{#each courtOptions as court}<option value={court}>{court}</option>{/each}</select></label><label>Time<input type="time" value={scheduleFor(match.id).time || ''} on:input={(event) => setSchedule(match.id, 'time', event.currentTarget.value)} /></label><button class="primary-button" type="submit">Record score</button></form>{/if}{/each}</div>
      <div class="connector"><span></span><span></span></div>
      <div class="round"><small>FINAL</small><div class:complete={finalResult} class:upcoming={!finalResult} class="bracket-match score-match"><span>{finalMatch.teamA || 'Semifinal 1 winner'}</span><b>{finalResult ? finalResult.scoreA : '—'}</b><span>{finalMatch.teamB || 'Semifinal 2 winner'}</span><b>{finalResult ? finalResult.scoreB : '—'}</b>{#if finalResult}<em>✓</em>{/if}</div>{#if finalResult}<small class="match-meta">Court {detailsFor(finalMatch.id)?.court || '—'} · {detailsFor(finalMatch.id)?.time || '—'}</small>{:else if finalMatch.teamA && finalMatch.teamB}<form class="score-form" on:submit|preventDefault={() => submitMatch(finalMatch)}><label>{finalMatch.teamA}<input type="number" min="0" step="1" value={scoreFor(finalMatch.id).a || ''} on:input={(event) => setScore(finalMatch.id, 'a', event.currentTarget.value)} /></label><label>{finalMatch.teamB}<input type="number" min="0" step="1" value={scoreFor(finalMatch.id).b || ''} on:input={(event) => setScore(finalMatch.id, 'b', event.currentTarget.value)} /></label><label>Court<select value={scheduleFor(finalMatch.id).court || '1'} on:change={(event) => setSchedule(finalMatch.id, 'court', event.currentTarget.value)}>{#each courtOptions as court}<option value={court}>{court}</option>{/each}</select></label><label>Time<input type="time" value={scheduleFor(finalMatch.id).time || ''} on:input={(event) => setSchedule(finalMatch.id, 'time', event.currentTarget.value)} /></label><button class="primary-button" type="submit">Record final</button></form>{/if}</div>
    </div><div class="bracket-footer"><span><i class="dot pink-dot"></i>Completed matches update standings</span><span><i class="dot yellow-dot"></i>Enter scores to advance winners</span></div></section>
  {/if}
</main>
