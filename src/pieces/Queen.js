import Piece from "../Piece.js";

export default class Queen extends Piece {
  constructor(color, hasMoved = false) {
    super(color, "Q");
    this.directions = [
      [-1, 0], // UP
      [1, 0], // DOWN
      [0, -1], // LEFT
      [0, 1], // RIGHT
      [-1, -1], // UP LEFT
      [-1, 1], // UP RIGHT
      [1, -1], // DOWN LEFT
      [1, 1], // DOWN RIGHT
    ];
    this.hasMoved = hasMoved; // Used later for castling.
  }
  getMoves(row, col, board) {
    let moves = [...this.getRayMoves(row, col, this.directions, board)];
    return moves;
  }
}
