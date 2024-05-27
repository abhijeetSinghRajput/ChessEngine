importScripts(
    'defs.js',
    'bitBoard.js',
    'board.js',
    'moveStructure.js',
    'generateMove.js',
    'evaluation.js',
    'pvTable.js',
    'search.js',
    'main.js'
);

init();

self.onmessage = function(e){
    const {command, searchTime, board} = e.data;
    gameBoard = board;
    if(command == 'search'){
        searchPosition(searchTime);
        self.postMessage({bestMove: searchController.best});
    }
}
