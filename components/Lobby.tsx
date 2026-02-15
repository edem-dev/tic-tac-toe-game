import React from 'react';
import { Copy } from 'lucide-react';

interface LobbyProps {
  myId: string;
  targetId: string;
  setTargetId: (id: string) => void;
  connectToPeer: () => void;
  isConnecting: boolean;
  error: string;
  onBackToMenu: () => void;
}

const Lobby: React.FC<LobbyProps> = ({
  myId,
  targetId,
  setTargetId,
  connectToPeer,
  isConnecting,
  error,
  onBackToMenu,
}) => {
  return (
    <div className="flex flex-col gap-6 max-w-md w-full animate-in fade-in zoom-in-95">
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h2 className="text-2xl font-bold">Host a Game</h2>
        <p className="text-slate-400 text-sm">Share this code with your friend:</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-950 p-3 rounded-lg font-mono text-indigo-400 border border-slate-800 select-all overflow-hidden text-ellipsis">
            {myId || "Generating..."}
          </div>
          <button 
            onClick={() => { navigator.clipboard.writeText(myId); }}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            title="Copy Code"
          >
            <Copy size={20} className="text-indigo-400" />
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
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors uppercase"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value.toUpperCase())}
          />
          <button 
            onClick={connectToPeer}
            disabled={isConnecting}
            className={`w-full p-3 font-bold rounded-lg transition-all ${isConnecting ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
            {isConnecting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </div>
            ) : "Connect & Play"}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      <button onClick={onBackToMenu} className="text-slate-500 hover:text-slate-300 underline underline-offset-4 text-sm text-center">Back to Menu</button>
    </div>
  );
};

export default Lobby;
