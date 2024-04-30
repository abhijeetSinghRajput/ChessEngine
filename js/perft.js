function perft(depth) {
    if (depth <= 0) {
        return 1;
    }

    let count = 0;
    for (const { move } of generateMoves()) {
        if (doMove(move) == false) {
            continue;
        }
        count += perft(depth - 1);
        undoMove();
    }
    return count;
}

function perftTest(depth) {
    let moveCount = 0;
    let totalNodeSeared = 0;
    for (const { move } of generateMoves()) {
        if (doMove(move) == false) {
            continue;
        }

        let count = perft(depth - 1);
        undoMove();

        totalNodeSeared += count;
        console.log(++moveCount, moveStr(move), count);
    }
    console.log('Total Node Seared', totalNodeSeared);
}

function moveStr(move) {
    return SquaresChar[moveFrom(move)] + SquaresChar[moveTo(move)];
}


// go to perft 4
// a2a3:   8457        a2a3   8461
// a2a4:   9329        a2a4   9333
// b2b3:   9345        b2b3   9349
// b2b4:   9332        b2b4   9378
// c2c3:   9272        c2c3   9276
// c2c4:   9744        c2c4   9756
// d2d3:   11959       d2d3   11989
// d2d4:   12435       d2d4   12465
// e2e3:   13134       e2e3   13168
// e2e4:   13160       e2e4   13198
// f2f3:   8457        f2f3   8461
// f2f4:   8929        f2f4   8937
// g2g3:   9345        g2g3   9349
// g2g4:   9328        g2g4   9376
// h2h3:   8457        h2h3   8461
// h2h4:   9329        h2h4   9333
// b1a3:   8885        b1a3   8889
// b1c3:   9755        b1c3   9763
// g1f3:   9748        g1f3   9754
// g1h3:   8881        g1h3   8887

// Nodes searched: 197281   Total Node Seared 197583
