const graphicalBoard = document.getElementById('board');
const hashKey = document.querySelector('#hash-key');
const gui = {};
let guiPieces = {};

// =================================================================
// ===================== Board Initializaation =====================
// =================================================================

gui.renderPieces = function () {
    graphicalBoard.querySelectorAll('.piece').forEach(piece => piece.remove());

    for (const sq of Sq64To120) {
        if (gameBoard.pieces[sq] != Pieces.empty) {
            gui.addPiece(SquaresChar[sq], gameBoard.pieces[sq]);
        }
    }
    if (gameBoard.checkSq != Squares.noSq) {
        addMarker(SquaresChar[gameBoard.checkSq], 'check');
    }
    hashKey.textContent = gameBoard.positionKey.toString(16);
    gui.addBoardInteraction();
}

gui.addBoardInteraction = function () {
    for (const square in guiPieces) {
        let piece = guiPieces[square];
        piece.addEventListener('dragstart', dragStart);
        piece.addEventListener('click', clickOnPiece);
    }
    graphicalBoard.addEventListener('dragover', dragOver);
    graphicalBoard.addEventListener('drop', drop);
    graphicalBoard.addEventListener('click', clickOnSquare);
}

function clickOnPiece(e) {
    let piece = e.target;
    // second click is for move the piece
    // in this case second click to also to select the piece.
    if (guiPieces[fromSq]?.classList[1][0] == piece.classList[1][0]) {
        document.querySelector(`#${fromSq}.highlight`)?.remove();
        removeHints();
    }
    if (fromSq && piece.classList[1][0] != SideChar[gameBoard.side]) {
        drop(e);
    }
    else {
        dragStart(e);
    }
}

function clickOnSquare(e) {
    if (!e.target.classList.contains('piece')) {
        drop(e);
    }
}


gui.addPiece = function (square, piece) {
    const pieceElement = document.createElement('div');
    const pieceName = SideChar[PieceColor[piece]] + PieceType[piece];

    pieceElement.classList.add('piece', pieceName);
    pieceElement.id = square;
    pieceElement.draggable = true;

    //add piece events listener
    pieceElement.addEventListener('dragstart', dragStart);
    pieceElement.addEventListener('click', clickOnPiece);

    guiPieces[pieceElement.id] = pieceElement;
    graphicalBoard.appendChild(pieceElement);
}

gui.removePiece = function (square) {
    guiPieces[square]?.remove();
    delete guiPieces[square];
}

gui.movePiece = function (from, to) {
    guiPieces[from].id = to;
    guiPieces[to] = guiPieces[from];
    delete guiPieces[from];
}




// =================================================================
// ============================ Events =============================
// =================================================================

let fromSq, toSq, moveList;
const promotionWindow = document.querySelectorAll('.promotion-window');

promotionWindow.forEach(promo => {
    promo.addEventListener('click', (e) => {
        let piece = Pieces[e.target.classList[1]];
        promotionMove = updatePromotion(promotionMove, piece);
        promotionWindow[gameBoard.side].style.display = 'none';
        gui.doMove(promotionMove);
    })
})

function dragStart(e) {
    fromSq = getSquare(e);
    moveList = generateMoves();
    showHints(fromSq, moveList);
    addMarker(fromSq, 'highlight');
}


function drop(e) {
    document.querySelector(`#${fromSq}.highlight`)?.remove();
    removeHints();
    toSq = getSquare(e);
    const move = parseMove(fromSq, toSq, moveList);
    if (move & PromotionFlag) {
        promotionMove = move;
        let file = fileOf(moveTo(move));
        promotionWindow[gameBoard.side].classList.add(`file-${FileChar[file]}`);
        promotionWindow[gameBoard.side].style.display = 'flex';
    }
    else {
        gui.doMove(move);
    }
}

function dragOver(e) {
    e.preventDefault();
}




// =================================================================
// =========================== Play Move ===========================
// =================================================================

