'use client';

import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import TicTacToe from '@/components/TicTacToe';
import CoinBackground from '@/components/CoinBackground';

export default function WalletPage() {
  const wallet = useWallet();
  const { publicKey, connecting } = wallet;

  return (
    <main className="relative min-h-screen w-full bg-gray-50/50 p-8 overflow-hidden">
      <CoinBackground />
      <div className="relative z-10 mx-auto max-w-lg">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wallet Page</h1>
            <p className="mt-1 text-sm text-gray-500">Play Tic Tac Toe on Stellar Testnet</p>
          </div>
          <ConnectWallet {...wallet} />
        </header>

        {!publicKey && !connecting && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-500">
            <p className="mb-2">Connect your wallet to play.</p>
          </div>
        )}

        {publicKey && (
          <TicTacToe publicKey={publicKey} />
        )}

        <footer className="mt-12 text-center text-xs text-gray-400">
          Bets are sent to a demo &quot;Pot&quot; address on Testnet.
        </footer>
      </div>
    </main>
  );
}
