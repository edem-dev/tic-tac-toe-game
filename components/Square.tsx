
import React from 'react';
import { Player } from '../types';
import { X, Circle } from 'lucide-react';

interface SquareProps {
  value: Player;
  onClick: () => void;
  isWinningSquare: boolean;
  disabled: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare, disabled }) => {
  const baseStyles = "w-full aspect-square flex items-center justify-center rounded-xl transition-all duration-300";
  const hoverStyles = !disabled && !value ? "hover:bg-slate-800 cursor-pointer active:scale-90" : "cursor-default";
  const bgStyles = isWinningSquare 
    ? (value === 'X' ? "bg-indigo-600/40 text-indigo-300 shadow-[0_0_20px_rgba(79,70,229,0.4)]" : "bg-emerald-600/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]")
    : "bg-slate-900 text-slate-100 border border-slate-800";

  return (
    <button
      onClick={onClick}
      disabled={disabled || !!value}
      className={`${baseStyles} ${hoverStyles} ${bgStyles}`}
    >
      {value === 'X' && (
        <X size={48} strokeWidth={3} className="animate-[scale-in_0.2s_ease-out] text-indigo-400" />
      )}
      {value === 'O' && (
        <Circle size={40} strokeWidth={3} className="animate-[scale-in_0.2s_ease-out] text-emerald-400" />
      )}
    </button>
  );
};

export default Square;
