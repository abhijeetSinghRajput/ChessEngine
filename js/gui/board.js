const gui = {};
const graphicalBoard = document.getElementById('board');
const hashKey = document.getElementById('hash-key');


let squareElements;
let pieceElements;

// =====================================================
// =================== GUI RENDERING ===================
// =====================================================

gui.renderSquares = function () {
    squareElements = [];

    for (let rank = Rank1; rank <= Rank8; ++rank) {
        for (let file = FileA; file <= FileH; ++file) {
            const square = document.createElement('div');
            const squareColor = (rank + file) % 2 ? 'dark' : 'light';

            square.classList.add('square', squareColor);
            square.id = FileChar[file] + (rank + 1);

            if (file === FileA) {
                square.innerHTML += `<span class="num">${rank + 1}</span>`
            }
            if (rank === Rank1) {
                square.innerHTML += `<span class="alpha">${FileChar[file]}</span>`
            }

            squareElements.push(square);
            graphicalBoard.appendChild(square);
            square.style.gridRow = 8 - rank;
        }
    }
}

gui.renderPieces = function () {
    document.querySelectorAll('.piece').forEach(piece => piece.remove());

    //traverse the sq of internal board and add pieces on gui
    for (const sq of Sq64To120) {
        if (gameBoard.pieces[sq] !== Pieces.empty) {
            gui.addPiece(sq, gameBoard.pieces[sq]);
        }
    }

    this.addInteraction();
}



// =====================================================
// ================= BOARD INTERACTION =================
// =====================================================

let clickStart = false;

gui.removeInteraction = function () {
    pieceElements.forEach(piece => {
        piece.removeEventListener('dragstart', dragStart);
        piece.removeEventListener('click', clickOnPiece);
    })
    squareElements.forEach(square => {
        square.removeEventListener('dragover', dragOver);
        square.removeEventListener('drop', drop);
        square.removeEventListener('dragleave', dragLeave);
        square.removeEventListener('click', clickOnSquare);
    })
}

gui.addInteraction = function () {
    pieceElements = document.querySelectorAll('.piece');
    squareElements = document.querySelectorAll('.square');
    gui.removeInteraction();
    if (promotionMove) {
        squareElements[Sq120To64[moveTo(promotionMove)]].querySelector('ul')?.remove();
    }

    pieceElements.forEach(piece => {
        piece.addEventListener('dragstart', dragStart);
        piece.addEventListener('click', clickOnPiece);
    })

    squareElements.forEach(square => {
        square.addEventListener('dragover', dragOver);
        square.addEventListener('drop', drop);
        square.addEventListener('dragleave', dragLeave);
        square.addEventListener('click', clickOnSquare);
    });
    if (promotionMove) {
        choosePromotionPiece(promotionMove);
    }
}

function clickOnPiece(e) {
    let piece = e.target;
    if (fromSq && piece.classList[1][0] !== SideChar[gameBoard.side]) {
        drop(e);
    }
    else {
        clearMarker();
        dragStart(e);
    }
}
function clickOnSquare(e) {
    if (!e.target.classList.contains('piece')) {
        drop(e);
    }
}


let fromSq, toSq, movelist, promotionMove = null;

function dragStart(e) {
    let square = e.target.parentElement;
    fromSq = Squares[square.id];
    movelist = generateMoves();

    clearHighlight();
    addHighlight(fromSq);
    addMarker(fromSq, movelist);
}

let activeSquare = null;
function dragOver(e) {
    //select the square
    let square = e.target;
    if (!e.target.classList.contains('square')) {
        square = e.target.parentElement;
    }

    //add over effect
    activeSquare = square;
    square.classList.add('active');
    e.preventDefault();
}
//drag leave trigger when we leave a square and enter 
function dragLeave(e) {
    if (activeSquare) {
        activeSquare.classList.remove('active');
        activeSquare = null;
    }
}

