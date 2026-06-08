'use client';

import { useState, useEffect } from 'react';
import { 
  buildPaymentXDR, 
  submitSignedXDR, 
  pollTransaction 
} from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';
import { useGameSync } from '@/hooks/useGameSync';

type GameState = 'LOBBY' | 'BETTING' | 'WAITING_FOR_BET' | 'PLAYING' | 'WON' | 'DRAW';

const POT_ADDRESS = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

export default function TicTacToe({ publicKey }: { publicKey: string }) {
  const [roomId, setRoomId] = useState<string>('');
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const [mySymbol, setMySymbol] = useState<'X' | 'O' | null>(null);
  const [betAmount, setBetAmount] = useState<string>('1');
  
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const { messages, sendMove } = useGameSync(joinedRoom);

  function calculateWinner(squares: (string | null)[]) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }

  const winner = calculateWinner(board);

  const applyMove = (i: number, symbol: 'X' | 'O') => {
    setBoard((prevBoard) => {
      if (prevBoard[i]) return prevBoard;
      const nextBoard = [...prevBoard];
      nextBoard[i] = symbol;
      
      const nextWinner = calculateWinner(nextBoard);
      if (nextWinner) {
        setGameState('WON');
      } else if (!nextBoard.includes(null)) {
        setGameState('DRAW');
      }
      
      return nextBoard;
    });
    setXIsNext(symbol !== 'X');
  };

  const handleCreateGame = () => {
    const id = Math.random().toString(36).substring(2, 7).toUpperCase();
    setJoinedRoom(id);
    setMySymbol('X');
    setGameState('BETTING');
  };

  const handleJoinGame = () => {
    if (!roomId) return;
    const cleanId = roomId.trim().toUpperCase();
    setJoinedRoom(cleanId);
    setMySymbol('O');
    setGameState('BETTING');
  };

  const handlePlaceBet = async () => {
    setGameState('WAITING_FOR_BET');
    setError('');
    try {
      const xdr = await buildPaymentXDR(publicKey, POT_ADDRESS, betAmount, 'XLM');
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });

      if (signed.error) throw new Error(String(signed.error));

      const hash = await submitSignedXDR(signed.signedTxXdr);
      setTxHash(hash);
      await pollTransaction(hash);

      setGameState('PLAYING');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Bet failed');
      setGameState('BETTING');
    }
  };

  const handleClick = (i: number) => {
    const isMyTurn = (xIsNext && mySymbol === 'X') || (!xIsNext && mySymbol === 'O');
    if (gameState !== 'PLAYING' || board[i] || winner || !isMyTurn) return;

    applyMove(i, mySymbol!);
    sendMove(i, mySymbol!);
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMove = messages[messages.length - 1];
      applyMove(lastMove.index, lastMove.player);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const CasinoChip = ({ color, amount }: { color: string, amount: string }) => (
    <div className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-dashed border-white shadow-xl ${color}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[10px] font-black text-black">
        {amount}
      </div>
    </div>
  );

  const handleClaim = async () => {
    setError('');
    setGameState('WAITING_FOR_BET'); // Reuse loading state
    try {
      const res = await fetch('/api/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerAddress: publicKey,
          amount: Number(betAmount) * 2
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      alert(`JACKPOT PAID! Hash: ${data.hash}`);
      window.location.reload();
    } catch (e: any) {
      setError(e.message || 'Payout failed');
      setGameState('WON');
    }
  };

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border-4 border-yellow-500 bg-slate-900 shadow-2xl">
      {/* Casino Header */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 p-4 text-center">
        <h2 className="text-2xl font-black italic tracking-tighter text-yellow-300 drop-shadow-md">
          STELLAR CASINO ROYALE
        </h2>
        {joinedRoom && (
          <div className="mt-1 font-mono text-xs font-bold text-white opacity-80">
            TABLE: {joinedRoom}
          </div>
        )}
      </div>

      <div className="p-6">
        {gameState === 'LOBBY' && (
          <div className="space-y-6 py-4 text-center">
            <div className="flex justify-center gap-4 py-4">
              <CasinoChip color="bg-blue-600" amount="1" />
              <CasinoChip color="bg-red-600" amount="5" />
              <CasinoChip color="bg-green-600" amount="10" />
            </div>
            <p className="text-sm font-bold text-yellow-500 uppercase tracking-widest">High Stakes Tic Tac Toe</p>
            <button
              onClick={handleCreateGame}
              className="w-full rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 py-4 font-black uppercase text-slate-900 shadow-[0_4px_0_rgb(161,98,7)] transition active:translate-y-1 active:shadow-none"
            >
              Start New Table
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500 font-bold">OR JOIN TABLE</span></div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Table ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="flex-1 rounded-full border-2 border-slate-700 bg-slate-800 px-4 py-2 font-bold text-white uppercase focus:border-yellow-500 focus:outline-none"
              />
              <button
                onClick={handleJoinGame}
                className="rounded-full bg-slate-100 px-8 py-2 font-black uppercase text-slate-900 transition hover:bg-white"
              >
                Join
              </button>
            </div>
          </div>
        )}

        {gameState === 'BETTING' && (
          <div className="py-4 text-center">
            <p className="mb-6 text-xl font-bold text-white">Select Your Buy-In</p>
            <div className="mb-8 flex justify-center gap-6">
              {[ '1', '5', '10' ].map((val) => (
                <button 
                  key={val}
                  onClick={() => setBetAmount(val)}
                  className={`group relative transition-transform hover:scale-110 ${betAmount === val ? 'scale-125' : 'opacity-50'}`}
                >
                  <CasinoChip color={val === '1' ? 'bg-blue-600' : val === '5' ? 'bg-red-600' : 'bg-green-600'} amount={val} />
                  {betAmount === val && <div className="absolute -bottom-2 left-1/2 h-1 w-4 -translate-x-1/2 bg-yellow-400 blur-[2px]"></div>}
                </button>
              ))}
            </div>
            <p className="mb-4 text-xs font-bold text-slate-400">WAITING FOR PLAYER {mySymbol === 'X' ? 'O' : 'X'}</p>
            <button
              onClick={handlePlaceBet}
              className="w-full rounded-full bg-emerald-600 py-4 font-black uppercase text-white shadow-[0_4px_0_rgb(5,150,105)] transition hover:bg-emerald-500 active:translate-y-1 active:shadow-none"
            >
              Place {betAmount} XLM Bet
            </button>
            {error && <p className="mt-4 text-sm font-bold text-red-500">⚠ {error}</p>}
          </div>
        )}

        {gameState === 'WAITING_FOR_BET' && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent shadow-[0_0_20px_rgba(234,179,8,0.5)]"></div>
            <p className="font-black uppercase tracking-widest text-yellow-500 animate-pulse">Confirming Bet...</p>
          </div>
        )}

        {(gameState === 'PLAYING' || gameState === 'WON' || gameState === 'DRAW') && (
          <div className="flex flex-col items-center">
            <div className="mb-6 flex w-full items-center justify-between rounded-xl bg-slate-800 p-3 border border-slate-700">
               <div className="flex items-center gap-2">
                 <div className={`h-3 w-3 rounded-full ${mySymbol === 'X' ? 'bg-blue-500 shadow-[0_0_8px_blue]' : 'bg-red-500 shadow-[0_0_8px_red]'}`}></div>
                 <span className="text-xs font-black text-white uppercase">Player {mySymbol}</span>
               </div>
               <div className="text-xs font-black uppercase text-yellow-500">
                {gameState === 'WON' ? "JACKPOT!" : 
                 gameState === 'DRAW' ? "SPLIT POT" : 
                 ((xIsNext && mySymbol === 'X') || (!xIsNext && mySymbol === 'O') ? "YOUR TURN" : "WAITING...")}
               </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-800 p-3 shadow-inner">
              {board.map((square, i) => (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  className={`flex h-20 w-20 items-center justify-center rounded-xl text-4xl font-black transition-all duration-75
                    ${!square && gameState === 'PLAYING' ? 'bg-slate-700 hover:bg-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]' : 'bg-slate-900'}
                    ${square === 'X' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]'}
                  `}
                  disabled={!!square || gameState !== 'PLAYING'}
                >
                  {square}
                </button>
              ))}
            </div>

            {(gameState === 'WON' || gameState === 'DRAW') && (
              <div className="mt-8 flex w-full flex-col gap-4">
                {gameState === 'WON' && winner === mySymbol && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-center shadow-xl border-2 border-emerald-400">
                    <div className="absolute -right-4 -top-4 opacity-20"><CasinoChip color="bg-yellow-400" amount="$$" /></div>
                    <p className="text-xl font-black italic text-white drop-shadow-lg">BIG WINNER!</p>
                    <p className="mt-1 text-xs font-bold text-emerald-100 opacity-80 uppercase tracking-tighter">The {Number(betAmount)*2} XLM Pot is Yours</p>
                    <button
                      onClick={handleClaim}
                      className="mt-4 w-full rounded-full bg-white py-3 text-sm font-black uppercase text-emerald-800 shadow-lg transition hover:scale-105 active:scale-95"
                    >
                      Collect Winnings
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-full border-2 border-slate-700 py-3 text-xs font-black uppercase text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Leave Table
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer Decoration */}
      <div className="bg-slate-800 p-2 text-center border-t border-slate-700">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Provably Fair • Powered by Stellar Testnet</p>
      </div>
    </div>
  );
}
