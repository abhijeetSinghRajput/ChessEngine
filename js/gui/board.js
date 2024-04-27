const gui = {};
const graphicalBoard = document.getElementById('board');

let squareElements;
let pieceElements;





gui.renderSquares = function () {
    squareElements = [];

    for (let rank = Rank1; rank <= Rank8; ++rank) {
        for (let file = FileA; file <= FileH; ++file) {
            const square = document.createElement('div');
            const squareColor = (rank + file) % 2 ? 'dark' : 'light';

            square.classList.add('square', squareColor);

            squareElements.push(square);
            graphicalBoard.appendChild(square);
            square.style.gridRow = 8 - rank;
        }
    }
}










gui.addInteraction = function () {
    pieceElements.forEach(piece => {
        piece.addEventListener('dragstart', dragStart);
    })

    squareElements.forEach(square => {
        square.addEventListener('dragover', dragOver);
        square.addEventListener('dragover', drop);
    });
}

gui.removeInteraction = function () {
    pieceElements.forEach(piece => {
        piece.removeEventListener('dragstart', drag);
        piece.removeEventListener('click', clickOnPiece);
    })

    squareElements.forEach(square => {
        square.removeEventListener('dragover', dragOver);
        square.removeEventListener('drop', drop);
        square.removeEventListener('click', clickOnSquare);
    })
}



gui.renderPieces = function () {
    //traverse the sq of internal board and add pieces on gui
    for (const sq of Sq64To120) {
        gui.addPiece(sq, gameBoard.pieces[sq]);
    }
}



gui.addPiece = function (sq, piece) {
    const pieceName = SideChar[PieceColor[piece]] + PieceType[piece];
    const pieceElement = document.createElement('div');
    pieceElement.classList.add('piece', pieceName);
    pieceElement.draggable = 'true';

    squareElements[Sq120To64[sq]].appendChild(pieceElement);
}