function drop(e) {
    clearMarker();

    let square = e.target;
    if (e.target.classList.contains('piece')) {
        square = e.target.parentElement;
    }
    toSq = Squares[square.id];
    let move = parseMove(fromSq, toSq, movelist);
    fromSq = null;

    if (move) {
        if (move & PromotionFlag) {
            promotionMove = move;
            choosePromotionPiece(move);
        }
        else {
            gui.doMove(move);
            promotionMove = null;
        }
        addHighlight(toSq);
    }
}
//even drop outside the board clear the marker
document.addEventListener('dragend', clearMarker);


// =====================================================
// ===================== HIGHLIGHT =====================
// =====================================================


const highlightSq = [];

function addHighlight(sq) {
    let square = squareElements[Sq120To64[sq]];
    if (square.classList.contains('danger')) {
        return;
    }
    square.classList.add('highlight');
    highlightSq.push(square);
}

function addMarker(from, movelist) {
    for (const { move } of movelist) {
        if (moveFrom(move) === from) {
            if (!doMove(move)) {
                continue;
            }
            undoMove();
            let to = moveTo(move);
            if (move & CaptureFlag) {
                squareElements[Sq120To64[to]].classList.add('attack');
            }
            else {
                squareElements[Sq120To64[to]].classList.add('dot');
            }
        }
    }
}

function clearHighlight() {
    while (highlightSq.length > 0) {
        highlightSq.pop().classList.remove('highlight');
    }
}

function clearMarker() {
    squareElements.forEach(square => {
        square.classList.remove('active', 'dot', 'attack', 'danger');
    })
}


// =====================================================
// =================== MOVE HANDING ====================
// =====================================================


gui.doMove = function (move, { audio = true, userMove = true } = {}) {
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
    hashKey.textContent = gameBoard.positionKey.toString(16);

    //giving opponent a check
    if (gameBoard.checkSq !== Squares.noSq) {
        CheckSound.play();
        squareElements[Sq120To64[gameBoard.checkSq]].classList.add('danger');
    }

    if (userMove) {
        if (isGameOver()) {
            addRecord(moveNotation(move, resultSubTitle.textContent == 'by checkmate'));
            gui.removeInteraction();

            GameEndSound.play();
            gameOver.classList.add('active');
        }
        else {
            // removing the undo move before adding new one.
            let temp = nodeList.length - currMoveNode - 1;
            while (temp--) {
                let node = nodeList.pop();
                if (node.classList.contains('white')) {
                    node.parentElement.remove();
                }
                node.remove();
            }

            addRecord(moveNotation(move));
        }
    }
}

gui.undoMove = function () {
    promotionUl?.remove();
    if (gameBoard.history.length === 0) {
        return;
    }
    const move = undoMove();
    hashKey.textContent = gameBoard.positionKey.toString(16);

    const from = moveFrom(move);
    const to = moveTo(move);


    if (move & EnPassantFlag) {
        if (gameBoard.side === Color.white) {
            this.addPiece(to - 10, Pieces.bp);
        }
        else {
            this.addPiece(to + 10, Pieces.wp);
        }
        CaptureSound.play();
    }
    else if (move & CastleFlag) {
        switch (to) {
            case Squares.g1: this.movePiece(Squares.f1, Squares.h1); break;
            case Squares.c1: this.movePiece(Squares.d1, Squares.a1); break;

            case Squares.g8: this.movePiece(Squares.f8, Squares.h8); break;
            case Squares.c8: this.movePiece(Squares.d8, Squares.a8); break;

            default: break;
        }
        CastleSound.play();
    }

    if (!(move & EnPassantFlag) && !(move & CastleFlag) && !(move & CaptureFlag) && !(move & PromotionFlag)) {
        if (gameBoard.side === Color.white) {
            EnemyMoveSound.play();
        }
        else {
            SelfMoveSound.play();
        }
    }

    this.movePiece(to, from);

    if (move & CaptureFlag) {
        CaptureSound.play();
        this.addPiece(to, moveCapturePiece(move));
    }
    if (move & PromotionFlag) {
        PromoteSound.play();
        this.removePiece(from);
        this.addPiece(from, PieceColor[movePormotionPiece(move)] === Color.white ? Pieces.wp : Pieces.bp);
    }

    if (gameBoard.checkSq !== Squares.noSq) {
        CheckSound.play();
        squareElements[Sq120To64[gameBoard.checkSq]].classList.add('danger');
    }
    else {
        squareElements[Sq120To64[gameBoard.pieceList[Kings[gameBoard.side ^ 1]][0]]].classList.remove('danger');
    }

    clearHighlight();
    addHighlight(from);
    addHighlight(to);

    nodeList[currMoveNode].classList.remove('selected');
    currMoveNode = prevMoveNode--;
    nodeList[currMoveNode]?.classList.add('selected');

    undoMoveHistory.push(move);
    if (currMoveNode % 2 != 0) --ply;
}


