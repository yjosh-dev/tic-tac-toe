'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import { fetchBalances, type Balances } from '@/lib/balances';

type BalanceContextType = {
  balances: Balances | null;
  loading: boolean;
  refreshBalances: () => Promise<void>;
};

const BalanceContext = createContext<BalanceContextType | null>(null);

export function BalanceProvider({
  children,
  publicKey,
}: {
  children: ReactNode;
  publicKey: string;
}) {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBalances = async () => {
    try {
      const data = await fetchBalances(publicKey);
      setBalances(data);
    } catch {
      setBalances(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);

    refreshBalances();

    const interval = setInterval(refreshBalances, 5000);

    return () => clearInterval(interval);
  }, [publicKey]);

  return (
    <BalanceContext.Provider
      value={{
        balances,
        loading,
        refreshBalances,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalances() {
  const context = useContext(BalanceContext);

  if (!context) {
    throw new Error('useBalances must be used inside BalanceProvider');
  }

  return context;
}