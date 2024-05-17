
// Example usage
// let pgn = [
//     '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8 13. Nf1 Bf8 14. Ng3 g6 15. Bg5 h6 16. Bd2 Bg7 17. Qc1 Kh7 18. Nh2 c5 19. d5 c4 20. Ng4 Nxg4 21. hxg4 Nc5 22. f3 a5 23. Kf2 b4 24. Rh1 Qb6 25. Be3 Qc7 26. Bxh6 Bxh6 27. Qxh6+ Kg8 28. Qh8#',
// ]
// setTimeout(() => {
//     const result = parsePGN(pgn[0]);
// }, 200);

function parsePGN(pgn) {
    let result = [];
    const moves = extractMoves(pgn);

    for (const move of moves) {
        const match = isValidPgnMove(move);
        if (!match) {
            throw new Error(`${move} is a invalid pgn move`);
        }

        let { piece, fromFile, fromRank, toSq, capture } = match;
        let fromSq;

        if (move[0].toUpperCase() == 'O') {
            ({ fromSq, toSq } = getCastleSq(move));
        }
        else if (piece == 'P') {
            fromSq = getPawnFromSq(match);
        }
        else if (piece == 'K' || piece == 'N') {
            fromSq = nonSlideFromSq(match);
        }
        else {
            fromSq = slideFromSq(match);
        }

        const parsedMove = parseMove(fromSq, toSq);
        if (!parseMove) {
            throw new Error(`${move} is a Illigal move`);
        }
        // console.log(fromSq, toSq, parsedMove);
        gui.doMove(parsedMove, { audio: false });
    }
}

function isValidPgnMove(move) {
    const movePattern = /^(O-O-O|O-O|([NBKRQ]?)([a-h]?)([1-8]?)(x?)([a-h][1-8])(=[NBKRQ])?[+#]?)$/;
    const match = move.match(movePattern);
    if (!match) return null;
    return {
        piece: match[2] || 'P',
        fromFile: match[3] || '',
        fromRank: match[4] || '',
        capture: match[5] === 'x',
        toSq: match[6]
    }
}

function getCastleSq(move) {
    let fromSq, toSq;
    if (gameBoard.side == Color.white) {
        fromSq = 'e1';
        toSq = (move.toLowerCase() == 'o-o') ? 'g1' : 'c1';
    }
    else {
        fromSq = 'e8';
        toSq = (move.toLowerCase() == 'o-o') ? 'g8' : 'c8';
    }
    return { fromSq, toSq };
}

function getPawnFromSq({ fromFile, toSq, capture }) {
    toSq = Squares[toSq];

    if (gameBoard.side == Color.white) {
        if (capture) return fromFile + (rankOf(toSq - 10) + 1);
        if (gameBoard.pieces[toSq - 10] != Pieces.empty) {
            return SquaresChar[toSq - 10];
        }
        return SquaresChar[toSq - 20];
    }
    else {
        if (capture) return fromFile + (rankOf(toSq + 10) + 1);
        if (gameBoard.pieces[toSq + 10] != Pieces.empty) {
            return SquaresChar[toSq + 10];
        }
        return SquaresChar[toSq + 20];
    }
}

function nonSlideFromSq({ piece, toSq, fromFile, fromRank }) {
    toSq = Squares[toSq];
    piece = Pieces[SideChar[gameBoard.side] + piece.toLowerCase()];
    if (fromFile !== '') fromFile = fromFile.charCodeAt(0) - 'a'.charCodeAt(0);
    if (fromRank !== '') fromRank -= 1;

    for (const direction of PieceDirections[piece]) {
        let targetSq = toSq + direction;
        if (gameBoard.pieces[targetSq] == piece) {
            if (fromFile === '' && fromRank === '') return SquaresChar[targetSq];
            if (fileOf(targetSq) == fromFile || rankOf(targetSq) == fromRank) {
                return SquaresChar[targetSq];
            }
        }
    }
}
function slideFromSq({ piece, toSq, fromFile, fromRank }) {
    toSq = Squares[toSq];
    piece = Pieces[SideChar[gameBoard.side] + piece.toLowerCase()];
    if (fromFile !== '') fromFile = fromFile.charCodeAt(0) - 'a'.charCodeAt(0);
    if (fromRank !== '') fromRank -= 1;


    for (const direction of PieceDirections[piece]) {
        let targetSq = toSq + direction;
        while (gameBoard.pieces[targetSq] != Squares.offBoard) {
            if (gameBoard.pieces[targetSq] != Pieces.empty) {
                if (gameBoard.pieces[targetSq] == piece) {
                    if (fromFile === '' && fromRank === '') return SquaresChar[targetSq];
                    if (fileOf(targetSq) == fromFile || rankOf(targetSq) == fromRank) {
                        return SquaresChar[targetSq];
                    }
                }
                break;
            }
            targetSq += direction;
        }
    }
}






function getPGN() {
    let pgn = '';
    let ply = 0;
    nodeList.forEach((node, index) => {
        if (index % 2 == 0) {
            pgn += ++ply + '. ';
        }
        pgn += node.textContent;
        if (index != nodeList.length - 1) {
            pgn += ' ';
        }
    })
    return pgn;
}

function extractMoves(pgn) {
    const lines = pgn.split('\n');
    // Flag to indicate when the moves section starts
    let movesStart = false;
    let moves = [];

    for (let line of lines) {
        // If we encounter a line without square brackets, it indicates the start of moves
        if (!line.startsWith('[') && line.trim() !== '') {
            movesStart = true;
        }
        // If movesStart is true, we process the line for moves
        if (movesStart) {
            const parts = line.trim().split(/\s+/);
            for (let part of parts) {
                // Remove move numbers and results
                if (!part.match(/^\d+\.$|1-0|0-1|1\/2-1\/2|\*/)) {
                    moves.push(part);
                }
            }
        }
    }

    return moves;
}


