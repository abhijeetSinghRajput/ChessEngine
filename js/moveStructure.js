//move structure                       set Mask
// 0000 0000 0000 0000 0000 0111 1111   0x7f          from
// 0000 0000 0000 0011 1111 1000 0000   0x7f          to
// 0000 0000 0011 1100 0000 0000 0000   0xf           capture piece
// 0000 0011 1100 0000 0000 0000 0000   0xf           promoted piece
// 0000 0100 0000 0000 0000 0000 0000   0x40000       enpassant
// 0000 1000 0000 0000 0000 0000 0000   0x80000       castle
// 0001 0000 0000 0000 0000 0000 0000   0x1000000     pawnstart


//space complexity:- 
//  8byte for each 7 properties 56 bytes
//  24bytes for objected itself
//  80bytes total

// our program gonna exceed 119 million moves in just by reaching to the depth of 6
// 80 bytes x 119,000,000 = 9.52 GB

// we can redure the sapce complexity by encoding these information binary representation of a single number;
// 1 bytes x 119,000,000 = 113.48 MB


//flags 🚩
const EnPassantFlag = 0x400000;
const CastleFlag = 0x800000;
const PawnStartFlag = 0x1000000;

const CaptureFlag = 0x3c000;
const PromotionFlag = 0x3c0000;

function buildMove(from, to, capturedPiece, promotedPiece, flag) {
    return from | (to << 7) | (capturedPiece << 14) | (promotedPiece << 18) | flag;
}


function moveFrom(move) {
    return (move & 0x7f);
}
function moveTo(move) {
    return (move >> 7) & 0x7f;

}
function moveCapturePiece(move) {
    return (move >> 14) & 0xf;
}
function movePormotionPiece(move) {
    return (move >> 18) & 0xf;
}

function moveDetail(move) {
    if (!move) return;

    console.log('from :', SquaresChar[moveFrom(move)]);
    console.log('to :', SquaresChar[moveTo(move)]);
    console.log('capture :', PieceChar[moveCapturePiece(move)]);
    console.log('promotion :', PieceChar[movePormotionPiece(move)]);

    if (move & EnPassantFlag) console.log('flag : enPassant');
    if (move & PawnStartFlag) console.log('flag : pawn start');
    if (move & CastleFlag) console.log('flag : castle');
    console.log('');
}

function movePiece(from, to) {
    let piece = gameBoard.pieces[from];
    
    if(piece == Pieces.wp){
        whitePawnMask &= ~(1n << BigInt(Sq120To64[from]));
        whitePawnMask |= (1n << BigInt(Sq120To64[to]));
    }
    else if(piece == Pieces.bp){
        blackPawnMask &= ~(1n << BigInt(Sq120To64[from]));
        blackPawnMask |= (1n << BigInt(Sq120To64[to]));
    }

    hashPiece(from, piece);
    gameBoard.pieces[from] = Pieces.empty;

    hashPiece(to, piece);
    gameBoard.pieces[to] = piece;

    for (let i = 0; i < gameBoard.pieceCount[piece]; ++i) {
        if (gameBoard.pieceList[piece][i] === from) {
            gameBoard.pieceList[piece][i] = to
            return;
        }
    }
}
function addPiece(sq, piece) {
    if (gameBoard.pieces[sq] !== Pieces.empty) {
        console.error('add piece error');
        return;
    }
    hashPiece(sq, piece);
    gameBoard.pieces[sq] = piece;
    gameBoard.material[PieceColor[piece]] += PieceValue[piece];
    gameBoard.pieceList[piece].push(sq);
    gameBoard.pieceCount[piece]++;

    if(piece == Pieces.wp){
        whitePawnMask |= (1n << BigInt(Sq120To64[sq]));
    }
    else if(piece == Pieces.bp){
        blackPawnMask |= (1n << BigInt(Sq120To64[sq]));
    }
}

function removePiece(sq) {
    let piece = gameBoard.pieces[sq];
    hashPiece(sq, piece);
    gameBoard.pieces[sq] = Pieces.empty;
    gameBoard.material[PieceColor[piece]] -= PieceValue[piece];

    for (let i = 0; i < gameBoard.pieceCount[piece]; ++i) {
        if (gameBoard.pieceList[piece][i] === sq) {
            let lastIndex = gameBoard.pieceCount[piece] - 1;
            gameBoard.pieceList[piece][i] = gameBoard.pieceList[piece][lastIndex];
            gameBoard.pieceList[piece].pop();
            break;
        }
    }
    gameBoard.pieceCount[piece]--;

    if(piece == Pieces.wp){
        whitePawnMask &= ~(1n << BigInt(Sq120To64[sq]));
    }
    else if(piece == Pieces.bp){
        blackPawnMask &= ~(1n << BigInt(Sq120To64[sq]));
    }
}