gui.doMove = function (move, { userMove = true } = {}) {
    if (!move) return;

    let fromSq = SquaresChar[moveFrom(move)];
    let toSq = SquaresChar[moveTo(move)];

    removePrevHighlight();
    addMarker(fromSq, 'highlight');
    addMarker(toSq, 'highlight');

    if (move & EnPassantFlag) {
        if (gameBoard.side == Color.white) {
            this.removePiece(SquaresChar[Squares[toSq] - 10]);
        }
        else {
            this.removePiece(SquaresChar[Squares[toSq] + 10]);
        }
    }
    else if (move & CastleFlag) {
        switch (toSq) {
            case 'g1': this.movePiece('h1', 'f1'); break;
            case 'c1': this.movePiece('a1', 'd1'); break;
            case 'g8': this.movePiece('h8', 'f8'); break;
            case 'c8': this.movePiece('a8', 'd8'); break;
            default: break;
        }
    }

    if (move & CaptureFlag) {
        this.removePiece(toSq);
    }
    if (move & PromotionFlag) {
        this.removePiece(fromSq);
        this.addPiece(fromSq, movePromotionPiece(move));
    }

    this.movePiece(fromSq, toSq);
    doMove(move);
    hashKey.textContent = gameBoard.positionKey.toString(16);

    if (gameBoard.checkSq != Squares.noSq) {
        addMarker(SquaresChar[gameBoard.checkSq], 'check');
    }
    else {
        document.querySelector('.check')?.remove();
    }

    if (isGameOver()) {
        if (userMove) {
            gameOver.classList.add('active');
            addRecord(moveNotation(move, gameBoard.checkSq != Squares.noSq));
        }
        playSound(move, true);
        return;
    }

    if(userMove){
        addRecord(moveNotation(move));
    }
    playSound(move);
}

gui.undoMove = function () {
    const move = undoMove();
    if (!move) return;

    let fromSq = SquaresChar[moveFrom(move)];
    let toSq = SquaresChar[moveTo(move)];

    document.querySelector(`#${fromSq}.highlight`)?.remove();
    document.querySelector(`#${toSq}.highlight`)?.remove();
    let currMove = gameBoard.history[gameBoard.history.length - 1]?.move;
    if (currMove) {
        addMarker(SquaresChar[moveFrom(currMove)], 'highlight');
        addMarker(SquaresChar[moveTo(currMove)], 'highlight');
    }

    if (move & EnPassantFlag) {
        if (gameBoard.side == Color.white) {
            this.addPiece(SquaresChar[Squares[toSq] - 10], Pieces.bp);
        }
        else {
            this.addPiece(SquaresChar[Squares[toSq] + 10], Pieces.wp);
        }
    }
    else if (move & CastleFlag) {
        switch (toSq) {
            case 'g1': this.movePiece('f1', 'h1'); break;
            case 'c1': this.movePiece('d1', 'a1'); break;
            case 'g8': this.movePiece('f8', 'h8'); break;
            case 'c8': this.movePiece('d8', 'a8'); break;
            default: break;
        }
    }
    this.movePiece(toSq, fromSq);
    playSound(move);

    if (move & CaptureFlag) {
        this.addPiece(toSq, moveCapturePiece(move));
    }
    if (move & PromotionFlag) {
        this.removePiece(fromSq);
        let pawn = (PieceColor[movePromotionPiece(move)] == Color.white) ? Pieces.wp : Pieces.bp;
        this.addPiece(fromSq, pawn);
    }

    if (gameBoard.checkSq != Squares.noSq) {
        addMarker(SquaresChar[gameBoard.checkSq], 'check');
    }
    else {
        document.querySelector('.check')?.remove();
    }

    nodeList[currMoveNode].classList.remove('selected');
    currMoveNode = prevMoveNode--;
    nodeList[currMoveNode]?.classList.add('selected');
    undoMoveHistory.push(move);
    if (currMoveNode % 2 != 0) --ply;

    hashKey.textContent = gameBoard.positionKey.toString(16);
}

function moveForward() {
    if (undoMoveHistory.length === 0) {
        return;
    }
    prevMoveNode = currMoveNode++;
    if (currMoveNode % 2 == 0) ++ply;

    let move = undoMoveHistory.pop();
    gui.doMove(move, { userMove: false });

    nodeList[prevMoveNode]?.classList.remove('selected');
    nodeList[currMoveNode]?.classList.add('selected');
}



// =================================================================
// ========================== Move record ==========================
// =================================================================

const records = document.querySelector('.movelist');
let undoMoveHistory = [];
let nodeList = [];
let prevMoveNode = -1;
let currMoveNode = -1;
let ply = 0;
let promotionMove = null;

