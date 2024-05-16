const PVTable = {
    entries : {},
    clear : function(){
        this.entries = {};
    }, 
    addMove : function(move){
        this.entries[gameBoard.positionKey] = move;
    },
    getMove : function(){
        this.entries[gameBoard.positionKey];
    },
    getBestMovesTillDepth : function(depth){
        let moves = [];
        for(let i = 0; i<depth; ++i){
            let move = this.getMove();
            moves.push(move);
            doMove(move);
        }
        while(gameBoard.history.length){
            undoMove();
        }
        return moves.map(move=>moveStr(move));
    }
};
