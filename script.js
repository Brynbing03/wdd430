const cells = [...document.querySelectorAll('.cell')];
const statusText = document.querySelector('#status-text');
const playerScoreEl = document.querySelector('#player-score');
const aiScoreEl = document.querySelector('#ai-score');
const streakLabel = document.querySelector('#streak-label');
const streakValue = document.querySelector('#streak-value');
const roundNumber = document.querySelector('#round-number');
const modal = document.querySelector('#result-modal');
const resultTitle = document.querySelector('#result-title');
const resultCopy = document.querySelector('#result-copy');

const WIN_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
let board = Array(9).fill('');
let scores = { player: 0, ai: 0, draws: 0 };
let round = 1;
let gameOver = false;
let aiThinking = false;
let aiTimer;

function checkWinner(state) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) return { winner: state[a], line };
  }
  return state.every(Boolean) ? { winner: 'draw', line: [] } : null;
}

function render() {
  cells.forEach((cell, index) => {
    const mark = board[index];
    cell.textContent = mark;
    cell.className = `cell${mark ? ` ${mark.toLowerCase()}` : ''}`;
    cell.disabled = Boolean(mark) || gameOver || aiThinking;
    cell.setAttribute('aria-label', `${['Top left', 'Top center', 'Top right', 'Middle left', 'Center', 'Middle right', 'Bottom left', 'Bottom center', 'Bottom right'][index]}, ${mark ? mark : 'empty'}`);
  });
  playerScoreEl.textContent = scores.player;
  aiScoreEl.textContent = scores.ai;
  roundNumber.textContent = String(round).padStart(2, '0');
  if (aiThinking) statusText.textContent = 'Machine is thinking…';
  else if (!gameOver) statusText.textContent = 'Your turn';
}

function endGame(result) {
  gameOver = true;
  if (result.winner === 'X') { scores.player++; streakLabel.textContent = 'CURRENT STREAK'; streakValue.textContent = 'WIN'; resultTitle.textContent = 'You win.'; resultCopy.textContent = 'A clean line through the machine.'; }
  else if (result.winner === 'O') { scores.ai++; streakLabel.textContent = 'CURRENT STREAK'; streakValue.textContent = 'AI +1'; resultTitle.textContent = 'The machine wins.'; resultCopy.textContent = 'Every square was accounted for.'; }
  else { scores.draws++; streakLabel.textContent = 'CURRENT STREAK'; streakValue.textContent = 'DRAW'; resultTitle.textContent = 'A perfect draw.'; resultCopy.textContent = 'Neither side gave the grid away.'; }
  statusText.textContent = result.winner === 'draw' ? 'Grid locked' : `${result.winner === 'X' ? 'You' : 'The machine'} completed a line`;
  render();
  result.line.forEach(index => cells[index].classList.add('win'));
  window.setTimeout(() => modal.classList.add('show'), 360);
  modal.setAttribute('aria-hidden', 'false');
}

function makeMove(index, mark) {
  board[index] = mark;
  const result = checkWinner(board);
  if (result) endGame(result);
  else render();
}

function minimax(state, depth, isMaximizing, alpha, beta) {
  const result = checkWinner(state);
  if (result) return result.winner === 'O' ? 10 - depth : result.winner === 'X' ? depth - 10 : 0;
  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) if (!state[i]) { state[i] = 'O'; best = Math.max(best, minimax(state, depth + 1, false, alpha, beta)); state[i] = ''; alpha = Math.max(alpha, best); if (beta <= alpha) break; }
    return best;
  }
  let best = Infinity;
  for (let i = 0; i < 9; i++) if (!state[i]) { state[i] = 'X'; best = Math.min(best, minimax(state, depth + 1, true, alpha, beta)); state[i] = ''; beta = Math.min(beta, best); if (beta <= alpha) break; }
  return best;
}

function getBestMove() {
  let bestScore = -Infinity;
  let move = 4;
  for (let i = 0; i < 9; i++) if (!board[i]) { board[i] = 'O'; const score = minimax(board, 0, false, -Infinity, Infinity); board[i] = ''; if (score > bestScore) { bestScore = score; move = i; } }
  return move;
}

function computerMove() {
  if (gameOver) return;
  aiThinking = true; render();
  aiTimer = window.setTimeout(() => { aiThinking = false; makeMove(getBestMove(), 'O'); }, 450);
}

function startRound() {
  window.clearTimeout(aiTimer); board = Array(9).fill(''); gameOver = false; aiThinking = false; round++; modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); render();
}

cells.forEach(cell => cell.addEventListener('click', () => { const index = Number(cell.dataset.index); if (!board[index] && !gameOver && !aiThinking) { makeMove(index, 'X'); if (!gameOver) computerMove(); } }));
document.querySelector('#new-game').addEventListener('click', startRound);
document.querySelector('#next-round').addEventListener('click', startRound);
document.querySelector('#reset-score').addEventListener('click', () => { scores = { player: 0, ai: 0, draws: 0 }; round = 0; streakValue.textContent = '—'; startRound(); });
render();
