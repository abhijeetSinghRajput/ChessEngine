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
            if (gameBoard.pieces[sq + 9] != Squares.offBoard && PieceColor[gameBoard.pieces[sq + 9]] == Color.black) {
                addWhiteCaptureMove(sq, sq + 9, gameBoard.pieces[sq + 9]);
            }
            if (gameBoard.pieces[sq + 11] != Squares.offBoard && PieceColor[gameBoard.pieces[sq + 11]] == Color.black) {
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
            if (gameBoard.pieces[sq - 9] != Squares.offBoard && PieceColor[gameBoard.pieces[sq - 9]] == Color.white) {
                addBlackCaptureMove(sq, sq - 9, gameBoard.pieces[sq - 9]);
            }
            if (gameBoard.pieces[sq - 11] != Squares.offBoard && PieceColor[gameBoard.pieces[sq - 11]] == Color.white) {
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
                    addQuiteMove(buildMove(Squares.e8, Squares.c8, 0, 0, CastleFlag));
                }
            }
        }

    }

    generateSlidingMoves();
    generateNonSlidingMoves();

    return moves;
}

function generateSlidingMoves({ captureOnly = false } = {}) {
    for (const piece of SlidingPieces[gameBoard.side]) {
        for (const sq of gameBoard.pieceList[piece]) {
            for (const direction of PieceDirections[piece]) {
                let targetSq = sq + direction;

                while (gameBoard.pieces[targetSq] != Squares.offBoard) {
                    if (gameBoard.pieces[targetSq] != Pieces.empty) {
                        if (PieceColor[gameBoard.pieces[targetSq]] != gameBoard.side) {
                            addCaptureMove(buildMove(sq, targetSq, gameBoard.pieces[targetSq], 0, 0));
                        }
                        break;
                    }
                    else if (!captureOnly) {
                        addQuiteMove(buildMove(sq, targetSq, 0, 0, 0));
                    }
                    targetSq += direction;
                }

            }
        }
    }
}

function generateNonSlidingMoves({ captureOnly = false } = {}) {
    for (const piece of NonSlidingPieces[gameBoard.side]) {
        for (const sq of gameBoard.pieceList[piece]) {
            for (const direction of PieceDirections[piece]) {

                let targetSq = sq + direction;
                if (gameBoard.pieces[targetSq] == Squares.offBoard) {
                    continue;
                }
                if (gameBoard.pieces[targetSq] == Pieces.empty) {
                    if (!captureOnly) {
                        addQuiteMove(buildMove(sq, targetSq, 0, 0, 0));
                    }
                }
                else if (PieceColor[gameBoard.pieces[targetSq]] != gameBoard.side) {
                    addCaptureMove(buildMove(sq, targetSq, gameBoard.pieces[targetSq], 0, 0));
                }
            }
        }
    }
}


function generateCaptureMoves() {
    moves = [];

    if (gameBoard.side == Color.white) {
        for (const sq of gameBoard.pieceList[Pieces.wp]) {

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

    }
    else {
        for (const sq of gameBoard.pieceList[Pieces.bp]) {

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
    }

    generateSlidingMoves({ captureOnly: true });
    generateNonSlidingMoves({ captureOnly: true });

    return moves;
}

//MvvLva = [victim][attacker]
let MvvLva = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 105, 102, 104, 103, 101, 100, 105, 102, 104, 103, 101, 100],
    [0, 405, 402, 404, 403, 401, 400, 405, 402, 404, 403, 401, 400],
    [0, 205, 202, 204, 203, 201, 200, 205, 202, 204, 203, 201, 200],
    [0, 305, 302, 304, 303, 301, 300, 305, 302, 304, 303, 301, 300],
    [0, 505, 502, 504, 503, 501, 500, 505, 502, 504, 503, 501, 500],
    [0, 605, 602, 604, 603, 601, 600, 605, 602, 604, 603, 601, 600],
    [0, 105, 102, 104, 103, 101, 100, 105, 102, 104, 103, 101, 100],
    [0, 405, 402, 404, 403, 401, 400, 405, 402, 404, 403, 401, 400],
    [0, 205, 202, 204, 203, 201, 200, 205, 202, 204, 203, 201, 200],
    [0, 305, 302, 304, 303, 301, 300, 305, 302, 304, 303, 301, 300],
    [0, 505, 502, 504, 503, 501, 500, 505, 502, 504, 503, 501, 500],
    [0, 605, 602, 604, 603, 601, 600, 605, 602, 604, 603, 601, 600],
];


function addCaptureMove(move) {
    let victim = moveCapturePiece(move);
    let attacker = gameBoard.pieces[moveFrom(move)];
    let score = MvvLva[victim][attacker] + 1000000;
    moves.push({ score, move });
}

function addQuiteMove(move) {
    let score = 0;
    if (searchController.killers[searchController.ply][0] == move) {
        score = 900000;
    }
    else if (searchController.killers[searchController.ply][1] == move) {
        score = 800000;
    }
    else {
        let piece = gameBoard.pieces[moveFrom(move)];
        let toSq = moveTo(move);
        score = searchController.history[piece][toSq];
    }

    moves.push({ score, move });
}

function addEnPassantMove(move) {
    //MvvLva[Pieces.wp][Pieces.bp] == MvvLva[Pieces.bp][Pieces.wp]
    let score = MvvLva[Pieces.wp][Pieces.bp] + 1000000;
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
    else {
        addQuiteMove(buildMove(from, to, 0, 0, 0));
    }
}
function addBlackPawnQuietMove(from, to) {
    //handling promotion move
    if (rankOf(to) === Rank1) {
        addQuiteMove(buildMove(from, to, 0, Pieces.bq, 0));
        addQuiteMove(buildMove(from, to, 0, Pieces.br, 0));
        addQuiteMove(buildMove(from, to, 0, Pieces.bb, 0));
        addQuiteMove(buildMove(from, to, 0, Pieces.bn, 0));
    }
    else {
        addQuiteMove(buildMove(from, to, 0, 0, 0));
    }
}



function addWhiteCaptureMove(from, to, capture) {
    //handling promotion move
    if (rankOf(to) === Rank8) {
        addCaptureMove(buildMove(from, to, capture, Pieces.wq, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.wr, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.wb, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.wn, 0));
    }
    else {
        addCaptureMove(buildMove(from, to, capture, 0, 0));
    }
}
function addBlackCaptureMove(from, to, capture) {
    //handling promotion move
    if (rankOf(to) === Rank1) {
        addCaptureMove(buildMove(from, to, capture, Pieces.bq, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.br, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.bb, 0));
        addCaptureMove(buildMove(from, to, capture, Pieces.bn, 0));
    }
    else {
        addCaptureMove(buildMove(from, to, capture, 0, 0));
    }
}