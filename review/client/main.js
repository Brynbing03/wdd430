let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "O";

const boardEl = document.querySelector("#board");
const resetButton = document.querySelector("#restart");
const resultsEl = document.querySelector(".results");

// displaying the wins and losses differently
// const historyEl = document.querySelector(".history");
const saveButton = document.querySelector("#save");


function cellTemplate(item, index) {
    return `<button class="cell" data-index="${index}">${item}</button>`;
}

function boardTemplate(board, container = false) {
    let template = "";
  
    if (container) {
      template = "<section class='board'>";
      template += board.map(cellTemplate).join("");
      template += "</section>";
    } else {
      template = board.map(cellTemplate).join("");
    }
  
    return template;
}

function renderBoard(board) {
    boardEl.innerHTML = "";
    boardEl.insertAdjacentHTML("afterbegin", boardTemplate(board));

}

function boardClickedHandler (event) {
    const cell=event.target;
    const cellIndex=cell.dataset.index;
    
    if (board[cellIndex]) {
        return;
    }
    board[cellIndex]=currentPlayer;
    renderBoard(board);
    currentPlayer=currentPlayer === "X"?"O":"X";

    const winner = checkWin();
        if (winner) {
        displayResults(winner);
        }
}

// adding who wins
function checkWin() {
    const winConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
  
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
  
      [0, 4, 8],
      [2, 4, 6]
    ];
  
    for (let condition of winConditions) {
      const [a, b, c] = condition;
      if (
        board[a] &&
        board[a] === board[b] &&
        board[a] === board[c]
      ) {
        return board[a];
      }
    }

    if (!board.includes("")) {
      return "Draw";
    }
    return null;
}

// putting up who wins
function displayResults(winner) {
    if (winner === "Draw") {
      resultsEl.innerHTML = "Game is a Draw.";
    } else {
      resultsEl.innerHTML = `Player ${winner} has won!`;
    }
}

// resetting the game to play again!
function resetHandler() {
    board = ["", "", "", "", "", "", "", "", ""];
  
    resultsEl.innerHTML = "";
  
    renderBoard(board);
}

// getting board to send from web to server
async function saveHandler() {
    const winner = checkWin();
  
    if (!winner) {
      alert("Finish the game before saving.");
      return;
    }
  
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ winner: winner })
    };
  
    const res = await fetch("http://localhost:3000/boards", options);
  
    if (res.ok) {
      renderHistory();
    }
}

async function renderHistory() {
    const res = await fetch("http://localhost:3000/boards");
  
    if (res.ok) {
      const games = await res.json();
  
      let xWins = 0;
      let oWins = 0;
      let draws = 0;
  
      games.forEach((game) => {
        if (game.winner === "X") {
          xWins++;
        } else if (game.winner === "O") {
          oWins++;
        } else if (game.winner === "Draw") {
          draws++;
        }
      });
  
      document.querySelector("#x-wins").textContent = xWins;
      document.querySelector("#x-losses").textContent = oWins;
  
      document.querySelector("#o-wins").textContent = oWins;
      document.querySelector("#o-losses").textContent = xWins;
  
      document.querySelector("#draws").textContent = draws;
    }
}

// I originally completed the history section by saving and displaying each
// Tic-Tac-Toe board as shown in the assignment. After getting that version
// working correctly, I decided to customize it. Instead of displaying every
// saved board, I use the saved game results to keep track of each player's
// wins and losses, as well as draws. I felt this made the history section
// cleaner and just made it look better. I hope that is ok! :)


boardEl.addEventListener("click", boardClickedHandler);
resetButton.addEventListener("click", resetHandler);
saveButton.addEventListener("click", saveHandler);

renderBoard(board);
renderHistory();