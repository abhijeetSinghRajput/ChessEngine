const graphicalBoard = document.getElementById('board');
const boardLayout = document.querySelector('.board-layout');

const hashKey = document.querySelector('#hash-key');
const gui = {};
let guiPieces = {};

// =================================================================
// ===================== Board Initializaation =====================
// =================================================================
gui.renderPieces = function () {
    document.querySelectorAll('#board>.piece').forEach(piece => piece.remove());

    for (const sq of Sq64To120) {
        if (gameBoard.pieces[sq] != Pieces.empty) {
            gui.addPiece(SquaresChar[sq], gameBoard.pieces[sq]);
        }
    }
    if (gameBoard.checkSq != Squares.noSq) {
        addMarker('check', SquaresChar[gameBoard.checkSq]);
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
// ======================== Event handlers =========================
// =================================================================

let fromSq = toSq = null, moveList;
const promotionWindow = document.querySelectorAll('.promotion-window');
const setupPieces = document.querySelectorAll('.setup-position .piece');
const closeSetup = document.querySelector('.setup-position .close');
const setupPosition = document.querySelector('.setup-position');

const checkboxes = document.querySelectorAll(".checkbox-grid input[type='checkbox']");
checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", function () {
        let bit = +checkbox.id;
        if (this.checked) {
            gameBoard.castlePermission |= bit;
        } else {
            gameBoard.castlePermission &= ~bit;
        }
    });
});

let selected = Pieces.empty;
let setup = false;

closeSetup.addEventListener('click', () => {
    if (gameBoard.pieceList[Pieces.wk].length !== 1 ||
        gameBoard.pieceList[Pieces.bk].length !== 1
    ) {
        alert('invalid position');
        return;
    }
    setup = false;
    setupPosition.classList.remove('active');
    selected = Pieces.empty;
})

setupPieces.forEach(piece => {
    piece.addEventListener('click', () => {
        if (piece.classList.contains('selected')) {
            selected = Pieces.empty;
            piece.classList.remove('selected');
            return;
        }
        setupPieces.forEach(piece => piece.classList.remove('selected'));
        selected = Pieces[piece.classList[1]];
        piece.classList.add('selected');
    })
})

promotionWindow.forEach(promo => {
    promo.addEventListener('click', (e) => {
        let piece = Pieces[e.target.classList[1]];
        promotionMove = updatePromotion(promotionMove, piece);
        promotionWindow[gameBoard.side].style.display = 'none';
        gui.doMove(promotionMove);
    })
})

function clickOnPiece(e) {
    let piece = e.target;
    let pieceColor = piece.classList[1][0];
    if (pieceColor == SideChar[gameBoard.side]) {
        dragStart(e);
    }
    else {
        drop(e);
    }
}

function clickOnSquare(e) {
    if (setup) {
        if (PieceType[selected] == 'k') {
            if (gameBoard.pieceList[selected].length) {
                alert('There is already a king present')
                return;
            }
        }
        let sq = getSquare(e);
        if (guiPieces[sq]) {
            removePiece(Squares[sq]);
            gui.removePiece(sq);
            gameBoard.castlePermission &= CastlePermission[Squares[sq]];
        }
        if (selected !== Pieces.empty) {
            addPiece(Squares[sq], selected);
            gui.addPiece(sq, selected);
            addCastlePermission(sq);
        }
        updateCheckBoxes();
        return;
    }


    if (!e.target.classList.contains('piece')) {
        drop(e);
    }
}
function addCastlePermission() {
    if (gameBoard.pieces[Squares.a1] == Pieces.wr && gameBoard.pieces[Squares.e1] == Pieces.wk) {
        gameBoard.castlePermission |= 0b0100; // Set the bit for 'Q'
    } else if (gameBoard.pieces[Squares.e1] == Pieces.wk && gameBoard.pieces[Squares.a1] == Pieces.wr && gameBoard.pieces[Squares.h1] == Pieces.wr) {
        gameBoard.castlePermission |= 0b1100; // Set the bits for 'K' and 'Q'
    } else if (gameBoard.pieces[Squares.h1] == Pieces.wr && gameBoard.pieces[Squares.e1] == Pieces.wk) {
        gameBoard.castlePermission |= 0b1000; // Set the bit for 'K'
    } else if (gameBoard.pieces[Squares.a8] == Pieces.br && gameBoard.pieces[Squares.e8] == Pieces.bk) {
        gameBoard.castlePermission |= 0b0001; // Set the bit for 'q'
    } else if (gameBoard.pieces[Squares.e8] == Pieces.bk && gameBoard.pieces[Squares.a8] == Pieces.br && gameBoard.pieces[Squares.h8] == Pieces.br) {
        gameBoard.castlePermission |= 0b0011; // Set the bits for 'k' and 'q'
    } else if (gameBoard.pieces[Squares.h8] == Pieces.br && gameBoard.pieces[Squares.e8] == Pieces.bk) {
        gameBoard.castlePermission |= 0b0010; // Set the bit for 'k'
    }

}
function updateCheckBoxes() {
    checkboxes.forEach(checkbox => checkbox.checked = false)
    if (gameBoard.castlePermission & CastleBit.K) checkboxes[0].checked = true;
    if (gameBoard.castlePermission & CastleBit.k) checkboxes[1].checked = true;
    if (gameBoard.castlePermission & CastleBit.Q) checkboxes[2].checked = true;
    if (gameBoard.castlePermission & CastleBit.q) checkboxes[3].checked = true;
}




