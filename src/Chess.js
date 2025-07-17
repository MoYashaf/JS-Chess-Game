import Board from "./Board.js";
import Bishop from "./pieces/Bishop.js";
import King from "./pieces/King.js";
import Knight from "./pieces/Knight.js";
import Pawn from "./pieces/Pawn.js";
import Queen from "./pieces/Queen.js";
import Rook from "./pieces/Rook.js";
export const BOARD_DIM = 8;

export const COLORS = {
  WHITE: "w",
  BLACK: "b",
};

// This board state represents the entire game board.
// an empty square is 'null', and every other piece is an object.
// export let boardState = Array.from({ length: 8 }, () =>
//   new Array(8).fill(null)
// );
// boardState[4][5] = new Bishop("b");
// boardState[4][3] = new Queen("b");
// boardState[7][4] = new King("w");
// boardState[0][4] = new King("b");
export let boardState = [
  [
    new Rook("b"),
    new Knight("b"),
    new Bishop("b"),
    new Queen("b"),
    new King("b"),
    new Bishop("b"),
    new Knight("b"),
    new Rook("b"),
  ],
  [
    new Pawn("b"),
    new Pawn("b"),
    new Pawn("b"),
    new Pawn("b"),
    new Pawn("b"),
    new Pawn("b"),
    new Pawn("b"),
    new Pawn("b"),
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    new Pawn("w"),
    new Pawn("w"),
    new Pawn("w"),
    new Pawn("w"),
    new Pawn("w"),
    new Pawn("w"),
    new Pawn("w"),
    new Pawn("w"),
  ],
  [
    new Rook("w"),
    new Knight("w"),
    new Bishop("w"),
    new Queen("w"),
    new King("w"),
    new Bishop("w"),
    new Knight("w"),
    new Rook("w"),
  ],
];
// Used for assigning the correct CSS class for each piece.
export const pieceMap = {
  K: "king",
  Q: "queen",
  R: "rook",
  B: "bishop",
  N: "knight",
  P: "pawn",
};
export default class Chess {
  constructor(uiBoard, currentTurn = "w") {
    this.uiBoard = uiBoard;
    this.currentTurn = currentTurn;
    this.board = new Board(uiBoard);
  }

  play() {
    this.uiBoard.addEventListener("click", (e) => {
      /*
  There's basically two outcomes.
  1. You already selected a piece and need to move it.
  2. You're just going to select a piece to check it's moves;
  */
      this.board.clearHighlights();
      this.board.clearArrows();
      const square = e.target.closest(".square");
      if (!square) return;
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      if (this.board.selectedPiece) {
        // I always forget what does the array method 'some' do so I'll explain it breifly
        // It loops through the array and once it finds an element that meets the condition and returns true.
        // In this case it sees if the selected move is a legal square to move to.
        const isLegalMove = this.board.legalMoves.some(
          (move) => move[0] == row && move[1] == col
        );

        if (isLegalMove) {
          const currentKing = this.board.findPiece("K", this.currentTurn);
          const tempBoardState = JSON.parse(JSON.stringify(boardState));
          const currentPiece =
            tempBoardState[this.board.selectedPiece.row][
              this.board.selectedPiece.col
            ];
          tempBoardState[row][col] = currentPiece;
          tempBoardState[this.board.selectedPiece.row][
            this.board.selectedPiece.col
          ] = null;
          const leavesKingInCheck = currentKing.isInCheck(boardState);

          if (!leavesKingInCheck) {
            let pieceToBeMoved = document.querySelector(
              `.square[data-row="${this.board.selectedPiece.row}"][data-col="${this.board.selectedPiece.col}"] .piece`
            );
            pieceToBeMoved.style = `transform: translate(calc((${this.board.selectedPiece.col} - ${col}) * 50px * -1), calc((${this.board.selectedPiece.row} - ${row}) * 50px * -1));`;
            this.board.clearHighlights();
            pieceToBeMoved.addEventListener("transitionend", (_) => {
              // We move the square by setting it's value to the destination and reseting its original square.
              boardState[row][col] =
                boardState[this.board.selectedPiece.row][
                  this.board.selectedPiece.col
                ];
              boardState[this.board.selectedPiece.row][
                this.board.selectedPiece.col
              ] = null;

              boardState[this.board.selectedPiece.row][
                this.board.selectedPiece.col
              ].hasMoved = true;

              const opponentColor = this.currentTurn == "w" ? "b" : "w";
              this.currentTurn = opponentColor;
              // Reset everything.
              this.board.selectedPiece = null;
              this.board.legalMoves = [];
              this.board.clearHighlights();
              this.board.render();
            });
          } else {
            this.board.selectedPiece = null;
            this.board.legalMoves = [];
            this.board.clearHighlights();
            this.board.render();
          }
        } else {
          // In case the user plays an illegal move,
          // or unselects the current piece.
          this.board.selectedPiece = null;
          this.board.legalMoves = [];
          this.board.clearHighlights();
          this.board.render();
        }
      } else {
        // This means that the user is choosing a piece.
        // We'll display its moves and highlight them.
        this.board.selectedPiece = { row, col, piece: boardState[row][col] };
        this.board.legalMoves = [
          ...this.board.selectedPiece.piece.getMoves(
            this.board.selectedPiece.row,
            this.board.selectedPiece.col,
            boardState
          ),
        ];

        this.board.legalMoves = this.board.legalMoves.filter((move) => {
          const tempBoardState = JSON.parse(JSON.stringify(boardState));
          tempBoardState[move[0]][move[1]] = this.board.selectedPiece.piece;
          tempBoardState[this.board.selectedPiece.row][
            this.board.selectedPiece.col
          ] = null;
          const currentKing = this.board.findPiece("K", this.currentTurn);
          return !currentKing.isInCheck(boardState);
        });

        this.board.highlightSquares(this.board.legalMoves);
      }
    });
    this.board.render();
  }
}
