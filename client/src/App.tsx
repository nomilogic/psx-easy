import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import Homepage from "@/pages/homepage";
import ApiDashboard from "@/pages/api-dashboard";
import StockDetail from "@/pages/stock-detail";
import AIAnalysis from "@/pages/ai-analysis";
import NotFound from "@/pages/not-found";
import { useWebSocket } from "@/hooks/use-websocket";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
    },
  },
});

function App() {
  useWebSocket();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={Homepage} />
          <Route path="/api" component={ApiDashboard} />
          <Route path="/ai-analysis" component={AIAnalysis} />
          <Route path="/stock/:symbol" component={StockDetail} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}