function dragStart(e) {
    if (setup) return;

    removeMarker('hint', '*');
    removeMarker('capture-hint', '*');
    removeMarker('highlight', fromSq);
    fromSq = getSquare(e);
    moveList = generateMoves();
    showHints(fromSq, moveList);
    addMarker('highlight', fromSq);
}

document.addEventListener('mousedown', (e) => {
    if (!graphicalBoard.contains(e.target)) {
        removeMarker('hint', '*');
        removeMarker('capture-hint', '*');
        removeMarker('highlight', fromSq);
        fromSq = null;
    }
})

function drop(e) {
    removeMarker('hint', '*');
    removeMarker('capture-hint', '*');
    removeMarker('highlight', fromSq);

    toSq = getSquare(e);
    const move = parseMove(fromSq, toSq, moveList);
    if (move & PromotionFlag) {
        promotionMove = move;
        let file = fileOf(moveTo(move));

        const classList = promotionWindow[gameBoard.side].classList;
        classList.remove(classList[2]);
        classList.add(`file-${FileChar[file]}`);

        promotionWindow[gameBoard.side].style.display = 'flex';
        //remove the window if clicked outside
        document.addEventListener('mousedown', outSideClick);

        function outSideClick(e) {
            if (!promotionWindow[gameBoard.side].contains(e.target)) {
                promotionWindow[gameBoard.side].style.display = 'none';
                document.removeEventListener('mousedown', outSideClick);
            }
        }
    }
    else {
        gui.doMove(move);
    }
    fromSq = null;
}

function dragOver(e) {
    e.preventDefault();
}




// =================================================================
// =========================== Play Move ===========================
// =================================================================
const worker = new Worker('js/searchWorker.js');
const lines = document.querySelectorAll('.line');
const mateIn = document.querySelector('#mateIn span');

function updateLine(line) {
    lines[0].textContent = lines[1].textContent;
    lines[1].textContent = lines[2].textContent;
    lines[2].textContent = line;
}

worker.onmessage = function (e) {
    const { bestMove, command, depth, pvLine, bestScore, nodes, ordering } = e.data;
    if (command == 'searching') {
        searchDepth[gameBoard.side].textContent = depth;
        let line = `${depth} ordering: ${ordering}% nodes: ${nodes}  score: ${bestScore} ${pvLine}`
        updateLine(line);
    }
    //search finished
    else {
        engine.thinking = false;
        if (Math.abs(bestScore) > Mate) {
            mateIn.textContent = Infinite - Math.abs(bestScore);
            mateIn.parentElement.style.display = 'block';
        }
        else {
            mateIn.parentElement.style.display = 'none';
        }

        if (bestMove & FromBookFlag) {
            setTimeout(() => {
                gui.doMove(bestMove, {
                    userMove: false,
                    engineMove: true,
                });
            }, 200);
        }
        else {
            gui.doMove(bestMove, {
                userMove: false,
                engineMove: true,
            });
        }
    }
}
worker.onerror = function (e) {
    console.error('worker error:', e.message);
}

