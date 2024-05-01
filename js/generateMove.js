let moves;
function generateMoves() {
    moves = [];

    if (gameBoard.side == Color.white) {
        for (const sq of gameBoard.pieceList[Pieces.wp]) {
            if (gameBoard.pieces[sq + 10] == Pieces.empty) {
                addWhitePawnQuietMove(sq, sq + 10);
                if (gameBoard.pieces[sq + 20] == Pieces.empty && rankOf(sq) == Rank2) {
                    addQuiteMove(buildMove(sq, sq + 20, 0, 0, PawnStartFlag));
                }
            }

            //add capture move
            if (sq + 9 != Squares.offBoard && PieceColor[gameBoard.pieces[sq + 9]] == Color.black) {
                addWhiteCaptureMove(sq, sq + 9, gameBoard.pieces[sq + 9]);
            }
            if (sq + 11 != Squares.offBoard && PieceColor[gameBoard.pieces[sq + 11]] == Color.black) {
                addWhiteCaptureMove(sq, sq + 11, gameBoard.pieces[sq + 11]);
            }

            //add enpassant move
            if (sq + 9 == gameBoard.enPassantSq) {
                addEnPassantMove(buildMove(sq, sq + 9, 0, 0, EnPassantFlag));
            }
            if (sq + 11 == gameBoard.enPassantSq) {
                addEnPassantMove(buildMove(sq, sq + 11, 0, 0, EnPassantFlag));
            }

        }


        //castling

        if (gameBoard.castlePermission & CastleBit.K) {
            if (gameBoard.pieces[Squares.f1] == Pieces.empty && gameBoard.pieces[Squares.g1] == Pieces.empty) {
                if (gameBoard.checkSq == Squares.noSq && !isUnderAttack(Squares.f1, Color.black)) {
                    addQuiteMove(buildMove(Squares.e1, Squares.g1, 0, 0, CastleFlag));
                }
            }
        }
        if (gameBoard.castlePermission & CastleBit.Q) {
            if (gameBoard.pieces[Squares.d1] == Pieces.empty && gameBoard.pieces[Squares.c1] == Pieces.empty && gameBoard.pieces[Squares.b1] == Pieces.empty) {
                if (gameBoard.checkSq == Squares.noSq && !isUnderAttack(Squares.d1, Color.black)) {
                    addQuiteMove(buildMove(Squares.e1, Squares.c1, 0, 0, CastleFlag));
                }
            }
        }

    }
    else {
        for (const sq of gameBoard.pieceList[Pieces.bp]) {
            if (gameBoard.pieces[sq - 10] == Pieces.empty) {
                //add a white quite move
                addBlackPawnQuietMove(sq, sq - 10);

                if (gameBoard.pieces[sq - 20] == Pieces.empty && rankOf(sq) == Rank7) {
                    //add pawn first move
                    addQuiteMove(buildMove(sq, sq - 20, 0, 0, PawnStartFlag));
                }
            }

            //add capture move
            if (sq - 9 != Squares.offBoard && PieceColor[gameBoard.pieces[sq - 9]] == Color.white) {
                addBlackCaptureMove(sq, sq - 9, gameBoard.pieces[sq - 9]);
            }
            if (sq - 11 != Squares.offBoard && PieceColor[gameBoard.pieces[sq - 11]] == Color.white) {
                addBlackCaptureMove(sq, sq - 11, gameBoard.pieces[sq - 11]);
            }

            //add enpassant move
            if (sq - 9 == gameBoard.enPassantSq) {
                addEnPassantMove(buildMove(sq, sq - 9, 0, 0, EnPassantFlag));
            }
            if (sq - 11 == gameBoard.enPassantSq) {
                addEnPassantMove(buildMove(sq, sq - 11, 0, 0, EnPassantFlag));
            }
        }


        //castling
        if (gameBoard.castlePermission & CastleBit.k) {
            if (gameBoard.pieces[Squares.f8] == Pieces.empty && gameBoard.pieces[Squares.g8] == Pieces.empty) {
                if (gameBoard.checkSq == Squares.noSq && !isUnderAttack(Squares.f8, Color.white)) {
                    addQuiteMove(buildMove(Squares.e8, Squares.g8, 0, 0, CastleFlag));
                }
            }
        }
        if (gameBoard.castlePermission & CastleBit.q) {
            if (gameBoard.pieces[Squares.d8] == Pieces.empty && gameBoard.pieces[Squares.c8] == Pieces.empty && gameBoard.pieces[Squares.b8] == Pieces.empty) {
                if (gameBoard.checkSq == Squares.noSq && !isUnderAttack(Squares.d8, Color.white)) {
                    addQuiteMove(buildMove(Squares.e8, Squares.g8, 0, 0, CastleFlag));
                }
            }
        }

    }

    generateSlidingMoves();
    generateNonSlidingMoves();
    
    return moves;
}

