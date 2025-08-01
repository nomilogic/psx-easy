import { useState, useEffect, useRef } from "react";
import type { StockData, MarketSummary, WebSocketMessage } from "@shared/schema";

interface WebSocketState {
  isConnected: boolean;
  marketData: StockData[] | null;
  marketSummary: MarketSummary | null;
  connectedClients: number;
  lastMessage: WebSocketMessage | null;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(): WebSocketState {
  const [isConnected, setIsConnected] = useState(false);
  const [marketData, setMarketData] = useState<StockData[] | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [connectedClients, setConnectedClients] = useState(0);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5; // Define maximum reconnection attempts
  const reconnectInterval = 3000; // Define reconnection interval in milliseconds

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset reconnection attempts on successful connection

        // Clear any pending reconnection attempts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

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
              if (message.data && Array.isArray(message.data)) {
                setMarketData(message.data);
              }
              break;
            case 'sector_update':
              // Handle sector updates (just log for now)
              // console.log('Sector update:', message.data);
              break;
            default:
              // Handle unknown message types gracefully
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log(`WebSocket disconnected with code: ${event.code}, reason: ${event.reason}`);
        setIsConnected(false);

        // Attempt to reconnect after a delay, up to maxReconnectAttempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) { // Do not reconnect on normal close (code 1000)
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect WebSocket (attempt ${reconnectAttemptsRef.current + 1})...`);
            reconnectAttemptsRef.current++;
            connect();
          }, reconnectInterval);
        } else {
          console.log("Not attempting to reconnect WebSocket.");
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);

        // Implement exponential backoff or similar strategy here if needed

        // Attempt reconnection unless max attempts reached
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect WebSocket after error (attempt ${reconnectAttemptsRef.current + 1})...`);
            reconnectAttemptsRef.current++;
            connect();
          }, reconnectInterval);
        } else {
          console.log("Max reconnection attempts reached. Not attempting to reconnect.");
        }
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
      wsRef.current.close(1000, "Manual disconnect"); // Provide a reason for closure
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
    // Removed dependency array, relying on connect and disconnect functions.
  }, []);

  // Prevent multiple instances
  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
    lastMessage,
    connect, 
    disconnect 
  };
}