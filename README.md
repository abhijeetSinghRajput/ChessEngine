# Chess Engine  
[Live Demo](https://chessleague.netlify.app)  
[GitHub Repository](https://github.com/abhijeetSinghRajput/ChessEngine)  

## Table of Contents  
1. [Overview](#overview)  
2. [Features](#features)  
3. [Technologies Used](#technologies-used)  
4. [Installation](#installation)  
5. [How It Works](#how-it-works)  
6. [Playing the Game](#playing-the-game)  
7. [Algorithm Overview](#algorithm-overview)  
8. [Testing and Evaluation](#testing-and-evaluation)  
9. [Future Enhancements](#future-enhancements)  
10. [Contributing](#contributing)  
11. [License](#license)  
12. [Acknowledgements](#acknowledgements)  
13. [Contact](#contact)  

## Overview  
The **Chess Engine** is a powerful and efficient chess-playing system designed to compete at an advanced level. With an ELO rating of 2100, it can play against seasoned players and provide a competitive challenge. It incorporates a variety of chess algorithms and optimizations to make decisions, evaluate board positions, and search for the best moves. The engine is built with cutting-edge techniques and aims to deliver a smooth, high-level experience for players.

## Features  
- **Advanced AI:** Capable of playing at a high level with a well-trained evaluation function.  
- **Opening Book:** Utilizes an opening book to play well-known openings at the start of the game.  
- **Alpha-Beta Pruning:** Implemented to reduce the search space, improving performance during the decision-making process.  
- **Transposition Tables:** For memoizing previously evaluated positions and reducing redundant calculations.  
- **Evaluation Function:** A strong evaluation system considering various aspects like material, piece position, king safety, etc.  
- **Move Ordering Heuristics:** Such as killer moves, which prioritize promising moves to speed up the search.  
- **UCI Protocol Support:** Compatible with Universal Chess Interface (UCI) for easy integration with chess GUIs.  

## Technologies Used  
- **Languages:** C++ (for engine logic)  
- **Libraries:**  
  - SFML (for graphical interface and rendering)  
  - UCI protocol for chess GUIs  
- **Data Structures:**  
  - Bitboards for fast bitwise operations  
  - Hash tables for transposition tables  
  - Minimax algorithm with alpha-beta pruning  

## Installation  
To set up the Chess Engine locally, follow these steps:

1. Clone the repository:  
   ```bash  
   git clone https://github.com/abhijeetSinghRajput/ChessEngine.git