gui.addPiece = function (sq, piece) {
    const pieceName = SideChar[PieceColor[piece]] + PieceType[piece];
    const pieceElement = document.createElement('div');
    pieceElement.classList.add('piece', pieceName);
    pieceElement.draggable = 'true';

    pieceElement.addEventListener('dragstart', dragStart);
    pieceElement.addEventListener('click', clickOnPiece);

    squareElements[Sq120To64[sq]].appendChild(pieceElement);
}

gui.removePiece = function (sq) {
    squareElements[Sq120To64[sq]].querySelector('.piece')?.remove();
}

gui.movePiece = function (from, to) {
    let piece = squareElements[Sq120To64[from]].querySelector('.piece');
    squareElements[Sq120To64[to]].appendChild(piece);
}

// =====================================================
// ================= GAME TERMINATION ==================
// =====================================================

const resultTitle = document.querySelector('.game-over .header .title');
const resultSubTitle = document.querySelector('.game-over .header .subtitle');
const [whitePlayer, blackPlayer] = document.querySelectorAll('.player');

function isGameOver() {
    if (gameBoard.fiftyMove >= 100) {
        resultTitle.textContent = 'Draw';
        resultSubTitle.textContent = 'by fiftymove'

        return true;
    }

    if (threeFoldRep() >= 2) {
        resultTitle.textContent = 'Draw';
        resultSubTitle.textContent = 'by threefold'

        return true;
    }

    if (drawMaterial()) {
        resultTitle.textContent = 'Draw';
        resultSubTitle.textContent = 'by ensufficient matterial'

        return true;
    }

    //check is there there any legal move
    for (const { move } of generateMoves()) {
        if (!doMove(move)) {
            continue;
        }

        undoMove();
        return false;
    }

    if (gameBoard.checkSq !== Squares.noSq) {
        if (gameBoard.side === Color.white) {
            resultTitle.textContent = 'Black Won';
            blackPlayer.classList.add('winner');
        }
        else {
            resultTitle.textContent = 'White Won';
            whitePlayer.classList.add('winner');
        }
        resultSubTitle.textContent = 'by checkmate'
        return true;
    }
    else {
        resultTitle.textContent = 'Draw';
        resultSubTitle.textContent = 'by Stalemate'
        return true;
    }
}

function threeFoldRep() {
    let repetition = 0;
    for (const { positionKey } of gameBoard.history) {
        if (gameBoard.positionKey === positionKey) {
            repetition++;
        }
    }
    return repetition;
}

function drawMaterial() {

    if (gameBoard.pieceCount[Pieces.wp] !== 0 || gameBoard.pieceCount[Pieces.bp] !== 0) return false;
    if (gameBoard.pieceCount[Pieces.wq] !== 0 || gameBoard.pieceCount[Pieces.bq] !== 0 ||
        gameBoard.pieceCount[Pieces.wr] !== 0 || gameBoard.pieceCount[Pieces.br] !== 0) return false;
    if (gameBoard.pieceCount[Pieces.wb] > 1 || gameBoard.pieceCount[Pieces.bb] > 1) return false;
    if (gameBoard.pieceCount[Pieces.wn] > 1 || gameBoard.pieceCount[Pieces.bn] > 1) return false;

    if (gameBoard.pieceCount[Pieces.wn] !== 0 && gameBoard.pieceCount[Pieces.wb] !== 0) return false;
    if (gameBoard.pieceCount[Pieces.bn] !== 0 && gameBoard.pieceCount[Pieces.bb] !== 0) return false;

    return true;
}


