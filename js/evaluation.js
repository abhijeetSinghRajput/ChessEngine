var PawnTable = [
    0, 0, 0, 0, 0, 0, 0, 0,
    10, 10, 0, -10, -10, 0, 10, 10,
    5, 0, 0, 5, 5, 0, 0, 5,
    0, 0, 10, 20, 20, 10, 0, 0,
    5, 5, 5, 10, 10, 5, 5, 5,
    10, 10, 10, 20, 20, 10, 10, 10,
    20, 20, 20, 30, 30, 20, 20, 20,
    0, 0, 0, 0, 0, 0, 0, 0
];


var KnightTable = [
    0, -10, 0, 0, 0, 0, -10, 0,
    0, 0, 0, 5, 5, 0, 0, 0,
    0, 0, 10, 10, 10, 10, 0, 0,
    0, 0, 10, 20, 20, 10, 5, 0,
    5, 10, 15, 20, 20, 15, 10, 5,
    5, 10, 10, 20, 20, 10, 10, 5,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
];

var BishopTable = [
    0, 0, -10, 0, 0, -10, 0, 0,
    0, 0, 0, 10, 10, 0, 0, 0,
    0, 0, 10, 15, 15, 10, 0, 0,
    0, 10, 15, 20, 20, 15, 10, 0,
    0, 10, 15, 20, 20, 15, 10, 0,
    0, 0, 10, 15, 15, 10, 0, 0,
    0, 0, 0, 10, 10, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
];

var RookTable = [
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    25, 25, 25, 25, 25, 25, 25, 25,
    0, 0, 5, 10, 10, 5, 0, 0
];

var BishopPair = 40;


function evalPosition() {

    var score = gameBoard.material[Color.white] - gameBoard.material[Color.black];
    //pawn
    for (const sq of gameBoard.pieceList[Pieces.wp]) {
        score += PawnTable[Sq120To64[sq]];
    }
    for (const sq of gameBoard.pieceList[Pieces.bp]) {
        score -= PawnTable[Mirror64[Sq120To64[sq]]];
    }

    //knight
    for (const sq of gameBoard.pieceList[Pieces.wn]) {
        score += KnightTable[Sq120To64[sq]];
    }
    for (const sq of gameBoard.pieceList[Pieces.bn]) {
        score -= KnightTable[Mirror64[Sq120To64[sq]]];
    }

    //bishop
    for (const sq of gameBoard.pieceList[Pieces.wb]) {
        score += BishopTable[Sq120To64[sq]];
    }
    for (const sq of gameBoard.pieceList[Pieces.bb]) {
        score -= BishopTable[Mirror64[Sq120To64[sq]]];
    }

    //rook
    for (const sq of gameBoard.pieceList[Pieces.wr]) {
        score += RookTable[Sq120To64[sq]];
    }

    for (const sq of gameBoard.pieceList[Pieces.br]) {
        score -= RookTable[Mirror64[Sq120To64[sq]]];
    }

    //queen
    for (const sq of gameBoard.pieceList[Pieces.wq]) {
        score += RookTable[Sq120To64[sq]];
    }

    for (const sq of gameBoard.pieceList[Pieces.bq]) {
        score -= RookTable[Mirror64[Sq120To64[sq]]];
    }

    //bonus
    if (gameBoard.pieceCount[Pieces.wb] >= 2) {
        score += BishopPair;
    }
    if (gameBoard.pieceCount[Pieces.bb] >= 2) {
        score -= BishopPair;
    }

    return (gameBoard.side == Color.white) ? score : -score;
}






















































