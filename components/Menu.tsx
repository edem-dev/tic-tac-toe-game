import React from 'react';
import { GameMode } from '../types';

interface MenuProps {
  onStartSolo: () => void;
  onStartMultiplayer: () => void;
  showInstallBtn: boolean;
  onInstallClick: () => void;
}

const Menu: React.FC<MenuProps> = ({ 
  onStartSolo, 
  onStartMultiplayer, 
  showInstallBtn, 
  onInstallClick 
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">TICKY
        </h1>
        <p className="text-slate-400 font-medium">Modern Classic Challenge</p>
      </div>

      <div className="grid grid-cols-1 w-full gap-4">
        <button 
          onClick={onStartSolo}
          className="group relative p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] text-left"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xl font-bold">Single Player</span>
            <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded">VS AI</span>
          </div>
          <p className="text-slate-500 text-sm">Challenge the machine in expert or easy mode.</p>
        </button>

        <button 
          onClick={onStartMultiplayer}
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
            onClick={onInstallClick}
            className="group relative p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl hover:bg-indigo-600/20 transition-all text-center"
          >
            <span className="text-indigo-400 font-bold text-sm">✨ Install App for Offline Play</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Menu;
