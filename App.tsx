
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import { GameMode, Player, GameState, PeerMessage, Difficulty } from './types';
import { calculateWinner, getBestMove, getRandomMove } from './services/gameLogic';
import Square from './components/Square';

const App: React.FC = () => {
  // Navigation State
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>('EXPERT');

  // PWA Installation State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Game State
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [status, setStatus] = useState<GameState>({ board: Array(9).fill(null), xIsNext: true, winner: null, winningLine: null });

  // Multiplayer State
  const [peer, setPeer] = useState<any>(null);
  const [conn, setConn] = useState<any>(null);
  const [myId, setMyId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const boardRef = useRef<Player[]>(board);
  useEffect(() => { boardRef.current = board; }, [board]);

  // PWA Logic
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    if (mode === GameMode.MULTI_LOBBY && !peer) {
      const p = new Peer();
      p.on('open', (id: string) => setMyId(id));
      p.on('connection', (connection: any) => {
        if (connRef.current) {
          connection.close();
          return;
        }
        setIsHost(true);
        setupConnection(connection);
      });
      p.on('error', (err: any) => {
        console.error('Peer error:', err);
        setError(err.type === 'peer-not-found' ? 'Peer not found.' : 'Connection error.');
      });
      setPeer(p);
    }
  }, [mode, peer]);

  const connRef = useRef<any>(null);
  useEffect(() => { connRef.current = conn; }, [conn]);

  const setupConnection = (c: any) => {
    c.on('open', () => {
      setConn(c);
      setConnected(true);
      setMode(GameMode.MULTI_GAME);
      resetGame();
    });
    c.on('data', (data: any) => {
      const msg = data as PeerMessage;
      if (msg.type === 'MOVE' && typeof msg.index === 'number') {
        handleMove(msg.index, true);
      } else if (msg.type === 'RESET') {
        resetGame(true);
      }
    });
    c.on('close', () => {
      setConnected(false);
      setError('Opponent disconnected.');
      setMode(GameMode.MULTI_LOBBY);
      setConn(null);
    });
    c.on('error', (err: any) => {
      console.error('Connection error:', err);
      setError('Connection lost.');
    });
  };

  const connectToPeer = () => {
    if (!targetId || !peer) return;
    setIsHost(false);
    const connection = peer.connect(targetId);
    setupConnection(connection);
  };

  const handleMove = useCallback((i: number, fromRemote: boolean = false) => {
    const currentWinner = calculateWinner(boardRef.current).winner;
    if (currentWinner || boardRef.current[i]) return;

    if (mode === GameMode.MULTI_GAME && !fromRemote) {
      const mySymbol = isHost ? 'X' : 'O';
      const currentTurnSymbol = xIsNext ? 'X' : 'O';
      if (mySymbol !== currentTurnSymbol) return;
      if (conn) conn.send({ type: 'MOVE', index: i });
    }

    setBoard(prev => {
      const newBoard = [...prev];
      newBoard[i] = xIsNext ? 'X' : 'O';
      
      const result = calculateWinner(newBoard);
      setStatus({
        board: newBoard,
        xIsNext: !xIsNext,
        winner: result.winner,
        winningLine: result.line
      });
      return newBoard;
    });
    setXIsNext(prev => !prev);
  }, [mode, isHost, conn, xIsNext]);

  useEffect(() => {
    if (mode === GameMode.SOLO && !xIsNext && !status.winner) {
      const currentBoard = [...boardRef.current];
      const timeout = setTimeout(() => {
        const move = difficulty === 'EXPERT' ? getBestMove(currentBoard) : getRandomMove(currentBoard);
        if (move !== -1 && move !== undefined) handleMove(move);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [xIsNext, mode, difficulty, status.winner, handleMove]);

  const resetGame = (fromRemote: boolean = false) => {
    const newBoard = Array(9).fill(null);
    setBoard(newBoard);
    setXIsNext(true);
    setStatus({ board: newBoard, xIsNext: true, winner: null, winningLine: null });
    
    if (mode === GameMode.MULTI_GAME && !fromRemote && conn) {
      conn.send({ type: 'RESET' });
    }
  };

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center gap-8 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
          TIC-TAC-TOE
        </h1>
        <p className="text-slate-400 font-medium">Modern Classic Challenge</p>
      </div>

      <div className="grid grid-cols-1 w-full gap-4">
        <button 
          onClick={() => { setMode(GameMode.SOLO); resetGame(); }}
          className="group relative p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] text-left"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xl font-bold">Single Player</span>
            <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded">VS AI</span>
          </div>
          <p className="text-slate-500 text-sm">Challenge the machine in expert or easy mode.</p>
        </button>

        <button 
          onClick={() => setMode(GameMode.MULTI_LOBBY)}
          className="group relative p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] text-left"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xl font-bold">Multiplayer</span>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded">ONLINE</span>
          </div>
          <p className="text-slate-500 text-sm">Play with a friend via matchmaking codes.</p>
        </button>

        {showInstallBtn && (
          <button 
            onClick={handleInstallClick}
            className="group relative p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl hover:bg-indigo-600/20 transition-all text-center"
          >
            <span className="text-indigo-400 font-bold text-sm">✨ Install App for Offline Play</span>
          </button>
        )}
      </div>
    </div>
  );

  const renderLobby = () => (
    <div className="flex flex-col gap-6 max-w-md w-full animate-in fade-in zoom-in-95">
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h2 className="text-2xl font-bold">Host a Game</h2>
        <p className="text-slate-400 text-sm">Share this code with your friend:</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-950 p-3 rounded-lg font-mono text-indigo-400 border border-slate-800 select-all overflow-hidden text-ellipsis">
            {myId || "Generating..."}
          </div>
          <button 
            onClick={() => { navigator.clipboard.writeText(myId); alert("Copied!"); }}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            📋
          </button>
        </div>
        <p className="text-xs text-slate-500 animate-pulse">Waiting for opponent to join...</p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800"></span></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-950 px-2 text-slate-500">OR</span></div>
      </div>

      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h2 className="text-2xl font-bold">Join a Game</h2>
        <div className="space-y-2">
          <input 
            type="text" 
            placeholder="Enter friend's code..." 
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          />
          <button 
            onClick={connectToPeer}
            className="w-full p-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg transition-all"
          >
            Connect & Play
          </button>
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      <button onClick={() => setMode(GameMode.MENU)} className="text-slate-500 hover:text-slate-300 underline underline-offset-4 text-sm text-center">Back to Menu</button>
    </div>
  );

  const renderGame = () => {
    const isPlayerTurn = mode === GameMode.MULTI_GAME 
      ? (isHost ? xIsNext : !xIsNext)
      : (xIsNext);

    return (
      <div className="flex flex-col items-center gap-8 w-full max-w-sm animate-in fade-in zoom-in-95">
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
                onClick={() => setDifficulty('EXPERT')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${difficulty === 'EXPERT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 Expert
               </button>
            </div>
          )}
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
                  <span className="text-2xl font-black">X</span>
                </div>
                <div className="h-0.5 w-8 bg-slate-800 rounded-full"></div>
                <div className={`p-3 rounded-xl transition-all duration-300 ${!xIsNext ? 'bg-emerald-500/20 text-emerald-400 scale-110 ring-2 ring-emerald-500/50' : 'bg-slate-800 text-slate-500 opacity-50'}`}>
                  <span className="text-2xl font-black">O</span>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                {isPlayerTurn ? "Your Turn" : "Opponent's Turn"}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <button 
              onClick={() => resetGame()}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition-all active:scale-95"
            >
              Restart
            </button>
            <button 
              onClick={() => { setMode(GameMode.MENU); setPeer(null); setConn(null); }}
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {mode === GameMode.MENU && renderMenu()}
      {mode === GameMode.MULTI_LOBBY && renderLobby()}
      {(mode === GameMode.SOLO || mode === GameMode.MULTI_GAME) && renderGame()}
      
      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default App;
