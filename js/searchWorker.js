importScripts(
    'defs.js',
    'bitBoard.js',
    'board.js',
    'moveStructure.js',
    'generateMove.js',
    'evaluation.js',
    'pvTable.js',
    'search.js',
    'polyglot.js',
    'main.js',
);

self.onmessage = function(e){
    const {command, searchTime, board} = e.data;
    gameBoard = board;
    if(command == 'search'){
        let depth = searchPosition(searchTime);
        self.postMessage({
            command: 'searchFinished',
            bestMove: searchController.bestMove,
            bestScore: searchController.bestScore,
            depth : searchController.depthReached,
        })
    }
}
