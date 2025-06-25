const BOARD_DIM = 8;

let boardState = [
  ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
  ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, "wQ", null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
  ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],
];
const pieceMap = {
  wK: "w-king",
  wQ: "w-queen",
  wR: "w-rook",
  wB: "w-bishop",
  wN: "w-knight",
  wP: "w-pawn",
  bK: "b-king",
  bQ: "b-queen",
  bR: "b-rook",
  bB: "b-bishop",
  bN: "b-knight",
  bP: "b-pawn",
};
let chessBoardUI = document.querySelector(".chess-board");

function createBoard() {
  for (let i = 0; i < BOARD_DIM; i++) {
    for (let j = 0; j < BOARD_DIM; j++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.dataset.row = i;
      square.dataset.col = j;
      if ((i + j) % 2 == 0) {
        square.classList.add("light-square");
      } else {
        square.classList.add("dark-square");
      }
      chessBoardUI.appendChild(square);
    }
  }
}

function render() {
  const squares = document.querySelectorAll(".chess-board .square");
  squares.forEach((square, index) => {
    // Clear any exisiting piece.
    square.innerHTML = "";
    const row = Math.floor(index / BOARD_DIM);
    const col = index % BOARD_DIM;
    const pieceCode = boardState[row][col];
    if (pieceCode) {
      const pieceDiv = document.createElement("div");
      pieceDiv.classList.add("piece", pieceMap[pieceCode]);
      square.appendChild(pieceDiv);
    }
  });
}
function highlightSquares(squares) {
  const squaresToBeHighlighted = new Array(squares.length);
  for (let i = 0; i < squaresToBeHighlighted.length; i++) {
    squaresToBeHighlighted[i] = document.querySelector(
      `.square[data-row="${squares[i][0]}"][data-col="${squares[i][1]}"]`
    );
    squaresToBeHighlighted[i].classList.add("legal-move");
  }
}
function clearHighlights() {
  const squares = document.querySelectorAll(".chess-board .square");
  squares.forEach((square, index) => {
    square.classList.remove("legal-move");
    square.classList.remove("in-check");
  });
}
function isValidSquare(r, c) {
  return r >= 0 && r < BOARD_DIM && c >= 0 && c < BOARD_DIM;
}
function getPawnMoves(row, col, board, typeOfMove = "all") {
  let moves = [];
  const pieceColor = board[row][col][0];
  let direction = pieceColor == "w" ? -1 : 1;
  const startingRank = pieceColor == "w" ? BOARD_DIM - 2 : 1;

  if (typeOfMove == "all") {
    if (board[row + direction][col] == null) {
      moves.push([row + direction, col]);
    }
  }
  // UP LEFT
  if (
    board[row + direction][col - 1] != null &&
    board[row + direction][col - 1][0] != pieceColor
  ) {
    moves.push([row + direction, col - 1]);
  } // UP RIGHT
  if (
    board[row + direction][col + 1] != null &&
    board[row + direction][col + 1][0] != pieceColor
  ) {
    moves.push([row + direction, col + 1]);
  }
  //Only on the first move.
  if (typeOfMove == "all") {
    if (row == startingRank) {
      if (board[row + direction * 2][col] == null)
        moves.push([row + direction * 2, col]);
    }
  }

  return moves;
}

function getRookMoves(row, col, board) {
  const moves = [];
  const pieceColor = board[row][col][0];
  // UP
  for (let i = row - 1; i >= 0; i--) {
    const targetSquare = board[i][col];
    if (targetSquare == null) {
      moves.push([i, col]);
    } else {
      if (targetSquare[0] != pieceColor) {
        moves.push([i, col]);
        break;
      } else break;
    }
  }
  // DOWN
  for (let i = row + 1; i < BOARD_DIM; i++) {
    const targetSquare = board[i][col];
    if (targetSquare == null) {
      moves.push([i, col]);
    } else {
      if (targetSquare[0] != pieceColor) {
        moves.push([i, col]);
        break;
      } else break;
    }
  }
  // LEFT
  for (let i = col - 1; i >= 0; i--) {
    const targetSquare = board[row][i];
    if (targetSquare == null) {
      moves.push([row, i]);
    } else {
      if (targetSquare[0] != pieceColor) {
        moves.push([row, i]);
        break;
      } else break;
    }
  }
  // RIGHT
  for (let i = col + 1; i < BOARD_DIM; i++) {
    const targetSquare = board[row][i];
    if (targetSquare == null) {
      moves.push([row, i]);
    } else {
      if (targetSquare[0] != pieceColor) {
        moves.push([row, i]);
        break;
      } else break;
    }
  }
  return moves;
}
function getKnightMoves(row, col, board) {
  const moves = [];
  const moveOffsets = [
    { r: -2, c: -1 },
    { r: -2, c: 1 },
    { r: -1, c: -2 },
    { r: -1, c: 2 },
    { r: 1, c: -2 },
    { r: 1, c: 2 },
    { r: 2, c: -1 },
    { r: 2, c: 1 },
  ];
  const pieceColor = board[row][col][0];
  for (const offset of moveOffsets) {
    const newRow = row + offset.r;
    const newCol = col + offset.c;
    // Boundary checking.
    if (
      newRow >= 0 &&
      newRow < BOARD_DIM &&
      newCol >= 0 &&
      newCol < BOARD_DIM
    ) {
      const targetSquare = board[newRow][newCol];
      if (targetSquare == null || targetSquare[0] != pieceColor) {
        moves.push([newRow, newCol]);
      }
    }
  }
  return moves;
}

