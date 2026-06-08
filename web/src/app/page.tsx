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

  return (
    <main className="min-h-screen w-full bg-[#0a0a0c] text-slate-100 selection:bg-yellow-500 selection:text-black">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-12">
        {/* Massive Casino Header */}
        <header className="relative mb-16 text-center">
          <div className="inline-block relative">
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-tight">
              STELLAR<br/>ROYALE
            </h1>
            <div className="absolute -right-8 -top-4 rotate-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-dashed border-white bg-red-600 shadow-2xl animate-bounce">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[10px] font-black text-black">
                  777
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-bold uppercase tracking-[0.3em] text-yellow-500/80 drop-shadow-sm">
            High Stakes • Instant Payouts • No Limit
          </p>
          <div className="mt-8 flex justify-center">
            <ConnectWallet {...wallet} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Game Area */}
          <div className="lg:col-span-7 space-y-8">
            {!publicKey && !connecting ? (
              <div className="rounded-3xl border-4 border-slate-800 bg-slate-900/80 backdrop-blur-md p-12 text-center shadow-2xl">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-4xl">
                  🎰
                </div>
                <h3 className="text-2xl font-black uppercase text-white mb-2">Welcome to the Floor</h3>
                <p className="text-slate-400 mb-8">Connect your wallet to enter the high-stakes arena.</p>
                <div className="flex justify-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse delay-75"></div>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse delay-150"></div>
                </div>
              </div>
            ) : publicKey ? (
              <section className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-red-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative">
                  <TicTacToe publicKey={publicKey} />
                </div>
              </section>
            ) : null}

            {/* Casino Dashboard Sections */}
            {publicKey && (
              <div className="space-y-6">
                 <div className="rounded-2xl border-2 border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                   <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Cashier Desk</h4>
                   <div className="flex flex-wrap gap-3">
                     <FundAccount publicKey={publicKey} onFunded={refresh} />
                     <AddTrustline publicKey={publicKey} onDone={refresh} />
                   </div>
                 </div>
                 
                 <div className="rounded-2xl border-2 border-slate-800 bg-slate-900/50 p-2 backdrop-blur-sm">
                   <SendPayment publicKey={publicKey} onSent={refresh} />
                 </div>
              </div>
            )}
          </div>

          {/* Side Bar: VIP Stats */}
          <div className="lg:col-span-5 space-y-8">
            {publicKey && (
              <div className="sticky top-8 space-y-8">
                {/* VIP CARD */}
                <div className="relative overflow-hidden rounded-3xl border-2 border-yellow-500/30 bg-gradient-to-br from-slate-800 to-black p-1 shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl italic font-black">VIP</div>
                  <div className="p-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500 mb-6">VIP Player Account</h3>
                    <BalanceCard publicKey={publicKey} refreshKey={refreshKey} />
                    <button
                      onClick={refresh}
                      className="mt-4 w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors"
                    >
                      ↻ Refresh Vault
                    </button>
                  </div>
                </div>

                {/* Live Feed Mock */}
                <div className="rounded-2xl border-2 border-slate-800 bg-black/40 p-6 backdrop-blur-md">
                   <h4 className="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                     <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                     Live Feed
                   </h4>
                   <div className="space-y-4 text-[11px] font-bold uppercase tracking-tight text-slate-400">
                     <div className="flex justify-between border-b border-slate-800 pb-2">
                       <span>GA39... won pot</span>
                       <span className="text-emerald-500">+10.0 XLM</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800 pb-2">
                       <span>GD91... bet placed</span>
                       <span className="text-yellow-500">-5.0 XLM</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800 pb-2">
                       <span>GB82... joined table</span>
                       <span className="text-blue-500">READY</span>
                     </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grand Footer */}
        <footer className="mt-24 border-t border-slate-800 pt-12 text-center">
          <div className="mb-8 flex justify-center gap-8 grayscale opacity-50">
             <div className="text-xl font-black italic">STELLAR</div>
             <div className="text-xl font-black italic">SOROBAN</div>
             <div className="text-xl font-black italic">ABLY</div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
            Official PUP QC Workshop Build • Built for the Bold
          </p>
        </footer>
      </div>
    </main>
  );
}
