import { BOARD_DIM, boardState, pieceMap } from "./Chess.js";
export default class Board {
  constructor(uiBoard) {
    this.uiBoard = uiBoard;
    this.legalMoves = [];
    this.selectedPiece = null;
    this.draggedPieceElement = null;
    this.arrowLayer = document.querySelector(".svg-layer");
    this.svgArrows = [];

    // Code for drawing arrows.
    this.uiBoard.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      let targetSquare = e.target.closest(".square");
      targetSquare.classList.toggle("highlighted-square");
    });

    this.uiBoard.addEventListener("mousedown", (e) => {
      if (e.button != 2) return;

      const square = e.target.closest(".square");
      if (!square) return;
      this.arrowStart = {
        row: parseInt(square.dataset.row),
        col: parseInt(square.dataset.col),
      };
    });

    this.uiBoard.addEventListener("mouseup", (e) => {
      if (e.button != 2 || !this.arrowStart) return;
      const targetSquare = e.target.closest(".square");
      if (!targetSquare) return;
      const arrowEnd = {
        row: parseInt(targetSquare.dataset.row),
        col: parseInt(targetSquare.dataset.col),
      };
      if (
        this.arrowStart.row == arrowEnd.row &&
        this.arrowStart.col == arrowEnd.col
      ) {
        const arrowIndex = this.getSvgArrow(this.arrowStart, arrowEnd);
        this.svgArrows[arrowIndex].remove();
        this.svgArrows.splice(arrowIndex, 1);
        return;
      }

      // Check if arrow already exists, in this case remove it.
      const arrowExists = this.arrowExists(this.arrowStart, arrowEnd);
      if (arrowExists) {
        console.log("Found arrow");
        let arrowIndex = this.getSvgArrow(this.arrowStart, arrowEnd);
        console.log(arrowIndex);
        console.log(this.svgArrows[arrowIndex]);
        // this.svgArrows[arrowIndex].remove();
        // this.svgArrows.splice(arrowIndex, 1);
        return;
      }
      this.addSvgArrow(this.arrowStart, arrowEnd);
      this.arrowStart = null;
    });

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
        // This makes it so that all squares could be dragged on.
        square.addEventListener("dragover", (e) => {
          e.preventDefault();
        });

        square.addEventListener("drop", (e) => {
          e.preventDefault();
          const pieceRow = JSON.parse(
            e.dataTransfer.getData("text/plain")
          ).startRow;
          const pieceCol = parseInt(
            JSON.parse(e.dataTransfer.getData("text/plain")).startCol
          );
          let targetSquare = e.target.closest(".square");
          const targetRow = parseInt(targetSquare.dataset.row);
          const targetCol = parseInt(targetSquare.dataset.col);
          const isLegalMove = this.legalMoves.some(
            (move) => move[0] == targetRow && move[1] == targetCol
          );
          if (isLegalMove) {
            targetSquare.innerHTML = "";
            targetSquare.appendChild(this.draggedPieceElement);
            // Perform the real move
            const piece = boardState[pieceRow][pieceCol];
            boardState[targetRow][targetCol] = piece;
            boardState[pieceRow][pieceCol] = null;

            this.selectedPiece = null;
            this.legalMoves = [];
            this.clearHighlights();
            this.render();
          }
        });
        this.uiBoard.appendChild(square);
      }
    }
  }
  render() {
    const squares = document.querySelectorAll(".chess-board .square");
    squares.forEach((square, index) => {
      // Clear any exisiting piece.
      square.innerHTML = "";
      const row = Math.floor(index / BOARD_DIM);
      const col = index % BOARD_DIM;
      const piece = boardState[row][col];
      if (piece) {
        const pieceImg = document.createElement("img");
        pieceImg.classList.add(
          "piece"
          // `${piece.color}-${pieceMap[piece.type]}`
        );
        pieceImg.src = `./assets/${piece.color}-${pieceMap[
          piece.type
        ].toLowerCase()}.svg`;
        pieceImg.setAttribute("draggable", "true");
        pieceImg.addEventListener("dragstart", (e) =>
          this.handleDragStart(e, pieceImg, row, col, piece)
        );
        pieceImg.addEventListener("dragend", this.handleDragEnd);
        square.appendChild(pieceImg);
      }
    });
  }
  highlightSquares(squares) {
    const squaresToBeHighlighted = new Array(squares.length);
    for (let i = 0; i < squaresToBeHighlighted.length; i++) {
      squaresToBeHighlighted[i] = document.querySelector(
        `.square[data-row="${squares[i][0]}"][data-col="${squares[i][1]}"]`
      );
      const highlightDiv = document.createElement("div");
      let targetSquare = squaresToBeHighlighted[i];
      if (targetSquare.children.length > 0) {
        targetSquare.classList.add("capture-square");
        highlightDiv.classList.add("capture-highlight");
      } else {
        targetSquare.classList.add("move-square");
        highlightDiv.classList.add("move-highlight");
      }
      targetSquare.appendChild(highlightDiv);

      squaresToBeHighlighted[i].classList.add("legal-move");
    }
  }
  clearHighlights() {
    const squares = document.querySelectorAll(".square");
    squares.forEach((square) => {
      square.classList.remove("legal-move");
      square.classList.remove("highlighted-square");
    });
  }
  handleDragEnd(e) {
    e.target.classList.remove("being-dragged");
    this.clearHighlights();
    this.selectedPiece = null;
    this.legalMoves = [];
  }
  handleDragStart(e, pieceImg, row, col, piece) {
    this.clearArrows();
    pieceImg.classList.add("being-dragged");
    this.selectedPiece = { row, col, piece };
    this.legalMoves = this.selectedPiece.piece.getMoves(
      this.selectedPiece.row,
      this.selectedPiece.col,
      boardState
    );
    this.highlightSquares(this.legalMoves);
    this.draggedPieceElement = pieceImg;
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        startRow: this.selectedPiece.row,
        startCol: this.selectedPiece.col,
        pieceType: this.selectedPiece.piece.type,
        pieceColor: this.selectedPiece.piece.color,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  }
  getSquareCenter(row, col) {
    const squareSize = this.uiBoard.clientWidth / BOARD_DIM;
    return {
      x: col * squareSize + squareSize / 2,
      y: row * squareSize + squareSize / 2,
    };
  }
  addSvgArrow(from, to) {
    const svg = this.arrowLayer;
    const fromPos = this.getSquareCenter(from.row, from.col);
    const toPos = this.getSquareCenter(to.row, to.col);
    const arrow = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    arrow.setAttribute("x1", fromPos.x);
    arrow.setAttribute("y1", fromPos.y);
    arrow.setAttribute("x2", toPos.x);
    arrow.setAttribute("y2", toPos.y);
    arrow.setAttribute("stroke", "rgba(255, 0, 0, 0.6)");
    arrow.setAttribute("stroke-width", "8");
    arrow.setAttribute("marker-end", "url(#arrowhead)");
    svg.appendChild(arrow);

    this.svgArrows.push(arrow);
  }
  clearArrows() {
    this.svgArrows.forEach((arrow) => {
      console.log(arrow);
      arrow.remove();
    });
    this.svgArrows = [];
  }
  arrowExists(arrowStart, arrowEnd) {
    const arrowExist = this.svgArrows.some((arrow) => {
      console.log(arrow.getAttribute("x1"));
      console.log(this.getSquareCenter(arrowStart.row, arrowStart.col).x);
      return (
        arrow.getAttribute("x1") ==
          this.getSquareCenter(arrowStart.row, arrowStart.col).x &&
        arrow.getAttribute("x2") ==
          this.getSquareCenter(arrowEnd.row, arrowEnd.col).x &&
        arrow.getAttribute("y1") ==
          this.getSquareCenter(arrowStart.row, arrowStart.col).y &&
        arrow.getAttribute("y2") ==
          this.getSquareCenter(arrowEnd.row, arrowEnd.col).y
      );
    });
    return arrowExist;
  }
  getSvgArrow(arrowStart, arrowEnd) {
    let index = null;
    this.svgArrows.forEach((arrow, i) => {
      if (
        arrow.getAttribute("x1") ==
          this.getSquareCenter(arrowStart.row, arrowStart.col).x &&
        arrow.getAttribute("x2") ==
          this.getSquareCenter(arrowEnd.row, arrowEnd.col).x &&
        arrow.getAttribute("y1") ==
          this.getSquareCenter(arrowStart.row, arrowStart.col).y &&
        arrow.getAttribute("y2") ==
          this.getSquareCenter(arrowEnd.row, arrowEnd.col).y
      );
      {
        index = i;
      }
    });
    return index;
  }

  findPiece(pieceType, pieceColor) {
    for (let i = 0; i < BOARD_DIM; i++) {
      for (let j = 0; j < BOARD_DIM; j++) {
        let targetPiece = boardState[i][j];
        if (targetPiece) {
          if (targetPiece.type == pieceType && targetPiece.color == pieceColor)
            return targetPiece;
        } else continue;
      }
    }
  }
}
