//example:- 

// bitBoard file[0]      nth Bit
// 1 0 0 0 0 0 0 0       0  1  2  3  4  5  6  7
// 1 0 0 0 0 0 0 0       8  9 10 11 12 13 14 15 
// 1 0 0 0 0 0 0 0      16 17 18 19 20 21 22 23
// 1 0 0 0 0 0 0 0      24 25 26 27 28 29 30 31
// 1 0 0 0 0 0 0 0      32 33 34 35 36 37 38 39
// 1 0 0 0 0 0 0 0      40 41 42 43 44 45 46 47
// 1 0 0 0 0 0 0 0      48 49 50 51 52 53 54 55
// 1 0 0 0 0 0 0 0      56 57 58 59 60 61 62 63

const FileBitMask = new Array(8).fill(0n);
const RankBitMask = new Array(8).fill(0n);
const PassedPawnBitMask = new Array(2);
const IsolatedBitMask = new Array(64).fill(0n);



const PawnBitBoard = {
    0: 0n,
    1: 0n,
    setBit: function (color, sq) {
        this[color] |= (1n << BigInt(sq));
    },
    clearBit: function (color, sq) {
        this[color] &= ~(1n << BigInt(sq));
    },
    getBoth: function () {
        return this[Color.white] | this[Color.black];
    },
    init: function () {
        for (let sq = 0; sq < 64; sq++) {
            let piece = gameBoard.pieces[Sq64To120[sq]];
            if (piece == Pieces.empty) continue;
            if (piece == Pieces.wp) {
                this.setBit(Color.white, sq);
            }
            else if (piece == Pieces.bp) {
                this.setBit(Color.black, sq);
            }
        }
    }
};



function printBitBoard(num) {
    for (let row = 0; row < 8; row++) {
        let rowString = '';
        for (let col = 0; col < 8; col++) {
            const bit = (num >> BigInt(row * 8 + col)) & 1n;
            rowString += bit + ' ';
        }
        console.log(row + ". " + rowString);
    }
    console.log('');
}