'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchBalances, type Balances } from '@/lib/balances';

export default function BalanceCard({
  publicKey,
  refreshKey,
}: {
  publicKey: string;
  refreshKey: number;
}) {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [loading, setLoading] = useState(true);

  const previousBalances = useRef<Balances | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [transactionMessage, setTransactionMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadBalances = async () => {
      try {
        const b = await fetchBalances(publicKey);

        console.log('BALANCES RETURNED:', b);

        if (!active) return;

        try {
          if (
            previousBalances.current &&
            previousBalances.current.funded &&
            b.funded
          ) {
            const xlmDiff =
              parseFloat(b.xlm) -
              parseFloat(previousBalances.current.xlm);

            const usdcDiff =
              parseFloat(b.usdc) -
              parseFloat(previousBalances.current.usdc);

            if (xlmDiff !== 0 || usdcDiff !== 0) {
              let message = '';

              if (xlmDiff !== 0) {
                message += `XLM ${
                  xlmDiff > 0 ? 'received' : 'sent'
                }: ${Math.abs(xlmDiff)}\n`;
              }

              if (usdcDiff !== 0) {
                message += `USDC ${
                  usdcDiff > 0 ? 'received' : 'sent'
                }: ${Math.abs(usdcDiff)}`;
              }

              setTransactionMessage(message);
              setShowModal(true);
            }
          }

          previousBalances.current = b;
          setBalances(b);
        } catch (comparisonError) {
          console.error(
            'Balance comparison error:',
            comparisonError
          );

          previousBalances.current = b;
          setBalances(b);
        }
      } catch (error) {
        console.error('FETCH BALANCES ERROR:', error);

        if (active) {
          setBalances(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    setLoading(true);

    loadBalances();

    const interval = setInterval(loadBalances, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [publicKey, refreshKey]);

  if (loading) {
    return (
      <div className="mt-4 grid animate-pulse grid-cols-2 gap-4">
        <div className="h-20 rounded bg-gray-200" />
        <div className="h-20 rounded bg-gray-200" />
      </div>
    );
  }

  if (balances && !balances.funded) {
    return (
      <p className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        This account isn’t funded yet. Click “Fund with Friendbot” above.
      </p>
    );
  }

  if (!balances) {
    return (
      <p className="mt-4 text-sm text-red-500">
        Failed to load balances.
      </p>
    );
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            XLM
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {balances.xlm}
          </p>
        </div>

        <div className="rounded border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            USDC
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {balances.usdc}
          </p>
        </div>
      </div>

     {showModal && (
  <div
    className="
      fixed
      top-5
      right-5
      z-50
      animate-[slideIn_.35s_ease-out]
    "
  >
    <div className="w-80 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
      
      {/* Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

      <div className="p-4">

        <div className="flex items-start gap-3">

          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-5 w-5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Transaction Successful
              </h3>

              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Balance updated successfully
            </p>

            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-800 whitespace-pre-line">
                {transactionMessage}
              </p>

              <p className="mt-2 text-[11px] text-slate-400">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
)}
    </>
  );
}