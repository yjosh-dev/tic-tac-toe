'use client';

import { useEffect, useState, useRef } from 'react';
import * as Ably from 'ably';

// !!! Ably JWT Token provided by user
const ABLY_TOKEN = 'eyJ0eXAiOiJKV1QiLCJ2ZXJzaW9uIjoxLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI5Yjg2YjFjNy1jYmVlLTRiYTYtYjNmNy1lZDhkYjVlY2I5OWEiLCJpc3MiOiJhYmx5LmNvbSIsImlhdCI6MTc4MDg5ODYwNywic3ViIjoxMDI1MjYsImV4cCI6MTc4MzQ5MDYwN30.GHv0CnMRit7BO6GbdQsztGITv5h3BZAoDME-0GiJils';

interface GameMove {
  index: number;
  player: 'X' | 'O';
}

export function useGameSync(roomId: string | null) {
  const [messages, setMessages] = useState<GameMove[]>([]);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const ablyRef = useRef<Ably.Realtime | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // Initialize Ably using Token (JWT)
    const ably = new Ably.Realtime({ token: ABLY_TOKEN });
    ablyRef.current = ably;
    const channel = ably.channels.get(`tic-tac-toe-${roomId}`);
    channelRef.current = channel;

    // Subscribe to messages
    channel.subscribe('move', (message) => {
      setMessages((prev) => [...prev, message.data]);
    });

    return () => {
      channel.unsubscribe();
      ably.close();
    };
  }, [roomId]);

  const sendMove = (index: number, player: 'X' | 'O') => {
    if (channelRef.current) {
      channelRef.current.publish('move', { index, player });
    }
  };

  return { messages, sendMove };
}
