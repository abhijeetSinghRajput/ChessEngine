const gameBoard = {};

gameBoard.pieces = new Array(120);
gameBoard.side = Color.white;
gameBoard.castlePermission = 0;
gameBoard.enPassantSq = Squares.noSq;
gameBoard.fiftyMove = 0;
gameBoard.checkSq = Squares.noSq;
gameBoard.positionKey = 0;

gameBoard.pieceList = new Array(13);
gameBoard.pieceCount = new Array(13);
gameBoard.material = new Array(2);
gameBoard.history = [];

function resetBoard() {
    for (let i = 0; i < 120; ++i) {
        gameBoard.pieces[i] = Squares.offBoard;
    }
    for (const sq of Sq64To120) {
        gameBoard.pieces[sq] = Pieces.empty;
    }

    for (let i = 0; i < 13; ++i) {
        gameBoard.pieceList[i] = [];
        gameBoard.pieceCount[i] = 0;
    }

    gameBoard.material[Color.white] = 0;
    gameBoard.material[Color.black] = 0;

    gameBoard.side = Color.white;
    gameBoard.castlePermission = 0;
    gameBoard.enPassantSq = Squares.noSq;
    gameBoard.fiftyMove = 0;
    gameBoard.checkSq = Squares.noSq;
    gameBoard.positionKey = 0;
    gameBoard.history = [];
}

function parseFen(fen) {
    resetBoard();

    const [position, side, castlePermission, enPassantSq] = fen.split(' ');
    const map = {
        P: Pieces.wp, R: Pieces.wr, N: Pieces.wn, B: Pieces.wb, Q: Pieces.wq, K: Pieces.wk,
        p: Pieces.bp, r: Pieces.br, n: Pieces.bn, b: Pieces.bb, q: Pieces.bq, k: Pieces.bk,
    };

    let rank = Rank8;
    let file = FileA;

    for (const char of position) {
        if (char === '/') {
            rank--;
            file = FileA;
            continue;
        }

        if (char >= '1' && char <= '8') {
            file += +char;
        }
        else {
            let sq = fileRank2Sq(file++, rank);
            gameBoard.pieces[sq] = map[char];
        }
    }

    gameBoard.side = (side === 'w') ? Color.white : Color.black;

    for (const char of castlePermission) {
        gameBoard.castlePermission |= CastleBit[char];
    }

    if (enPassantSq !== '-') {
        gameBoard.enPassantSq = Squares[enPassantSq];
    }

    //update value of pieces, pieceCount, and piece points
    updateMaterial();

    //is opponent king  in check
    let opponentKing = gameBoard.pieceList[Kings[gameBoard.side]][0];
    if (isUnderAttack(opponentKing, gameBoard.side ^ 1)) {
        gameBoard.checkSq = gameBoard.pieceList[Kings[gameBoard.side]][0];
    }

    //assign a unique key for each different position
    generatePositionKey();
}












function generatePositionKey() {
    for (const sq of Sq64To120) {
        let piece = gameBoard.pieces[sq];
        if (piece !== Pieces.empty) {
            hashPiece(sq, piece);
        }
    }
    hashCastle();
    if (gameBoard.side === Color.white) {
        hashSide();
    }
    if (gameBoard.enPassantSq !== Squares.noSq) {
        hashEnPassant();
    }
}

function updateMaterial() {
    for (const sq of Sq64To120) {
        let piece = gameBoard.pieces[sq];
        if (piece !== Pieces.empty) {
            gameBoard.pieceList[piece].push(sq);
            gameBoard.pieceCount[piece]++;
            gameBoard.material[PieceColor[piece]] += PieceValue[piece];
        }
    }
}

function printBoard() {
    let line = '';
    for (let rank = Rank8; rank >= Rank1; --rank) {
        line = rank + '    ';
        for (let file = FileA; file <= FileH; ++file) {
            let sq = fileRank2Sq(file, rank);
            let piece = gameBoard.pieces[sq];
            line += ' ' + PieceChar[piece] + ' ';
        }
        console.log(line);
    }

    line = '\n      ';
    for (let file = 0; file < 8; ++file) {
        line += FileChar[file] + '  ';
    }
    console.log(line);

    console.log('side :', SideChar[gameBoard.side]);
    console.log('castle :', gameBoard.castlePermission.toString(2));
    if (gameBoard.enPassantSq !== Squares.noSq) {
        console.log('enPassant :', SquaresChar[gameBoard.enPassantSq])
    }
    console.log('\x1b[33m' + 'hashKey : ' + gameBoard.positionKey.toString(16));

    if (gameBoard.checkSq !== Squares.noSq) {
        console.log('\x1b[31m' + 'check : ' + SquaresChar[gameBoard.checkSq])
    }
}

function getFen() {
    let fen = '';
    for (let rank = Rank8; rank >= Rank1; --rank) {
        let emptySq = 0;
        for (let file = FileA; file <= FileH; ++file) {
            let sq = fileRank2Sq(file, rank);
            let piece = gameBoard.pieces[sq];

            if (piece === Pieces.empty) {
                emptySq++;
            }
            else {
                if (emptySq) {
                    fen += emptySq;
                    emptySq = 0;
                }
                fen += PieceChar[piece];
            }
        }
        if (emptySq) {
            fen += emptySq;
        }
        if (rank !== Rank1) {
            fen += '/'
        }
    }

    fen += ' ' + SideChar[gameBoard.side] + ' ';
    if (gameBoard.castlePermission) {
        if (gameBoard.castlePermission & CastleBit.K) fen += 'K';
        if (gameBoard.castlePermission & CastleBit.Q) fen += 'Q';
        if (gameBoard.castlePermission & CastleBit.k) fen += 'k';
        if (gameBoard.castlePermission & CastleBit.q) fen += 'q';
    }
    else {
        fen += '-';
    }

    if (gameBoard.enPassantSq !== Squares.noSq) {
        fen += ' ' + SquaresChar[gameBoard.enPassantSq];
    }
    else {
        fen += ' - '
    }
    return fen;
}

function isUnderAttack(sq, attakingSide) {
    if (attakingSide === Color.white) {
        if (gameBoard.pieces[sq - 9] === Pieces.wp || gameBoard.pieces[sq - 11] === Pieces.wp) {
            return true;
        }
    }
    else {
        if (gameBoard.pieces[sq + 9] === Pieces.bp || gameBoard.pieces[sq + 11] === Pieces.bp) {
            return true;
        }
    }

    //non sliding attack
    for (const attakingPiece of NonSlidingPiece[attakingSide]) {
        for (const direction of PieceDirections[attakingPiece]) {
            let targetSq = sq + direction;

            if (gameBoard.pieces[targetSq] === attakingPiece) {
                return true;
            }
        }
    }

    for (const attakingPiece of SlidingPieces[attakingSide]) {
        for (const direction of PieceDirections[attakingPiece]) {
            let targetSq = sq + direction;
            while (targetSq !== Squares.offBoard) {
                if (gameBoard.pieces[targetSq] !== Pieces.empty) {
                    if (gameBoard.pieces[targetSq] === attakingPiece) {
                        return true;
                    }
                    break;
                }
                targetSq += direction;
            }
        }
    }

    return false;
}