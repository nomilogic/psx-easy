
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Server, 
  BarChart3, 
  Brain, 
  Search, 
  Filter, 
  Download,
  Home,
  TrendingUp
} from "lucide-react";

interface StickyNavigationProps {
  currentPage: 'home' | 'api' | 'ai-analysis' | 'stock-detail';
  stockSymbol?: string;
}

export default function StickyNavigation({ currentPage, stockSymbol }: StickyNavigationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show navigation after scrolling past the main header (about 200px)
      if (window.pageYOffset > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;

  const getNavigationItems = () => {
    const baseItems = [
      { href: "/", label: "Dashboard", icon: Home, active: currentPage === 'home' },
      { href: "/api", label: "API Explorer", icon: Server, active: currentPage === 'api' },
      { href: "/ai-analysis", label: "AI Analysis", icon: Brain, active: currentPage === 'ai-analysis' },
    ];

    if (currentPage === 'stock-detail' && stockSymbol) {
      baseItems.splice(1, 0, {
        href: `/stock/${stockSymbol}`,
        label: stockSymbol,
        icon: TrendingUp,
        active: true
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className={`fixed top-12 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-all duration-300 ${
      isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "secondary" : "ghost"}
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    item.active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Page-specific Actions */}
          <div className="flex items-center space-x-2">
            {currentPage === 'api' && (
              <>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </>
            )}
            
            {currentPage === 'home' && (
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-1" />
                Search
              </Button>
            )}

            {(currentPage === 'ai-analysis' || currentPage === 'stock-detail') && (
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
