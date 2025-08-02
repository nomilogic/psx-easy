
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  BarChart3,
  Brain,
  Menu,
  X,
  Activity,
  Globe,
  TrendingUp,
  Bot,
} from "lucide-react";
import GlobalHeaderTicker from "./global-header-ticker";
import HeaderTicker from "./header-ticker";
import IndicesTicker from "./indices-ticker";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { marketData: stocks } = useWebSocket();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/api", label: "Market Data", icon: BarChart3 },
    { path: "/ai-analysis", label: "AI Analysis", icon: Brain },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Sticky Header Tickers at the very top */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        {/* Market Indices Ticker */}
        <IndicesTicker />
        
        {/* Stock Ticker */}
        <HeaderTicker stocks={stocks || []} />
        
        {/* Global Header Ticker */}
        <GlobalHeaderTicker />
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-[120px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">PAISX</h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Pakistan AI Stock Exchange
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      className={`flex items-center space-x-2 ${
                        isActive(item.path)
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Status Badge */}
            <div className="hidden md:flex items-center space-x-3">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <Activity className="w-3 h-3 mr-1" />
                Live Market
              </Badge>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-slate-200 mt-2 pt-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={isActive(item.path) ? "secondary" : "ghost"}
                        className={`w-full justify-start ${
                          isActive(item.path)
                            ? "bg-blue-100 text-blue-700"
                            : "text-slate-600"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
                <div className="pt-2 border-t border-slate-200">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <Activity className="w-3 h-3 mr-1" />
                    Live Market Data
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
