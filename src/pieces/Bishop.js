import Piece from "../Piece.js";

export default class Bishop extends Piece {
  constructor(color) {
    super(color, "B");
    this.directions = [
      [-1, -1], // UP LEFT
      [-1, 1], // UP RIGHT
      [1, -1], // DOWN LEFT
      [1, 1], // DOWN RIGHT
    ];
  }
  getMoves(row, col, board) {
    let moves = [...this.getRayMoves(row, col, this.directions, board)];
    return moves;
  }
}
