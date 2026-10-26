// The store is intentionally plain JavaScript so it can be shared by every route.
// @ts-nocheck
import { browser } from '$app/environment';
import { writable, derived, get as getStore } from 'svelte/store';
import { supabase } from '$lib/supabase/client.js';

const STORAGE_KEY = 'pickleplay-tournament-v1';
const SELECTED_TOURNAMENT_KEY = 'pickleplay-selected-tournament-v1';

export const divisions = [
  { id: 'girls', label: 'Girls doubles', short: 'Girls', color: 'pink' },
  { id: 'boys', label: 'Boys doubles', short: 'Boys', color: 'blue' },
  { id: 'mixed', label: 'Mixed doubles', short: 'Mixed', color: 'green' }
];

const seedTeams = {
  girls: [
    { name: 'The Dinks', players: 'Maya + Zoe', wins: 3, losses: 0, points: 9, streak: 'W3', rank: 1 },
    { name: 'Kitchen Queens', players: 'Ava + Ellie', wins: 2, losses: 1, points: 6, streak: 'W2', rank: 2 },
    { name: 'Spin Sisters', players: 'Lena + Mia', wins: 1, losses: 2, points: 3, streak: 'L1', rank: 3 },
    { name: 'Paddle Pals', players: 'Grace + Ruby', wins: 0, losses: 3, points: 0, streak: 'L3', rank: 4 }
  ],
  boys: [
    { name: 'Baseline Bros', players: 'Noah + Jack', wins: 3, losses: 0, points: 9, streak: 'W3', rank: 1 },
    { name: 'The Lob Squad', players: 'Leo + Owen', wins: 2, losses: 1, points: 6, streak: 'W1', rank: 2 },
    { name: 'Dink & Drive', players: 'Eli + Finn', wins: 1, losses: 2, points: 3, streak: 'L1', rank: 3 },
    { name: 'Net Results', players: 'Liam + Max', wins: 0, losses: 3, points: 0, streak: 'L3', rank: 4 }
  ],
  mixed: [
    { name: 'Drop Shot Duo', players: 'Sam + Riley', wins: 3, losses: 0, points: 9, streak: 'W3', rank: 1 },
    { name: 'Sweet Spot', players: 'Casey + Jordan', wins: 2, losses: 1, points: 6, streak: 'W2', rank: 2 },
    { name: 'Court Chemistry', players: 'Taylor + Alex', wins: 1, losses: 2, points: 3, streak: 'L1', rank: 3 },
    { name: 'The Third Shot', players: 'Cameron + Drew', wins: 0, losses: 3, points: 0, streak: 'L3', rank: 4 }
  ]
};

const seededTeams = Object.fromEntries(Object.entries(seedTeams).map(([division, divisionTeams]) => [division, divisionTeams.map((team, index) => ({ ...team, seed: index + 1 }))]));
const defaultTournament = () => ({ name: 'Saturday Social', date: '2026-10-26', venue: 'Rally House', courts: 2, status: 'draft' });
const defaultProfile = () => ({ organizer: 'Jordan Smith', email: '', defaultDivision: 'girls', defaultCourts: 2 });
const emptyState = () => ({ activeDivision: 'girls', teams: structuredClone(seededTeams), matches: [], bracketResults: [], matchDetails: {}, tournament: defaultTournament(), profile: defaultProfile() });

