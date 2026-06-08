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
      const xdr = await buildPaymentXDR(publicKey, POT_ADDRESS, '1', 'XLM');
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

  // Sync moves from Ably
  useEffect(() => {
    if (messages.length > 0) {
      const lastMove = messages[messages.length - 1];
      applyMove(lastMove.index, lastMove.player);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Online Bet Tic Tac Toe</h2>
        {joinedRoom && (
          <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-mono font-bold text-indigo-600">
            ROOM: {joinedRoom}
          </span>
        )}
      </div>

      {gameState === 'LOBBY' && (
        <div className="space-y-4 py-4">
          <button
            onClick={handleCreateGame}
            className="w-full rounded-lg bg-indigo-600 py-3 font-bold text-white transition hover:bg-indigo-700"
          >
            Create New Game
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 uppercase"
            />
            <button
              onClick={handleJoinGame}
              className="rounded-lg bg-gray-800 px-6 py-2 font-bold text-white transition hover:bg-black"
            >
              Join
            </button>
          </div>
        </div>
      )}

      {gameState === 'BETTING' && (
        <div className="py-8 text-center">
          <p className="mb-2 text-gray-600 font-medium">You are Player {mySymbol}</p>
          <p className="mb-4 text-sm text-gray-500">Share Room ID <span className="font-bold text-gray-900">{joinedRoom}</span> with your opponent.</p>
          <button
            onClick={handlePlaceBet}
            className="rounded-lg bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700"
          >
            Pay 1 XLM Entry Fee
          </button>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>
      )}

      {gameState === 'WAITING_FOR_BET' && (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-600">Verifying payment on Stellar...</p>
        </div>
      )}

      {(gameState === 'PLAYING' || gameState === 'WON' || gameState === 'DRAW') && (
        <div className="flex flex-col items-center">
          <div className="mb-4 flex w-full justify-between items-center text-sm">
            <div className={`px-3 py-1 rounded-full ${mySymbol === 'X' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
              You: {mySymbol}
            </div>
            <div className="font-bold">
              {gameState === 'WON' ? `Winner: ${winner}` : 
               gameState === 'DRAW' ? "It's a Draw!" : 
               ((xIsNext && mySymbol === 'X') || (!xIsNext && mySymbol === 'O') ? "Your Turn" : "Opponent's Turn")}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {board.map((square, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className={`flex h-20 w-20 items-center justify-center rounded-lg text-3xl font-bold transition
                  ${!square && gameState === 'PLAYING' ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100'}
                  ${square === 'X' ? 'text-blue-600' : 'text-red-600'}
                `}
                disabled={!!square || gameState !== 'PLAYING'}
              >
                {square}
              </button>
            ))}
          </div>

          {txHash && (
            <p className="mt-6 text-[10px] text-gray-400">
              Payment confirmed: {txHash.substring(0, 10)}...
            </p>
          )}

          {(gameState === 'WON' || gameState === 'DRAW') && (
            <div className="mt-6 flex flex-col gap-3 w-full">
              {gameState === 'WON' && winner === mySymbol && (
                <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-center">
                  <p className="text-emerald-800 font-bold">You Won the Pot!</p>
                  <p className="text-xs text-emerald-600 mb-3">2 XLM is waiting for you.</p>
                  <button
                    onClick={() => alert('In a production app, a Smart Contract or Backend would now automatically send 2 XLM to your address: ' + publicKey)}
                    className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Claim 2 XLM Winnings
                  </button>
                </div>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50 text-gray-700"
              >
                Back to Lobby
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
