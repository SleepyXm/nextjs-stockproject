"use client";

import { CandlestickChart, Interval } from "../../types/charts";
import { CandleStickChart, Linechart } from "../ChartRender";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { data } from "framer-motion/client";
import { useChartData } from "../ChartData";

const API_BASE = "http://localhost:8000/api";

function useCandlestickChartData(ticker: string, interval: string) {
  return useChartData<CandlestickChart>(ticker, interval);
}

function useLineChartData(ticker: string, interval: string) {
  const raw = useChartData(ticker, interval);
  return raw?.map((item) => ({
    time: item.time,
    value: item.close,
  }));
}

function TradeButtonRow({ data, ticker }: { data: any; ticker: string }) {
  const handleTrade = async (action: "buy" | "sell") => {
    try {
      const tradePayload = {
        ticker,
        action,
        price: action === "buy" ? data.buy_price : data.close,
        buy_price: data.buy_price,
        sell_price: data.close,
        time: data.time,
      };

      const res = await axios.post(
        "http://localhost:8000/api/trade",
        tradePayload
      );
      const { pnl, spread } = res.data.data;

      alert(
        `${action.toUpperCase()} order placed!\nPnL: $${pnl} | Spread: $${spread}`
      );
    } catch (err) {
      console.error("Trade error:", err);
    }
  };

  return (
    <div className="flex gap-4 mb-2 items-center">
      <button
        onClick={() => handleTrade("sell")}
        className="bg-red-400 text-white px-4 py-2 rounded flex flex-col items-center hover:bg-red-500 transition"
      >
        Sell
        <small>${data.close}</small>
      </button>

      <button
        onClick={() => handleTrade("buy")}
        className="bg-blue-400 text-white px-4 py-2 rounded flex flex-col items-center hover:bg-blue-500 transition"
      >
        Buy
        <small>${data.buy_price}</small>
      </button>
    </div>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const intervals: Interval[] = ["1m", "5m", "15m", "1h", "1d", "1wk", "1mo"];

export default function ChartPage() {
  const params = useParams();
  const symbolParam = typeof params.symbol === "string" ? params.symbol : "";
  const shortname = symbolParam.toUpperCase();
  const [interval, setInterval] = useState<Interval>("5m");

  const [isCandle, setIsCandle] = useState(true); // true = candlestick, false = line

  const debouncedTicker = useDebounce(symbolParam.toUpperCase(), 500);
  const dataCandlestick = useCandlestickChartData(debouncedTicker, interval);
  const dataLine = useLineChartData(debouncedTicker, interval);
  const latestCandle = dataCandlestick?.[dataCandlestick.length - 1] || null;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center my-4">
        <div className="flex gap-2">
          {intervals.map((int) => (
            <button
              key={int}
              onClick={() => setInterval(int)}
              className={`px-3 py-1 rounded ${
                interval === int ? "bg-blue-600 text-white" : "bg-gray-600"
              }`}
            >
              {int}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsCandle(true)}
            className={`px-3 py-1 rounded ${
              isCandle ? "bg-blue-600 text-white" : "bg-gray-600"
            }`}
          >
            Candlestick
          </button>
          <button
            onClick={() => setIsCandle(false)}
            className={`px-3 py-1 rounded ${
              !isCandle ? "bg-blue-600 text-white" : "bg-gray-600"
            }`}
          >
            Line
          </button>
        </div>
      </div>

      {latestCandle && (
        <TradeButtonRow data={latestCandle} ticker={debouncedTicker} />
      )}

      <h2 className="text-xl font-bold mb-2">{shortname} Chart</h2>

      {isCandle ? (
        dataCandlestick && dataCandlestick.length > 0 ? (
          <CandleStickChart data={dataCandlestick} />
        ) : (
          <p>Loading candlestick chart data...</p>
        )
      ) : dataLine ? (
        <Linechart data={dataLine} />
      ) : (
        <p>Loading line chart data...</p>
      )}
    </div>
  );
}
