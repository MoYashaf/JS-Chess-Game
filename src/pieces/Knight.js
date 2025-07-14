import Piece from "../Piece.js";

export default class Knight extends Piece {
  constructor(color) {
    super(color, "N");
    // These are the eight L-shapes the knight can move like.
    this.directions = [
      { r: -2, c: -1 },
      { r: -2, c: 1 },
      { r: -1, c: -2 },
      { r: -1, c: 2 },
      { r: 1, c: -2 },
      { r: 1, c: 2 },
      { r: 2, c: -1 },
      { r: 2, c: 1 },
    ];
  }
  // Instead of using getRayMoves we use the normal getMoves function because an L-shape isn't a ray.
  // It's using the same basis though, only using an object instead of an array.
  getMoves(row, col, board) {
    let moves = [];
    for (const direction of this.directions) {
      const newRow = row + direction.r;
      const newCol = col + direction.c;

      if (this.isValidSquare(newRow, newCol)) {
        const targetSquare = board[newRow][newCol];
        if (targetSquare == null || targetSquare.color != this.color) {
          moves.push([newRow, newCol]);
        }
      }
    }
    return moves;
  }
}
