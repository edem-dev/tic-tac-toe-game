
export type Player = 'X' | 'O' | null;

export enum GameMode {
  MENU = 'MENU',
  SOLO = 'SOLO',
  MULTI_LOBBY = 'MULTI_LOBBY',
  MULTI_GAME = 'MULTI_GAME'
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'EXPERT';

export interface GameState {
  board: Player[];
  xIsNext: boolean;
  winner: Player | 'DRAW';
  winningLine: number[] | null;
}

export interface PeerMessage {
  type: 'MOVE' | 'RESET' | 'CHAT';
  index?: number;
  text?: string;
  sender?: Player;
}
