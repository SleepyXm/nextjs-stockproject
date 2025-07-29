"use client";

import { Interval } from "../../types/charts";
import { CandleStickChart, Linechart } from "../ChartRender";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { data } from "framer-motion/client";
import { useChartData } from "../ChartData";
import TradeButtonRow from "@/app/trading/trade";

const API_BASE = "http://localhost:8000/api";

function ShowChart(ticker: string, interval: string, type: "CandleStick" | "line") {
  const raw = useChartData(ticker, interval);
  return type === "line" ? raw?.map((item) => ({ ...item, value:item.close })) : raw;
}

const intervals: Interval[] = ["1m", "5m", "15m", "1h", "1d", "1wk", "1mo"];

export default function ChartPage() {
  const params = useParams();
  const symbolParam = typeof params.symbol === "string" ? params.symbol : "";
  const shortname = symbolParam.toUpperCase();
  const [interval, setInterval] = useState<Interval>("5m");

  const [isCandle, setIsCandle] = useState(true); // true = candlestick, false = line


  const chartData = ShowChart(shortname, interval, isCandle ? "CandleStick" : "line");
  const [activeTrades, setActiveTrades] = useState<any[]>([]);
  const tradeUI = chartData && chartData.length > 0 ? (<TradeButtonRow data={chartData[chartData.length -1]} ticker={shortname} activeTrades={activeTrades} setActiveTrades={setActiveTrades} />) : null;

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
              isCandle ? "bg-blue-600 text-white" : "bg-gray-600"}`}
          >
            Candlestick
          </button>
          <button
            onClick={() => setIsCandle(false)}
            className={`px-3 py-1 rounded ${!isCandle ? "bg-blue-600 text-white" : "bg-gray-600"}`}
          >
            Line
          </button>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-2">{shortname} Chart</h2>
      {chartData && chartData.length > 0 ? (
        isCandle ? (
          <CandleStickChart data={chartData} renderTradeUI={tradeUI} trades={activeTrades} />
        ) : (
          <Linechart data={chartData} renderTradeUI={tradeUI} trades={activeTrades} />
        )
      ) : (
        <p>Loading {isCandle ? "candlestick" : "line"} chart data...</p>
      )}
    </div>
  );
}
