
import { useEffect, useState } from 'react';
import type { StockData } from '@shared/schema';

interface UseSupabaseRealtimeOptions {
  onStockUpdate?: (stock: Partial<StockData>) => void;
  onMarketUpdate?: (data: any) => void;
  onKSE100Update?: (data: any) => void;
}

export function useSupabaseRealtime(options: UseSupabaseRealtimeOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Connect to WebSocket server for real-time updates
    const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8080`;
    const ws = new WebSocket(`${wsUrl}/market-ws`);

    ws.onopen = () => {
      console.log('📡 Connected to real-time market updates');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastUpdate(new Date());

        switch (message.type) {
          case 'stock_update':
            options.onStockUpdate?.(message.data);
            break;
          case 'market_update':
            options.onMarketUpdate?.(message.data);
            break;
          case 'kse100_update':
            options.onKSE100Update?.(message.data);
            break;
          default:
            console.log('📊 Market update:', message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('📡 Disconnected from real-time updates');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [options.onStockUpdate, options.onMarketUpdate, options.onKSE100Update]);

  return {
    isConnected,
    lastUpdate
  };
}
