import { boardState, BOARD_DIM, pieceMap } from "./src/Chess.js";

let uiBoard = document.querySelector(".chess-board");
const moveAudio = new Audio("assets/Move.mp3");
const captureAudio = new Audio("assets/Capture-2.mp3");
const invalidMoveAudio = new Audio("assets/invalid-move.mp3");
const checkAudio = new Audio("assets/move-check.mp3");
const gameEndAudio = new Audio("assets/game-end.mp3");

function createBoard(uiBoard) {
  for (let i = 0; i < BOARD_DIM; i++) {
    for (let j = 0; j < BOARD_DIM; j++) {
      let square = document.createElement("div");
      square.dataset.row = i;
      square.dataset.col = j;
      square.classList.add("square");
      if ((i + j) % 2 == 0) {
        square.classList.add("light-square");
      } else {
        square.classList.add("dark-square");
      }

      square.addEventListener("dragover", (e) => e.preventDefault());
      square.addEventListener("drop", handlePieceDrop);
      uiBoard.appendChild(square);
    }
  }
}

function render(boardState) {
  const squares = document.querySelectorAll(".chess-board .square");
  squares.forEach((square, index) => {
    square.innerHTML = "";
    const row = Math.floor(index / BOARD_DIM);
    const col = index % BOARD_DIM;
    const piece = boardState[row][col];
    if (piece != null) {
      const pieceImg = document.createElement("img");
      pieceImg.classList.add("piece", `${piece.color}-${pieceMap[piece.type]}`);
      pieceImg.src = `assets/${piece.color}-${pieceMap[piece.type]}.svg`;
      pieceImg.addEventListener("dragstart", (e) =>
        handleDragStart(e, pieceImg, row, col, piece)
      );
      pieceImg.addEventListener("dragend", handleDragEnd);
      square.appendChild(pieceImg);
    }
  });
}

uiBoard.addEventListener("click", handleBoardClick);

createBoard(uiBoard);
render(boardState);

let selectedPiece = null;
let legalMoves = [];
let gameEnd = false;

function resetBoard() {
  selectedPiece = null;
  legalMoves = [];
  resetHighlights();
}

let currentTurn = "w";
function handleBoardClick(e) {
  const square = e.target.closest(".square");
  if (!square) return;
  const row = Number(square.dataset.row);
  const col = Number(square.dataset.col);

  if (!selectedPiece) {
    if (square.children.length == 0) return;
    if (boardState[row][col].color != currentTurn) {
      return;
    }
    selectedPiece = { row, col, piece: boardState[row][col] };
    legalMoves = [...selectedPiece.piece.getMoves(row, col, boardState)].filter(
      (move) =>
        !isMoveLeavingKingInCheck(
          [selectedPiece.row, selectedPiece.col],
          move,
          boardState,
          currentTurn
        )
    );
    highlightSquares(legalMoves);
    return;
  }
  const isLegalMove = legalMoves.some(
    (move) => move[0] == row && move[1] == col
  );
  if (!isLegalMove) {
    resetBoard();
    return;
  }
  if (selectedPiece.piece.color != currentTurn) {
    resetBoard();
    return;
  }
  movePiece([selectedPiece.row, selectedPiece.col], [row, col], boardState);
  selectedPiece.piece.hasMoved = true;
  currentTurn = switchTurn(currentTurn);
  checkGameState(currentTurn);
  if (isCapture([row, col], boardState)) captureAudio.play();
  else moveAudio.play();
  resetBoard();
}

// function selectPiece(row, col, boardState) {
//   if (square.children.length == 0) return;
//   if (boardState[row][col].color != currentTurn) {
//     return;
//   }
//   selectedPiece = { row, col, piece: boardState[row][col] };
//   legalMoves = [...selectedPiece.piece.getMoves(row, col, boardState)];
//   highlightSquares(legalMoves);
// }

