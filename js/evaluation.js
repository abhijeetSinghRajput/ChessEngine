const PawnIsolated = -10;
const PawnPassed = [0, 5, 10, 20, 35, 60, 100, 200];
const RookOpenFile = 10;
const RookSemiOpenFile = 5;
const QueenOpenFile = 5;
const QueenSemiOpenFile = 3;
const BishopPair = 30;

const PawnTable = [
    0, 0, 0, 0, 0, 0, 0, 0,
    10, 10, 0, -10, -10, 0, 10, 10,
    5, 0, 0, 5, 5, 0, 0, 5,
    0, 0, 10, 20, 20, 10, 0, 0,
    5, 5, 5, 10, 10, 5, 5, 5,
    10, 10, 10, 20, 20, 10, 10, 10,
    20, 20, 20, 30, 30, 20, 20, 20,
    0, 0, 0, 0, 0, 0, 0, 0
];

const KnightTable = [
    0, -10, 0, 0, 0, 0, -10, 0,
    0, 0, 0, 5, 5, 0, 0, 0,
    0, 0, 10, 10, 10, 10, 0, 0,
    0, 0, 10, 20, 20, 10, 5, 0,
    5, 10, 15, 20, 20, 15, 10, 5,
    5, 10, 10, 20, 20, 10, 10, 5,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
];

const BishopTable = [
    0, 0, -10, 0, 0, -10, 0, 0,
    0, 0, 0, 10, 10, 0, 0, 0,
    0, 0, 10, 15, 15, 10, 0, 0,
    0, 10, 15, 20, 20, 15, 10, 0,
    0, 10, 15, 20, 20, 15, 10, 0,
    0, 0, 10, 15, 15, 10, 0, 0,
    0, 0, 0, 10, 10, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
];

const RookTable = [
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    25, 25, 25, 25, 25, 25, 25, 25,
    0, 0, 5, 10, 10, 5, 0, 0
];

const KingEndTable = [
    -50, -10, 0, 0, 0, 0, -10, -50,
    -10, 0, 10, 10, 10, 10, 0, -10,
    0, 10, 20, 20, 20, 20, 10, 0,
    0, 10, 20, 40, 40, 20, 10, 0,
    0, 10, 20, 40, 40, 20, 10, 0,
    0, 10, 20, 20, 20, 20, 10, 0,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -50, -10, 0, 0, 0, 0, -10, -50
];

const KingOpenTable = [
    0, 5, 5, -10, -10, 0, 10, 5,
    -30, -30, -30, -30, -30, -30, -30, -30,
    -50, -50, -50, -50, -50, -50, -50, -50,
    -70, -70, -70, -70, -70, -70, -70, -70,
    -70, -70, -70, -70, -70, -70, -70, -70,
    -70, -70, -70, -70, -70, -70, -70, -70,
    -70, -70, -70, -70, -70, -70, -70, -70,
    -70, -70, -70, -70, -70, -70, -70, -70
];

const Mirror = [
    56, 57, 58, 59, 60, 61, 62, 63,
    48, 49, 50, 51, 52, 53, 54, 55,
    40, 41, 42, 43, 44, 45, 46, 47,
    32, 33, 34, 35, 36, 37, 38, 39,
    24, 25, 26, 27, 28, 29, 30, 31,
    16, 17, 18, 19, 20, 21, 22, 23,
    8, 9, 10, 11, 12, 13, 14, 15,
    0, 1, 2, 3, 4, 5, 6, 7,
];

const EndGameMaterial = (PieceValue[Pieces.wr] + 2 * PieceValue[Pieces.wn] + 2 * PieceValue[Pieces.wp] + PieceValue[Pieces.wk]);