function newGame() {
    resetGui();
    //no need to parse fen it it's already at starting position
    if (gameBoard.positionKey !== StartingHashKey) {
        parseFen(StartingFen);
        gui.renderPieces();
        GameStartSound.play();
    }
    clearHighlight();
    clearMarker();

    promotionUl?.remove();
}
function resetGui() {
    ply = 0;
    prevMoveNode = -1;
    currMoveNode = -1;
    undoMoveHistory = [];
    nodeList = [];
    records.innerHTML = '';
}


const records = document.querySelector('.movelist');
let nodeList = [];
let undoMoveHistory = [];
let prevMoveNode = -1;
let currMoveNode = -1;
let ply = 0;

function addRecord(notation) {
    const node = document.createElement('div');
    const color = gameBoard.side === Color.white ? 'black' : 'white';
    node.classList.add('node', color);
    node.textContent = notation;

    nodeList.push(node);

    prevMoveNode = currMoveNode++;

    nodeList[prevMoveNode]?.classList.remove('selected');
    nodeList[currMoveNode].classList.add('selected');
    if (currMoveNode % 2 === 0) {
        const move = document.createElement('div');
        const p = document.createElement('p');

        p.classList.add('ply');
        move.classList.add('move');

        p.textContent = ++ply + '.';

        move.append(p, node);
        records.appendChild(move);
    }
    else {
        records.lastChild.appendChild(node);
    }
}


function moveForward() {
    if (undoMoveHistory.length === 0) {
        return;
    }
    prevMoveNode = currMoveNode++;
    if(currMoveNode % 2 == 0) ++ply;

    let move = undoMoveHistory.pop();
    gui.doMove(move, { userMove: false });

    nodeList[prevMoveNode]?.classList.remove('selected');
    nodeList[currMoveNode].classList.add('selected');
}

function parseMove(from, to, movelist) {
    if (!movelist) {
        movelist = generateMoves();
    }

    let found = null;
    for (const { move } of movelist) {
        if (moveFrom(move) === from && moveTo(move) === to) {
            found = move;
            break;
        }
    }

    if (found) {
        if (!doMove(found)) {
            IllegalSound.play();
            if (gameBoard.checkSq !== Squares.noSq) {
                squareElements[Sq120To64[gameBoard.checkSq]].classList.add('blink');
                setTimeout(() => {
                    squareElements[Sq120To64[gameBoard.checkSq]].classList.remove('blink');
                }, 500);
            }
            return null;
        }
        undoMove();
    }

    return found;
}

function flipBoard() {
    graphicalBoard.querySelectorAll('.num').forEach(e => e.remove());
    graphicalBoard.querySelectorAll('.alpha').forEach(e => e.remove());

    if (!graphicalBoard.classList.contains('flip')) {
        for (let rank = Rank1; rank <= Rank8; ++rank) {
            for (let file = FileA; file <= FileH; ++file) {
                let sq = fileRank2Sq(file, rank);
                if (file === FileH) {
                    squareElements[Sq120To64[sq]].innerHTML += `<span class="num">${rank + 1}<span>`
                }
                if (rank === Rank8) {
                    squareElements[Sq120To64[sq]].innerHTML += `<span class="alpha">${FileChar[file]}<span>`
                }
                squareElements[Sq120To64[sq]].style.gridRow = rank + 1;
                squareElements[Sq120To64[sq]].style.gridColumn = 8 - file;
            }
        }
        graphicalBoard.classList.add('flip');
    }
    else {
        for (let rank = Rank1; rank <= Rank8; ++rank) {
            for (let file = FileA; file <= FileH; ++file) {
                let sq = fileRank2Sq(file, rank);
                if (file === FileA) {
                    squareElements[Sq120To64[sq]].innerHTML += `<span class="num">${rank + 1}<span>`
                }
                if (rank === Rank1) {
                    squareElements[Sq120To64[sq]].innerHTML += `<span class="alpha">${FileChar[file]}<span>`
                }
                squareElements[Sq120To64[sq]].style.gridRow = 8 - rank;
                squareElements[Sq120To64[sq]].style.gridColumn = file + 1;
            }
        }
        graphicalBoard.classList.remove('flip');
    }
    gui.addInteraction();
}

