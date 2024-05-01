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

        let test = TestCases[depth][moveStr(move)] == count ? '✅' : '❌';

        totalNodeSeared += count;
        console.log(++moveCount, moveStr(move), count, test);
    }
    console.log('Total Node Seared', totalNodeSeared);
}

function moveStr(move) {
    return SquaresChar[moveFrom(move)] + SquaresChar[moveTo(move)];
}




const TestCases = {
    1: {
        'a2a3': 1,
        'a2a4': 1,
        'b2b3': 1,
        'b2b4': 1,
        'c2c3': 1,
        'c2c4': 1,
        'd2d3': 1,
        'd2d4': 1,
        'e2e3': 1,
        'e2e4': 1,
        'f2f3': 1,
        'f2f4': 1,
        'g2g3': 1,
        'g2g4': 1,
        'h2h3': 1,
        'h2h4': 1,
        'b1a3': 1,
        'b1c3': 1,
        'g1f3': 1,
        'g1h3': 1,
    },
    2: {
        'a2a3': 20,
        'a2a4': 20,
        'b2b3': 20,
        'b2b4': 20,
        'c2c3': 20,
        'c2c4': 20,
        'd2d3': 20,
        'd2d4': 20,
        'e2e3': 20,
        'e2e4': 20,
        'f2f3': 20,
        'f2f4': 20,
        'g2g3': 20,
        'g2g4': 20,
        'h2h3': 20,
        'h2h4': 20,
        'b1a3': 20,
        'b1c3': 20,
        'g1f3': 20,
        'g1h3': 20,
    },
    3: {
        'a2a3': 380,
        'a2a4': 420,
        'b2b3': 420,
        'b2b4': 421,
        'c2c3': 420,
        'c2c4': 441,
        'd2d3': 539,
        'd2d4': 560,
        'e2e3': 599,
        'e2e4': 600,
        'f2f3': 380,
        'f2f4': 401,
        'g2g3': 420,
        'g2g4': 421,
        'h2h3': 380,
        'h2h4': 420,
        'b1a3': 400,
        'b1c3': 440,
        'g1f3': 440,
        'g1h3': 400,
    },
    4: {
        'a2a3': 8457,
        'a2a4': 9329,
        'b2b3': 9345,
        'b2b4': 9332,
        'c2c3': 9272,
        'c2c4': 9744,
        'd2d3': 11959,
        'd2d4': 12435,
        'e2e3': 13134,
        'e2e4': 13160,
        'f2f3': 8457,
        'f2f4': 8929,
        'g2g3': 9345,
        'g2g4': 9328,
        'h2h3': 8457,
        'h2h4': 9329,
        'b1a3': 8885,
        'b1c3': 9755,
        'g1f3': 9748,
        'g1h3': 8881,

    },
    5: {
        'a2a3': 181046,
        'a2a4': 217832,
        'b2b3': 215255,
        'b2b4': 216145,
        'c2c3': 222861,
        'c2c4': 240082,
        'd2d3': 328511,
        'd2d4': 361790,
        'e2e3': 402988,
        'e2e4': 405385,
        'f2f3': 178889,
        'f2f4': 198473,
        'g2g3': 217210,
        'g2g4': 214048,
        'h2h3': 181044,
        'h2h4': 218829,
        'b1a3': 198572,
        'b1c3': 234656,
        'g1f3': 233491,
        'g1h3': 198502,
    },
    6: {
        'a2a3': 4463267,
        'a2a4': 5363555,
        'b2b3': 5310358,
        'b2b4': 5293555,
        'c2c3': 5417640,
        'c2c4': 5866666,
        'd2d3': 8073082,
        'd2d4': 8879566,
        'e2e3': 9726018,
        'e2e4': 9771632,
        'f2f3': 4404141,
        'f2f4': 4890429,
        'g2g3': 5346260,
        'g2g4': 5239875,
        'h2h3': 4463070,
        'h2h4': 5385554,
        'b1a3': 4856835,
        'b1c3': 5708064,
        'g1f3': 5723523,
        'g1h3': 4877234,
    },
}
