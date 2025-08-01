import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketStatus {
  isOpen: boolean;
  nextOpenTime?: string;
  nextCloseTime?: string;
  currentTime: string;
}

export function SimpleMarketStatus() {
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Fetch market status
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/market/status');
        const status = await response.json();
        setMarketStatus(status);
      } catch (error) {
        console.warn('Could not fetch market status:', error);
      }
    };

    fetchStatus();
    
    // Update market status every minute
    const statusInterval = setInterval(fetchStatus, 60000);
    
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const formatPakistanTime = (date: Date) => {
    return date.toLocaleString('en-PK', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-PK', {
        timeZone: 'Asia/Karachi',
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getTimeUntil = (targetTime: string) => {
    try {
      const target = new Date(targetTime);
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) return 'Now';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
      }
      
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    } catch {
      return 'Unknown';
    }
  };

  if (!marketStatus) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Loading...
        </Badge>
        <span className="text-sm text-white/80">
          {formatPakistanTime(currentTime)} PKT
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {marketStatus.isOpen ? (
          <Badge variant="default" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
            <TrendingUp className="w-3 h-3" />
            Market Open
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1 bg-red-100 text-red-800">
            <TrendingDown className="w-3 h-3" />
            Market Closed
          </Badge>
        )}
        
        <span className="text-sm font-medium text-white">
          {formatPakistanTime(currentTime)} PKT
        </span>
      </div>

      <div className="text-xs text-white/70">
        {marketStatus.isOpen ? (
          marketStatus.nextCloseTime && (
            <div>Closes in {getTimeUntil(marketStatus.nextCloseTime)} at 5:00 PM</div>
          )
        ) : (
          <>
            <div>Market Hours: 9:30 AM - 5:00 PM (Mon-Fri)</div>
            {marketStatus.nextOpenTime && (
              <div>
                Next: {formatDate(marketStatus.nextOpenTime)} at 9:30 AM
                {getTimeUntil(marketStatus.nextOpenTime) !== 'Now' && 
                  ` (in ${getTimeUntil(marketStatus.nextOpenTime)})`
                }
              </div>
            )}
          </>
        )}
      </div>

      {!marketStatus.isOpen && (
        <div className="text-xs bg-blue-500/20 text-blue-200 px-2 py-1 rounded">
          Showing last available market data
        </div>
      )}
    </div>
  );
}