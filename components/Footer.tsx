import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
      <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
        Built with <span className="animate-pulse text-indigo-400">☕</span> by Michael
      </p>
      <a 
        href="https://github.com/edem-dev/tic-tac-toe-game.git" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs font-bold"
      >
        <Github size={14} />
        View on GitHub
      </a>
    </footer>
  );
};

export default Footer;