function movePiece([fromR, fromC], [toR, toC], boardState, animate = true) {
  if (!gameEnd) {
    let piece = document.querySelector(
      `.square[data-row="${fromR}"][data-col="${fromC}"] .piece`
    );
    if (!piece) {
      console.log("Piece to be moved doesn't exist");
      return;
    }
    if (!animate) {
      boardState[toR][toC] = boardState[fromR][fromC];
      boardState[fromR][fromC] = null;
      render(boardState);
      return;
    }
    const translateX = (toC - fromC) * 80;
    const translateY = (toR - fromR) * 80;

    piece.style.transform = ` translate(${translateX}px, ${translateY}px)`;

    piece.addEventListener("transitionend", handleTransitionEnd);
    function handleTransitionEnd(e) {
      boardState[toR][toC] = boardState[fromR][fromC];
      boardState[fromR][fromC] = null;
      render(boardState);
      piece.removeEventListener("transitionend", handleTransitionEnd);
      return;
    }
  }
}

function highlightSquares(squaresCoords, isCheck = false) {
  if (!isCheck) {
    let squares = getSquaresFromCoords(squaresCoords);
    squares.forEach((square) => {
      square.classList.add("highlight");
      if (square.children.length > 0) {
        square.classList.add("capture-move");
        return;
      }
      square.classList.add("normal-move");
    });
  } else {
    let square = document.querySelector(
      `.square[data-row="${squaresCoords[0]}"][data-col="${squaresCoords[1]}"]`
    );
    square.classList.add("in-check");
  }
}

function resetHighlights() {
  const squares = document.querySelectorAll(".square");
  squares.forEach((square) => {
    square.classList.remove("normal-move");
    square.classList.remove("capture-move");
    square.classList.remove("in-check");
  });
}

function getSquaresFromCoords(coords) {
  let squares = [];
  for (let i = 0; i < coords.length; i++) {
    const targetSquare = document.querySelector(
      `.square[data-row="${coords[i][0]}"][data-col="${coords[i][1]}"]`
    );
    squares.push(targetSquare);
  }
  return squares;
}

function isCapture([row, col], boardState) {
  if (!boardState[row][col]) return false;
  return true;
}

function switchTurn(currentTurn) {
  if (!gameEnd) {
    return currentTurn == "w" ? "b" : "w";
  }
}

function handleDragStart(e, pieceImg, row, col, piece) {
  pieceImg.classList.add("being-dragged");
  selectedPiece = { row, col, piece };
  legalMoves = [
    ...selectedPiece.piece.getMoves(
      selectedPiece.row,
      selectedPiece.col,
      boardState
    ),
  ].filter(
    (move) =>
      !isMoveLeavingKingInCheck(
        [selectedPiece.row, selectedPiece.col],
        move,
        boardState,
        currentTurn
      )
  );
  e.dataTransfer.setData(
    "text/plain",
    JSON.stringify({
      startRow: selectedPiece.row,
      startCol: selectedPiece.col,
      pieceType: selectedPiece.piece.type,
      pieceColor: selectedPiece.piece.color,
    })
  );
  e.dataTransfer.effectAllowed = "move";
}

function handleDragEnd(e) {
  e.target.classList.remove("being-dragged");
  resetHighlights();
  resetBoard();
}
function handlePieceDrop(e) {
  e.preventDefault();
  const { startRow, startCol } = JSON.parse(
    e.dataTransfer.getData("text/plain")
  );
  let wasCapture = false;
  let targetSquare = e.target.closest(".square");
  const targetRow = Number(targetSquare.dataset.row);
  const targetCol = Number(targetSquare.dataset.col);
  const isLegalMove = legalMoves.some(
    (move) => move[0] == targetRow && move[1] == targetCol
  );
  if (isLegalMove && boardState[startRow][startCol].color == currentTurn) {
    // Perform the real move
    wasCapture = isCapture([targetRow, targetCol], boardState);
    movePiece([startRow, startCol], [targetRow, targetCol], boardState, false);
    currentTurn = switchTurn(currentTurn);

    checkGameState(currentTurn);
    if (wasCapture) captureAudio.play();
    else moveAudio.play();
    resetBoard();
    resetHighlights();
  }
}

