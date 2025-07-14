import Piece from "../Piece.js";
import { BOARD_DIM, boardState } from "../Chess.js";

export default class King extends Piece {
  constructor(color, hasMoved = false) {
    super(color, "K");
    this.directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    this.hasMoved = hasMoved; // Used later for castling.
  }
  getMoves(row, col, board) {
    const moves = [];
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
      const newRow = row + dr;
      const newCol = col + dc;

      if (this.isValidSquare(newRow, newCol)) {
        const target = board[newRow][newCol];
        if (!target || target.color !== this.color) {
          moves.push([newRow, newCol]);
        }
      }
    }
    return moves;
  }

  getRayMoves(row, col, directions, board) {
    let moves = [];
    for (let [dr, dc] of directions) {
      let newRow = row + dr;
      let newCol = col + dc;
      if (!this.isValidSquare(newRow, newCol)) continue;

      const targetSquare = board[newRow][newCol];
      if (targetSquare == null) {
        moves.push([newRow, newCol]);
      } else {
        if (targetSquare.color != this.color) moves.push([newRow, newCol]);
      }
    }
    return moves;
  }

  isInCheck(board) {
    let totalMoves = [];
    let kingPosition = null;
    for (let i = 0; i < BOARD_DIM; i++) {
      for (let j = 0; j < BOARD_DIM; j++) {
        const piece = boardState[i][j];
        if (piece == null) continue;
        const pieceColor = piece.color;
        const pieceType = piece.type;
        if (pieceType == "K" && pieceColor == this.color) kingPosition = [i, j];
        if (pieceColor != this.color) {
          totalMoves.push(...piece.getMoves(i, j, board));
        }
      }
    }
    if (kingPosition == null) console.error("King not found...");
    return totalMoves.some((move) => {
      return move[0] == kingPosition[0] && move[1] == kingPosition[1];
    });
  }
}