function readSavedState() {
  if (!browser) return { state: emptyState(), issue: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { state: emptyState(), issue: null };
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return { state: emptyState(), issue: 'invalid' };
    const fallback = emptyState();
    const savedTeams = saved.teams && typeof saved.teams === 'object' && !Array.isArray(saved.teams) ? saved.teams : null;
    const validDivision = divisions.some((division) => division.id === saved.activeDivision);
    if (!savedTeams || !validDivision || !Array.isArray(saved.matches)) return { state: fallback, issue: 'invalid' };
    const teams = ['girls', 'boys', 'mixed'].reduce((all, division) => {
      const savedDivision = savedTeams[division];
      const validTeams = Array.isArray(savedDivision) ? savedDivision.filter(isValidTeam).map(normalizeTeam) : [];
      return { ...all, [division]: validTeams.length ? validTeams : fallback.teams[division] };
    }, {});
    const matches = saved.matches.filter((match) => match && typeof match === 'object' && typeof match.winner === 'string' && typeof match.opponent === 'string').map((match) => ({
      id: typeof match.id === 'string' ? match.id : `match-${Date.now()}-${Math.random()}`,
      division: divisions.some((division) => division.id === match.division) ? match.division : 'girls',
      winner: match.winner.trim(),
      opponent: match.opponent.trim(),
      createdAt: typeof match.createdAt === 'string' ? match.createdAt : new Date().toISOString()
    }));
    const bracketResults = Array.isArray(saved.bracketResults) ? saved.bracketResults.filter((result) => result && typeof result.id === 'string' && typeof result.division === 'string' && typeof result.teamA === 'string' && typeof result.teamB === 'string' && Number.isFinite(Number(result.scoreA)) && Number.isFinite(Number(result.scoreB))).map((result) => ({
      ...result,
      scoreA: Number(result.scoreA),
      scoreB: Number(result.scoreB),
      winner: result.scoreA > result.scoreB ? result.teamA : result.teamB
    })) : [];
    const matchDetails = saved.matchDetails && typeof saved.matchDetails === 'object' && !Array.isArray(saved.matchDetails) ? saved.matchDetails : {};
    const tournament = saved.tournament && typeof saved.tournament === 'object' ? {
      name: typeof saved.tournament.name === 'string' && saved.tournament.name.trim() ? saved.tournament.name.trim() : fallback.tournament.name,
      date: typeof saved.tournament.date === 'string' ? saved.tournament.date : fallback.tournament.date,
      venue: typeof saved.tournament.venue === 'string' ? saved.tournament.venue.trim() : fallback.tournament.venue,
      courts: Number.isInteger(Number(saved.tournament.courts)) && Number(saved.tournament.courts) > 0 ? Number(saved.tournament.courts) : fallback.tournament.courts,
      status: ['draft', 'live', 'paused', 'complete'].includes(saved.tournament.status) ? saved.tournament.status : fallback.tournament.status
    } : fallback.tournament;
    const profile = saved.profile && typeof saved.profile === 'object' ? {
      organizer: typeof saved.profile.organizer === 'string' && saved.profile.organizer.trim() ? saved.profile.organizer.trim() : fallback.profile.organizer,
      email: typeof saved.profile.email === 'string' ? saved.profile.email.trim() : fallback.profile.email,
      defaultDivision: divisions.some((division) => division.id === saved.profile.defaultDivision) ? saved.profile.defaultDivision : fallback.profile.defaultDivision,
      defaultCourts: Number.isInteger(Number(saved.profile.defaultCourts)) && Number(saved.profile.defaultCourts) > 0 ? Number(saved.profile.defaultCourts) : fallback.profile.defaultCourts
    } : fallback.profile;
    return {
      state: {
        activeDivision: saved.activeDivision,
        teams,
        matches,
        bracketResults,
        matchDetails,
        tournament,
        profile
      },
      issue: null
    };
  } catch {
    return { state: emptyState(), issue: 'unavailable' };
  }
}

function isValidTeam(team) {
  return team && typeof team === 'object' && typeof team.name === 'string' && team.name.trim() && typeof team.players === 'string' && Number.isFinite(Number(team.wins)) && Number.isFinite(Number(team.losses));
}

function normalizeTeam(team) {
  return {
    name: team.name.trim(),
    players: team.players.trim(),
    wins: Math.max(0, Number(team.wins)),
    losses: Math.max(0, Number(team.losses)),
    points: Number.isFinite(Number(team.points)) ? Math.max(0, Number(team.points)) : Math.max(0, Number(team.wins)) * 3,
    streak: typeof team.streak === 'string' ? team.streak : '—',
    rank: Number.isFinite(Number(team.rank)) ? Number(team.rank) : 0,
    seed: Number.isFinite(Number(team.seed)) && Number(team.seed) > 0 ? Number(team.seed) : Number(team.rank) || 1
  };
}

