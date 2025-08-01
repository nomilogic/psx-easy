import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketStatus {
  isOpen: boolean;
  nextOpenTime?: string;
  nextCloseTime?: string;
  currentTime: string;
}

interface MarketStatusIndicatorProps {
  marketStatus?: MarketStatus | null;
  lastUpdate?: string | null;
}

export function MarketStatusIndicator({ marketStatus, lastUpdate }: MarketStatusIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-PK', {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid time';
    }
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

  const currentPakTime = currentTime.toLocaleString('en-PK', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const currentPakDate = currentTime.toLocaleDateString('en-PK', {
    timeZone: 'Asia/Karachi',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!marketStatus) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Loading Market Status
        </Badge>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {currentPakTime} PKT
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Market Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {marketStatus.isOpen ? (
            <Badge variant="default" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
              <TrendingUp className="w-3 h-3" />
              Market Open
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <TrendingDown className="w-3 h-3" />
              Market Closed
            </Badge>
          )}
          
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {currentPakTime} PKT
          </span>
        </div>

        {lastUpdate && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {formatTime(lastUpdate)}
          </span>
        )}
      </div>

      {/* Market Schedule Info */}
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div>{currentPakDate}</div>
        
        {marketStatus.isOpen ? (
          marketStatus.nextCloseTime && (
            <div>
              Market closes in {getTimeUntil(marketStatus.nextCloseTime)} at 5:00 PM PKT
            </div>
          )
        ) : (
          <>
            <div>Market Hours: 9:30 AM - 5:00 PM (Monday to Friday)</div>
            {marketStatus.nextOpenTime && (
              <div>
                Next session: {formatDate(marketStatus.nextOpenTime)} at 9:30 AM PKT
                {getTimeUntil(marketStatus.nextOpenTime) !== 'Now' && 
                  ` (in ${getTimeUntil(marketStatus.nextOpenTime)})`
                }
              </div>
            )}
          </>
        )}
      </div>

      {/* Data Status Notice */}
      {!marketStatus.isOpen && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            Showing last available market data from previous trading session
          </p>
        </div>
      )}
    </div>
  );
}