function evalPosition() {
    let score = gameBoard.material[Color.white] - gameBoard.material[Color.black];

    // pawn
    for (const sq of gameBoard.pieceList[Pieces.wp]) {
        score += PawnTable[Sq120To64[sq]];

        if (!(IsolatedMask[sq] & PawnBitBoard[Color.white])) {
            // console.log(SquaresChar[sq], 'white isolated');
            score += PawnIsolated;
        }

        if (!(PassedPawnMask[Color.white][sq] & PawnBitBoard[Color.black])) {
            // console.log(SquaresChar[sq], 'white passed');
            score += PawnPassed[rankOf(sq)];
        }
    }
    for (const sq of gameBoard.pieceList[Pieces.bp]) {
        score -= PawnTable[Mirror[Sq120To64[sq]]];

        if (!(IsolatedMask[sq] & PawnBitBoard[Color.black])) {
            // console.log(SquaresChar[sq], 'black isolated');
            score -= PawnIsolated;
        }

        if (!(PassedPawnMask[Color.black][sq] & PawnBitBoard[Color.white])) {
            // console.log(SquaresChar[sq], 'black passed');
            score -= PawnPassed[7 - rankOf(sq)];
        }
    }


    //knight
    for (const sq of gameBoard.pieceList[Pieces.wn]) {
        score += PawnTable[Sq120To64[sq]];
    }
    for (const sq of gameBoard.pieceList[Pieces.bn]) {
        score -= PawnTable[Mirror[Sq120To64[sq]]];
    }

    //bishop
    for (const sq of gameBoard.pieceList[Pieces.wb]) {
        score += PawnTable[Sq120To64[sq]];
    }
    for (const sq of gameBoard.pieceList[Pieces.bb]) {
        score -= PawnTable[Mirror[Sq120To64[sq]]];
    }

    //rook
    for (const sq of gameBoard.pieceList[Pieces.wr]) {
        score += PawnTable[Sq120To64[sq]];
        let currFile = fileOf(sq);
        if (!(FileMask[currFile] & PawnBitBoard[Color.both])) {
            score += RookOpenFile;
        }
        else if (!(FileMask[currFile] & PawnBitBoard[Color.black])) {
            score += RookSemiOpenFile;
        }
    }
    for (const sq of gameBoard.pieceList[Pieces.br]) {
        score -= PawnTable[Mirror[Sq120To64[sq]]];
        let currFile = fileOf(sq);
        if (!(FileMask[currFile] & PawnBitBoard[Color.both])) {
            score -= RookOpenFile;
        }
        else if (!(FileMask[currFile] & PawnBitBoard[Color.white])) {
            score -= RookSemiOpenFile;
        }
    }

    //queen
    for (const sq of gameBoard.pieceList[Pieces.wq]) {
        score += PawnTable[Sq120To64[sq]];
        let currFile = fileOf(sq);
        if (!(FileMask[currFile] & PawnBitBoard[Color.both])) {
            score += QueenOpenFile;
        }
        else if (!(FileMask[currFile] & PawnBitBoard[Color.black])) {
            score += QueenSemiOpenFile;
        }
    }
    for (const sq of gameBoard.pieceList[Pieces.bq]) {
        score -= PawnTable[Mirror[Sq120To64[sq]]];
        let currFile = fileOf(sq);
        if (!(FileMask[currFile] & PawnBitBoard[Color.both])) {
            score -= QueenOpenFile;
        }
        else if (!(FileMask[currFile] & PawnBitBoard[Color.white])) {
            score -= QueenSemiOpenFile;
        }
    }


    // The King
    let whiteKingSq = gameBoard.pieceList[Pieces.wk][0];
    if (gameBoard.material[Color.black] <= EndGameMaterial) {
        score += KingEndTable[Sq120To64[whiteKingSq]];
    }
    else {
        score += KingOpenTable[Sq120To64[whiteKingSq]];
    }

    let blackKingSq = gameBoard.pieceList[Pieces.bk][0];
    if (gameBoard.material[Color.white] <= EndGameMaterial) {
        score -= KingEndTable[Mirror[Sq120To64[blackKingSq]]];
    }
    else {
        score -= KingOpenTable[Mirror[Sq120To64[blackKingSq]]];
    }

    // Bonus
    if (gameBoard.pieceCount[Pieces.wb] >= 2) score += BishopPair;
    if (gameBoard.pieceCount[Pieces.bb] >= 2) score -= BishopPair;


    return (gameBoard.side == Color.white) ? score : -score;
}



function printBitBoard(number) {
    let bits = '';
    let num = BigInt(number);
    for (let i = 0; i <= 63; ++i) {
        if (i % 8 == 0) bits += '\n';
        bits += (num & (BigInt(1) << BigInt(i))) ? '1' : '0';
        bits += ' ';
    }
    console.log(bits);
    console.log(num);
}
