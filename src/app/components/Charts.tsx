"use client";

import { createChart, AreaSeries, CandlestickSeries, ColorType } from 'lightweight-charts';
import { LineChart, LineChartColors, CandlestickChart, CandlestickChartColors, RawData, Interval } from '../types/charts';
import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { data } from 'framer-motion/client';

const API_BASE = "http://localhost:8000/api"
const STOCK_DATA_URL = `${API_BASE}/stockdata?ticker_symbol=`;
const LIVE_DATA_URL = `${API_BASE}/stockdata/latest?ticker_symbol=`;

export const ChartComponent2: React.FC<{
  data: any[];
  colors?: any;
}> = ({ data, colors = {} }) => {
  const {
    backgroundColor = 'transparent',
    textColor = 'black',
    upColor = 'green',
    downColor = 'red',
    borderUpColor = '#4CAF50',
    borderDownColor = '#F44336',
    wickUpColor = '#4CAF50',
    wickDownColor = '#F44336',
  } = colors;

  const chartContainerRef2 = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef2.current) return;

    const chart = createChart(chartContainerRef2.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef2.current.clientWidth,
      height: chartContainerRef2.current.clientHeight,
      timeScale: {
        rightOffset: 10,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderUpColor,
      borderDownColor,
      wickUpColor,
      wickDownColor,
    });

    series.setData(data);

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef2.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef2.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return <div ref={chartContainerRef2} style={{ width: 1500, height: 900 }} />;
};


export const ChartComponent: React.FC<{
  data: LineChart[];
  colors?: LineChartColors;
}> = ({ data, colors = {} }) => {
  const {
    backgroundColor = 'white',
    lineColor = '#2962FF',
    textColor = 'black',
    areaTopColor = '#2962FF',
    areaBottomColor = 'rgba(41, 98, 255, 0.28)',
  } = colors;

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: container.clientWidth,
      height: container.clientHeight,
      timeScale: {
        rightOffset: 10,
      }
    });

    chart.timeScale().fitContent();

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });

    areaSeries.setData(data);

    chartRef.current = chart;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: 300 }} />;
};

// Example usage

//const initialData: LineChart[] = [
//  { time: '2018-12-22', value: 32.51 },
// { time: '2018-12-23', value: 31.11 },
//  { time: '2018-12-24', value: 27.02 },
//  { time: '2018-12-25', value: 27.32 },
//  { time: '2018-12-26', value: 25.17 },
//  { time: '2018-12-27', value: 28.89 },
//  { time: '2018-12-28', value: 25.46 },
//  { time: '2018-12-29', value: 23.92 },
//  { time: '2018-12-30', value: 22.68 },
//  { time: '2018-12-31', value: 22.67 },
//];

//const initialData2: CandlestickChart[] = [
//  { time: '2018-12-22', open: 32.51, high: 32.57, low: 31.77, close: 32.92 },
//  { time: '2018-12-23', open: 32.51, high: 32.57, low: 31.77, close: 32.92 },
//  { time: '2018-12-24', open: 32.51, high: 32.57, low: 31.77, close: 32.92 },
//  { time: '2018-12-25', open: 32.51, high: 32.57, low: 31.77, close: 32.92 },
//  { time: '2018-12-26', open: 32.51, high: 32.57, low: 31.77, close: 32.92 },
//  { time: '2018-12-27', open: 32.51, high: 32.57, low: 31.77, close: 32.92 },
//  { time: '2018-12-28', open: 32.51, high: 32.57, low: 31.77, close: 32.92 }
//];

export function useChartData<T extends { time: string } = any>(ticker: string, interval: string) {
  const [data, setData] = useState<T[] | null>(null);

  // Initial fetch when ticker changes
  useEffect(() => {
    if (!ticker || !interval) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`${STOCK_DATA_URL}${ticker}&interval=${interval}`);
        setData(res.data);
      } catch (err) {
        console.error("Nothing to see here:", err);
      }
    };
    fetchData();
  }, [ticker, interval]);

  // Live update effect
  useEffect(() => {
    if (!ticker || !interval) return;

    const fetchLatest = async () => {
      try {
        const res = await axios.get(`${LIVE_DATA_URL}${ticker}&interval=${interval}`);
        const latestCandle: T = res.data;

        setData((currentData) => {
          if (!currentData || currentData.length === 0) return [latestCandle];

          const lastCandle = currentData[currentData.length - 1];

          if (lastCandle.time === latestCandle.time) {
            // Replace last candle
            return [...currentData.slice(0, -1), latestCandle];
          } else if (lastCandle.time < latestCandle.time) {
            // Append new candle
            return [...currentData, latestCandle];
          }
          // If latestCandle.time <= lastCandle.time and not equal, ignore update
          return currentData;
        });
      } catch (err) {
        console.error("Live update fetch error:", err);
      }
    };

    // Fetch first immediately
    fetchLatest();

    const intervalId = setInterval(fetchLatest, 1400);

    return () => clearInterval(intervalId);
  }, [ticker, interval]);

  return data;
}

function useCandlestickChartData(ticker: string, interval: string) {
  return useChartData<CandlestickChart>(ticker, interval);
}

function useLineChartData(ticker: string, interval: string) {
  const raw = useChartData(ticker, interval);
  return raw?.map(item => ({
    time: item.time,
    value: item.close,
  }));
}

function TradeButtonRow({ data, ticker }: { data: any; ticker: string }) {
  const handleTrade = async (action: "buy" | "sell") => {
    try {
      const priceToSend = action === "buy" ? data.buy_price : data.close;
      await axios.post("http://localhost:8000/trade", {
        ticker,
        action,
        price: priceToSend,
        time: data.time,
      });
      alert(`${action.toUpperCase()} order placed!`);
    } catch (err) {
      console.error("Nothing to see here lololol (trade btw):", err);
    }
  };

  return (
    <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
      <span>{data.time} - Close: ${data.close} - Buy: ${data.buy_price}</span>
      <button onClick={() => handleTrade("buy")}>Buy</button>
      <button onClick={() => handleTrade("sell")}>Sell</button>
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

const intervals: Interval[] = [
  "1m",
  "5m",
  "15m",
  "1h",
  "4h",
  "1d",
  "1wk",
  "1mo"
]

export default function App() {

  const [interval, setInterval] = useState<Interval>("5m")
  const [ticker, setTicker] = useState('');
  const debouncedTicker = useDebounce(ticker, 500);
  const dataCandlestick = useCandlestickChartData(debouncedTicker, interval);
  const dataLine = useLineChartData(debouncedTicker, interval);
  const latestCandle = dataCandlestick ? dataCandlestick[dataCandlestick.length - 1] : null;


  return (
    
  <div className="p-4">
    <div className="flex gap-2 my-4">
      {intervals.map((int) => (
        <button
          key={int}
          onClick={() => setInterval(int)}
          className={`px-3 py-1 rounded ${
            interval === int ? 'bg-blue-600 text-white' : 'bg-gray-600'
          }`}
          >
            {int}
        </button>
      ))}
    </div>

    <input
      type="text"
      value={ticker}
      onChange={(e) => setTicker(e.target.value.toUpperCase())}
      placeholder="Enter ticker"
      />
      {dataCandlestick && dataCandlestick.length > 0 ? (
        <>
          <ChartComponent2 data={dataCandlestick} />
          {latestCandle && <TradeButtonRow data={latestCandle} ticker={debouncedTicker} />}
        </>
        ) : (
        <p>Loading chart data...</p>
        )}


      {dataLine ? (
        <ChartComponent data={dataLine}/>
      ) : (
        <p>Loading line chart data...</p>
      )}
  </div>
  )
}