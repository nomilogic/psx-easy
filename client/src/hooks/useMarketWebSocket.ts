import { useEffect, useState, useRef } from 'react';
import type { WebSocketMessage, StockData, MarketSummary } from '@shared/schema';

interface MarketStatus {
  isOpen: boolean;
  nextOpenTime?: string;
  nextCloseTime?: string;
  currentTime: string;
}

interface MarketWebSocketData {
  stocks: StockData[];
  summary: MarketSummary | null;
  marketStatus: MarketStatus | null;
  isConnected: boolean;
  error: string | null;
  lastUpdate: string | null;
}

export function useMarketWebSocket(): MarketWebSocketData {
  const [data, setData] = useState<MarketWebSocketData>({
    stocks: [],
    summary: null,
    marketStatus: null,
    isConnected: false,
    error: null,
    lastUpdate: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Fetch initial market status from REST API
    fetch('/api/market/status')
      .then(res => res.json())
      .then(status => {
        setData(prev => ({
          ...prev,
          marketStatus: status,
        }));
      })
      .catch(err => console.warn('Could not fetch market status:', err));

    try {
      // Connect to the separate market WebSocket server
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsPort = import.meta.env.VITE_WS_PORT || "8080";
      const wsUrl = `${protocol}//${window.location.hostname}:${wsPort}/market-ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('📡 Connected to Market WebSocket');
        setData(prev => ({ ...prev, isConnected: true, error: null }));
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          setData(prev => ({
            ...prev,
            lastUpdate: message.timestamp,
          }));

          switch (message.type) {
            case 'market_update':
            case 'database_update':
              if (message.data.stocks) {
                setData(prev => ({
                  ...prev,
                  stocks: message.data.stocks,
                  summary: message.data.summary || prev.summary,
                }));
              }
              break;

            case 'market_status':
              setData(prev => ({
                ...prev,
                marketStatus: message.data,
              }));
              break;

            case 'live_update':
              // Real-time updates from external sources
              if (message.data.stocks) {
                setData(prev => ({
                  ...prev,
                  stocks: message.data.stocks,
                  summary: message.data.summary || prev.summary,
                }));
              }
              break;

            case 'initial_data':
              setData(prev => ({
                ...prev,
                stocks: message.data.stocks || [],
                summary: message.data.summary || null,
              }));
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('📡 Market WebSocket disconnected');
        setData(prev => ({ ...prev, isConnected: false }));
        
        // Implement exponential backoff for reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`🔄 Attempting to reconnect (attempt ${reconnectAttempts.current})...`);
          connect();
        }, delay);
      };

      wsRef.current.onerror = (error) => {
        console.error('Market WebSocket error:', error);
        setData(prev => ({ 
          ...prev, 
          error: 'WebSocket connection failed. Market data may be limited during off-hours.',
          isConnected: false 
        }));
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setData(prev => ({ 
        ...prev, 
        error: 'Failed to connect to market data stream',
        isConnected: false 
      }));
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return data;
}