function getBishopMoves(row, col, board) {
  let moves = [];
  const pieceColor = board[row][col][0];
  const directions = [
    [-1, -1], // UP LEFT
    [-1, 1], // UP RIGHT
    [1, -1], // DOWN LEFT
    [1, 1], // DOWN RIGHT
  ];
  for (const [dr, dc] of directions) {
    for (let i = 1; ; i++) /* i represents distance from current piece.*/ {
      const newRow = row + dr * i;
      const newCol = col + dc * i;
      if (!isValidSquare(newRow, newCol)) {
        break;
      }
      const targetSquare = board[newRow][newCol];
      if (targetSquare == null) {
        moves.push([newRow, newCol]);
      } else {
        if (targetSquare[0] != pieceColor) {
          moves.push([newRow, newCol]);
          break;
        } else {
          break;
        }
      }
    }
  }
  return moves;
}

function getQueenMoves(row, col, board) {
  let moves = [];
  moves = getBishopMoves(row, col, board);
  moves.push(...getRookMoves(row, col, board));
  return moves;
}

function getKingMoves(row, col, board) {
  let moves = [];
  const pieceColor = board[row][col][0];
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  for (let [dr, dc] of directions) {
    let newRow = row + dr;
    let newCol = col + dc;
    if (!isValidSquare(newRow, newCol)) continue;

    const targetSquare = board[newRow][newCol];
    if (targetSquare == null) {
      moves.push([newRow, newCol]);
    } else {
      if (targetSquare[0] != pieceColor) moves.push([newRow, newCol]);
    }
  }
  return moves;
}
function getPieceType(row, col, board) {
  if (board[row][col] == null)
    throw new Error("Cannot get the type of piece on an empty square.");
  return board[row][col][1];
}
function checkForChecks(boardState, kingColor) {
  let totalMoves = [];
  let kingPosition = null;
  for (let i = 0; i < BOARD_DIM; i++) {
    for (let j = 0; j < BOARD_DIM; j++) {
      const piece = boardState[i][j];
      if (piece == null) continue;
      const pieceColor = piece[0];
      const pieceType = piece[1];
      if (pieceType == "K" && pieceColor == kingColor) kingPosition = [i, j];
      if (pieceColor != kingColor) {
        switch (getPieceType(i, j, boardState)) {
          case "R":
            totalMoves = [...totalMoves, ...getRookMoves(i, j, boardState)];
            break;
          case "B":
            totalMoves = [...totalMoves, ...getBishopMoves(i, j, boardState)];
            break;
          case "N":
            totalMoves = [...totalMoves, ...getKnightMoves(i, j, boardState)];
            break;
          case "Q":
            totalMoves = [...totalMoves, ...getQueenMoves(i, j, boardState)];
            break;
          // case "K":
          //   totalMoves = [...totalMoves, ...getKingMoves(i, j, boardState)];
          //   break;
          case "P":
            totalMoves = [
              ...totalMoves,
              ...getPawnMoves(i, j, boardState, "attack"),
            ];
            break;
          default:
            break;
        }
      }
    }
  }
  if (kingPosition == null) console.error("King not found...");
  return totalMoves.some((move) => {
    return move[0] == kingPosition[0] && move[1] == kingPosition[1];
  });
}
function highlightCheck(row, col, boardState) {
  let checkedSquare = document.querySelector(
    `.square[data-row="${row}"][data-col="${col}"]`
  );
  checkedSquare.classList.add("in-check");
}
let selectedPiece = null;
let legalMoves = [];
let currentTurn = "w";

