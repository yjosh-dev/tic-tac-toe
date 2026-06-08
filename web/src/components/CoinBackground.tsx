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
        size: 10 + Math.random() * 20,
        duration: 6 + Math.random() * 8,
        opacity: 0.3 + Math.random() * 0.5,
      }));
    };

    // Use a timeout to avoid synchronous setState in effect lint error
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
          className="animate-coin-fall pointer-events-none fixed z-0 flex items-center justify-center rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] border-2 border-yellow-500"
          style={{
            left: `${coin.left}%`,
            width: `${coin.size}px`,
            height: `${coin.size}px`,
            animationDelay: `${coin.delay}s`,
            animationDuration: `${coin.duration}s`,
            opacity: coin.opacity,
            top: '-50px',
          }}
        >
          <span className="text-[8px] font-bold text-yellow-700 select-none">$</span>
        </div>
      ))}
    </div>
  );
}
