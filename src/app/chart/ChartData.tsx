import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api"
const STOCK_DATA_URL = `${API_BASE}/stockdata?ticker_symbol=`;
const LIVE_DATA_URL = `${API_BASE}/stockdata/latest?ticker_symbol=`;

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