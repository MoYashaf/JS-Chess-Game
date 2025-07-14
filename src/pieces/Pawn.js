import Piece from "../Piece.js";

export default class Pawn extends Piece {
  constructor(color) {
    super(color, "P");
    this.hasMoved = false;
    this.direction = this.color == "w" ? -1 : 1;
  }

  getMoves(row, col, board) {
    let moves = [];
    // UP
    if (
      this.isValidSquare(row + this.direction, col) &&
      board[row + this.direction][col] == null
    ) {
      moves.push([row + this.direction, col]);
      // TWO UP
      if (
        this.isValidSquare(row + this.direction * 2, col) &&
        board[row + this.direction * 2][col] == null &&
        this.hasMoved == false
      )
        moves.push([row + this.direction * 2, col]);
    }
    // UP LEFT
    if (
      board[row + this.direction][col - 1] &&
      board[row + this.direction][col - 1].color != this.color
    ) {
      moves.push([row + this.direction, col - 1]);
    } // UP RIGHT
    if (
      board[row + this.direction][col + 1] &&
      board[row + this.direction][col + 1].color != this.color
    ) {
      moves.push([row + this.direction, col + 1]);
    }
    return moves;
  }
  getCaptures(row, col, board) {
    let moves = [];
    // UP LEFT
    if (
      this.isValidSquare(row + this.direction, col - 1) ||
      (board[row + this.direction][col - 1] &&
        board[row + this.direction][col - 1].color != this.color)
    ) {
      moves.push([row + this.direction, col - 1]);
    } // UP RIGHT
    if (
      this.isValidSquare(row + this.direction, col + 1) ||
      (board[row + this.direction][col + 1] &&
        board[row + this.direction][col + 1].color != this.color)
    ) {
      moves.push([row + this.direction, col + 1]);
    }
    return moves;
  }
}
