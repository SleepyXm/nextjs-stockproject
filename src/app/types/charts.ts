export type RawData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  buy_price: number;
}

export type LineChart = {
  time: string;
  value: number;
};

export type CandlestickChart = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type LineChartColors = {
  backgroundColor?: string;
  lineColor?: string;
  textColor?: string;
  areaTopColor?: string;
  areaBottomColor?: string;
};

export type CandlestickChartColors = {
  backgroundColor?: string;
  textColor?: string;
  upColor: string;
  downColor: string;
  borderUpColor?: string;
  borderDownColor?: string;
  wickUpColor?: string;
  wickDownColor?: string;
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
  ticker: string;
  action: "buy" | "sell";
  price: number;
  time: string;
}