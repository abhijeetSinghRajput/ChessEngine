let gameBoard = {};

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

function isValidFen(fen) {
    const [position, side, castling, enPassant] = fen.split(' ');

    const rows = position.split('/');
    if (rows.length !== 8) {
        throw new Error('FEN string should contain exactly 8 rows separated by slashes.');
    }

    const validPosition = rows.every(row => {
        let count = 0;
        for (let char of row) {
            if (char >= '1' && char <= '8') {
                count += parseInt(char);
            } else if ('pnbrqkPNBRQK'.includes(char)) {
                count++;
            } else {
                throw new Error(`Invalid character "${char}" found in FEN position.`);
            }
        }
        return count === 8;
    });

    if (!validPosition) {
        throw new Error('Each row in FEN position must sum to exactly 8 squares.');
    }

    if (!['w', 'b'].includes(side)) {
        throw new Error('Side to move must be either "w" (white) or "b" (black).');
    }

    // Validate castling availability
    if (!/^(-|[KQkq]{1,4})$/.test(castling)) {
        throw new Error('Castling availability must be "-" or a combination of "K", "Q", "k", and "q".');
    }

    // Validate en passant target square
    if (!/^(-|[a-h][36])$/.test(enPassant)) {
        throw new Error('En passant target square must be "-" or a valid square (e.g., "e3", "d6").');
    }

    return true;
}

function parseFen(fen) {
    try {
        isValidFen(fen)
    }
    catch (error) {
        console.error(error);
        alert(error.message);
        return;
    }
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
    gameBoard.positionKey = generatePositionKey();
}










function generatePositionKey() {
    let hashKey = 0;
    for (const sq of Sq64To120) {
        let piece = gameBoard.pieces[sq];
        if (piece !== Pieces.empty) {
            hashKey ^= PieceKeys[piece][sq];
        }
    }
    hashKey ^= CastleKeys[gameBoard.castlePermission];

    if (gameBoard.side === Color.white) {
        hashKey ^= SideKey;
    }
    if (gameBoard.enPassantSq !== Squares.noSq) {
        hashKey ^= PieceKeys[Pieces.empty][gameBoard.enPassantSq];
    }
    return hashKey;
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
    PawnBitBoard.init();
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
        fen += ' ' + SquaresChar[gameBoard.enPassantSq] + ' ';
    }
    else {
        fen += ' - '
    }
    fen += gameBoard.fiftyMove + ' ';
    //ply that visible on gui
    fen += ply ? ply : 1;
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
    for (const attakingPiece of NonSlidingPieces[attakingSide]) {
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