function moveNotation(move, checkMate = false) {
    let from = moveFrom(move);
    let to = moveTo(move);
    let piece = PieceType[gameBoard.pieces[to]].toUpperCase();
    let capture = ((move & CaptureFlag) || (move & EnPassantFlag)) ? 'x' : '';
    let check = (gameBoard.checkSq !== Squares.noSq) ? '+' : '';
    if (checkMate) check = '#';
    let notation;

    if ((move & PromotionFlag) || piece === 'P') {
        notation = capture + SquaresChar[to];
        if (capture) {
            notation = SquaresChar[from][0] + notation;
        }
        if (move & PromotionFlag) {
            notation += '=' + piece;
        }

        return notation + check;
    }
    else {
        if (move & CastleFlag) {
            if (fileOf(to) === FileG) return 'o-o'
            return 'o-o-o';
        }
        const disambiguation = getDisambiguation(from, to);
        return piece + disambiguation + capture + SquaresChar[to] + check;
    }
    return moveStr(move);
}
function getDisambiguation(from, to) {
    let piece = gameBoard.pieces[to];
    const samePieceMove = [from];

    if (PieceType[piece] === 'n' || PieceType[piece] === 'k') {
        for (const direction of PieceDirections[piece]) {
            let targetSq = to + direction;
            if (gameBoard.pieces[targetSq] === piece) {
                samePieceMove.push(targetSq);
            }
        }
    }
    else {
        for (const direction of PieceDirections[piece]) {
            let targetSq = to + direction;
            while (gameBoard.pieces[targetSq] !== Squares.noSq) {
                if (gameBoard.pieces[targetSq] !== Pieces.empty) {
                    if (gameBoard.pieces[targetSq] === piece) {
                        samePieceMove.push(targetSq);
                    }
                    break;
                }
                targetSq += direction;
            }
        }
    }

    //no other piece able to cause ambiguity
    if (samePieceMove.length === 1) {
        return '';
    }

    let sameRank = samePieceMove.filter(sq => rankOf(from) === rankOf(sq));
    let sameFile = samePieceMove.filter(sq => fileOf(from) === fileOf(sq));

    if (sameFile.length === 1) return SquaresChar[from][0];
    if (sameRank.length === 1) return SquaresChar[from][1];
    return SquaresChar[from];
}

let promotionUl;
function choosePromotionPiece(move) {
    let toSq = moveTo(move);
    promotionUl = document.createElement('ul');
    promotionUl.classList.add(gameBoard.side === Color.white ? 'white' : 'black');

    let pieces = 'qrbn';
    for (const piece of pieces) {
        const pieceElement = document.createElement('li');
        pieceElement.classList.add('piece', SideChar[gameBoard.side] + piece);
        promotionUl.appendChild(pieceElement);
    }
    squareElements[Sq120To64[toSq]].appendChild(promotionUl);

    promotionUl.childNodes.forEach(piece => {
        piece.addEventListener('click', () => {
            let promoteTo = Pieces[piece.classList[1]];
            move = updatePromotion(move, promoteTo);
            promotionUl.remove();
            gui.doMove(move);
            promotionMove = null;
        })
    })
}