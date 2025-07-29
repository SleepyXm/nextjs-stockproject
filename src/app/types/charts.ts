export type RawData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  buy_price: number;
}


export type Interval = 
  | "1m"
  | "5m"
  | "15m"
  | "1h"
  | "4h"
  | "1d"
  | "1wk"
  | "1mo";

export type Period =
  | "1d"
  | "5d"
  | "1mo"
  | "3mo"
  | "6mo"
  | "1y"
  | "5y";

export type Trade = {
  trade_id: number;
  ticker: string;
  action: "buy" | "sell";
  entry_price: number;
  pnl: number;
  spread: number;
}