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
            square.id = FileChar[file] + (rank + 1);

            squareElements.push(square);
            graphicalBoard.appendChild(square);
            square.style.gridRow = 8 - rank;
        }
    }
}

gui.renderPieces = function () {
    //traverse the sq of internal board and add pieces on gui
    for (const sq of Sq64To120) {
        if (gameBoard.pieces[sq] !== Pieces.empty) {
            gui.addPiece(sq, gameBoard.pieces[sq]);
        }
    }

    this.addInteraction();
}



gui.addInteraction = function () {
    pieceElements = document.querySelectorAll('.piece');
    pieceElements.forEach(piece => {
        piece.addEventListener('dragstart', dragStart);
    })

    squareElements.forEach(square => {
        square.addEventListener('dragover', dragOver);
        square.addEventListener('drop', drop);
    });
}


let fromSq, toSq;

function dragStart(e) {
    fromSq = e.target.parentElement;

}
function dragOver(e) {
    e.preventDefault();
}
function drop(e) {
    toSq = e.target;
    let capture = 0;
    if (toSq.classList.contains('piece')) {
        if (SideChar[PieceColor[gameBoard.pieces[Squares[fromSq.id]]]] == toSq.classList[1][0]) {
            return;
        }
        else{
            capture = 1;
        }
        toSq = toSq.parentElement;
    }

    let move = buildMove(Squares[fromSq.id], Squares[toSq.id], capture);
    gui.doMove(move);
}



gui.addPiece = function (sq, piece) {
    const pieceName = SideChar[PieceColor[piece]] + PieceType[piece];
    const pieceElement = document.createElement('div');
    pieceElement.classList.add('piece', pieceName);
    pieceElement.draggable = 'true';

    pieceElement.addEventListener('dragstart', dragStart);

    squareElements[Sq120To64[sq]].appendChild(pieceElement);
}

gui.removePiece = function (sq) {
    squareElements[Sq120To64[sq]].querySelector('.piece')?.remove();
}

gui.movePiece = function (from, to) {
    let piece = squareElements[Sq120To64[from]].querySelector('.piece');
    squareElements[Sq120To64[to]].appendChild(piece);
}

gui.doMove = function (move) {
    if (!move) {
        return;
    }

    const from = moveFrom(move);
    const to = moveTo(move);
    const side = gameBoard.side;


    if (move & EnPassantFlag) {
        if (side === Color.white) {
            this.removePiece(to - 10);
        }
        else {
            this.removePiece(to + 10);
        }
        CaptureSound.play();
    } else if (move & CastleFlag) {
        switch (to) {
            case Squares.g1: this.movePiece(Squares.h1, Squares.f1); break;
            case Squares.c1: this.movePiece(Squares.a1, Squares.d1); break;

            case Squares.g8: this.movePiece(Squares.h8, Squares.f8); break;
            case Squares.c8: this.movePiece(Squares.a8, Squares.d8); break;
                CastleSound.play();
            default: break;
        }
        CastleSound.play();
    }

    if (move & CaptureFlag) {
        CaptureSound.play();
        this.removePiece(to);
    }

    if (!(move & EnPassantFlag) && !(move & CastleFlag) && !(move & CaptureFlag) && !(move & PromotionFlag)) {
        if (side === Color.white) {
            SelfMoveSound.play();
        }
        else {
            EnemyMoveSound.play();
        }
    }
    this.movePiece(from, to);

    if (move & PromotionFlag) {
        PromoteSound.play();
        this.removePiece(to);
        this.addPiece(to, movePormotionPiece(move));
    }

    //current player in check
    if (gameBoard.checkSq !== Squares.noSq) {
        squareElements[Sq120To64[gameBoard.checkSq]].classList.remove('danger');
    }

    doMove(move);

    //giving opponent a check
    if (gameBoard.checkSq !== Squares.noSq) {
        CheckSound.play();
        squareElements[Sq120To64[gameBoard.checkSq]].classList.add('danger');
    }

    if (isGameOver()) {
        addRecord(moveNotation(move, true));
        removeBoardInteraction();
        if (retriving) return;

        GameEndSound.play();
        gameOver.classList.add('active');
        return;
    }
}


function isGameOver() {

}
