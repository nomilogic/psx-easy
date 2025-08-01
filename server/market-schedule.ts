import { DateTime } from "luxon";

export class MarketSchedule {
  private static readonly MARKET_TIMEZONE = "Asia/Karachi";
  private static readonly MARKET_OPEN_HOUR = 9;
  private static readonly MARKET_OPEN_MINUTE = 30;
  private static readonly MARKET_CLOSE_HOUR = 17;
  private static readonly MARKET_CLOSE_MINUTE = 0;

  static isMarketOpen(): boolean {
    const now = DateTime.now().setZone(this.MARKET_TIMEZONE);
    
    // Check if it's a weekend (Saturday or Sunday)
    if (now.weekday === 6 || now.weekday === 7) {
      return false;
    }

    const marketOpen = now.set({
      hour: this.MARKET_OPEN_HOUR,
      minute: this.MARKET_OPEN_MINUTE,
      second: 0,
      millisecond: 0,
    });

    const marketClose = now.set({
      hour: this.MARKET_CLOSE_HOUR,
      minute: this.MARKET_CLOSE_MINUTE,
      second: 0,
      millisecond: 0,
    });

    return now >= marketOpen && now <= marketClose;
  }

  static getMarketStatus(): {
    isOpen: boolean;
    nextOpenTime?: string;
    nextCloseTime?: string;
    currentTime: string;
  } {
    const now = DateTime.now().setZone(this.MARKET_TIMEZONE);
    const isOpen = this.isMarketOpen();

    let nextOpenTime: string | undefined;
    let nextCloseTime: string | undefined;

    if (isOpen) {
      // Market is open, calculate next close time
      nextCloseTime = now
        .set({
          hour: this.MARKET_CLOSE_HOUR,
          minute: this.MARKET_CLOSE_MINUTE,
          second: 0,
          millisecond: 0,
        })
        .toISO()!;
    } else {
      // Market is closed, calculate next open time
      let nextOpen = now.set({
        hour: this.MARKET_OPEN_HOUR,
        minute: this.MARKET_OPEN_MINUTE,
        second: 0,
        millisecond: 0,
      });

      // If we're past today's close time, move to next weekday
      if (now.hour >= this.MARKET_CLOSE_HOUR) {
        nextOpen = nextOpen.plus({ days: 1 });
      }

      // Skip weekends
      while (nextOpen.weekday === 6 || nextOpen.weekday === 7) {
        nextOpen = nextOpen.plus({ days: 1 });
      }

      nextOpenTime = nextOpen.toISO()!;
    }

    return {
      isOpen,
      nextOpenTime,
      nextCloseTime,
      currentTime: now.toISO()!,
    };
  }

  static getTimeUntilMarketOpen(): number | null {
    if (this.isMarketOpen()) {
      return null;
    }

    const now = DateTime.now().setZone(this.MARKET_TIMEZONE);
    let nextOpen = now.set({
      hour: this.MARKET_OPEN_HOUR,
      minute: this.MARKET_OPEN_MINUTE,
      second: 0,
      millisecond: 0,
    });

    // If we're past today's open time, move to next day
    if (now.hour >= this.MARKET_CLOSE_HOUR) {
      nextOpen = nextOpen.plus({ days: 1 });
    }

    // Skip weekends
    while (nextOpen.weekday === 6 || nextOpen.weekday === 7) {
      nextOpen = nextOpen.plus({ days: 1 });
    }

    return nextOpen.diff(now).as("milliseconds");
  }

  static getTimeUntilMarketClose(): number | null {
    if (!this.isMarketOpen()) {
      return null;
    }

    const now = DateTime.now().setZone(this.MARKET_TIMEZONE);
    const marketClose = now.set({
      hour: this.MARKET_CLOSE_HOUR,
      minute: this.MARKET_CLOSE_MINUTE,
      second: 0,
      millisecond: 0,
    });

    return marketClose.diff(now).as("milliseconds");
  }
}