const engine = {

    //(-1 none) (0 white) (1 black) (2 both)
    side: Color.both,
    isRunning: false,
    searchTime: [2, 2],
    thinking: false,

    updateSide: function () {
        let blackActive = blackBotToggle.classList.contains('active');
        let whiteActive = whiteBotToggle.classList.contains('active');

        if (blackActive && whiteActive) {
            this.isRunning = true;
            this.side = Color.both;
        }
        else if (!blackActive && !whiteActive) {
            this.isRunning = false;
            this.side = -1;
        }
        else if (whiteActive) {
            this.isRunning = true;
            this.side = Color.white;
        }
        else {
            this.isRunning = true;
            this.side = Color.black;
        }
    },
    stop() {
        searchDepth[0].textContent = '';
        searchDepth[1].textContent = '';

        this.isRunning = false;
        this.side = -1;
        blackBotToggle.classList.remove('active');
        whiteBotToggle.classList.remove('active');
    },
    play: function () {
        if (!this.isRunning || this.thinking) return;

        if (this.side == Color.both || this.side == gameBoard.side) {
            if (isGameOver()) return;
            this.thinking = true;
            worker.postMessage({
                command: 'search',
                searchTime: this.searchTime[gameBoard.side],
                board: gameBoard,
            });
        }
    }
}

const whiteBotToggle = document.getElementById('whiteBot')
const blackBotToggle = document.getElementById('blackBot')
const searchDepth = [
    document.querySelector('.player.white sup#searchDepth'),
    document.querySelector('.player.black sup#searchDepth')
];

setTimeout(() => {
    for (const botToggle of [whiteBotToggle, blackBotToggle]) {
        botToggle.addEventListener('click', () => {
            botToggle.classList.toggle('active');
            engine.updateSide();
            engine.play();
        })
    }
}, 1000);

gui.doMove = function (move, { userMove = true, engineMove = false, audio = true } = {}) {
    if (!move) return;
    if (engine.thinking) {
        alert('can you please wait. engine is thinking now');
        return;
    }
    let fromSq = SquaresChar[moveFrom(move)];
    let toSq = SquaresChar[moveTo(move)];

    removePrevHighlight();
    addMarker('highlight', fromSq);
    addMarker('highlight', toSq);

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
    this.updateCapture(move);

    hashKey.textContent = gameBoard.positionKey.toString(16);

    if (gameBoard.checkSq != Squares.noSq) {
        addMarker('check', SquaresChar[gameBoard.checkSq]);
    }
    else {
        removeMarker('check', '*');
    }

    if (isGameOver()) {
        if (userMove || engineMove) {
            gameOver.classList.add('active');
            addRecord(moveNotation(move, gameBoard.checkSq != Squares.noSq));
        }
        if (audio) playSound(move, true);
        return;
    }

    if (audio) playSound(move);

    if (userMove || engineMove) {
        addRecord(moveNotation(move));
        engine.play();
    }
}