function calcDangerSquares(attackerColor, boardState) {
  let squares = [];
  for (let i = 0; i < BOARD_DIM; i++) {
    for (let j = 0; j < BOARD_DIM; j++) {
      let targetPiece = boardState[i][j];
      if (!targetPiece) continue;
      if (targetPiece.color !== attackerColor) continue;
      squares.push(...targetPiece.getCaptures(i, j, boardState));
    }
  }
  return squares;
}

function findPiece(pieceType, pieceColor, board = boardState) {
  for (let i = 0; i < BOARD_DIM; i++) {
    for (let j = 0; j < BOARD_DIM; j++) {
      let targetPiece = board[i][j];
      if (!targetPiece) continue;
      if (targetPiece.type == pieceType && targetPiece.color == pieceColor)
        return [i, j];
    }
  }
}

function isKingInCheck(kingColor, board) {
  const kingCoords = findPiece("K", kingColor, board);
  if (!kingCoords) {
    console.warn(`King of color ${kingColor} not found on board.`);
    return false;
  }
  const [row, col] = kingCoords;

  // Calculate danger squares from pieces *of the opposing color*
  const opponentColor = switchTurn(kingColor);
  const dangerSquares = calcDangerSquares(opponentColor, board); // calcDangerSquares now expects the *attacking* color

  // Check if the king's coordinates are in the list of danger squares
  return dangerSquares.some(([r, c]) => r === row && c === col);
}

function isMoveLeavingKingInCheck(
  [fromR, fromC],
  [toR, toC],
  boardState,
  kingColor
) {
  const tempBoard = boardState.map((row) =>
    row.map((piece) =>
      piece
        ? Object.assign(Object.create(Object.getPrototypeOf(piece)), piece)
        : null
    )
  );

  // Perform the hypothetical move on the temporary board.
  tempBoard[toR][toC] = tempBoard[fromR][fromC];
  tempBoard[fromR][fromC] = null;

  // Check if the king of the 'kingColor' (current player's color) is in check on the tempBoard.
  return isKingInCheck(kingColor, tempBoard);
}

function hasLegalMoves(color, boardState) {
  for (let i = 0; i < BOARD_DIM; i++) {
    for (let j = 0; j < BOARD_DIM; j++) {
      const piece = boardState[i][j];
      if (!piece || piece.color !== color) continue;

      const filtered = piece
        .getMoves(i, j, boardState)
        .filter(
          (move) => !isMoveLeavingKingInCheck([i, j], move, boardState, color)
        );

      if (filtered.length > 0) {
        return true; // Found at least one legal move
      }
    }
  }
  return false; // No legal moves found for any piece
}

function checkGameState(nextTurn) {
  const isInCheck = isKingInCheck(nextTurn, boardState);
  const hasMoves = hasLegalMoves(nextTurn, boardState);
  console.log(`Is King In Check? ${isInCheck}`);
  console.log(`Does the ${nextTurn} king have any moves? ${hasMoves}`);
  if (isInCheck && !hasMoves) {
    console.log("Checkmate");
    gameEndAudio.play();
    gameEnd = true;
    return;
  }
  if (!isInCheck && !hasMoves) {
    console.log("Stalemate");
    gameEndAudio.play();
    gameEnd = true;
    return;
  }
  if (isInCheck) {
    console.log("Check");
    checkAudio.play();
    return;
  }
  if (boardHasOnlyTwoKings(boardState)) {
    console.log("Not enough pieces to deliver checkmate.");
    gameEndAudio.play();
    gameEnd = true;
    return;
  }
}

function boardHasOnlyTwoKings(boardState) {
  let kings = [];
  for (let i = 0; i < BOARD_DIM; i++) {
    for (let j = 0; j < BOARD_DIM; j++) {
      let targetPiece = boardState[i][j];
      if (!targetPiece) continue;
      if (targetPiece.type == "K") {
        kings.push(true);
        continue;
      }
      if (targetPiece) return false;
    }
  }
  if (kings.length > 1) return true;
}
