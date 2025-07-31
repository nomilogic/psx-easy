import { useState, useEffect, useRef } from "react";
import type { StockData, MarketSummary, WebSocketMessage } from "@shared/schema";

interface WebSocketState {
  isConnected: boolean;
  marketData: StockData[] | null;
  marketSummary: MarketSummary | null;
  connectedClients: number;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(): WebSocketState {
  const [isConnected, setIsConnected] = useState(false);
  const [marketData, setMarketData] = useState<StockData[] | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [connectedClients, setConnectedClients] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);

        // Clear any pending reconnection attempts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'market_update':
              if (message.data.stocks) {
                setMarketData(message.data.stocks);
              }
              if (message.data.summary) {
                setMarketSummary(message.data.summary);
              }
              break;
            case 'stock_update':
              // Handle individual stock updates
              console.log('Stock update:', message.data);
              break;
            case 'sector_update':
              // Handle sector updates  
              console.log('Sector update:', message.data);
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);

        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect WebSocket...");
          connect();
        }, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
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

    setIsConnected(false);
  };

  useEffect(() => {
    // Auto-connect on mount
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Update connected clients count based on connection status
  useEffect(() => {
    if (isConnected) {
      // This is a simplified approach - in a real app you'd get this from the server
      setConnectedClients(prev => prev + 1);
    } else {
      setConnectedClients(prev => Math.max(0, prev - 1));
    }
  }, [isConnected]);

  return { 
    isConnected, 
    marketData, 
    marketSummary, 
    connectedClients, 
    connect, 
    disconnect 
  };
}