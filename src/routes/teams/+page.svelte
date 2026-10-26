<script>
  import SiteHeader from '$lib/SiteHeader.svelte';
  import { activeDivision, activeTeams, teams, divisions, notice, noticeType, switchDivision, recordWin, addTeam, updateTeam, removeTeam, resetTournament, tournament, availableTournaments, selectTournament, updateTournament, setTournamentStatus, teamSummaries, playerDirectory } from '$lib/tournament.js';
  let showAddTeam = false;
  let showSetup = false;
  /** @type {{ index: number } | null} */
  let editingTeam = null;
  let newTeam = { name: '', playerOne: '', playerTwo: '' };
  let settingsDraft = { name: '', date: '', venue: '', courts: 2 };
  let teamQuery = '';
  $: active = divisions.find((division) => division.id === $activeDivision) || divisions[0];
  $: filteredTeams = $activeTeams.filter((team) => `${team.name} ${team.players}`.toLowerCase().includes(teamQuery.trim().toLowerCase()));
  function submitTeam() {
    const saved = editingTeam
      ? updateTeam(editingTeam.index, newTeam.name, newTeam.playerOne, newTeam.playerTwo)
      : addTeam(newTeam.name, newTeam.playerOne, newTeam.playerTwo);
    if (saved) { newTeam = { name: '', playerOne: '', playerTwo: '' }; showAddTeam = false; editingTeam = null; }
  }
  /** @param {number} index @param {{ name: string, players: string }} team */
  function openEdit(index, team) {
    const players = team.players.split('+').map((/** @type {string} */ player) => player.trim());
    newTeam = { name: team.name, playerOne: players[0] || '', playerTwo: players[1] || '' };
    editingTeam = { index };
    showAddTeam = true;
  }
  function confirmReset() {
    if (window.confirm('Reset all teams and recorded results to the starting tournament data?')) resetTournament();
  }
  /** @param {number} index @param {{ name: string }} team */
  function confirmRemove(index, team) {
    if (window.confirm(`Remove ${team.name} from the ${active.label} division? This cannot be undone.`)) removeTeam(index);
  }
  function openSetup() { settingsDraft = { name: $tournament.name, date: $tournament.date, venue: $tournament.venue, courts: $tournament.courts }; showSetup = true; }
  function saveSetup() { if (updateTournament(settingsDraft)) showSetup = false; }
  /** @param {KeyboardEvent} event */
  function handleKeydown(event) { if (event.key === 'Escape') { showAddTeam = false; showSetup = false; editingTeam = null; } }
</script>

<svelte:window on:keydown={handleKeydown} />

