from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from routers.utils.stock_utils import load_stock_data, INTERVALS, PERIODS

stock_router = APIRouter()

class TradeAction(BaseModel):
    ticker: str
    action: str
    price: float
    time: int
    buy_price: float
    sell_price: float


INTERVALS = {"1m", "5m", "15m", "30m", "1h", "1d"}
PERIODS = {"1d", "5d", "1mo", "3mo"}


@stock_router.get("/stockdata")
async def get_stock_data(
    ticker_symbol: str,
    interval: str = Query("5m"),
    period: str = Query("1mo")
):
    if interval not in INTERVALS or period not in PERIODS:
        raise HTTPException(status_code=400, detail="Invalid interval or period")

    try:
        data, column_mapping = load_stock_data(ticker_symbol, interval, period)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
    
    open_col = column_mapping["open_col"]
    high_col = column_mapping["high_col"]
    low_col = column_mapping["low_col"]
    close_col = column_mapping["close_col"]
    
    chart_data = [
        {
            "time": int(idx.timestamp()),
            "open": row[open_col],
            "high": row[high_col],
            "low": row[low_col],
            "close": row[close_col],
        }
        for idx, row in data.iterrows()
    ]
    
    return chart_data


@stock_router.get("/stockdata/latest")
async def get_latest_candle(
    ticker_symbol: str,
    interval: str = Query("5m")
):
    if interval not in INTERVALS:
        raise HTTPException(status_code=400, detail="Invalid interval")

    # We'll force period short here for live data (e.g. '1d')
    period = "1d"

    try:
        data, column_mapping = load_stock_data(ticker_symbol, interval, period)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
    
    if data.empty:
        raise HTTPException(status_code=404, detail="No data found for latest candle")

    open_col = column_mapping["open_col"]
    high_col = column_mapping["high_col"]
    low_col = column_mapping["low_col"]
    close_col = column_mapping["close_col"]

    latest_row = data.iloc[-1].copy()
    multiplier = 1.0008 if latest_row[close_col] < 10000 else 1.00008
    buy_price = latest_row[close_col] * multiplier

    latest_idx = data.index[-1]

    latest_candle = {
        "time": int(latest_idx.timestamp()),
        "open": latest_row[open_col],
        "high": latest_row[high_col],
        "low": latest_row[low_col],
        "close": round(latest_row[close_col], 2),
        "buy_price": round(buy_price, 2)
    }

    return latest_candle


@stock_router.get("/stockdata/intraday")
async def get_intraday_data(
    ticker_symbol: str,
    interval: str = Query("15m"),
    period: str = Query("1d")
):
    if interval not in INTERVALS:
        raise HTTPException(status_code=400, detail="Invalid interval")
    if period not in PERIODS:
        raise HTTPException(status_code=400, detail="Invalid period")
    
    try:
        data, column_mapping = load_stock_data(ticker_symbol, interval, period)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
    
    open_col = column_mapping["open_col"]
    high_col = column_mapping["high_col"]
    low_col = column_mapping["low_col"]
    close_col = column_mapping["close_col"]
    
    chart_data = [
        {
            "time": int(idx.timestamp()),
            "open": row[open_col],
            "high": row[high_col],
            "low": row[low_col],
            "close": row[close_col],
        }
        for idx, row in data.iterrows()
    ]
    
    return chart_data

@stock_router.post("/trade")
async def place_trade(trade: TradeAction):
    direction = 1 if trade.action == "buy" else -1

    entry_price = trade.price
    exit_price = trade.sell_price if trade.action == "buy" else trade.buy_price
    spread = round(trade.sell_price - trade.buy_price, 4)
    pnl = round((exit_price - entry_price) * direction, 4)

    return {
        "message": "Trade executed",
        "data": {
            "ticker": trade.ticker,
            "action": trade.action,
            "entry_price": entry_price,
            "exit_price": exit_price,
            "spread": spread,
            "pnl": pnl,
            "time": trade.time
        }
    }