
-- Add new columns for additional Arif Habib API data
ALTER TABLE "stocks" ADD COLUMN "bid_price" real;
ALTER TABLE "stocks" ADD COLUMN "bid_volume" integer;
ALTER TABLE "stocks" ADD COLUMN "ask_price" real;
ALTER TABLE "stocks" ADD COLUMN "ask_volume" integer;
ALTER TABLE "stocks" ADD COLUMN "high_52_week" real;
ALTER TABLE "stocks" ADD COLUMN "low_52_week" real;
ALTER TABLE "stocks" ADD COLUMN "market_cap" real;
ALTER TABLE "stocks" ADD COLUMN "shares" real;
ALTER TABLE "stocks" ADD COLUMN "free_float" real;
ALTER TABLE "stocks" ADD COLUMN "upper_cap" real;
ALTER TABLE "stocks" ADD COLUMN "lower_cap" real;
ALTER TABLE "stocks" ADD COLUMN "haircut" real;
ALTER TABLE "stocks" ADD COLUMN "beta" real;
ALTER TABLE "stocks" ADD COLUMN "listed_in" jsonb;
ALTER TABLE "stocks" ADD COLUMN "pivot_points" jsonb;
ALTER TABLE "stocks" ADD COLUMN "returns" jsonb;
ALTER TABLE "stocks" ADD COLUMN "last_trade_date" text;
ALTER TABLE "stocks" ADD COLUMN "type" integer;
ALTER TABLE "stocks" ADD COLUMN "status" integer;
ALTER TABLE "stocks" ADD COLUMN "last_day_close_volume" integer;
ALTER TABLE "stocks" ADD COLUMN "etf" jsonb;
ALTER TABLE "stocks" ADD COLUMN "xb" boolean;
ALTER TABLE "stocks" ADD COLUMN "xd" boolean;
ALTER TABLE "stocks" ADD COLUMN "xr" boolean;
ALTER TABLE "stocks" ADD COLUMN "sd" boolean;

-- Fix volume column type to match schema
ALTER TABLE "stocks" ALTER COLUMN "volume" TYPE integer USING volume::integer;