function doMove(move) {
    if (!move) {
        return;
    }
    const from = moveFrom(move);
    const to = moveTo(move);
    const side = gameBoard.side;
    const piece = gameBoard.pieces[from];
    gameBoard.history.push({
        fiftyMove: gameBoard.fiftyMove,
        positionKey: gameBoard.positionKey,
        enPassantSq: gameBoard.enPassantSq,
        castlePermission: gameBoard.castlePermission,
        checkSq: gameBoard.checkSq,
        move,
    });

    if (move & EnPassantFlag) {
        if (side === Color.white) {
            removePiece(to - 10);
        } else {
            removePiece(to + 10);
        }
    }
    else if (move & CastleFlag) {
        switch (to) {
            case Squares.g1: movePiece(Squares.h1, Squares.f1); break;
            case Squares.c1: movePiece(Squares.a1, Squares.d1); break;

            case Squares.g8: movePiece(Squares.h8, Squares.f8); break;
            case Squares.c8: movePiece(Squares.a8, Squares.d8); break;

            default: break;
        }
    }
    //hash out
    if (gameBoard.enPassantSq !== Squares.noSq) {
        hashEnPassant();
    }
    hashCastle();

    gameBoard.castlePermission &= CastlePermission[from];
    gameBoard.castlePermission &= CastlePermission[to];
    gameBoard.enPassantSq = Squares.noSq;

    //hash in
    hashCastle();

    gameBoard.fiftyMove++;

    if (PieceType[piece] === 'p') {
        gameBoard.fiftyMove = 0;
        if (move & PawnStartFlag) {
            if (side === Color.white) {
                gameBoard.enPassantSq = from + 10;
            }
            else {
                gameBoard.enPassantSq = from - 10;
            }
            hashEnPassant();
        }
    }

    if (move & CaptureFlag) {
        gameBoard.fiftyMove = 0;
        removePiece(to);
    }
    movePiece(from, to);

    if (move & PromotionFlag) {
        removePiece(to);
        addPiece(to, movePormotionPiece(move));
    }

    gameBoard.side ^= 1;
    hashSide();

    let kingOnSq = gameBoard.pieceList[Kings[side]][0];
    let enemyKingOnSq = gameBoard.pieceList[Kings[gameBoard.side]][0];

    if (isUnderAttack(kingOnSq, gameBoard.side)) {
        undoMove();
        return false;
    }

    if (isUnderAttack(enemyKingOnSq, side)) {
        gameBoard.checkSq = enemyKingOnSq;
    }
    else {
        gameBoard.checkSq = Squares.noSq;
    }
    return true;
}

function undoMove() {
    if (gameBoard.history.length === 0) {
        return;
    }

    const {
        fiftyMove,
        enPassantSq,
        castlePermission,
        checkSq,
        move,
    } = gameBoard.history.pop();

    if (gameBoard.enPassantSq != Squares.noSq) {
        hashEnPassant();
    }
    hashCastle();

    gameBoard.fiftyMove = fiftyMove;
    gameBoard.enPassantSq = enPassantSq;
    gameBoard.castlePermission = castlePermission;
    gameBoard.checkSq = checkSq;

    if (gameBoard.enPassantSq != Squares.noSq) {
        hashEnPassant();
    }
    hashCastle();

    gameBoard.side ^= 1;
    hashSide();

    const from = moveFrom(move);
    const to = moveTo(move);

    if (move & EnPassantFlag) {
        if (gameBoard.side === Color.white) {
            addPiece(to - 10, Pieces.bp);
        }
        else {
            addPiece(to + 10, Pieces.wp);
        }
    }
    else if (move & CastleFlag) {
        switch (to) {
            case Squares.g1: movePiece(Squares.f1, Squares.h1); break;
            case Squares.c1: movePiece(Squares.d1, Squares.a1); break;

            case Squares.g8: movePiece(Squares.f8, Squares.h8); break;
            case Squares.c8: movePiece(Squares.d8, Squares.a8); break;

            default: break;
        }
    }


    movePiece(to, from);
    if (move & CaptureFlag) {
        addPiece(to, moveCapturePiece(move));
    }
    if (move & PromotionFlag) {
        removePiece(from);
        addPiece(from, PieceColor[movePormotionPiece(move)] === Color.white ? Pieces.wp : Pieces.bp);
    }

    return move;
}