
import { Player } from '../types';

export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const calculateWinner = (board: Player[]): { winner: Player | 'DRAW', line: number[] | null } => {
  for (let i = 0; i < WIN_LINES.length; i++) {
    const [a, b, c] = WIN_LINES[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: WIN_LINES[i] };
    }
  }
  if (!board.includes(null)) {
    return { winner: 'DRAW', line: null };
  }
  return { winner: null, line: null };
};

// Minimax Algorithm for unbeatable AI
const minimax = (board: Player[], depth: number, isMaximizing: boolean): number => {
  const { winner } = calculateWinner(board);
  
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (winner === 'DRAW') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = 'O';
        const score = minimax(newBoard, depth + 1, false);
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = 'X';
        const score = minimax(newBoard, depth + 1, true);
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

export const getBestMove = (board: Player[]): number => {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const newBoard = [...board];
      newBoard[i] = 'O';
      const score = minimax(newBoard, 0, false);
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};

export const getRandomMove = (board: Player[]): number => {
  const availableMoves = board.map((val, idx) => (val === null ? idx : null)).filter((val) => val !== null) as number[];
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};
