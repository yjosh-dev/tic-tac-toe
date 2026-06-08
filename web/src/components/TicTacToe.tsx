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

  const { messages, sendMove, sendSettings } = useGameSync(joinedRoom);

  // Synchronize game events from Ably
  useEffect(() => {
    if (messages.length > 0) {
      const lastEvent = messages[messages.length - 1];
      
      if (lastEvent.type === 'move' && lastEvent.index !== undefined && lastEvent.player) {
        applyMove(lastEvent.index, lastEvent.player);
      } else if (lastEvent.type === 'settings' && lastEvent.bet) {
        // If I'm the joiner (Player O), I must accept the creator's bet amount
        if (mySymbol === 'O') {
          setBetAmount(lastEvent.bet);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

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
    // We'll send the settings once the bet is selected
  };

  const handleJoinGame = () => {
    if (!roomId) return;
    const cleanId = roomId.trim().toUpperCase();
    setJoinedRoom(cleanId);
    setMySymbol('O');
    setGameState('BETTING');
  };

  const handlePlaceBet = async () => {
    // If I'm Player X, I broadcast my chosen bet to the opponent
    if (mySymbol === 'X') {
      sendSettings(betAmount);
    }

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

  const handleClaim = async () => {
    setError('');
    const originalState = gameState;
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
      setGameState(originalState);
    }
  };

  const CasinoChip = ({ color, amount, active }: { color: string, amount: string, active?: boolean }) => (
    <div className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-dashed ${active ? 'border-yellow-400 scale-110' : 'border-white/50'} shadow-xl ${color} transition-all`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[10px] font-black text-black">
        {amount}
      </div>
      {active && <div className="absolute -inset-1 rounded-full border-2 border-yellow-400 animate-pulse"></div>}
    </div>
  );

  return (
    <div className="w-full overflow-hidden rounded-[32px] border-4 border-yellow-500 bg-[#0d0d0f] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Casino Header */}
      <div className="bg-gradient-to-r from-red-800 via-red-600 to-red-800 p-5 text-center border-b-4 border-yellow-600">
        <h2 className="text-3xl font-black italic tracking-tighter text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          CASINO ROYALE
        </h2>
        {joinedRoom && (
          <div className="mt-1 inline-block px-3 py-0.5 rounded-full bg-black/40 border border-yellow-500/30 text-[10px] font-black text-yellow-500 uppercase tracking-widest">
            PRIVATE TABLE: {joinedRoom}
          </div>
        )}
      </div>

      <div className="p-8">
        {gameState === 'LOBBY' && (
          <div className="space-y-8 text-center">
            <div className="flex justify-center gap-6 py-4">
              <CasinoChip color="bg-blue-600" amount="1" />
              <CasinoChip color="bg-red-600" amount="5" />
              <CasinoChip color="bg-green-600" amount="10" />
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleCreateGame}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-yellow-400 to-yellow-600 p-px shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="rounded-2xl bg-gradient-to-b from-yellow-400 to-yellow-600 px-8 py-4 font-black uppercase text-slate-900 shadow-[inset_0_2px_0_rgba(255,255,255,0.4)]">
                  Create New Table
                </div>
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="mx-4 text-[10px] font-black uppercase text-slate-600 tracking-[0.3em]">OR JOIN EXISTING</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="ENTER TABLE ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="flex-1 rounded-2xl border-2 border-slate-800 bg-black/40 px-6 py-4 font-black text-white uppercase placeholder:text-slate-700 focus:border-yellow-500 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleJoinGame}
                  className="rounded-2xl bg-white px-8 py-4 font-black uppercase text-black hover:bg-yellow-400 transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'BETTING' && (
          <div className="py-4 text-center space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                {mySymbol === 'X' ? 'Set the Stakes' : 'Match the Stakes'}
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {mySymbol === 'X' ? 'Choose the buy-in for this table' : 'The host has set the buy-in'}
              </p>
            </div>

            <div className="flex justify-center gap-8">
              {['1', '5', '10'].map((val) => (
                <button 
                  key={val}
                  onClick={() => mySymbol === 'X' && setBetAmount(val)}
                  disabled={mySymbol === 'O'}
                  className={`relative transition-all duration-300 ${betAmount === val ? 'scale-110 opacity-100' : 'scale-90 opacity-40'} ${mySymbol === 'O' ? 'cursor-default' : 'hover:scale-105'}`}
                >
                  <CasinoChip 
                    color={val === '1' ? 'bg-blue-600' : val === '5' ? 'bg-red-600' : 'bg-green-600'} 
                    amount={val} 
                    active={betAmount === val}
                  />
                  {betAmount === val && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-yellow-500 whitespace-nowrap">
                      {val} XLM BET
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={handlePlaceBet}
                className="group relative w-full overflow-hidden rounded-2xl bg-emerald-600 p-px shadow-[0_10px_20px_-5px_rgba(5,150,105,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="rounded-2xl bg-emerald-600 px-8 py-5 font-black uppercase text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.2)]">
                  Place {betAmount} XLM Buy-In
                </div>
              </button>
              {error && (
                <div className="mt-4 rounded-xl border-2 border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-500 uppercase italic animate-shake">
                  ⚠ {error}
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'WAITING_FOR_BET' && (
          <div className="py-16 text-center space-y-6">
            <div className="relative mx-auto h-20 w-20">
              <div className="absolute inset-0 animate-ping rounded-full bg-yellow-500/20"></div>
              <div className="relative flex h-full w-full items-center justify-center rounded-full border-4 border-yellow-500 border-t-transparent animate-spin shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                 <span className="text-2xl animate-pulse">💎</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-black uppercase tracking-[0.3em] text-yellow-500 animate-pulse">Verifying Transaction</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase italic">On-Chain Confirmation in Progress...</p>
            </div>
          </div>
        )}

        {(gameState === 'PLAYING' || gameState === 'WON' || gameState === 'DRAW') && (
          <div className="flex flex-col items-center space-y-8">
            <div className="flex w-full items-center justify-between rounded-2xl bg-black/40 p-4 border border-white/5 shadow-inner">
               <div className="flex items-center gap-3">
                 <div className={`h-4 w-4 rounded-full ring-4 ${mySymbol === 'X' ? 'bg-blue-500 ring-blue-500/20 shadow-[0_0_15px_blue]' : 'bg-red-500 ring-red-500/20 shadow-[0_0_15px_red]'}`}></div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-500 uppercase">Your Mark</span>
                   <span className="text-sm font-black text-white uppercase tracking-tighter">Player {mySymbol}</span>
                 </div>
               </div>
               
               <div className="text-right">
                 <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">Pot Total</span>
                 <span className="text-lg font-black text-yellow-500 italic leading-none">{Number(betAmount) * 2} XLM</span>
               </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-red-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative grid grid-cols-3 gap-4 rounded-3xl bg-slate-900/50 p-4 shadow-2xl backdrop-blur-sm border border-white/5">
                {board.map((square, i) => (
                  <button
                    key={i}
                    onClick={() => handleClick(i)}
                    className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-black transition-all duration-100
                      ${!square && gameState === 'PLAYING' ? 'bg-slate-800 hover:bg-slate-700 hover:scale-[1.05] active:scale-95 shadow-lg' : 'bg-black/40'}
                      ${square === 'X' ? 'text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]' : 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]'}
                    `}
                    disabled={!!square || gameState !== 'PLAYING'}
                  >
                    {square}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm font-black uppercase tracking-[0.2em] text-center">
               {gameState === 'WON' ? (
                 <span className="text-yellow-500 animate-bounce block">🎉 JACKPOT ACQUIRED! 🎉</span>
               ) : gameState === 'DRAW' ? (
                 <span className="text-slate-400 block">TABLE DRAW - SPLIT POT</span>
               ) : (
                 <span className="text-slate-500 block">
                   {((xIsNext && mySymbol === 'X') || (!xIsNext && mySymbol === 'O')) 
                    ? "👉 YOUR TURN TO BET" 
                    : "⌛ WAITING FOR OPPONENT"}
                 </span>
               )}
            </div>

            {(gameState === 'WON' || gameState === 'DRAW') && (
              <div className="w-full space-y-4 pt-4 border-t border-slate-800">
                {gameState === 'WON' && winner === mySymbol && (
                  <button
                    onClick={handleClaim}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 p-px shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 px-8 py-5 font-black uppercase text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.2)]">
                      Collect {Number(betAmount) * 2} XLM Winnings
                    </div>
                  </button>
                )}
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full rounded-2xl border-2 border-slate-800 py-4 text-xs font-black uppercase text-slate-500 transition-colors hover:bg-slate-900 hover:text-white"
                >
                  Return to Lobby
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Security Info */}
      <div className="bg-black/60 px-8 py-3 text-center border-t border-slate-800 flex justify-center gap-6 items-center">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_emerald]"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Testnet Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_blue]"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Ably Sync Secure</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 shadow-[0_0_5px_yellow]"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Pot Verified</span>
        </div>
      </div>
    </div>
  );
}
