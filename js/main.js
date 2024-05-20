(function main() {
    init();
    // StartingFen = 'r3k2r/pPppqpb11/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ';
    // StartingFen = '2k1r2r/Bpq3pp/3b4/3Bp3/8/7b/PPP1QP2/R3R1K1 w - -';

    // StartingFen = 'rnb1k2r/pp2qppp/3p1n2/2pp2B1/1bP5/2N1P3/PP2NPP/R2QKB1R w KQkq'
    // StartingFen = '2rr3k/pp3pp1/1nnqbN1p/3pN3/2pP4/2P3Q1/PPB4P/R4RK1 w - -';
    StartingFen = '1br3k1/p4p2/2p1r3/3p1b2/3Bn1p1/1P2P1Pq/P3Q1BP/2R1NRK1 b - -';
    parseFen(StartingFen);
    gui.renderPieces();
    // printBoard();
    // console.log(evalPosition());

    // perftTest(4)
    // for (let depth = 1; depth <= 5; depth++) {
    //     let searchStartTime = new Date().getTime();
    //     let visitedNodes = perft(depth);
    //     let searchEndTime = new Date().getTime();
    //     console.log(depth, visitedNodes, (searchEndTime - searchStartTime), 'millisecond');
    // }

})();

function init() {
    initSquareSwitch();
    initBitLines();
    initPassedPawnMask();
    initIsolatedMask();
}

function initSquareSwitch() {
    for (let rank = Rank1; rank <= Rank8; ++rank) {
        for (let file = FileA; file <= FileH; ++file) {
            let sq120 = fileRank2Sq(file, rank);
            let sq64 = rank * 8 + file;
            Sq120To64[sq120] = sq64;
            Sq64To120[sq64] = sq120;
        }
    }
}

function initBitLines() {
    for (let file = FileA; file <= FileH; ++file) {
        let num = 0n;
        for (let i = 0; i < 8; ++i) {
            num |= 1n << (BigInt(file) + BigInt(i * 8));
        }
        FileMask[file] = num;
    }

    let num = 255n;
    for (let rank = Rank1; rank <= Rank8; ++rank) {
        RankMask[rank] = (num << BigInt(rank * 8));
    }
}

function initIsolatedMask(){
    for(const sq of Sq64To120){
        let currFile = fileOf(sq);
        let leftFileMask = FileMask[currFile - 1];
        let rightFileMask = FileMask[currFile + 1];
        let mask = 0n;
        if(leftFileMask) mask |= leftFileMask;
        if(rightFileMask) mask |= rightFileMask;
        IsolatedMask[sq] = mask;
    }
};

function initPassedPawnMask() {
    PassedPawnMask[Color.white] = new Array(120);
    PassedPawnMask[Color.black] = new Array(120);

    for (const sq of Sq64To120) {
        let currFile = fileOf(sq);
        let currFileMask = FileMask[currFile];
        let leftFileMask = FileMask[currFile - 1];
        let rightFileMask = FileMask[currFile + 1];

        if (leftFileMask) currFileMask |= leftFileMask;
        if (rightFileMask) currFileMask |= rightFileMask;

        let whitePassedMask = currFileMask;
        for (let rank = rankOf(sq); rank >= Rank1; --rank) {
            whitePassedMask &= (~RankMask[rank]);
        }

        let blackPassedMask = currFileMask;
        for (let rank = rankOf(sq); rank <= Rank8; ++rank) {
            blackPassedMask &= (~RankMask[rank]);
        }

        PassedPawnMask[Color.white][sq] = whitePassedMask;
        PassedPawnMask[Color.black][sq] = blackPassedMask;
    }
};


function printArr(arr, rows, cols) {
    for (let i = 0; i < rows; ++i) {
        let line = `${i}    `;
        for (let j = 0; j < cols; ++j) {
            let val = arr[i * cols + j];
            if (val >= 0 && val <= 9) {
                line += '0' + val + ' ';
            }
            else if (!val) {
                line += '.. '
            }
            else {
                line += val + ' ';
            }
        }
        console.log(line);
    }
}