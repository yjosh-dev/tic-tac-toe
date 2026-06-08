'use client';

import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import TicTacToe from '@/components/TicTacToe';
import CoinBackground from '@/components/CoinBackground';

export default function WalletPage() {
  const wallet = useWallet();
  const { publicKey, connecting } = wallet;

  return (
    <main className="relative min-h-screen w-full bg-slate-950 p-4 md:p-8 overflow-hidden flex items-center justify-center">
      <CoinBackground />
      
      {/* Overlay to give the background some depth */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-lg w-full backdrop-blur-sm bg-gray-900/40 rounded-[40px] p-1 shadow-2xl border border-white/5">
        <div className="bg-gray-50 rounded-[36px] p-6 md:p-8 shadow-inner overflow-hidden relative">
          <header className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Wallet Page</h1>
              <p className="mt-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Stellar Royale Edition</p>
            </div>
            <ConnectWallet {...wallet} />
          </header>

          {!publicKey && !connecting && (
            <div className="rounded-3xl border-4 border-dashed border-gray-200 bg-white py-16 text-center text-gray-400">
              <div className="mb-4 text-4xl">🔐</div>
              <p className="text-sm font-black uppercase tracking-widest">Connect wallet to enter</p>
            </div>
          )}

          {publicKey && (
            <TicTacToe publicKey={publicKey} />
          )}

          <footer className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Bets are sent to a demo &quot;Pot&quot; address on Testnet.
          </footer>
        </div>
      </div>
    </main>
  );
}