<SiteHeader />
<main>
  <section class="hero page-hero"><div><p class="eyebrow">TOURNAMENT ROSTER</p><h1>Teams &amp; standings.</h1><p class="hero-copy">Keep every division, player pairing, and result in one place.</p></div><div class="hero-actions"><button class="outline-button" on:click={openSetup}>Tournament setup</button><button class="outline-button reset-button" on:click={confirmReset}>Reset tournament</button><button class="primary-button hero-action" on:click={() => showAddTeam = true}>+ Add team</button></div></section>
  <section class="tournament-control"><div><p class="eyebrow">TOURNAMENT STATUS</p><h2>{$tournament.name}</h2><p>{$tournament.date} · {$tournament.venue} · {$tournament.courts} courts</p>{#if $availableTournaments.length > 1}<label class="tournament-picker">Switch tournament<select value={$availableTournaments.find((option) => option.name === $tournament.name)?.id || ''} on:change={(event) => selectTournament(event.currentTarget.value)}>{#each $availableTournaments as option}<option value={option.id}>{option.name} · {option.date}</option>{/each}</select></label>{/if}</div><div class="status-actions"><span class="status-badge {$tournament.status}">{$tournament.status}</span>{#if $tournament.status === 'draft' || $tournament.status === 'paused'}<button class="primary-button" on:click={() => setTournamentStatus('live')}>Start tournament</button>{:else if $tournament.status === 'live'}<button class="outline-button" on:click={() => setTournamentStatus('paused')}>Pause</button><button class="outline-button" on:click={() => setTournamentStatus('complete')}>Mark complete</button>{:else}<button class="outline-button" on:click={() => setTournamentStatus('draft')}>Reopen</button>{/if}</div></section>
  <section class="division-tabs" aria-label="Choose a division">{#each divisions as division}<button class:active-tab={$activeDivision === division.id} class="division-tab {division.color}" on:click={() => switchDivision(division.id)}><span class="tab-icon">{division.id === 'girls' ? '♧' : division.id === 'boys' ? '♤' : '♡'}</span><span>{division.label}<small class="division-count">{$teams[division.id]?.length || 0} teams</small></span></button>{/each}</section>
  {#if $notice}<div class="notice" class:notice-error={$noticeType === 'error'} role="status">{$notice}</div>{/if}
  <section class="panel standings-page"><div class="panel-heading"><div><p class="eyebrow">{active.label.toUpperCase()}</p><h2>Standings</h2></div><span class="live-pill"><i></i> Live</span></div><label class="team-search">Search teams or players<input bind:value={teamQuery} type="search" placeholder="e.g. Dinks or Maya" /></label><div class="table-head"><span>TEAM</span><span>W</span><span>L</span><span>PTS</span><span>FORM</span><span></span></div>{#each filteredTeams as team, index}<div class="team-row"><span class="team-rank">{team.rank}</span><span class="team-info"><span class="team-avatar {index === 0 ? 'pink-avatar' : index === 1 ? 'green-avatar' : 'neutral-avatar'}">{team.name.slice(0, 1)}</span><span><strong>{team.name}</strong><small>{team.players}</small></span></span><strong>{team.wins}</strong><span>{team.losses}</span><strong>{team.points}</strong><span class:streak-win={team.streak.startsWith('W')} class="streak">{team.streak}</span><span class="row-actions"><button class="row-action" aria-label={`Record a win for ${team.name}`} on:click={() => recordWin($activeTeams.indexOf(team))}>+</button><button class="edit-action" aria-label={`Edit ${team.name}`} on:click={() => openEdit($activeTeams.indexOf(team), team)}>Edit</button><button class="remove-action" aria-label={`Remove ${team.name}`} on:click={() => confirmRemove($activeTeams.indexOf(team), team)}>Remove</button></span></div>{:else}<div class="empty-team-results">No teams match “{teamQuery}”.</div>{/each}</section>
  <section class="profile-grid">
    <article class="panel"><div class="panel-heading"><div><p class="eyebrow">TEAM PARTICIPATION</p><h2>Performance cards</h2></div><span class="card-label">{$teamSummaries.filter((team) => team.division === $activeDivision).length} TEAMS</span></div><div class="performance-list">{#each $teamSummaries.filter((team) => team.division === $activeDivision) as team}<div class="performance-card"><div><strong>{team.name}</strong><small>{team.players} · {team.totalMatches} matches</small></div><span><b>{team.points}</b> pts</span><span class:streak-win={team.streak.startsWith('W')} class="streak">{team.streak}</span></div>{/each}</div></article>
    <article class="panel"><div class="panel-heading"><div><p class="eyebrow">PLAYER DIRECTORY</p><h2>Players</h2></div><span class="card-label">{$playerDirectory.length} PLAYERS</span></div><div class="directory-list">{#each $playerDirectory as player}<div class="directory-row"><span class="team-avatar neutral-avatar">{player.name.slice(0, 1)}</span><div><strong>{player.name}</strong><small>{player.teams.join(' · ')}</small></div><span class="directory-record">{player.wins}–{player.losses}<small>{player.points} pts</small></span></div>{/each}</div></article>
  </section>
</main>

{#if showAddTeam}<div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="team-modal-title" tabindex="-1" on:click={(event) => event.target === event.currentTarget && (showAddTeam = false)} on:keydown={(event) => event.key === 'Escape' && (showAddTeam = false)}><form class="modal" on:submit|preventDefault={submitTeam}><button type="button" class="modal-close" aria-label="Close" on:click={() => { showAddTeam = false; editingTeam = null; }}>×</button><p class="eyebrow">{editingTeam ? 'EDIT TEAM' : `NEW TEAM · ${active.short.toUpperCase()}`}</p><h2 id="team-modal-title">{editingTeam ? 'Edit team' : 'Add a team'}</h2><label>Team name<input bind:value={newTeam.name} placeholder="e.g. The Lob Stars" /></label><div class="player-fields"><label>Player 1<input bind:value={newTeam.playerOne} placeholder="e.g. Jamie" /></label><label>Player 2<input bind:value={newTeam.playerTwo} placeholder="e.g. Chris" /></label></div><button class="primary-button" type="submit">{editingTeam ? 'Save changes' : 'Add to standings'}</button></form></div>{/if}
{#if showSetup}<div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="setup-modal-title" tabindex="-1" on:click={(event) => event.target === event.currentTarget && (showSetup = false)} on:keydown={(event) => event.key === 'Escape' && (showSetup = false)}><form class="modal" on:submit|preventDefault={saveSetup}><button type="button" class="modal-close" aria-label="Close" on:click={() => showSetup = false}>×</button><p class="eyebrow">TOURNAMENT CONTROL</p><h2 id="setup-modal-title">Setup tournament</h2><label>Tournament name<input bind:value={settingsDraft.name} placeholder="Saturday Social" /></label><div class="player-fields"><label>Date<input type="date" bind:value={settingsDraft.date} /></label><label>Courts<input type="number" min="1" step="1" bind:value={settingsDraft.courts} /></label></div><label>Venue<input bind:value={settingsDraft.venue} placeholder="Rally House" /></label><button class="primary-button" type="submit">Save tournament details</button></form></div>{/if}
