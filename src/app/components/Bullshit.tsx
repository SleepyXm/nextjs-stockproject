"use client";
import axios from "axios";
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000/stockdata?ticker_symbol="

export function Data() {
    const [data, setData] = useState<any>(null);
    const ticker = "AAPL";
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE}${ticker}`)
                setData(res.data);
            }
            catch (err) {
                console.error("Kill yourself: ", err)
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : "Loading..."}
        </div>
    )
}