let hydrated = false;
let cloudReady = false;
let cloudUserId = null;
let cloudTournamentId = null;
let cloudDivisions = {};
let cloudSyncTimer = null;
let cloudSyncInFlight = false;
let cloudSyncQueued = false;
export const activeDivision = writable('girls');
export const teams = writable(structuredClone(seededTeams));
export const matches = writable([]);
export const bracketResults = writable([]);
export const matchDetails = writable({});
export const tournament = writable(defaultTournament());
export const availableTournaments = writable([]);
export const profile = writable(defaultProfile());
export const hydrationReady = writable(!browser);
export const notice = writable('');
export const noticeType = writable('success');
export const activeTeams = derived([activeDivision, teams], ([$activeDivision, $teams]) => $teams[$activeDivision]);
export const teamSummaries = derived(teams, ($teams) => Object.entries($teams).flatMap(([division, divisionTeams]) => divisionTeams.map((team) => ({ ...team, division, totalMatches: team.wins + team.losses }))));
export const playerDirectory = derived(teamSummaries, ($teamSummaries) => {
  const players = new Map();
  $teamSummaries.forEach((team) => {
    team.players.split('+').map((player) => player.trim()).filter(Boolean).forEach((name) => {
      const current = players.get(name) || { name, teams: [], wins: 0, losses: 0, points: 0, divisions: new Set() };
      current.teams = [...current.teams, team.name];
      current.wins += team.wins;
      current.losses += team.losses;
      current.points += team.points;
      current.divisions.add(team.division);
      players.set(name, current);
    });
  });
  return [...players.values()].map((player) => ({ ...player, divisions: [...player.divisions] })).sort((a, b) => a.name.localeCompare(b.name));
});
let persistenceError = false;

function setNotice(message, type = 'success') {
  notice.set(message);
  noticeType.set(type);
}

/** @param {string|null} userId */
export async function initializePersistence(userId = null) {
  if (!browser || hydrated) return;
  try {
    if (userId) await initializeCloudPersistence(userId);
    else initializeLocalPersistence();
  } catch (error) {
    initializeLocalPersistence();
    setNotice(`Cloud data could not be loaded, so local data is being used: ${error.message || 'unknown error'}`, 'error');
  }
  hydrated = true;
  hydrationReady.set(true);
}

