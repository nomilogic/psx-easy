import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import GlobalHeaderTicker from "@/components/global-header-ticker";
import Navigation from "@/components/navigation";
import StickyNavigation from "@/components/sticky-navigation";
import Homepage from "@/pages/homepage";
import StockDetail from "@/pages/stock-detail";
import NotFound from "@/pages/not-found";
import ApiDashboard from "@/pages/api-dashboard";
import AiAnalysis from "@/pages/ai-analysis-new";
import AIAnalysisComprehensive from "@/pages/ai-analysis-comprehensive";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchInterval: 1000 * 30, // Auto-refetch every 30 seconds
    },
  },
});

function AppContent() {
  const [location] = useLocation();

  // Determine current page and extract stock symbol if applicable
  const getCurrentPage = () => {
    if (location === "/") return "home";
    if (location === "/api") return "api";
    if (location === "/ai-analysis") return "ai-analysis";
    if (location === "/ai-comprehensive") return "ai-comprehensive";
    if (location.startsWith("/stock/")) return "stock-detail";
    return "home";
  };

  const getStockSymbol = () => {
    if (location.startsWith("/stock/")) {
      return location.split("/")[2];
    }
    return undefined;
  };

  const currentPage = getCurrentPage();
  const stockSymbol = getStockSymbol();

  return (
    <div className="pt-0">
      {" "}
      {/* Add padding for fixed header ticker */}
      <Navigation />
      {/* <StickyNavigation currentPage={currentPage as any} stockSymbol={stockSymbol} /> */}
      <Switch>
        <Route path="/" component={Homepage} />
        <Route path="/stock/:symbol" component={StockDetail} />
        <Route path="/api" component={ApiDashboard} />
        <Route path="/ai-analysis" component={AiAnalysis} />
        <Route path="/ai-comprehensive" component={AIAnalysisComprehensive} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
