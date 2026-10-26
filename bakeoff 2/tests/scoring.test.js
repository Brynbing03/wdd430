import test from 'node:test';
import assert from 'node:assert/strict';
import { getWinner, parseScore, rankTeams } from '../src/lib/scoring.js';

test('parseScore accepts whole numbers and rejects invalid scores', () => {
  assert.equal(parseScore('11'), 11);
  assert.equal(parseScore('0'), 0);
  assert.equal(parseScore('-1'), null);
  assert.equal(parseScore('2.5'), null);
});

test('getWinner rejects ties and returns the higher scorer', () => {
  assert.equal(getWinner('A', 'B', '11', '7'), 'A');
  assert.equal(getWinner('A', 'B', '7', '11'), 'B');
  assert.equal(getWinner('A', 'B', '8', '8'), null);
});

test('rankTeams sorts by wins, then fewest losses, and assigns ranks', () => {
  const ranked = rankTeams([
    { name: 'C', wins: 1, losses: 2 },
    { name: 'A', wins: 3, losses: 1 },
    { name: 'B', wins: 3, losses: 0 }
  ]);
  assert.deepEqual(ranked.map((team) => team.name), ['B', 'A', 'C']);
  assert.deepEqual(ranked.map((team) => team.rank), [1, 2, 3]);
});
