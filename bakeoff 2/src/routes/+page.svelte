<script>
  import SiteHeader from '$lib/SiteHeader.svelte';
  import { activeDivision, activeTeams, bracketResults, divisions, matchDetails, teams, notice, noticeType, switchDivision, tournament } from '$lib/tournament.js';
  $: active = divisions.find((division) => division.id === $activeDivision) || divisions[0];
  $: leader = $activeTeams[0] || { name: 'No teams yet', players: 'Add teams to get started', wins: 0, losses: 0, streak: '—' };
  $: teamsForBracket = [...$activeTeams].sort((a, b) => (a.seed || a.rank) - (b.seed || b.rank)).slice(0, 4);
  $: semifinalMatches = teamsForBracket.length >= 4 ? [
    { id: `${$activeDivision}-semi-1`, teamA: teamsForBracket[0].name, teamB: teamsForBracket[2].name },
    { id: `${$activeDivision}-semi-2`, teamA: teamsForBracket[1].name, teamB: teamsForBracket[3].name }
  ] : [];
  $: completedSemis = semifinalMatches.map((match) => ({ ...match, result: $bracketResults.find((result) => result.id === match.id) }));
  $: finalMatch = { id: `${$activeDivision}-final`, teamA: completedSemis[0]?.result?.winner || '', teamB: completedSemis[1]?.result?.winner || '' };
  $: finalResult = $bracketResults.find((result) => result.id === finalMatch.id);
  $: divisionResults = $bracketResults.filter((result) => result.division === $activeDivision);
  $: completedCount = divisionResults.length;
  $: nextMatch = completedSemis.find((match) => !match.result) || (!finalResult && finalMatch.teamA && finalMatch.teamB ? finalMatch : null);

  /** @param {string} date */
  function formatDate(date) {
    return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }

  /** @param {string} name */
  function initials(name) {
    return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  }

  /** @param {string} id */
  function detailsFor(id) {
    return /** @type {Record<string, { court?: number, time?: string }>} */ ($matchDetails)[id];
  }
</script>

<SiteHeader />
<main>
  <section class="hero"><div><p class="eyebrow">{$tournament.name.toUpperCase()} · {formatDate($tournament.date)}</p><h1>Let’s play some <span>pickleball.</span></h1><p class="hero-copy">Track the action, celebrate the wins, and keep your eye on the next matchup.</p></div><div class="hero-ball" aria-hidden="true"><img src="/pickleplay-logo.png" alt="" /></div></section>
  <section class="division-tabs" aria-label="Choose a division">{#each divisions as division}<button class:active-tab={$activeDivision === division.id} class="division-tab {division.color}" on:click={() => switchDivision(division.id)}><span class="tab-icon">{division.id === 'girls' ? '♧' : division.id === 'boys' ? '♤' : '♡'}</span><span>{division.label}<small class="division-count">{$teams[division.id]?.length || 0} teams</small></span></button>{/each}</section>
  {#if $notice}<div class="notice" class:notice-error={$noticeType === 'error'} role="status">{$notice}</div>{/if}
  <section class="summary-grid"><article class="summary-card feature-card"><div class="card-label">CURRENT LEADER · {active.short.toUpperCase()}</div><div class="leader-row"><div class="team-avatar pink-avatar">{leader.name.slice(0, 1)}</div><div><h2>{leader.name}</h2><p>{leader.players}</p></div><span class="rank-badge">#1</span></div><div class="leader-record"><strong>{leader.wins}–{leader.losses}</strong><span>match record</span><span class="up">↗ {leader.streak}</span></div></article><article class="summary-card"><div class="card-label">BRACKET MATCHES PLAYED</div><div class="stat-number">{completedCount} <span>/ 3</span></div><div class="progress"><span style="width: {Math.min(100, completedCount / 3 * 100)}%"></span></div><p>{completedCount === 3 ? 'Division bracket complete' : 'Record scores to advance the bracket'}</p></article><article class="summary-card next-card"><div class="card-label">UP NEXT</div>{#if nextMatch}<div class="next-match"><span class="mini-team">{initials(nextMatch.teamA)}</span><strong>{nextMatch.teamA}</strong><span class="vs">vs</span><strong>{nextMatch.teamB}</strong><span class="mini-team lavender">{initials(nextMatch.teamB)}</span></div><div class="next-time"><span>{detailsFor(nextMatch.id)?.time || 'Schedule match'}</span><span>{detailsFor(nextMatch.id)?.court ? `Court ${detailsFor(nextMatch.id).court}` : $tournament.venue} <i></i></span></div>{:else}<div class="next-match"><strong>{completedCount === 3 ? 'Bracket complete' : 'Record both semifinals to set the final'}</strong></div><div class="next-time"><span>{$tournament.venue}</span></div>{/if}</article></section>
  <section class="content-grid"><article class="panel"><div class="panel-heading"><div><p class="eyebrow">QUICK LOOK</p><h2>Standings</h2></div><a class="text-button" href="/teams">View all →</a></div>{#each $activeTeams.slice(0, 3) as team}<div class="team-row dashboard-team"><span class="team-rank">{team.rank}</span><span class="team-info"><span class="team-avatar neutral-avatar">{team.name.slice(0, 1)}</span><span><strong>{team.name}</strong><small>{team.players}</small></span></span><strong>{team.wins}</strong><span>{team.losses}</span><span class:streak-win={team.streak.startsWith('W')} class="streak">{team.streak}</span></div>{/each}</article><article class="panel bracket-panel"><div class="panel-heading"><div><p class="eyebrow">LIVE VIEW</p><h2>Bracket progress</h2></div><span class="live-pill"><i></i> Live</span></div><div class="bracket"><div class="round round-one"><small>SEMIFINALS</small>{#each completedSemis as match}<div class:complete={match.result} class:upcoming={!match.result} class="bracket-match"><span>{match.teamA}</span><b>{match.result ? match.result.scoreA : '—'}</b><span>{match.teamB}</span><b>{match.result ? match.result.scoreB : '—'}</b>{#if match.result}<em>✓</em>{/if}</div>{/each}</div><div class="connector"><span></span><span></span></div><div class="round round-two"><small>FINAL</small><div class:complete={finalResult} class:upcoming={!finalResult} class="bracket-match"><span>{finalMatch.teamA || 'Semifinal 1 winner'}</span><b>{finalResult ? finalResult.scoreA : '—'}</b><span>{finalMatch.teamB || 'Semifinal 2 winner'}</span><b>{finalResult ? finalResult.scoreB : '—'}</b>{#if finalResult}<em>✓</em>{/if}</div></div></div><div class="bracket-footer"><span><i class="dot pink-dot"></i>Completed</span><span><i class="dot yellow-dot"></i>Up next</span><a class="text-button" href="/bracket">View full bracket →</a></div></article></section>
  <section class="fun-feature"><div class="fun-icon">☀</div><div><p class="eyebrow">COMING SOON</p><h2>Bring your game face</h2><p>Player profiles, match highlights, and a daily “Dink of the Day” are on the way.</p></div><span class="coming-pill">In the works</span></section>
</main>
