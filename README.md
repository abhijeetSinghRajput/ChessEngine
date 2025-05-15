# JavaScript Chess Engine (elo 2100)

This is a lightweight and powerful chess engine written in JavaScript. It includes a bitboard-based architecture, move generation, evaluation, and a basic GUI. The project is modular and structured to make learning, debugging, and extending easier.

## Features

- **Bitboard Representation** for efficient board handling (`bitBoard.js`)
- **Move Generation** including legal move filtering (`generateMove.js`)
- **Search Algorithm** with basic evaluation (`search.js`, `evaluation.js`)
- **PGN Compiler** to parse/export games (`pgnCompiler.js`)
- **Polyglot Opening Book Support** (`polyglot.js`)
- **Perft Testing** for move generation accuracy (`perft.js`)
- **Worker Support** for parallelized searching (`searchWorker.js`)
- **Modular UI Components** in `gui/` folder

## File Structure

- `bitBoard.js` - Core representation of the chessboard
- `board.js` - Board setup, FEN parsing
- `defs.js` - Constants and definitions
- `evaluation.js` - Evaluation function to score positions
- `generateMove.js` - Generates all legal and pseudo-legal moves
- `main.js` - Entry point and initialization
- `moveStructure.js` - Move representation and utilities
- `perft.js` - Perft functionality for debugging
- `pgnCompiler.js` - Handles PGN parsing and generation
- `polyglot.js` - Integration for opening books
- `pvTable.js` - Principal variation table
- `search.js` - Minimax/Alpha-beta logic
- `searchWorker.js` - Web worker for background search
- `gui/` - Contains the graphical interface files

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/abhijeetSinghRajput/chessEngine.git
   cd chessEngine