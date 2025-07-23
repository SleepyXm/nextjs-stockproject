import { useState, useEffect } from 'react';
import { Asset } from '../types/Assets';
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

export default function AssetSearchComponent() {
    const [searchInput, setSearchInput] = useState('');
    const [assets, setAssets] = useState<Asset[]>([]);
    const handleSearch = () => {
        if (!searchInput.trim()) return;
        fetchAssets(searchInput).then(setAssets);
    }
    
    return (
    <div>
        <h2>Search Assets</h2>
        <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search for an asset..."
        />
        <button onClick={handleSearch}>Search</button>
        
        <ul>
            {assets.map((asset) => (
                <li key={asset.symbol}>
                    <Link href={`/chart/${asset.symbol}`}>
                        {asset.symbol} — {asset.shortname}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
  );
}