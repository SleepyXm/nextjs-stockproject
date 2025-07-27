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
  const [activeTrades, setActiveTrades] = useState<any[]>([]);

  const handleTrade = async (action: "buy" | "sell") => {
    try {
      if (
        (action === "buy" && typeof data.buy_price !== "number") ||
        (action === "sell" && typeof data.close !== "number")
      ) {
        alert("Invalid price data.");
        return;
      }

      const tradePayload = {
        ticker,
        action,
        price: action === "buy" ? data.buy_price : data.close,
        buy_price: data.buy_price,
        sell_price: data.close,
        time: data.time,
      };

      const res = await axios.post("http://localhost:8000/api/trade", tradePayload);

      const trade = res.data.data;
      setActiveTrades((prev) => [...prev, trade]);

      const { pnl, spread } = trade;
      alert(`${action.toUpperCase()} order placed!\nPnL: $${pnl} | Spread: $${spread}`);
    } catch (err) {
      console.error("Trade error:", err);
    }
  };

  const handleCloseTrade = async (tradeId: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/trade/${tradeId}`);
      setActiveTrades((prev) => prev.filter((t) => t.trade_id !== tradeId));
    } catch (err) {
      console.error("Failed to delete trade:", err);
    }
  };

  return (
    <>
      <div className="flex gap-4 mb-2 items-center">
        <button
          onClick={() => handleTrade("sell")}
          className="bg-red-400 text-white px-4 py-2 rounded flex flex-col items-center hover:bg-red-500 transition"
        >
          Sell
          <small>${typeof data.close === "number" ? data.close.toFixed(2) : "-"}</small>
        </button>

        <button
          onClick={() => handleTrade("buy")}
          className="bg-blue-400 text-white px-4 py-2 rounded flex flex-col items-center hover:bg-blue-500 transition"
        >
          Buy
          <small>${typeof data.buy_price === "number" ? data.buy_price.toFixed(2) : "-"}</small>
        </button>
      </div>

      {activeTrades.length > 0 && (
        <div className="bg-neutral-100 p-3 rounded shadow-md">
          <h3 className="font-semibold mb-2">Open Positions</h3>
          <ul className="space-y-2">
            {activeTrades.map((trade) => {
              const currentPrice = typeof data.close === "number" ? data.close : 0;
              const direction = trade.action === "buy" ? 1 : -1;
              const entry = trade.entry_price || 0;
              const livePnL = (currentPrice - entry) * direction;

              return (
                <li
                  key={trade.trade_id}
                  className="flex justify-between items-center bg-white p-2 rounded border"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {trade.action.toUpperCase()} {trade.ticker}
                    </p>
                    <p className="text-xs text-gray-600">
                      Entry: ${entry.toFixed(2)} | Current: ${currentPrice.toFixed(2)} | PnL:{" "}
                      <span className={livePnL >= 0 ? "text-green-600" : "text-red-600"}>
                        ${livePnL.toFixed(2)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleCloseTrade(trade.trade_id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    X
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
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
