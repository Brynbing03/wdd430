/** @param {unknown} value */
export function parseScore(value) {
  const score = Number(value);
  return Number.isInteger(score) && score >= 0 ? score : null;
}

/** @param {string} teamA @param {string} teamB @param {unknown} scoreA @param {unknown} scoreB */
export function getWinner(teamA, teamB, scoreA, scoreB) {
  const parsedA = parseScore(scoreA);
  const parsedB = parseScore(scoreB);
  if (!teamA || !teamB || teamA === teamB || parsedA === null || parsedB === null || parsedA === parsedB) return null;
  return parsedA > parsedB ? teamA : teamB;
}

/** @param {Array<{ name: string, wins: number, losses: number }>} teamList */
export function rankTeams(teamList) {
  return [...teamList].sort((a, b) => b.wins - a.wins || a.losses - b.losses).map((team, index) => ({ ...team, rank: index + 1 }));
}
