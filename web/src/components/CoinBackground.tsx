'use client';

import React, { useEffect, useState } from 'react';

export default function CoinBackground() {
  const [coins, setCoins] = useState<{ id: number; delay: number; left: number; size: number; duration: number; opacity: number }[]>([]);

  useEffect(() => {
    const generateCoins = () => {
      return Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        delay: Math.random() * 20,
        left: Math.random() * 100,
        size: 15 + Math.random() * 20,
        duration: 7 + Math.random() * 10,
        opacity: 0.4 + Math.random() * 0.4,
      }));
    };

    const timeout = setTimeout(() => {
      setCoins(generateCoins());
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="animate-coin-fall pointer-events-none fixed z-0 flex items-center justify-center rounded-full border border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6),inset_0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            left: `${coin.left}%`,
            width: `${coin.size}px`,
            height: `${coin.size}px`,
            animationDelay: `${coin.delay}s`,
            animationDuration: `${coin.duration}s`,
            opacity: coin.opacity,
            top: '-50px',
            background: 'radial-gradient(circle at 30% 30%, #fef08a 0%, #eab308 50%, #a16207 100%)',
          }}
        >
          <div className="flex h-[70%] w-[70%] items-center justify-center rounded-full border border-yellow-600/30">
            <span className="text-[8px] font-black text-yellow-900/50 select-none">$</span>
          </div>
        </div>
      ))}
    </div>
  );
}
