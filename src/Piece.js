import { BOARD_DIM } from "./Chess.js";

/*
This is the base class for all pieces to come, whether standard or imaginary.
*/
export default class Piece {
  constructor(color, type) {
    this.color = color;
    this.type = type;
    this.hasMoved = false;
  }

  // Sees if the square is within the board's range.
  isValidSquare(row, col) {
    return row >= 0 && row < BOARD_DIM && col >= 0 && col < BOARD_DIM;
  }

  // This should be overridden by the specific piece type.
  getMoves(row, col, board) {
    throw new Error(
      "This should never be called without being overridden by another subclass."
    );
  }
  // This method is useful for pieces like the Rook, Bishop and Queen, and could be easilly overriden for custom functionality.
  // It basically works by getting an array of arrays that contains the direction (-1 means UP or LEFT and 1 means DOWN or RIGHT).
  getRayMoves(row, col, directions, board) {
    const moves = [];

    for (const [dr, dc] of directions) {
      for (let i = 1; ; i++) {
        // i represents distance from current piece.
        const newRow = row + dr * i;
        const newCol = col + dc * i;

        // If we're getting out of the board's boundaries then stop.
        if (!this.isValidSquare(newRow, newCol)) break;

        const targetPiece = board[newRow][newCol];
        // If it's an empty square then add it to the available moves and continue looping.
        if (targetPiece == null) moves.push([newRow, newCol]);
        // It it's of an other color, add it and stop looping.
        // else, it's of the same color. Don't add it and stop looping.
        else {
          if (targetPiece.color != this.color) {
            moves.push([newRow, newCol]);
            break;
          }
          break;
        }
      }
    }
    return moves;
  }
  getCaptures(row, col, board) {
    return this.getMoves(row, col, board);
  }
}
