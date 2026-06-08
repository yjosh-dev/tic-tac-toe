'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import FundAccount from '@/components/FundAccount';
import AddTrustline from '@/components/AddTrustline';
import BalanceCard from '@/components/BalanceCard';
import SendPayment from '@/components/SendPayment';
import TicTacToe from '@/components/TicTacToe';

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connecting } = wallet;
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Generate random coins for the background rain
  const coins = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${5 + Math.random() * 10}s`,
    delay: `${Math.random() * -15}s`,
    size: `${10 + Math.random() * 30}px`,
    opacity: 0.1 + Math.random() * 0.3,
    emoji: ['🪙', '💎', '💰', '✨'][Math.floor(Math.random() * 4)]
  }));

  return (
    <main className="min-h-screen w-full bg-[#1a0505] text-slate-100 overflow-x-hidden selection:bg-yellow-500 selection:text-black font-sans">
      
      {/* 🎰 THEMED BACKGROUND 🎰 */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Red Felt Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4a0404_0%,_#1a0505_100%)]"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        
        {/* 🪙 INFINITE COIN RAIN 🪙 */}
        <div className="absolute inset-0">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className="absolute animate-coin-fall text-yellow-500/30 select-none"
              style={{
                left: coin.left,
                animationDuration: coin.duration,
                animationDelay: coin.delay,
                fontSize: coin.size,
                opacity: coin.opacity,
                filter: 'blur(1px)',
              }}
            >
              {coin.emoji}
            </div>
          ))}
        </div>

        {/* Floating Neon Card Suits */}
        <div className="absolute top-20 left-10 text-red-500/20 text-9xl rotate-12 animate-pulse">♠</div>
        <div className="absolute bottom-40 right-10 text-red-600/20 text-9xl -rotate-12 animate-pulse delay-700">♥</div>
        <div className="absolute top-1/2 left-1/4 text-red-500/10 text-8xl rotate-45 animate-bounce">♦</div>
        <div className="absolute bottom-20 left-1/2 text-red-600/10 text-9xl -rotate-45 animate-bounce delay-1000">♣</div>
        
        {/* Spotlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-yellow-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 flex flex-col items-center">
        
        {/* 🏰 SYMMETRICAL HEADER 🏰 */}
        <header className="w-full flex flex-col items-center mb-16">
          <div className="relative inline-block text-center group">
            {/* Golden Halo */}
            <div className="absolute -inset-8 bg-yellow-500/20 blur-[60px] rounded-full group-hover:bg-yellow-500/30 transition-all duration-1000"></div>
            
            <h1 className="relative text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] mb-4">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-700 drop-shadow-[0_8px_0_rgba(0,0,0,1)]">
                STELLAR
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-red-200 via-red-500 to-red-800 drop-shadow-[0_8px_0_rgba(0,0,0,1)]">
                ROYALE
              </span>
            </h1>
            
            {/* Animated Casino Chips Decor */}
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-12 hidden md:block animate-bounce">
               <div className="h-16 w-16 rounded-full border-4 border-dashed border-white bg-blue-600 shadow-2xl flex items-center justify-center font-black text-white text-xs">100</div>
            </div>
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 rotate-12 hidden md:block animate-bounce delay-300">
               <div className="h-16 w-16 rounded-full border-4 border-dashed border-white bg-red-600 shadow-2xl flex items-center justify-center font-black text-white text-xs">500</div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
             <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
             <p className="text-xl md:text-2xl font-black uppercase tracking-[0.4em] text-yellow-400 drop-shadow-lg text-center">
                The Galaxy's Elite Playground
             </p>
             <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
          </div>

          <div className="mt-10 transform hover:scale-105 transition-transform duration-300">
            <ConnectWallet {...wallet} />
          </div>
        </header>

        {/* 🏛️ SYMMETRICAL MAIN CONTENT 🏛️ */}
        <div className="w-full max-w-4xl space-y-12">
          
          {/* 🎯 THE GAME (CENTERED) */}
          <section className="w-full flex flex-col items-center">
            {!publicKey && !connecting ? (
              <div className="w-full max-w-2xl rounded-[40px] border-8 border-[#2a1a1a] bg-[#120a0a]/90 backdrop-blur-xl p-16 text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border-double">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 p-1 mb-8 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-5xl">👑</div>
                </div>
                <h3 className="text-4xl font-black uppercase text-white mb-4 italic">Membership Required</h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">Please present your <span className="text-yellow-500 font-bold">Freighter Wallet</span> to gain access to the private betting tables.</p>
                <div className="flex justify-center gap-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-3 w-3 rounded-full bg-yellow-500/20 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                  ))}
                </div>
              </div>
            ) : publicKey ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative group w-full max-w-2xl">
                   {/* Golden Frame Aura */}
                   <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 rounded-[36px] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                   <TicTacToe publicKey={publicKey} />
                </div>
                
                {/* 💳 SYMMETRICAL DASHBOARD (UNDER GAME) */}
                <div className="mt-12 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                   
                   {/* Player Vault */}
                   <div className="rounded-3xl border-4 border-[#2a1a1a] bg-black/60 backdrop-blur-md p-8 shadow-2xl flex flex-col items-center text-center">
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] text-yellow-500/60 mb-8 border-b border-yellow-500/20 pb-2 w-full">Member Balance</h4>
                      <BalanceCard publicKey={publicKey} refreshKey={refreshKey} />
                      <button
                        onClick={refresh}
                        className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors"
                      >
                        ↻ Synchronize Vault
                      </button>
                   </div>

                   {/* Cashier Services */}
                   <div className="rounded-3xl border-4 border-[#2a1a1a] bg-black/60 backdrop-blur-md p-8 shadow-2xl flex flex-col items-center text-center justify-center space-y-6">
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] text-red-500/60 mb-2 border-b border-red-500/20 pb-2 w-full">Cashier Desk</h4>
                      <div className="flex flex-col gap-4 w-full">
                         <div className="flex gap-2 justify-center">
                            <FundAccount publicKey={publicKey} onFunded={refresh} />
                            <AddTrustline publicKey={publicKey} onDone={refresh} />
                         </div>
                         <div className="bg-slate-900/80 rounded-2xl border border-white/5 p-2 overflow-hidden transform scale-90">
                           <SendPayment publicKey={publicKey} onSent={refresh} />
                         </div>
                      </div>
                   </div>
                </div>

                {/* 📊 LIVE TRANSACTION TICKER (BOTTOM CENTER) */}
                <div className="mt-8 w-full max-w-2xl overflow-hidden rounded-full border-2 border-slate-800 bg-black/80 px-8 py-3 backdrop-blur-sm">
                   <div className="flex items-center justify-between gap-12 whitespace-nowrap animate-marquee">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                         <span className="h-2 w-2 rounded-full bg-green-500"></span>
                         <span>LAST WIN: 20.0 XLM (GD72...A92)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                         <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                         <span>POT SIZE: 1,240.5 XLM</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                         <span className="h-2 w-2 rounded-full bg-red-500"></span>
                         <span>LIVE PLAYERS: 48</span>
                      </div>
                   </div>
                </div>
              </div>
            ) : null}
          </section>

        </div>

        {/* 🎖️ GRAND SYMMETRICAL FOOTER 🎖️ */}
        <footer className="mt-32 w-full max-w-4xl border-t-2 border-yellow-500/20 pt-16 flex flex-col items-center">
          <div className="flex justify-center gap-12 mb-12 grayscale opacity-30 hover:opacity-100 transition-opacity duration-500">
             <div className="text-2xl font-black italic tracking-tighter">STELLAR</div>
             <div className="text-2xl font-black italic tracking-tighter">SOROBAN</div>
             <div className="text-2xl font-black italic tracking-tighter">ABLY</div>
          </div>
          
          <div className="relative text-center">
            <div className="text-[12px] font-black uppercase tracking-[0.8em] text-yellow-600 mb-2">
              Stellar Royale • Grand Opening 2026
            </div>
            <p className="text-[10px] font-bold text-slate-600 uppercase">
              Powered by the Stellar Development Foundation Testnet • Not for real money play
            </p>
          </div>
        </footer>
      </div>

      {/* Global CSS for Marquee and suit glow */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </main>
  );
}
