(function main() {
    init();
    parseFen(StartingFen);
    if (typeof window !== 'undefined') {
        gui.renderPieces();
    }
    readPolyBook({path:'../gm2600.bin'});
    loadBooksFromIndexedDB();
})();

function init() {
    init_SquareSwitch();
    init_FileBitMask();
    init_RankBitMask();
    init_PassedPawnBitMask();
    init_IsolatedBitMask();
}


function init_FileBitMask() {
    for (let file = FileA; file <= FileH; ++file) {
        for (let rank = Rank1; rank <= Rank8; ++rank) {
            FileBitMask[file] |= (1n << BigInt(file)) << BigInt(8 * rank);
        }
    }
}

function init_RankBitMask() {
    for (let rank = Rank1; rank <= Rank8; ++rank) {
        RankBitMask[rank] |= 255n << BigInt(rank * 8);
    }
}

function init_IsolatedBitMask() {
    for (let sq = 0; sq < 64; sq++) {
        let file = fileOf(Sq64To120[sq]);
        if (file > FileA) {
            IsolatedBitMask[sq] |= FileBitMask[file - 1];
        }
        if (file < FileH) {
            IsolatedBitMask[sq] |= FileBitMask[file + 1];
        }
    }
}

function init_PassedPawnBitMask() {
    for (let i = 0; i < 2; ++i) {
        PassedPawnBitMask[i] = new Array(64).fill(0n);

        for (let sq = 0; sq < 64; sq++) {
            let file = fileOf(Sq64To120[sq]);
            let rank = rankOf(Sq64To120[sq]);

            PassedPawnBitMask[i][sq] |= FileBitMask[file];
            if (file > FileA) {
                PassedPawnBitMask[i][sq] |= FileBitMask[file - 1];
            }
            if (file < FileH) {
                PassedPawnBitMask[i][sq] |= FileBitMask[file + 1];
            }

            if (i == Color.white) {
                while (rank >= Rank1) {
                    PassedPawnBitMask[i][sq] &= ~RankBitMask[rank--];
                }
            }
            else {
                while (rank <= Rank8) {
                    PassedPawnBitMask[i][sq] &= ~RankBitMask[rank++];
                }
            }
        }
    }
}

function init_SquareSwitch() {
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