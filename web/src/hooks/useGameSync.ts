'use client';

import { useEffect, useState, useRef } from 'react';
import * as Ably from 'ably';

// Full Ably Root Key provided by user
const ABLY_KEY = 'nQ2DYw.oEeHoA:HYWuHtZeHYE7KHB_tMYtbRdQWN0zsUrB_Mmzdn7pWrc';

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

    // Initialize Ably using API Key
    console.log('Ably: Initializing with roomId:', roomId);
    const ably = new Ably.Realtime({ key: ABLY_KEY });
    ablyRef.current = ably;

    ably.connection.on('connected', () => {
      console.log('Ably: Connected to server');
    });

    ably.connection.on('failed', (err) => {
      console.error('Ably: Connection failed:', err);
    });

    const channel = ably.channels.get(`tic-tac-toe-${roomId}`);
    channelRef.current = channel;

    // Subscribe to messages
    channel.subscribe('move', (message) => {
      console.log('Ably: Received move:', message.data);
      setMessages((prev) => [...prev, message.data]);
    });

    return () => {
      channel.unsubscribe();
      ably.close();
    };
  }, [roomId]);

  const sendMove = (index: number, player: 'X' | 'O') => {
    if (channelRef.current) {
      console.log('Ably: Sending move:', { index, player });
      channelRef.current.publish('move', { index, player });
    }
  };

  return { messages, sendMove };
}