function addRecord(notation) {
    const node = document.createElement('div');
    const color = gameBoard.side === Color.white ? 'black' : 'white';
    node.classList.add('node', color);
    node.textContent = notation;

    let temp = nodeList.length - currMoveNode - 1;
    while (temp--) {
        let node = nodeList.pop();
        if (node.classList.contains('white')) {
            node.parentElement.remove();
        }
        node.remove();
    }
    undoMoveHistory = [];

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
    records.scrollTop = records.scrollHeight;
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
}

// =================================================================
// ======================= Game Termination ========================
// =================================================================

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

function threeFoldRep() {
    let repetition = 0;
    for (const { positionKey } of gameBoard.history) {
        if (gameBoard.positionKey === positionKey) {
            repetition++;
        }
    }
    return repetition;
}



// =================================================================
// ====================== Auxillury functions ======================
// =================================================================
function newGame() {
    resetGui();
    parseFen(StartingFen);
    gui.renderPieces();
    GameStartSound.play();
}

function resetGui() {
    ply = 0;
    prevMoveNode = -1;
    currMoveNode = -1;
    undoMoveHistory = [];
    nodeList = [];
    records.innerHTML = '';
    guiPieces = {};
    removeHints();
    document.querySelectorAll('.highlight').forEach(e => e.remove());
    document.querySelector('.check')?.remove();
}
function removePrevHighlight() {
    const prevMove = gameBoard.history[gameBoard.history.length - 1]?.move;
    if (prevMove) {
        let fromSq = SquaresChar[moveFrom(prevMove)];
        let toSq = SquaresChar[moveTo(prevMove)];
        document.querySelector(`#${fromSq}.highlight`)?.remove();
        document.querySelector(`#${toSq}.highlight`)?.remove();
    }
}
function playSound(move, gameEnd = false) {
    if (gameEnd) GameEndSound.play();
    else if (gameBoard.checkSq != Squares.noSq) CheckSound.play();
    else if (move & PromotionFlag) PromoteSound.play();
    else if (move & CaptureFlag) CaptureSound.play();
    else if (move & EnPassantFlag) CaptureSound.play();
    else if (move & CastleFlag) CastleSound.play();
    else if (gameBoard.side == Color.white) SelfMoveSound.play();
    else EnemyMoveSound.play();
}
function parseMove(fromSq, toSq, movelist) {
    fromSq = Squares[fromSq];
    toSq = Squares[toSq];


    let found = null;
    for (const { move } of movelist) {
        if (moveFrom(move) === fromSq && moveTo(move) === toSq) {
            found = move;
            break;
        }
    }

    if (found) {
        if (!doMove(found)) {
            IllegalSound.play();
            return null;
        }
        undoMove();
    }

    return found;
}

function showHints(fromSq, movelist) {
    fromSq = Squares[fromSq];

    const hints = movelist.filter(({ move }) => {
        //filtering move for piece on 'fromSq' 
        if (moveFrom(move) == fromSq) {
            //filtering legal move
            if (doMove(move) == false) {
                return false;
            }
            else {
                undoMove();
                return true;
            }
        }
    });
    hints.forEach(({ move }) => {
        let className = (move & CaptureFlag) ? 'capture-hint' : 'hint';
        addMarker(SquaresChar[moveTo(move)], className);
    });
}

function removeHints() {
    document.querySelectorAll('.hint').forEach(hint => hint.remove());
    document.querySelectorAll('.capture-hint').forEach(hint => hint.remove());
}


function getSquare(e) {
    // dont use graphicalBoard.offset using it doesnt consider floting valute use this
    let x = e.clientX - graphicalBoard.getBoundingClientRect().left;
    let y = e.clientY - graphicalBoard.getBoundingClientRect().top;

    let squareSize = graphicalBoard.clientWidth / 8;
    let file = Math.floor(x / squareSize);
    let rank = 7 - Math.floor(y / squareSize);

    if (graphicalBoard.classList.contains('flipped')) {
        file = 7 - file;
        rank = 7 - rank;
    }

    let square = fileRank2Sq(file, rank);
    return SquaresChar[square];
}


function addMarker(square, className) {
    if (document.querySelector(`#${square}.${className}`)) {
        return;
    }

    const marker = document.createElement('div');
    marker.classList.add(className);
    marker.id = square;
    graphicalBoard.appendChild(marker);
}