function initializeLocalPersistence() {
  const saved = readSavedState();
  activeDivision.set(saved.state.activeDivision);
  teams.set(saved.state.teams);
  matches.set(saved.state.matches);
  bracketResults.set(saved.state.bracketResults);
  matchDetails.set(saved.state.matchDetails);
  tournament.set(saved.state.tournament);
  profile.set(saved.state.profile);
  if (saved.issue === 'invalid') setNotice('We could not use the saved tournament data, so a clean tournament was loaded.', 'error');
  if (saved.issue === 'unavailable') setNotice('Saved tournament data is unavailable, so changes will last for this session only.', 'error');
}

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function createMatchId() {
  return browser && crypto.randomUUID ? crypto.randomUUID() : `match-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function initializeCloudPersistence(userId) {
  cloudUserId = userId;
  const profileResult = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (profileResult.error) throw profileResult.error;
  if (!profileResult.data) {
    const createdProfile = await supabase.from('profiles').insert({ id: userId }).select().single();
    if (createdProfile.error) throw createdProfile.error;
  }

  let tournamentResult = await supabase.from('tournaments').select('*').eq('owner_id', userId).order('created_at', { ascending: true });
  if (tournamentResult.error) throw tournamentResult.error;
  if (!tournamentResult.data.length) {
    const defaults = defaultTournament();
    tournamentResult = await supabase.from('tournaments').insert({ owner_id: userId, name: defaults.name, tournament_date: defaults.date, venue: defaults.venue, courts: defaults.courts, status: defaults.status }).select();
    if (tournamentResult.error) throw tournamentResult.error;
  }
  availableTournaments.set(tournamentResult.data.map((item) => ({ id: item.id, name: item.name, date: item.tournament_date, venue: item.venue, courts: item.courts, status: item.status })));
  const selectedId = browser ? localStorage.getItem(SELECTED_TOURNAMENT_KEY) : null;
  const selectedTournament = tournamentResult.data.find((item) => item.id === selectedId) || tournamentResult.data[0];
  cloudTournamentId = selectedTournament.id;

  let divisionResult = await supabase.from('tournament_divisions').select('*').eq('tournament_id', cloudTournamentId).order('created_at');
  if (divisionResult.error) throw divisionResult.error;
  if (!divisionResult.data.length) {
    divisionResult = await supabase.from('tournament_divisions').insert(divisions.map((division) => ({ tournament_id: cloudTournamentId, code: division.id, label: division.label, short_label: division.short, color: division.color }))).select();
    if (divisionResult.error) throw divisionResult.error;
  }
  cloudDivisions = Object.fromEntries(divisionResult.data.map((division) => [division.code, division]));

  let teamResult = await supabase.from('teams').select('*').eq('tournament_id', cloudTournamentId).order('seed');
  if (teamResult.error) throw teamResult.error;
  if (!teamResult.data.length) {
    const seedRows = Object.entries(seededTeams).flatMap(([code, divisionTeams]) => divisionTeams.map((team) => ({ tournament_id: cloudTournamentId, division_id: cloudDivisions[code].id, name: team.name, seed: team.seed, wins: team.wins, losses: team.losses, points: team.points, streak: team.streak })));
    teamResult = await supabase.from('teams').insert(seedRows).select();
    if (teamResult.error) throw teamResult.error;
  }
  let links = await supabase.from('team_players').select('team_id, player_order, players(name)').in('team_id', teamResult.data.map((team) => team.id));
  if (links.error) throw links.error;
  if (!links.data.length) {
    for (const team of teamResult.data) {
      const code = Object.values(cloudDivisions).find((division) => division.id === team.division_id)?.code || 'girls';
      const seed = seededTeams[code].find((candidate) => candidate.name === team.name);
      const names = seed?.players.split('+').map((name) => name.trim()).filter(Boolean) || [];
      for (let index = 0; index < names.length; index += 1) {
        const player = await supabase.from('players').upsert({ tournament_id: cloudTournamentId, name: names[index] }, { onConflict: 'tournament_id,name' }).select().single();
        if (player.error) throw player.error;
        const link = await supabase.from('team_players').upsert({ team_id: team.id, player_id: player.data.id, player_order: index + 1 }, { onConflict: 'team_id,player_id' });
        if (link.error) throw link.error;
      }
    }
    links = await supabase.from('team_players').select('team_id, player_order, players(name)').in('team_id', teamResult.data.map((team) => team.id));
    if (links.error) throw links.error;
  }
  const playersByTeam = {};
  links.data.forEach((link) => { (playersByTeam[link.team_id] ||= []).push({ order: link.player_order, name: link.players?.name || '' }); });
  const loadedTeams = { girls: [], boys: [], mixed: [] };
  teamResult.data.forEach((team) => {
    const code = Object.values(cloudDivisions).find((division) => division.id === team.division_id)?.code || 'girls';
    const playerNames = (playersByTeam[team.id] || []).sort((a, b) => a.order - b.order).map((player) => player.name).filter(Boolean);
    loadedTeams[code].push({ ...team, players: playerNames.join(' + ') || 'Player 1 + Player 2', rank: 0 });
  });
  Object.keys(loadedTeams).forEach((code) => { loadedTeams[code] = loadedTeams[code].sort((a, b) => b.wins - a.wins || a.losses - b.losses).map((team, index) => ({ ...team, rank: index + 1 })); });

  const matchResult = await supabase.from('matches').select('*').eq('tournament_id', cloudTournamentId).order('created_at');
  if (matchResult.error) throw matchResult.error;
  const historyResult = await supabase.from('match_history').select('*').eq('tournament_id', cloudTournamentId).order('created_at');
  if (historyResult.error) throw historyResult.error;
  const teamsById = Object.fromEntries(teamResult.data.map((team) => [team.id, team.name]));
  const loadedBracketResults = [];
  const loadedDetails = {};
  matchResult.data.filter((match) => match.status === 'completed').forEach((match) => {
    const code = Object.values(cloudDivisions).find((division) => division.id === match.division_id)?.code || 'girls';
    const localId = match.round === 'final' ? `${code}-final` : `${code}-semi-${match.bracket_slot}`;
    loadedBracketResults.push({ id: localId, division: code, round: match.round === 'final' ? 'Final' : `Semifinal ${match.bracket_slot}`, teamA: teamsById[match.team_a_id] || '', teamB: teamsById[match.team_b_id] || '', scoreA: match.score_a, scoreB: match.score_b, winner: teamsById[match.winner_team_id] || '', createdAt: match.created_at });
    if (match.court || match.scheduled_at) loadedDetails[localId] = { court: match.court, time: match.scheduled_at ? new Date(match.scheduled_at).toISOString().slice(11, 16) : '' };
  });
  const loadedHistory = historyResult.data.filter((match) => teamsById[match.winner_team_id] && teamsById[match.loser_team_id]).map((match) => ({
    id: match.id,
    division: Object.values(cloudDivisions).find((division) => division.id === match.division_id)?.code || 'girls',
    winner: teamsById[match.winner_team_id],
    opponent: teamsById[match.loser_team_id],
    createdAt: match.created_at
  }));

  const savedTournament = selectedTournament;
  const savedProfile = profileResult.data || {};
  activeDivision.set(savedProfile.default_division || 'girls');
  teams.set(loadedTeams);
  matches.set(loadedHistory);
  bracketResults.set(loadedBracketResults);
  matchDetails.set(loadedDetails);
  tournament.set({ name: savedTournament.name, date: savedTournament.tournament_date, venue: savedTournament.venue, courts: savedTournament.courts, status: savedTournament.status });
  profile.set({ organizer: savedProfile.organizer_name || 'Tournament Organizer', email: '', defaultDivision: savedProfile.default_division || 'girls', defaultCourts: savedProfile.default_courts || savedTournament.courts || 2 });
  cloudReady = true;
}

export function selectTournament(id) {
  const selected = getStore(availableTournaments).find((item) => item.id === id);
  if (!selected || !browser) return false;
  localStorage.setItem(SELECTED_TOURNAMENT_KEY, selected.id);
  window.location.reload();
  return true;
}

function queueCloudSync() {
  if (!cloudReady || cloudSyncInFlight) { if (cloudReady) cloudSyncQueued = true; return; }
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => syncCloudState(), 250);
}

async function syncCloudState() {
  if (!cloudReady || !cloudUserId || !cloudTournamentId) return;
  cloudSyncInFlight = true;
  try {
    const currentTournament = getStore(tournament);
    const currentProfile = getStore(profile);
    const tournamentUpdate = await supabase.from('tournaments').update({ name: currentTournament.name, tournament_date: currentTournament.date, venue: currentTournament.venue, courts: currentTournament.courts, status: currentTournament.status }).eq('id', cloudTournamentId).eq('owner_id', cloudUserId);
    if (tournamentUpdate.error) throw tournamentUpdate.error;
    const profileUpdate = await supabase.from('profiles').upsert({ id: cloudUserId, organizer_name: currentProfile.organizer, default_division: currentProfile.defaultDivision, default_courts: currentProfile.defaultCourts });
    if (profileUpdate.error) throw profileUpdate.error;

    const currentTeams = getStore(teams);
    const syncedTeams = Object.fromEntries(Object.entries(currentTeams).map(([code, divisionTeams]) => [code, [...divisionTeams]]));
    let teamIdsChanged = false;
    for (const code of Object.keys(currentTeams)) {
      const divisionId = cloudDivisions[code]?.id;
      for (let index = 0; index < currentTeams[code].length; index += 1) {
        const team = currentTeams[code][index];
        const payload = { tournament_id: cloudTournamentId, division_id: divisionId, name: team.name, seed: team.seed || index + 1, wins: team.wins, losses: team.losses, points: team.points, streak: team.streak };
        const result = isUuid(team.id) ? await supabase.from('teams').update(payload).eq('id', team.id).select().single() : await supabase.from('teams').insert(payload).select().single();
        if (result.error) throw result.error;
        syncedTeams[code][index] = { ...team, id: result.data.id };
        teamIdsChanged = teamIdsChanged || team.id !== result.data.id;
      }
    }
    if (teamIdsChanged) teams.set(syncedTeams);

    const allTeams = Object.values(syncedTeams).flat();
    const teamId = (name) => allTeams.find((team) => team.name === name)?.id || null;
    for (const team of allTeams) {
      const playerNames = team.players.split('+').map((name) => name.trim()).filter(Boolean).slice(0, 2);
      const linkedPlayers = [];
      for (const name of playerNames) {
        const player = await supabase.from('players').upsert({ tournament_id: cloudTournamentId, name }, { onConflict: 'tournament_id,name' }).select().single();
        if (player.error) throw player.error;
        linkedPlayers.push(player.data);
      }
      const unlink = await supabase.from('team_players').delete().eq('team_id', team.id);
      if (unlink.error) throw unlink.error;
      for (let index = 0; index < linkedPlayers.length; index += 1) {
        const link = await supabase.from('team_players').insert({ team_id: team.id, player_id: linkedPlayers[index].id, player_order: index + 1 });
        if (link.error) throw link.error;
      }
    }
    const details = getStore(matchDetails);
    const history = getStore(matches);
    for (const match of history) {
      if (!isUuid(match.id)) continue;
      const winnerId = teamId(match.winner);
      const loserId = teamId(match.opponent);
      if (!winnerId || !loserId) continue;
      const historyUpdate = await supabase.from('match_history').upsert({ id: match.id, tournament_id: cloudTournamentId, division_id: cloudDivisions[match.division]?.id, winner_team_id: winnerId, loser_team_id: loserId, recorded_by: cloudUserId }, { onConflict: 'id' });
      if (historyUpdate.error) throw historyUpdate.error;
    }
    const results = getStore(bracketResults);
    for (let index = 0; index < results.length; index += 1) {
      const result = results[index];
      const row = { tournament_id: cloudTournamentId, division_id: cloudDivisions[result.division]?.id, round: result.round === 'Final' ? 'final' : 'semifinal', bracket_slot: result.round === 'Final' ? 1 : Number(String(result.id).split('-').pop()) || index + 1, team_a_id: teamId(result.teamA), team_b_id: teamId(result.teamB), score_a: result.scoreA, score_b: result.scoreB, winner_team_id: teamId(result.winner), status: 'completed', court: details[result.id]?.court || null, scheduled_at: details[result.id]?.time ? `${currentTournament.date}T${details[result.id].time}:00` : null, recorded_by: cloudUserId };
      const matchUpdate = await supabase.from('matches').upsert(row, { onConflict: 'tournament_id,division_id,round,bracket_slot' });
      if (matchUpdate.error) throw matchUpdate.error;
    }
    persistenceError = false;
  } catch (error) {
    persistenceError = true;
    setNotice(`Saved locally, but cloud sync failed: ${error.message || 'unknown error'}`, 'error');
  } finally {
    cloudSyncInFlight = false;
    if (cloudSyncQueued) { cloudSyncQueued = false; queueCloudSync(); }
  }
}

function persistState() {
  if (!browser || !hydrated) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      activeDivision: getStore(activeDivision),
      teams: getStore(teams),
      matches: getStore(matches),
      bracketResults: getStore(bracketResults),
      matchDetails: getStore(matchDetails),
      tournament: getStore(tournament),
      profile: getStore(profile)
    }));
    persistenceError = false;
    queueCloudSync();
  } catch {
    persistenceError = true;
    setNotice('Your changes are active, but could not be saved in this browser.', 'error');
  }
}

if (browser) {
  activeDivision.subscribe(persistState);
  teams.subscribe(persistState);
  matches.subscribe(persistState);
  bracketResults.subscribe(persistState);
  matchDetails.subscribe(persistState);
  tournament.subscribe(persistState);
  profile.subscribe(persistState);
}

export function switchDivision(id) {
  if (divisions.some((division) => division.id === id)) activeDivision.set(id);
  notice.set('');
  noticeType.set('success');
}

export function resetTournament() {
  const fresh = emptyState();
  activeDivision.set(fresh.activeDivision);
  teams.set(fresh.teams);
  matches.set(fresh.matches);
  bracketResults.set(fresh.bracketResults);
  matchDetails.set(fresh.matchDetails);
  tournament.set(fresh.tournament);
  profile.set(fresh.profile);
  setNotice(persistenceError ? 'Tournament reset for this session, but could not be saved in this browser.' : 'Tournament reset to the starting data.', persistenceError ? 'error' : 'success');
}

export function recordWin(index) {
  const division = getStore(activeDivision);
  const allTeams = getStore(teams);
  const current = allTeams[division][index];
  if (!current) return;
  if (index === 0) {
    setNotice(`${current.name} is already on top of the standings.`, 'error');
    return;
  }
  const opponent = allTeams[division][0];
  const updated = allTeams[division].map((team, teamIndex) => {
    if (teamIndex === index) return { ...team, wins: team.wins + 1, points: team.points + 3, streak: 'W1' };
    if (teamIndex === 0) return { ...team, losses: team.losses + 1, streak: 'L1' };
    return team;
  }).sort((a, b) => b.wins - a.wins || a.losses - b.losses).map((team, teamIndex) => ({ ...team, rank: teamIndex + 1 }));
  teams.set({ ...allTeams, [division]: updated });
  matches.update((allMatches) => [...allMatches, { id: createMatchId(), division, winner: current.name, opponent: opponent.name, createdAt: new Date().toISOString() }]);
  setNotice(persistenceError ? 'Win recorded, but it could not be saved in this browser.' : `${current.name} moved up after a recorded win.`, persistenceError ? 'error' : 'success');
}

export function addTeam(name, playerOne, playerTwo) {
  if (!name.trim() || !playerOne.trim() || !playerTwo.trim()) {
    setNotice('Add a team name and both player names to continue.', 'error');
    return false;
  }
  if (playerOne.trim().toLowerCase() === playerTwo.trim().toLowerCase()) {
    setNotice('Each team needs two different players.', 'error');
    return false;
  }
  const division = getStore(activeDivision);
  const allTeams = getStore(teams);
  const normalizedName = name.trim().toLowerCase();
  const duplicate = allTeams[division].some((team) => team.name.trim().toLowerCase() === normalizedName);
  if (duplicate) {
    setNotice(`A team named “${name.trim()}” already exists in the ${division} division.`, 'error');
    return false;
  }
  const added = { name: name.trim(), players: `${playerOne.trim()} + ${playerTwo.trim()}`, wins: 0, losses: 0, points: 0, streak: '—', rank: allTeams[division].length + 1, seed: allTeams[division].length + 1 };
  teams.set({ ...allTeams, [division]: [...allTeams[division], added] });
  setNotice(persistenceError ? `${added.name} was added, but could not be saved in this browser.` : `${added.name} joined the division.`, persistenceError ? 'error' : 'success');
  return true;
}

export function updateTeam(index, name, playerOne, playerTwo) {
  if (!name.trim() || !playerOne.trim() || !playerTwo.trim()) {
    setNotice('Add a team name and both player names to continue.', 'error');
    return false;
  }
  if (playerOne.trim().toLowerCase() === playerTwo.trim().toLowerCase()) {
    setNotice('Each team needs two different players.', 'error');
    return false;
  }
  const division = getStore(activeDivision);
  const allTeams = getStore(teams);
  const normalizedName = name.trim().toLowerCase();
  const duplicate = allTeams[division].some((team, teamIndex) => teamIndex !== index && team.name.trim().toLowerCase() === normalizedName);
  if (duplicate) {
    setNotice(`A team named “${name.trim()}” already exists in the ${division} division.`, 'error');
    return false;
  }
  const updatedTeam = { ...allTeams[division][index], name: name.trim(), players: `${playerOne.trim()} + ${playerTwo.trim()}` };
  teams.set({ ...allTeams, [division]: allTeams[division].map((team, teamIndex) => teamIndex === index ? updatedTeam : team) });
  setNotice(persistenceError ? `${updatedTeam.name} was updated, but could not be saved in this browser.` : `${updatedTeam.name} was updated.`, persistenceError ? 'error' : 'success');
  return true;
}

export function removeTeam(index) {
  const division = getStore(activeDivision);
  const allTeams = getStore(teams);
  const removed = allTeams[division][index];
  if (!removed) return false;
  const remaining = allTeams[division].filter((_team, teamIndex) => teamIndex !== index).map((team, teamIndex) => ({ ...team, rank: teamIndex + 1, seed: team.seed || teamIndex + 1 }));
  teams.set({ ...allTeams, [division]: remaining });
  bracketResults.update((results) => results.filter((result) => result.division !== division || ![result.teamA, result.teamB, result.winner].includes(removed.name)));
  matches.update((allMatches) => allMatches.filter((match) => match.division !== division || ![match.winner, match.opponent].includes(removed.name)));
  if (isUuid(removed.id)) supabase.from('teams').delete().eq('id', removed.id).then((result) => { if (result.error) setNotice('The team was removed here, but could not be removed from the cloud.', 'error'); });
  setNotice(`${removed.name} was removed from the ${division} division.`);
  return true;
}

export function recordMatch({ id, round, teamA, teamB, scoreA, scoreB }) {
  const division = getStore(activeDivision);
  const parsedA = Number(scoreA);
  const parsedB = Number(scoreB);
  if (!Number.isInteger(parsedA) || !Number.isInteger(parsedB) || parsedA < 0 || parsedB < 0) {
    setNotice('Enter whole-number scores of zero or higher.', 'error');
    return false;
  }
  if (parsedA === parsedB) {
    setNotice('A completed match cannot end in a tie.', 'error');
    return false;
  }
  if (!teamA || !teamB || teamA === teamB) {
    setNotice('Both teams must be ready before recording this match.', 'error');
    return false;
  }
  if (getStore(bracketResults).some((result) => result.id === id)) {
    setNotice('That match has already been recorded.', 'error');
    return false;
  }
  const winner = parsedA > parsedB ? teamA : teamB;
  const loser = winner === teamA ? teamB : teamA;
  const allTeams = getStore(teams);
  const updatedDivision = allTeams[division].map((team) => {
    if (team.name === winner) return { ...team, wins: team.wins + 1, points: team.points + 3, streak: 'W1' };
    if (team.name === loser) return { ...team, losses: team.losses + 1, streak: 'L1' };
    return team;
  }).sort((a, b) => b.wins - a.wins || a.losses - b.losses).map((team, index) => ({ ...team, rank: index + 1 }));
  teams.set({ ...allTeams, [division]: updatedDivision });
  bracketResults.update((results) => [...results, { id, division, round, teamA, teamB, scoreA: parsedA, scoreB: parsedB, winner, createdAt: new Date().toISOString() }]);
  setNotice(persistenceError ? 'Match recorded, but could not be saved in this browser.' : `${winner} won ${parsedA > parsedB ? parsedA : parsedB}–${parsedA > parsedB ? parsedB : parsedA}.`, persistenceError ? 'error' : 'success');
  return true;
}

export function updateTournament(settings) {
  const current = getStore(tournament);
  const name = String(settings.name || '').trim();
  const venue = String(settings.venue || '').trim();
  const courts = Number(settings.courts);
  if (!name || !settings.date || !venue || !Number.isInteger(courts) || courts < 1) {
    setNotice('Enter a tournament name, date, venue, and at least one court.', 'error');
    return false;
  }
  tournament.set({ ...current, name, date: settings.date, venue, courts });
  setNotice(persistenceError ? 'Tournament details updated, but could not be saved in this browser.' : 'Tournament details saved.', persistenceError ? 'error' : 'success');
  return true;
}

export function updateProfile(settings) {
  const organizer = String(settings.organizer || '').trim();
  const email = String(settings.email || '').trim();
  const defaultDivision = String(settings.defaultDivision || '');
  const defaultCourts = Number(settings.defaultCourts);
  if (!organizer || (email && !/^\S+@\S+\.\S+$/.test(email)) || !divisions.some((division) => division.id === defaultDivision) || !Number.isInteger(defaultCourts) || defaultCourts < 1) {
    setNotice('Enter an organizer name, valid email, preferred division, and court count.', 'error');
    return false;
  }
  profile.set({ organizer, email, defaultDivision, defaultCourts });
  setNotice(persistenceError ? 'Profile updated, but could not be saved in this browser.' : 'Profile and preferences saved.', persistenceError ? 'error' : 'success');
  return true;
}

export function setTournamentStatus(status) {
  if (!['draft', 'live', 'paused', 'complete'].includes(status)) return false;
  tournament.set({ ...getStore(tournament), status });
  setNotice(`Tournament marked ${status}.`);
  return true;
}

export function assignMatchDetails(id, court, time) {
  const courtNumber = Number(court);
  if (!Number.isInteger(courtNumber) || courtNumber < 1 || courtNumber > getStore(tournament).courts || !String(time || '').trim()) {
    setNotice('Choose a valid court and match time.', 'error');
    return false;
  }
  matchDetails.set({ ...getStore(matchDetails), [id]: { court: courtNumber, time: String(time).trim() } });
  return true;
}

export function undoLastResult() {
  const results = getStore(bracketResults);
  const last = results[results.length - 1];
  if (!last) {
    setNotice('There are no bracket results to undo.', 'error');
    return false;
  }
  const allTeams = getStore(teams);
  const updatedDivision = allTeams[last.division].map((team) => {
    if (team.name === last.winner) return { ...team, wins: Math.max(0, team.wins - 1), points: Math.max(0, team.points - 3) };
    if (team.name === (last.winner === last.teamA ? last.teamB : last.teamA)) return { ...team, losses: Math.max(0, team.losses - 1) };
    return team;
  }).sort((a, b) => b.wins - a.wins || a.losses - b.losses).map((team, index) => ({ ...team, rank: index + 1 }));
  teams.set({ ...allTeams, [last.division]: updatedDivision });
  bracketResults.set(results.slice(0, -1));
  setNotice(`${last.winner} result was undone.`);
  return true;
}
