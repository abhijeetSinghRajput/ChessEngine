let book;
fetch('../book.json')
	.then(response => response.json())
	.then(data => book = data)
	.catch(err => console.log(err));

function getMoveFromBook() {
	const positionKey = gameBoard.positionKey.toString(16);
	// no move present for current position
	if (!book[positionKey]) return false;

	// pick a random move from movelist
	const moves = Object.keys(book[positionKey]);
	const move = moves[Math.floor(Math.random() * moves.length)];

	searchController.bestMove = move | FromBookFlag;
	searchController.thinking = false;
	return true;
}

const searchController = {};
searchController.depthReached;
searchController.nodes;
searchController.fh;
searchController.fhf;
searchController.depth;
searchController.time;
searchController.start;
searchController.stop;
searchController.bestMove;
searchController.bestScore;
searchController.thinking;
searchController.ply;
searchController.killers = new Array(MaxDepth); //killer[ply][0/1];
searchController.history = new Array(13); //


searchController.clear = function () {
	this.killers = Array.from({ length: MaxDepth }, () => [null, null]);
	this.history = Array.from({ length: 13 }, () => Array(120).fill(0));
	this.ply = 0;
	this.depthReached = 0;
	this.nodes = 0;
	this.fh = 0;
	this.fhf = 0;
	this.start = Date.now();
	this.stop = false;
}

searchController.clear();

function searchPosition(thinkingTime = 2) {
	let bestMove = null;
	let bestScore = -Infinite;
	let depth = 1;
	let ordering = 0;

	searchController.clear();
	PvTable.clear();

	if (getMoveFromBook()) return;
	searchController.depth = MaxDepth;
	searchController.start = Date.now();
	searchController.time = thinkingTime * 1000;

	for (depth = 1; depth <= searchController.depth; ++depth) {
		bestScore = alphaBeta(-Infinite, Infinite, depth);

		if (searchController.stop) break;

		bestMove = PvTable.getMove();

		if (depth != 1) {
			ordering = ((searchController.fhf / searchController.fh) * 100).toFixed(2);
		}

		self.postMessage({
			command: 'searching',
			depth,
			pvLine: PvTable.getLine(depth),
			bestMove,
			bestScore,
			nodes: searchController.nodes,
			ordering,
		})
		searchController.bestMove = bestMove;
		searchController.bestScore = bestScore;
		searchController.depthReached = depth;
	}
	console.log(searchController.nodes, searchController.depthReached);
	searchController.thinking = false;
}




function alphaBeta(alpha, beta, depth, { doNull = true } = {}) {
	if (depth <= 0) {
		return quiescence(alpha, beta);
	}

	if ((searchController.nodes % 2048) == 0) {
		checkTimeUp();
	}

	searchController.nodes++;

	if ((isRepetition() || gameBoard.fiftyMove >= 100) && searchController.ply != 0) {
		return 0;
	}

	if (searchController.ply >= MaxDepth) {
		return evalPosition();
	}

	let inCheck = gameBoard.checkSq != Squares.noSq;
	if (inCheck) {
		++depth;
	}

	let score = -Infinite;

	//NULL Move Pruning
	if (doNull && !inCheck && searchController.ply && depth >= 4) {
		doNullMove();
		score = -alphaBeta(-beta, -beta + 1, depth - 4, { doNull: false });
		undoNullMove();
		if (searchController.stop) return 0;
		if (score >= beta) {
			return beta;
		}
	}

	const moves = generateMoves();
	let legalMove = 0;
	const prevAlpha = alpha;
	let bestMove = null;

	let pvMove = PvTable.getMove();
	if (pvMove) {
		for (const moveObj of moves) {
			if (moveObj.move == pvMove) {
				moveObj.score = 2000000;
				break;
			}
		}
	}

	for (let i = 0; i < moves.length; ++i) {
		swapWithBest(i, moves);
		const move = moves[i].move;

		if (!doMove(move)) continue;
		legalMove++;
		searchController.ply++;
		score = -alphaBeta(-beta, -alpha, depth - 1);

		undoMove();
		searchController.ply--;

		if (searchController.stop) return 0;

		if (score > alpha) {
			if (score >= beta) {
				if (legalMove === 1) searchController.fhf++;
				searchController.fh++;
				if (!(move & CaptureFlag)) {
					searchController.killers[searchController.ply][1] = searchController.killers[searchController.ply][0];
					searchController.killers[searchController.ply][0] = move;
				}
				return beta;
			}
			alpha = score;
			bestMove = move;
			if (!(move & CaptureFlag)) {
				let piece = gameBoard.pieces[moveFrom(move)];
				let toSq = moveTo(move);
				searchController.history[piece][toSq] += depth * depth;
			}
		}

	}

	if (legalMove == 0) {
		if (inCheck) {
			return -Mate + searchController.ply;
		} else {
			return 0;
		}
	}

	if (alpha != prevAlpha) {
		PvTable.addMove(bestMove);
	}

	return alpha;
}


function quiescence(alpha, beta) {

	if ((searchController.nodes % 2048) == 0) {
		checkTimeUp();
	}

	searchController.nodes++;

	if ((isRepetition() || gameBoard.fiftyMove >= 100) && searchController.ply != 0) {
		return 0;
	}

	if (searchController.ply >= MaxDepth) {
		return evalPosition();
	}

	let score = evalPosition();

	if (score >= beta) return beta;
	if (score > alpha) alpha = score;


	let legalMove = 0;
	let prevAlpha = alpha;
	let bestMove = null;
	let moves = generateCaptureMoves();


	for (let i = 0; i < moves.length; ++i) {
		swapWithBest(i, moves);
		const move = moves[i].move;

		if (!doMove(move)) continue;
		legalMove++;
		searchController.ply++;

		score = -quiescence(-beta, -alpha);

		undoMove();
		searchController.ply--;

		if (searchController.stop) return 0;

		if (score > alpha) {
			if (score >= beta) {
				if (legalMove == 1) {
					searchController.fhf++;
				}
				searchController.fh++;
				return beta;
			}
			alpha = score;
			bestMove = move;
		}
	}

	if (alpha != prevAlpha) {
		PvTable.addMove(bestMove);
	}

	return alpha;

}

function swapWithBest(i, moves) {
	let bestIndex = i;
	for (let j = i + 1; j < moves.length; ++j) {
		if (moves[j].score > moves[bestIndex].score) {
			bestIndex = j;
		}
	}
	if (bestIndex !== i) {
		[moves[i], moves[bestIndex]] = [moves[bestIndex], moves[i]];
	}
}


function checkTimeUp() {
	if ((Date.now() - searchController.start) > searchController.time) {
		searchController.stop = true;
	}
}

function isRepetition() {
	let hisPly = gameBoard.history.length;
	for (let i = hisPly - gameBoard.fiftyMove; i < hisPly - 1; ++i) {
		if (gameBoard.positionKey == gameBoard.history[i].positionKey) {
			return true;
		}
	}

	return false;
}