gui.undoMove = function ({ audio = true } = {}) {
    if (engine.thinking) {
        alert('can you please wait. engine is thinking now');
        return;
    }
    const move = undoMove();
    if (!move) return;
    this.updateCapture(move, { reverse: true });

    let fromSq = SquaresChar[moveFrom(move)];
    let toSq = SquaresChar[moveTo(move)];
    //remove from undo move
    removeMarker('highlight', fromSq)
    removeMarker('highlight', toSq)

    //add to last played move
    let currMove = gameBoard.history[gameBoard.history.length - 1]?.move;
    if (currMove) {
        addMarker('highlight', SquaresChar[moveFrom(currMove)]);
        addMarker('highlight', SquaresChar[moveTo(currMove)]);
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
    if (audio) playSound(move);

    if (move & CaptureFlag) {
        this.addPiece(toSq, moveCapturePiece(move));
    }
    if (move & PromotionFlag) {
        this.removePiece(fromSq);
        let pawn = (PieceColor[movePromotionPiece(move)] == Color.white) ? Pieces.wp : Pieces.bp;
        this.addPiece(fromSq, pawn);
    }

    if (gameBoard.checkSq != Squares.noSq) {
        addMarker('check', SquaresChar[gameBoard.checkSq]);
    }
    else {
        removeMarker('check', '*');
    }

    nodeList[currMoveNode].classList.remove('selected');
    currMoveNode = prevMoveNode--;
    nodeList[currMoveNode]?.classList.add('selected');
    undoMoveHistory.push(move);
    if (currMoveNode % 2 != 0) --ply;

    hashKey.textContent = gameBoard.positionKey.toString(16);
}

function moveForward({ audio = true } = {}) {
    if (undoMoveHistory.length === 0) {
        return;
    }
    prevMoveNode = currMoveNode++;
    if (currMoveNode % 2 == 0) ++ply;

    let move = undoMoveHistory.pop();
    gui.doMove(move, { userMove: false, audio });

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
    node.id = currMoveNode;
    node.addEventListener('click', clickOnNode);

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

function clickOnNode(e) {
    let id = e.target.id;
    if (id == currMoveNode) return;
    PremoveSound.play();
    while (currMoveNode != id) {
        if (currMoveNode > id) {
            gui.undoMove({ audio: false });
        }
        else {
            moveForward({ audio: false });
        }
    }
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
            if (fileOf(to) === FileG) return 'O-O' + check;
            return 'O-O-O' + check;
        }
        const disambiguation = getDisambiguation(from, to);
        return piece + disambiguation + capture + SquaresChar[to] + check;
    }

    function getDisambiguation(from, to) {
        let piece = gameBoard.pieces[to];
        let samePieceMove = [];
        //since the move has been performed. so take back the piece
        movePiece(to, from);

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

        // move the piece to actual position
        movePiece(from, to);

        //no other piece able to cause ambiguity
        if (samePieceMove.length === 1) {
            return '';
        }

        movePiece(to, from);
        samePieceMove = samePieceMove.filter((sq) => {
            //move the piece to 'to' and check is it ligal
            movePiece(sq, to);
            let king = gameBoard.pieceList[Kings[gameBoard.side ^ 1]][0];
            let legal = !isUnderAttack(king, gameBoard.side);
            //move the piece back
            movePiece(to, sq);
            return legal;
        })
        movePiece(from, to);

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
const [whitePlayer, blackPlayer] = document.querySelectorAll('.game-over .player');

function isGameOver() {
    if (gameBoard.fiftyMove >= 100) {
        resultTitle.textContent = 'Draw';
        resultSubTitle.textContent = 'by fiftymove'
        whitePlayer.classList.remove('winner');
        blackPlayer.classList.remove('winner');
        return true;
    }

    if (threeFoldRep() >= 2) {
        resultTitle.textContent = 'Draw';
        resultSubTitle.textContent = 'by threefold'
        whitePlayer.classList.remove('winner');
        blackPlayer.classList.remove('winner');
        return true;
    }

    if (drawMaterial()) {
        resultTitle.textContent = 'Draw';
        resultSubTitle.textContent = 'by ensufficient matterial'
        whitePlayer.classList.remove('winner');
        blackPlayer.classList.remove('winner');
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
            whitePlayer.classList.remove('winner');
            blackPlayer.classList.add('winner');
            playWinAnimation();
        }
        else {
            resultTitle.textContent = 'White Won';
            blackPlayer.classList.remove('winner');
            whitePlayer.classList.add('winner');
            playWinAnimation();
        }
        resultSubTitle.textContent = 'by checkmate'
        return true;
    }
    else {
        resultTitle.textContent = 'Draw';
        resultSubTitle.textContent = 'by Stalemate'
        whitePlayer.classList.remove('winner');
        blackPlayer.classList.remove('winner');
        return true;
    }
}
function playWinAnimation() {
    setTimeout(() => {
        winAnimation.style.display = 'block';
        winAnimation.seek(0);
        winAnimation.play();
    }, 500);

    setTimeout(() => {
        winAnimation.style.display = 'none';
    }, 2500);
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
function newGame(fen) {
    if (!fen) fen = StartingFen;

    try {
        parseFen(fen);
    } catch (error) {
        console.error(error);
        alert(error);
    }

    resetGui();
    transpositionTable.clear();
    gui.renderPieces();
    GameStartSound.play();
}

function resetGui() {
    lines.forEach(line => line.textContent = '');
    mateIn.parentElement.style.display = 'none';

    ply = 0;
    prevMoveNode = -1;
    currMoveNode = -1;
    undoMoveHistory = [];
    nodeList = [];
    records.innerHTML = '';
    guiPieces = {};

    engine.stop();

    removeAllMarker();
    const allCaptures = [...captures[0], ...captures[1]];
    for (const capture of allCaptures) {
        let currentClass = capture.classList[1];
        let newClass = currentClass.replace(/\d+$/, '0');
        capture.classList.replace(currentClass, newClass);
    }
}
function removePrevHighlight() {
    const prevMove = gameBoard.history[gameBoard.history.length - 1]?.move;
    if (prevMove) {
        let fromSq = SquaresChar[moveFrom(prevMove)];
        let toSq = SquaresChar[moveTo(prevMove)];
        removeMarker('highlight', fromSq);
        removeMarker('highlight', toSq);
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
        addMarker(className, SquaresChar[moveTo(move)]);
    });
}




function getSquare(e) {
    // dont use graphicalBoard.offset using it doesnt consider floting valute use this
    let x = e.clientX - graphicalBoard.getBoundingClientRect().left;
    let y = e.clientY - graphicalBoard.getBoundingClientRect().top;

    let squareSize = graphicalBoard.clientWidth / 8;
    let file = Math.floor(x / squareSize);
    let rank = 7 - Math.floor(y / squareSize);

    if (boardLayout.classList.contains('flipped')) {
        file = 7 - file;
        rank = 7 - rank;
    }

    let square = fileRank2Sq(file, rank);
    return SquaresChar[square];
}

const markers = {
    'highlight': {},
    'hint': {},
    'capture-hint': {},
    'check': {},
};

function removeMarker(className, square) {
    if (square == '*') {
        for (const square in markers[className]) {
            const marker = markers[className][square];
            marker.remove();
            delete markers[className][square];
        }
        return;
    }
    const marker = markers[className][square];
    if (marker) {
        marker.remove();
        delete markers[className][square];
    }
}
function removeAllMarker() {
    removeMarker('hint', '*');
    removeMarker('capture-hint', '*');
    removeMarker('highlight', '*')
    removeMarker('check', '*');
}
function addMarker(className, square) {
    //check if marker already exist
    if (markers[className][square]) return;

    const marker = document.createElement('div');
    markers[className][square] = marker;
    marker.classList.add(className);
    marker.id = square;
    graphicalBoard.appendChild(marker);
}

let captures = [
    document.querySelectorAll('.player.white .capture'),
    document.querySelectorAll('.player.black .capture'),
]
gui.updateCapture = function (move, { reverse = false } = {}) {
    if (gameBoard.side == Color.white) {
        if (gameBoard.pieceCount[Pieces.wr] > 2) return;
        if (gameBoard.pieceCount[Pieces.wn] > 2) return;
        if (gameBoard.pieceCount[Pieces.wb] > 2) return;
        if (gameBoard.pieceCount[Pieces.wq] > 1) return;
        if (gameBoard.pieceCount[Pieces.wp] > 8) return;
    }
    else {
        if (gameBoard.pieceCount[Pieces.br] > 2) return;
        if (gameBoard.pieceCount[Pieces.bn] > 2) return;
        if (gameBoard.pieceCount[Pieces.bb] > 2) return;
        if (gameBoard.pieceCount[Pieces.bq] > 1) return;
        if (gameBoard.pieceCount[Pieces.bp] > 8) return;
    }

    let attackerSide = (reverse) ? gameBoard.side : gameBoard.side ^ 1;
    let capturePiece = moveCapturePiece(move);
    if (move & EnPassantFlag) {
        capturePiece = (gameBoard.side == Color.white) ? Pieces.wp : Pieces.bp;
    }
    const map = {
        p: 0,
        b: 1,
        n: 2,
        r: 3,
        q: 4,
    };
    //add capture
    if (capturePiece) {
        let pieceName = PieceName[capturePiece];//eg wp (white pawn)
        let pieceIndex = map[pieceName[1]];//eg: map['p']

        //eg:classList[1] = wp-0 
        let captureCount = +captures[attackerSide][pieceIndex].classList[1][3];
        let newCaptureCount = (reverse) ? captureCount - 1 : captureCount + 1;
        captures[attackerSide][pieceIndex].classList.replace(
            `${pieceName}-${captureCount}`,
            `${pieceName}-${newCaptureCount}`
        )
    }

    //remove capture from opponent.
    if (move & PromotionFlag) {
        let promotedPiece = movePromotionPiece(move);
        let pieceName = PieceName[promotedPiece];
        let pieceIndex = map[pieceName[1]];

        //eg:classList[1] = wp-0 
        let captureCount = +captures[attackerSide ^ 1][pieceIndex].classList[1][3];
        if (captureCount == 0) return;

        let newCaptureCount = (reverse) ? captureCount + 1 : captureCount - 1;
        captures[attackerSide][pieceIndex].classList.replace(
            `${pieceName}-${captureCount}`,
            `${pieceName}-${newCaptureCount}`
        )
    }
}



