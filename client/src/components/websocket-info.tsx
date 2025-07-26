import { useState } from "react";
import { Plug, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";

export default function WebSocketInfo() {
  const { isConnected, connect, disconnect, connectedClients } = useWebSocket();

  const messageTypes = [
    {
      type: "market_update",
      description: "Broadcasts market overview changes",
      color: "bg-primary/10 text-primary"
    },
    {
      type: "stock_update", 
      description: "Individual stock price changes",
      color: "bg-secondary/10 text-secondary"
    },
    {
      type: "sector_update",
      description: "Sector performance updates", 
      color: "bg-warning/10 text-warning"
    }
  ];

  const exampleMessage = {
    type: "stock_update",
    timestamp: "2024-01-15T14:32:15.123Z",
    data: {
      symbol: "HBL",
      price: 132.50,
      change: 2.35,
      changePercent: 1.8,
      volume: 1200000
    }
  };

  return (
    <section id="websocket" className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">WebSocket Real-Time Updates</h3>
          <p className="text-sm text-slate-600">Live market data streaming via WebSocket connection</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Connection Details</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">WebSocket URL:</span>
                  <code className="text-sm font-mono text-slate-900">
                    {window.location.protocol === "https:" ? "wss://" : "ws://"}
                    {window.location.host}/ws
                  </code>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Protocol:</span>
                  <code className="text-sm font-mono text-slate-900">WebSocket (ws)</code>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Update Frequency:</span>
                  <code className="text-sm font-mono text-slate-900">Every 30 seconds</code>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Connected Clients:</span>
                  <span className="text-sm font-mono text-slate-900">{connectedClients}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Message Types</h4>
              <div className="space-y-3">
                {messageTypes.map((msgType, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${msgType.color}`}>
                        {msgType.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{msgType.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Example Message</h4>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono">
                {JSON.stringify(exampleMessage, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="mt-6 flex items-center space-x-4">
            {isConnected ? (
              <Button
                onClick={disconnect}
                variant="secondary"
                className="bg-slate-600 text-white hover:bg-slate-700"
              >
                <X className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={connect}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Plug className="w-4 h-4 mr-2" />
                Connect to WebSocket
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
