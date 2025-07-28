import { useState } from "react";
import axios from "axios";

export default function TradeButtonRow({ data, ticker }: { data: any; ticker: string }) {
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