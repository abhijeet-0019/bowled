import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';

export const UI = () => {
  const { score, lives, spin, gameState, ballState, startGame } = useGameStore();
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null);

  useEffect(() => {
    if (ballState === 'hit') {
      setFlash('hit');
      const t = setTimeout(() => setFlash(null), 1000);
      return () => clearTimeout(t);
    } else if (ballState === 'missed') {
      setFlash('miss');
      const t = setTimeout(() => setFlash(null), 1000);
      return () => clearTimeout(t);
    }
  }, [ballState]);

  if (gameState === 'start') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f5f5f0] text-gray-900 z-10">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">SPIN BOWLER</h1>
        <p className="text-lg mb-8 max-w-md text-center text-gray-600">
          Drag to bowl. Watch the spin indicator. Hit the stumps.
        </p>
        <button 
          onClick={startGame}
          className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          PLAY
        </button>
      </div>
    );
  }

  if (gameState === 'gameover') {
    const highScore = localStorage.getItem('cricketHighScore') || '0';
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f5f5f0]/90 backdrop-blur-sm text-gray-900 z-10">
        <h2 className="text-4xl font-bold mb-2">GAME OVER</h2>
        <p className="text-xl mb-2">Score: <span className="font-mono font-bold">{score}</span></p>
        <p className="text-md mb-8 text-gray-500">High Score: <span className="font-mono">{highScore}</span></p>
        <button 
          onClick={startGame}
          className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          PLAY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      {/* Flash Overlay */}
      {flash === 'hit' && (
        <div className="absolute inset-0 bg-green-500/20 animate-[pulse_1s_ease-out]" />
      )}
      {flash === 'miss' && (
        <div className="absolute inset-0 bg-red-500/20 animate-[pulse_1s_ease-out]" />
      )}
      
      {/* Top Bar */}
      <div className="flex justify-between items-start w-full max-w-4xl mx-auto z-20">
        
        {/* Spin Indicator */}
        <div className="flex flex-col items-center bg-white/80 backdrop-blur px-6 py-3 rounded-2xl shadow-sm border border-black/5 pointer-events-auto">
          <div className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-1">Spin</div>
          <div className="flex items-center gap-3">
            {spin.direction === 'Left' && <span className="text-xl font-bold">←</span>}
            <div className={`w-5 h-5 rounded-full border-2 border-gray-900 border-t-gray-300 ${spin.direction === 'Left' ? 'animate-[spin_1s_linear_infinite_reverse]' : 'animate-[spin_1s_linear_infinite]'}`} />
            <span className="font-mono text-xl font-bold">{spin.degree}° {spin.direction}</span>
            {spin.direction === 'Right' && <span className="text-xl font-bold">→</span>}
          </div>
        </div>

        {/* Score & Lives */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4">
            <div className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Score</div>
            <div className="font-mono text-2xl font-bold">{score}</div>
          </div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full ${i < lives ? 'bg-gray-900' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Hint */}
      <div className="text-center text-gray-500 text-sm tracking-wide">
        Drag down for power, left/right for angle
      </div>
    </div>
  );
};
