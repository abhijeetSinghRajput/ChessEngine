
// Example usage
// let pgn = [
//     '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8 13. Nf1 Bf8 14. Ng3 g6 15. Bg5 h6 16. Bd2 Bg7 17. Qc1 Kh7 18. Nh2 c5 19. d5 c4 20. Ng4 Nxg4 21. hxg4 Nc5 22. f3 a5 23. Kf2 b4 24. Rh1 Qb6 25. Be3 Qc7 26. Bxh6 Bxh6 27. Qxh6+ Kg8 28. Qh8#',
//     '1. b3 d5 2. Nf3 Nf6 3. Bb2 Bf5 4. Nh4 Bd7 5. e3 c5 6. c4 e6 7. Be2 Be7 8. O-O O-O 9. Nf3 Nc6 10. d4 cxd4 11. exd4 Rc8 12. Nbd2 dxc4 13. bxc4 Re8 14. Nb3 Bf8 15. Qd2 Ne7 16. Ne5 g6 17. Bf3 b6 18. Rfe1 Bg7 19. Rad1 b5 20. Nxd7 Nxd7 21. cxb5 Nb6 22. Na5 Nc4 23. Nxc4 Rxc4 24. Qd3 Rc8 25. a4 Qa5 26. Qb3 Red8 27. g3 Nd5 28. Rc1 Nb6 29. d5 Bxb2 30. Qxb2 exd5 31. Qf6 Qxa4 32. Rc7 Rf8 33. Rxc8 Rxc8 34. Re7 Rf8 35. h4 h5 36. Kg2 Qc2 37. g4 hxg4 38. Bxg4 d4 39. Be6 Qe4+ 40. Kg3 Qxe6 41. Rxe6 fxe6 42. Qxg6+ Kh8 43. Qh6+ Kg8 44. Qxe6+ Kg7 45. Qe5+ Rf6 46. Qxd4 Kf7 47. h5 Nc8 48. Kg4 Ne7 49. f4 Rb6 50. Qc4+ Kg7 51. Qc5 Ng8 52. Kg5 Nh6 53. Qe5+ Kf8 54. Qh8+ Ng8 55. h6 Rxh6 56. Qxh6+ Nxh6 57. Kxh6 Ke7 58. Kg7 Ke6 59. Kg6 1-0',
// ];
// setTimeout(() => {
//     const result = parsePGN(pgn[1]);
// }, 200);

function parsePGN(pgn) {
    engine.stop();
    
    let result = [];
    const moves = extractMoves(pgn);
    console.log(moves);
    newGame();
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
        else {
            piece = Pieces[SideChar[gameBoard.side] + piece.toLowerCase()];
            toSq = Squares[toSq];
            if (fromFile !== '') fromFile = fromFile.charCodeAt(0) - 'a'.charCodeAt(0);
            if (fromRank !== '') fromRank -= 1;

            let moves = generateMoves().filter(({ move }) => {
                return (
                    gameBoard.pieces[moveFrom(move)] == piece &&
                    moveTo(move) == toSq
                )
            });

            //filtering illegal move
            moves = moves.filter(({ move }) => {
                if (!doMove(move)) return false;
                undoMove();
                return true;
            })
            if (moves.length == 1) {
                gui.doMove(moves[0].move, { audio: false });
            }
            else {
                moves = moves.filter(({ move }) => {
                    return fileOf(moveFrom(move)) === fromFile || rankOf(moveFrom(move)) === fromRank
                })
                if (moves.length !== 1) {
                    throw new Error(`${move} is a Illigal move`);
                }
                gui.doMove(moves[0].move, { audio: false });
            }
            continue;
        }

        const parsedMove = parseMove(fromSq, toSq);
        if (!parsedMove) {
            throw new Error(`${move} is a Illigal move`);
        }
        // console.log(fromSq, toSq, parsedMove);
        gui.doMove(parsedMove, { audio: false });
    }
}

function isValidPgnMove(move) {
    const movePattern = /^(O-O-O|O-O|([NBKRQ]?)([a-h]?)([1-8]?)(x?)([a-h][1-8])(=[NBKRQ])?)[+#]?$/;
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




function getPGN() {
    let pgn = '';
    let ply = 0;
    for(let i = 0; i<=currMoveNode; ++i){
        const node = nodeList[i];
        if (i % 2 == 0) {
            pgn += ++ply + '. ';
        }
        pgn += node.textContent;
        pgn += ' ';
    }
    if (isGameOver()) {
        let result = resultTitle.textContent;
        switch (result) {
            case 'Draw': pgn += '1/2-1/2'; break;
            case 'White Won': pgn += '1-0'; break;
            case 'Black Won': pgn += '0-1'; break;
        }
    }
    return pgn;
}

function extractMoves(pgn) {
    const lines = pgn.split('\n');
    let movesStart = false;
    let moves = [];

    for (let line of lines) {
        // If we encounter a line without square brackets, it indicates the start of moves
        if (!movesStart && !line.startsWith('[') && line.trim() !== '') {
            movesStart = true;
        }

        // If movesStart is true, we process the line for moves
        if (movesStart) {
            // Remove comments and metadata enclosed in {}, and also strip any evaluation comments
            line = line.replace(/\{[^}]*\}|\([^\)]*\)/g, '').trim();

            const parts = line.split(/\s+/);

            for (let part of parts) {
                // Remove invalid moves (like move numbers, result, and annotations)
                if (!part.match(/^(\d+\.$|\d+\.\.\.$|1-0|0-1|1\/2-1\/2|\*|[\(\)]|\?\?|\!\!|\?|\!)/)) {
                    moves.push(part);
                }
            }

            // Stop processing when we encounter the result of the game
            if (line.includes('1-0') || line.includes('0-1') || line.includes('1/2-1/2') || line.includes('*')) {
                break;
            }
        }
    }
    moves = moves.map(move=>move.replace(/[?()\s]+/g, ''));
    return moves;
}

