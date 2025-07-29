import { useState, useEffect } from "react";
import { Asset } from "../types/Assets";
import { RawData } from "../types/charts";
import { LinechartIntraday } from "../chart/ChartRender";
import Link from "next/link";

const BACKEND_URL = "http://localhost:8000/api/search";

function fetchAssets(query: string): Promise<Asset[]> {
  return fetch(`${BACKEND_URL}?q=${encodeURIComponent(query)}`)
    .then((res) => {
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    })
    .then((data) => data.quotes || [])
    .catch((err) => {
      console.error("Error fetching assets:", err);
      return [];
    });
}

async function fetchIntraday(
  symbol: string,
  interval = "15m",
  period = "1d"
): Promise<RawData[]> {
  try {
    const res = await fetch(
      `http://localhost:8000/api/stockdata/intraday?ticker_symbol=${encodeURIComponent(
        symbol
      )}&interval=${interval}&period=${period}`
    );
    if (!res.ok) throw new Error("Intraday fetch fucking died bro");
    const intrday = await res.json();
    return intrday.map((intrday: any) => ({
      time: intrday.time,
      value: intrday.close,
    }));
  } catch (err) {
    console.error(`Im telling you intraday is an issue for ${symbol}:`, err);
    return [];
  }
}

export default function AssetSearchComponent() {
  const [searchInput, setSearchInput] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [intradayCharts, setIntradayCharts] = useState<
    Record<string, RawData[]>
  >({});

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    const results = await fetchAssets(searchInput);
    setAssets(results);

    const chartPromises = results.map(async (asset) => {
      const chart = await fetchIntraday(asset.symbol);
      return { symbol: asset.symbol, chart };
    });

    const chartResults = await Promise.all(chartPromises);
    const chartMap: Record<string, RawData[]> = {};

    for (const { symbol, chart } of chartResults) {
      chartMap[symbol] = chart;
    }

    setIntradayCharts(chartMap);
  };

  return (
    <div className="p-8 font-sans">
      <h2 className="mb-4 text-2xl font-semibold">Search Assets</h2>

      <div className="flex gap-2 mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2 mb-8"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for an asset..."
            className="px-4 py-3 text-base rounded-l-full border border-gray-300 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-300 bg-white text-gray-600 shadow-sm"
            style={{ width: "450px" }}
          />
          <button
            type="submit"
            className="px-5 py-3 text-base cursor-pointer bg-[#343f52] text-white rounded-r-full"
            style={{ width: "150px" }}
          >
            Search
          </button>
        </form>
      </div>

      <ul className="list-none p-0 m-0">
        {assets.map((asset) => (
          <li
            key={asset.symbol}
            className="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm"
          >
            <Link href={`/chart/${asset.symbol}`}>
              <div className="font-semibold mb-2">
                {asset.symbol} — {asset.shortname}
              </div>
            </Link>

            {intradayCharts[asset.symbol]?.length > 0 && (
              <div className="mt-4 w-full max-w-[600px] h-[150px]">
                <LinechartIntraday data={intradayCharts[asset.symbol]} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
