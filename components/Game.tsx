import React from 'react';
import { X, Circle } from 'lucide-react';
import Square from './Square';
import { GameMode, Player, GameState, Difficulty } from '../types';

interface GameProps {
  mode: GameMode;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  board: Player[];
  status: GameState;
  handleMove: (i: number) => void;
  xIsNext: boolean;
  isHost: boolean;
  resetGame: () => void;
  onQuit: () => void;
  scores: { X: number; O: number; draws: number };
}

const Game: React.FC<GameProps> = ({
  mode,
  difficulty,
  setDifficulty,
  board,
  status,
  handleMove,
  xIsNext,
  isHost,
  resetGame,
  onQuit,
  scores
}) => {
  const isPlayerTurn = mode === GameMode.MULTI_GAME 
    ? (isHost ? xIsNext : !xIsNext)
    : (xIsNext);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm animate-in fade-in zoom-in-95">
      <div className="flex justify-between w-full items-center">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Game Mode</span>
          <span className="text-lg font-bold">{mode === GameMode.SOLO ? 'Player vs AI' : 'Multiplayer'}</span>
        </div>
        {mode === GameMode.SOLO && (
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
             <button 
              onClick={() => setDifficulty('EASY')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${difficulty === 'EASY' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
               Easy
             </button>
             <button 
              onClick={() => setDifficulty('MEDIUM')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${difficulty === 'MEDIUM' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
               Medium
             </button>
             <button 
              onClick={() => setDifficulty('EXPERT')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${difficulty === 'EXPERT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
               Expert
             </button>
          </div>
        )}
      </div>

      {/* Score Board */}
      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Player (X)</span>
          <span className="text-xl font-black">{scores.X}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Draws</span>
          <span className="text-xl font-black">{scores.draws}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{mode === GameMode.SOLO ? 'AI (O)' : 'Opponent (O)'}</span>
          <span className="text-xl font-black">{scores.O}</span>
        </div>
      </div>

      <div className="w-full grid grid-cols-3 gap-3">
        {board.map((sq, i) => (
          <Square 
            key={i} 
            value={sq} 
            onClick={() => handleMove(i)} 
            isWinningSquare={status.winningLine?.includes(i) || false}
            disabled={!!status.winner || !isPlayerTurn}
          />
        ))}
      </div>

      <div className="w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center gap-4 text-center">
        {status.winner ? (
          <div className="space-y-1">
             <p className="text-sm uppercase tracking-widest text-slate-500 font-bold">Game Over</p>
             <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
               {status.winner === 'DRAW' ? "It's a Tie!" : `${status.winner} Wins!`}
             </h3>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-all duration-300 ${xIsNext ? 'bg-indigo-500/20 text-indigo-400 scale-110 ring-2 ring-indigo-500/50' : 'bg-slate-800 text-slate-500 opacity-50'}`}>
                <X size={24} strokeWidth={3} />
              </div>
              <div className="h-0.5 w-8 bg-slate-800 rounded-full"></div>
              <div className={`p-3 rounded-xl transition-all duration-300 ${!xIsNext ? 'bg-emerald-500/20 text-emerald-400 scale-110 ring-2 ring-emerald-500/50' : 'bg-slate-800 text-slate-500 opacity-50'}`}>
                <Circle size={20} strokeWidth={3} />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              {isPlayerTurn ? "Your Turn" : "Opponent's Turn"}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          <button 
            onClick={resetGame}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition-all active:scale-95"
          >
            Restart
          </button>
          <button 
            onClick={onQuit}
            className="px-6 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 font-bold rounded-xl transition-all active:scale-95"
          >
            Quit
          </button>
        </div>
      </div>

      {mode === GameMode.MULTI_GAME && (
        <div className="flex items-center gap-2 text-xs text-emerald-500/80 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live connection active
        </div>
      )}
    </div>
  );
};

export default Game;