chessBoardUI.addEventListener("click", (e) => {
  const square = e.target.closest(".square");
  if (!square) return;
  const row = parseInt(square.dataset.row);
  const col = parseInt(square.dataset.col);
  let clickedPiece = boardState[row][col];
  let clickedPieceColor = clickedPiece ? clickedPiece[0] : null;

  if (selectedPiece) {
    const isLegalMove = legalMoves.some(
      (move) => move[0] == row && move[1] == col
    );
    if (isLegalMove) {
      const tempBoardState = JSON.parse(JSON.stringify(boardState)); // Deep Copy.
      const pieceToMove = tempBoardState[selectedPiece.row][selectedPiece.col];
      // Performing the move on the temporary board.
      tempBoardState[row][col] = pieceToMove;
      tempBoardState[selectedPiece.row][selectedPiece.col] = null;
      const leavesKingInCheck = checkForChecks(tempBoardState, currentTurn);
      if (!leavesKingInCheck) {
        boardState[row][col] = boardState[selectedPiece.row][selectedPiece.col];
        boardState[selectedPiece.row][selectedPiece.col] = null;
        const opponentColor = currentTurn == "w" ? "b" : "w";

        if (checkForChecks(boardState, opponentColor)) {
          console.log("Someone is in check!");
        }
        currentTurn = opponentColor;
        // Reset everything.
        selectedPiece = null;
        legalMoves = [];
        clearHighlights();
        render();
      } else {
        console.log("Illegal Move: King is in check.");
        selectedPiece = null;
        legalMoves = [];
        clearHighlights();
        // highlightCheck();
        render();
      }
    } else {
      legalMoves = [];
      selectedPiece = null;

      clearHighlights();
      // highlightCheck();
    }
  } else {
    if (clickedPiece && clickedPieceColor == currentTurn) {
      selectedPiece = { row, col, piece: clickedPiece };
      switch (getPieceType(selectedPiece.row, selectedPiece.col, boardState)) {
        case "P":
          legalMoves = getPawnMoves(
            selectedPiece.row,
            selectedPiece.col,
            boardState
          );
          break;
        case "R":
          legalMoves = getRookMoves(
            selectedPiece.row,
            selectedPiece.col,
            boardState
          );
          break;
        case "B":
          legalMoves = getBishopMoves(
            selectedPiece.row,
            selectedPiece.col,
            boardState
          );
          break;
        case "N":
          legalMoves = getKnightMoves(
            selectedPiece.row,
            selectedPiece.col,
            boardState
          );
          break;
        case "Q":
          legalMoves = getQueenMoves(
            selectedPiece.row,
            selectedPiece.col,
            boardState
          );
          break;
        case "K":
          legalMoves = getKingMoves(
            selectedPiece.row,
            selectedPiece.col,
            boardState
          );
          break;

        default:
          legalMoves = [];
      }
      legalMoves = legalMoves.filter((move) => {
        const tempBoardState = JSON.parse(JSON.stringify(boardState));
        tempBoardState[move[0]][move[1]] = selectedPiece.piece;
        tempBoardState[selectedPiece.row][selectedPiece.col] = null;
        return !checkForChecks(tempBoardState, currentTurn);
      });
      highlightSquares(legalMoves);
    } else {
      clearHighlights();
    }
    // const piece = boardState[row][col];
    // if (piece) {
    //   selectedPiece = { row, col, piece };
    //   if (piece == "wP" || piece == "bP")
    //     legalMoves = getPawnMoves(
    //       selectedPiece.row,
    //       selectedPiece.col,
    //       boardState
    //     );
    //   if (piece == "wR" || piece == "bR")
    //     legalMoves = getRookMoves(
    //       selectedPiece.row,
    //       selectedPiece.col,
    //       boardState
    //     );
    //   if (piece == "wN" || piece == "bN")
    //     legalMoves = getKnightMoves(
    //       selectedPiece.row,
    //       selectedPiece.col,
    //       boardState
    //     );
    //   if (piece == "wB" || piece == "bB")
    //     legalMoves = getBishopMoves(
    //       selectedPiece.row,
    //       selectedPiece.col,
    //       boardState
    //     );
    //   if (piece == "wQ" || piece == "bQ")
    //     legalMoves = getQueenMoves(row, col, boardState);
    //   if (piece == "wK" || piece == "bK")
    //     legalMoves = getKingMoves(row, col, boardState);
    // }
  }
});

createBoard();
render();
