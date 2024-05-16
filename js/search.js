const searchController = {};

searchController.nodes;
searchController.fh;
searchController.fhf;
searchController.depth;
searchController.time;
searchController.start;
searchController.stop;
searchController.best;
searchController.thinking;

function searchPosition() {
    let bestMove = null;
    let bestScore = -Infinite;

    for (let depth = 1; depth <= searchController.depth; ++depth) {
        let score = alphaBeta(-Infinite, Infinit, depth);
        if (searchController.stop) break;

        bestScore = score;
        bestMove = PVTable.getMove();

    }

    searchController.best = bestMove;
    searchController.thinking = false;
}

function alphaBeta(alpha, beta, depth) {
    searchController.nodes++;
    if (depth <= 0) {
        return quiescence();
    }

    if(isReperation() || gameBoard.fifyMove >= 100) {
        return 0;
    }
    if (nodes % 2048 == 0) checkTimeUp();

    if (gameBoard.history.length >= MaxDepth) {
        return evalPosition();
    }
    if(gameBoard.checkSq != Squares.noSq){
        ++depth;
    }

    let score = -Infinite;
    let legalMove = 0;
    let prevAlpha = alpha;
    let bestMove = null;
    const moveList = generateMoves();
    //priorities the move
    const pvMove = PVTable.getMove();
    if(pvMove){
        for(const moveObj of moveList){
            if(moveObj.move == pvMove){
                moveObj.score = 2000000;
                break;
            }
        }
    }
    moveList.sort((a, b) => b.score - a.score);
    for (const {move} of moveList) {
        if (doMove(move) == false) {
            continue;
        }
        legalMove++;
        score = -alphaBeta(beta, alpha, depth - 1);

        undoMove();
        if (searchController.stop) return 0;

        if (score > alpha) {
            if (score >= beta) {
                if (legalMove == 1) {
                    searchController.fhf++;
                }
                else {
                    searchController.fh++;
                }
                //update killer move ...
                return beta;
            }
            alpha = score;
            bestMove = move;
            //update history table ...
        }
    }

    if(!legalMove){
        //checkmate
        if(gameBoard.checkSq != Squares.noSq){
            return -Mate + gameBoard.history.length;
        }
        //stalemate
        else{
            return 0;
        }
    }
    if (alpha != prevAlpha) {
        PVTable.addMove(move);
    }
    return alpha;
}

function quiescence(alpha, beta){
    if(searchController.nodes % 2048 == 0) checkTimeUp();
    searchController.nodes++;

    if(isReperation() || gameBoard.fifyMove >= 100) return 0;
    if(gameBoard.history.length >= MaxDepth) return evalPosition();

    var score = evalPosition();
    if(score >= beta) return beta;
    if(score > alpha) return score;

    let bestMove = null;
    let prevAlpha = alpha;
    let legalMove = 0;

    const captureMoves = generateCaptureMoves();
    captureMoves.sort((a, b) => b.score - a.score);

    for(const {move} of captureMoves){
        if(doMove(move) == false){
            continue;
        }
        legalMove++;
        score = -quiescence(-beta, -alpha);

        undoMove();
        if(searchController.stop) return 0;

        if(score > alpha){
            if(score >= beta){
                if(legalMove == 1){
                    searchController.fhf++;
                }
                searchController.fh++;
                return beta;
            }
            alpha = score;
            bestMove = move;
        }
    }

    if(alpha != prevAlpha){
        PVTable.addMove(bestMove);
    }

    return alpha;
}

function checkTimeUp() {
    if ((Date.now() - searchController.start) >= searchController.time) {
        searchController.stop = true;
    }
}

function isReperation() {
    //max iteration 64, because max depth is 64
    for (const { positionKey } of gameBoard.history) {
        if (gameBoard.positionKey === positionKey) {
            return true;
        }
    }
    return false;
}