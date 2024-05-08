(function main() {
    init();
    // StartingFen = 'r3k2r/p1ppqpb11/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ';
    parseFen(StartingFen);
    gui.renderSquares();
    gui.renderPieces();
    hashKey.textContent = gameBoard.positionKey.toString(16);

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