function generateSlidingMoves() {
    for (const piece of SlidingPieces[gameBoard.side]) {
        for (const sq of gameBoard.pieceList[piece]) {
            for (const direction of PieceDirections[piece]) {
                let targetSq = sq + direction;

                while (gameBoard.pieces[targetSq] != Squares.offBoard) {
                    if (gameBoard.pieces[targetSq] == Pieces.empty) {
                        addQuiteMove(buildMove(sq, targetSq, 0, 0, 0));
                    }
                    else {
                        if (PieceColor[gameBoard.pieces[targetSq]] !== gameBoard.side) {
                            addQuiteMove(buildMove(sq, targetSq, gameBoard.pieces[targetSq], 0, 0));
                        }
                        break;
                    }
                    targetSq += direction;
                }

            }
        }
    }
}

function generateNonSlidingMoves() {
    for (const piece of NonSlidingPieces[gameBoard.side]) {
        for (const sq of gameBoard.pieceList[piece]) {
            for (const direction of PieceDirections[piece]) {

                let targetSq = sq + direction;
                if (gameBoard.pieces[targetSq] == Squares.offBoard) {
                    continue;
                }
                if (gameBoard.pieces[targetSq] == Pieces.empty) {
                    addQuiteMove(buildMove(sq, targetSq, 0, 0, 0));
                }
                else if (PieceColor[gameBoard.pieces[targetSq]] != gameBoard.side) {
                    addQuiteMove(buildMove(sq, targetSq, gameBoard.pieces[targetSq], 0, 0));
                }
            }
        }
    }
}

//seperate functions for adding different move, because score will vary further
function addCaptureMove(move) {
    let score = 0;
    moves.push({ score, move });
}
function addQuiteMove(move) {
    let score = 0;
    moves.push({ score, move });
}
function addEnPassantMove(move) {
    let score = 0;
    moves.push({ score, move });
}


function addWhitePawnQuietMove(from, to) {
    //handling promotion move
    if (rankOf(to) === Rank8) {
        addQuiteMove(buildMove(from, to, 0, Pieces.wq, 0));
        addQuiteMove(buildMove(from, to, 0, Pieces.wr, 0));
        addQuiteMove(buildMove(from, to, 0, Pieces.wb, 0));
        addQuiteMove(buildMove(from, to, 0, Pieces.wn, 0));
    }
    addQuiteMove(buildMove(from, to, 0, 0, 0));
}
function addBlackPawnQuietMove(from, to) {
    //handling promotion move
    if (rankOf(to) === Rank1) {
        addQuiteMove(buildMove(from, to, 0, Pieces.bq, 0));
        addQuiteMove(buildMove(from, to, 0, Pieces.br, 0));
        addQuiteMove(buildMove(from, to, 0, Pieces.bb, 0));
        addQuiteMove(buildMove(from, to, 0, Pieces.bn, 0));
    }
    addQuiteMove(buildMove(from, to, 0, 0, 0));
}



function addWhiteCaptureMove(from, to, capture) {
    //handling promotion move
    if (rankOf(to) === Rank8) {
        addCaptureMove(buildMove(from, to, capture, Pieces.wq, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.wr, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.wb, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.wn, 0));
    }
    addCaptureMove(buildMove(from, to, capture, 0, 0));
}
function addBlackCaptureMove(from, to, capture) {
    //handling promotion move
    if (rankOf(to) === Rank1) {
        addCaptureMove(buildMove(from, to, capture, Pieces.bq, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.br, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.bb, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.bn, 0));
    }
    addCaptureMove(buildMove(from, to, capture, 0, 0));
}