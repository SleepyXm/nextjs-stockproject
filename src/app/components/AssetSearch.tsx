import { useState, useEffect } from 'react';
import { Asset } from '../types/Assets';
import { LineChart } from '../types/charts';
import { LinechartIntraday } from '../chart/ChartRender';
import Link from 'next/link';

const BACKEND_URL = 'http://localhost:8000/api/search';

function fetchAssets(query: string): Promise<Asset[]> {
  return fetch(`${BACKEND_URL}?q=${encodeURIComponent(query)}`)
    .then(res => {
      if (!res.ok) throw new Error('Fetch failed');
      return res.json();
    })
    .then(data => data.quotes || [])
    .catch(err => {
      console.error('Error fetching assets:', err);
      return [];
    });
}

async function fetchIntraday(symbol: string, interval = "15m", period = "1d"):  Promise<LineChart[]> {
  try {
    const res = await fetch(`http://localhost:8000/api/stockdata/intraday?ticker_symbol=${encodeURIComponent(symbol)}&interval=${interval}&period=${period}`);
    if (!res.ok) throw new Error('Intraday fetch fucking died bro');
    const candles = await res.json();
    return candles.map((candle: any) => ({
      time: candle.time,
      value: candle.close,
    }));
  } catch (err) {
    console.error(`Im telling you intraday is an issue for ${symbol}:`, err);
    return [];
  }
}


export default function AssetSearchComponent() {
    const [searchInput, setSearchInput] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [intradayCharts, setIntradayCharts] = useState<Record<string, LineChart[]>>({});

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    const results = await fetchAssets(searchInput);
    setAssets(results);

    const chartPromises = results.map(async (asset) => {
      const chart = await fetchIntraday(asset.symbol);
      return { symbol: asset.symbol, chart };
    });

    const chartResults = await Promise.all(chartPromises);
    const chartMap: Record<string, LineChart[]> = {};

    for (const { symbol, chart } of chartResults) {
      chartMap[symbol] = chart;
    }

    setIntradayCharts(chartMap);
  };

  return (
  <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
    <h2 style={{ marginBottom: '1rem' }}>Search Assets</h2>

    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search for an asset..."
        style={{
          padding: '0.5rem',
          fontSize: '1rem',
          flex: 1,
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Search
      </button>
    </div>

    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {assets.map((asset) => (
        <li
          key={asset.symbol}
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: 'rgba(0,0,0,0.00',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          }}
        >
          <Link href={`/chart/${asset.symbol}`}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              {asset.symbol} — {asset.shortname}
            </div>
          </Link>

          {intradayCharts[asset.symbol]?.length > 0 && (
            <div
              style={{
                marginTop: '1rem',
                width: '100%',
                maxWidth: 600,
                height: 150,
              }}
            >
              <LinechartIntraday data={intradayCharts[asset.symbol]} />
            </div>
          )}
        </li>
      ))}
    </ul>
  </div>
  );
}