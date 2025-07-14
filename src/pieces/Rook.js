import Piece from "../Piece.js";

export default class Rook extends Piece {
  constructor(color, hasMoved = false) {
    super(color, "R");
    this.directions = [
      [-1, 0], // UP
      [1, 0], // DOWN
      [0, -1], // LEFT
      [0, 1], // RIGHT
    ];
    this.hasMoved = hasMoved; // Used later for castling.
  }
  getMoves(row, col, board) {
    let moves = [...this.getRayMoves(row, col, this.directions, board)];
    return moves;
  }
}
