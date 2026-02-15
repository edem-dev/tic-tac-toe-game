
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import { GameMode, Player, GameState, PeerMessage, Difficulty } from './types';
import { calculateWinner, getBestMove, getRandomMove, getMediumMove } from './services/gameLogic';
import Menu from './components/Menu';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Footer from './components/Footer';

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
  const [scores, setScores] = useState<{ X: number; O: number; draws: number }>({ X: 0, O: 0, draws: 0 });

  // Multiplayer State
  const [peer, setPeer] = useState<any>(null);
  const [conn, setConn] = useState<any>(null);
  const [myId, setMyId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const isHostRef = useRef<boolean>(false);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);
  const [connected, setConnected] = useState<boolean>(false);
  const connectedRef = useRef<boolean>(false);
  useEffect(() => { connectedRef.current = connected; }, [connected]);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
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
      // Use a custom alphabet to avoid confusing characters like 0, O, 1, I, l
      const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let shortId = '';
      for (let i = 0; i < 6; i++) {
        shortId += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }
      
      const p = new Peer(shortId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        }
      });
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
      setIsConnecting(false);
      setMode(GameMode.MULTI_GAME);
      resetGame();
    });
    c.on('data', (data: any) => {
      const msg = data as PeerMessage;
      if (msg.type === 'MOVE' && typeof msg.index === 'number') {
        // Log received move for debugging
        console.log('Received move:', msg.index);
        
        // Double check it's actually the opponent's turn when receiving a move
        const currentTurnSymbol = boardRef.current.filter(Boolean).length % 2 === 0 ? 'X' : 'O';
        const opponentSymbol = isHostRef.current ? 'O' : 'X';
        
        // We only accept the move if it's the opponent's turn
        if (currentTurnSymbol === opponentSymbol) {
          handleMove(msg.index, true);
        } else {
          console.warn('Received move out of turn:', msg.index, 'Expected turn for:', opponentSymbol, 'Current turn:', currentTurnSymbol);
        }
      } else if (msg.type === 'RESET') {
        resetGame(true);
      }
    });
    c.on('close', () => {
      setConnected(false);
      setIsConnecting(false);
      setError('Opponent disconnected.');
      setMode(GameMode.MULTI_LOBBY);
      setConn(null);
    });
    c.on('error', (err: any) => {
      console.error('Connection error:', err);
      setIsConnecting(false);
      setError('Connection lost.');
    });
  };

  const connectToPeer = () => {
    if (!targetId || !peer || isConnecting) return;
    setIsHost(false);
    setError('');
    setIsConnecting(true);
    
    const connection = peer.connect(targetId);
    setupConnection(connection);

    // Timeout mechanism
    setTimeout(() => {
      if (connRef.current) return; // Already connected
      setIsConnecting(false);
      if (!connectedRef.current) {
        connection.close();
        setError('Connection timed out. Please check the code.');
      }
    }, 10000); // 10 seconds timeout
  };

  const handleMove = useCallback((i: number, fromRemote: boolean = false) => {
    // Check winner based on current board state
    const currentResult = calculateWinner(boardRef.current);
    if (currentResult.winner || boardRef.current[i]) return;

    if (mode === GameMode.MULTI_GAME && !fromRemote) {
      const mySymbol = isHost ? 'X' : 'O';
      // Use the helper to determine whose turn it is
      const nextToPlay = boardRef.current.filter(Boolean).length % 2 === 0 ? 'X' : 'O';
      if (mySymbol !== nextToPlay) return;
      if (conn) {
        console.log('Sending move:', i);
        conn.send({ type: 'MOVE', index: i });
      }
    }

    setBoard(prev => {
      const newBoard = [...prev];
      // Determine the symbol based on current pieces on the board
      const symbol = newBoard.filter(Boolean).length % 2 === 0 ? 'X' : 'O';
      newBoard[i] = symbol;
      
      const result = calculateWinner(newBoard);
      setStatus({
        board: newBoard,
        xIsNext: symbol === 'X' ? false : true,
        winner: result.winner,
        winningLine: result.line
      });

      if (result.winner) {
        setScores(prev => {
          if (result.winner === 'X') return { ...prev, X: prev.X + 1 };
          if (result.winner === 'O') return { ...prev, O: prev.O + 1 };
          if (result.winner === 'DRAW') return { ...prev, draws: prev.draws + 1 };
          return prev;
        });
      }
      return newBoard;
    });
    setXIsNext(prev => !prev);
  }, [mode, isHost, conn]);

  useEffect(() => {
    if (mode === GameMode.SOLO && !xIsNext && !status.winner) {
      const currentBoard = [...boardRef.current];
      const timeout = setTimeout(() => {
        let move: number;
        if (difficulty === 'EXPERT') {
          move = getBestMove(currentBoard);
        } else if (difficulty === 'MEDIUM') {
          move = getMediumMove(currentBoard);
        } else {
          move = getRandomMove(currentBoard);
        }
        if (move !== -1 && move !== undefined) handleMove(move);
      }, 1000);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {mode === GameMode.MENU && (
        <Menu 
          onStartSolo={() => { setMode(GameMode.SOLO); resetGame(); setScores({ X: 0, O: 0, draws: 0 }); }}
          onStartMultiplayer={() => { setMode(GameMode.MULTI_LOBBY); setScores({ X: 0, O: 0, draws: 0 }); }}
          showInstallBtn={showInstallBtn}
          onInstallClick={handleInstallClick}
        />
      )}
      {mode === GameMode.MULTI_LOBBY && (
        <Lobby 
          myId={myId}
          targetId={targetId}
          setTargetId={setTargetId}
          connectToPeer={connectToPeer}
          isConnecting={isConnecting}
          error={error}
          onBackToMenu={() => setMode(GameMode.MENU)}
        />
      )}
      {(mode === GameMode.SOLO || mode === GameMode.MULTI_GAME) && (
        <Game 
          mode={mode}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          board={board}
          status={status}
          handleMove={handleMove}
          xIsNext={xIsNext}
          isHost={isHost}
          resetGame={() => resetGame()}
          onQuit={() => { setMode(GameMode.MENU); setPeer(null); setConn(null); }}
          scores={scores}
        />
      )}
      
      <Footer />
      
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
