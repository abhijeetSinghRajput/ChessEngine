const PvTable = {
    entries: {},
};

PvTable.addMove = function (move) {
    this.entries[gameBoard.positionKey] = move;
}
PvTable.getMove = function () {
    return this.entries[gameBoard.positionKey];
}
PvTable.clear = function () {
    this.entries = {};
}
PvTable.length = function () {
    return Object.keys(this.entries).length;
}
PvTable.getLine = function (depth) {
    let move = this.getMove();
    let movelist = [];
    let count = 0;

    while (move && count < depth) {
        if (isMoveExists(move)) {
            doMove(move);
            movelist.push(move);
            count++;
        }
        else {
            break;
        }
        move = this.getMove();
    }
    while (count--) undoMove();
    return movelist.map(move => moveStr(move)).join(' ');
}

function isMoveExists(arg) {
    for (const { move } of generateMoves()) {
        if (move == arg) {
            if (!doMove(move)) continue;
            undoMove();
            return true;
        }
    }
    return false;
}




// D:1 Best:d2d4 Score:30 nodes:21 Pv: d2d4
// D:2 Best:d2d4 Score:0 nodes:207 Pv: d2d4 d7d5
// D:3 Best:d2d4 Score:25 nodes:2680 Pv: d2d4 d7d5 c1e3
// D:4 Best:d2d4 Score:0 nodes:17507 Pv: d2d4 d7d5 c1e3 c8e6
// D:5 Best:e2e4 Score:25 nodes:217789 Pv: e2e4 e7e5 d2d4 d7d5 c1e3



