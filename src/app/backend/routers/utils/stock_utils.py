import pandas as pd
import yfinance as yf
import numpy as np

INTERVALS = {
    "1m", "5m", "15m", "1h", "1d", "1wk", "1mo"
}

PERIODS = {
    "1d", "5d", "1mo", "3mo", "6mo", "1y", "5y"
}

def load_stock_data(ticker_symbol, interval, period):
    try:
        data = yf.download(ticker_symbol, period=period, interval=interval, auto_adjust=True, progress=False)
    except Exception as e:
        raise ValueError(f"Error: {e}")
    
    if data.empty:
        raise ValueError("No data found.")

    column_mapping = identify_columns(data, ticker_symbol)
    data = data.ffill()
    data = calculate_metrics(data, column_mapping)
    return data, column_mapping

def identify_columns(data, ticker_symbol):
    column_mapping = {}
    if isinstance(data.columns, pd.MultiIndex):
        cols = list(data.columns)
        def get(col): return (col, ticker_symbol) if (col, ticker_symbol) in cols else (col, '')
        column_mapping = {
            'close_col': get('Close'),
            'open_col': get('Open'),
            'high_col': get('High'),
            'low_col': get('Low'),
            'volume_col': get('Volume'),
        }
    else:
        for key in ['Close', 'Open', 'High', 'Low', 'Volume']:
            column_mapping[f"{key.lower()}_col"] = key
    return column_mapping

def calculate_metrics(data, column_mapping):
    if len(data) == 0:
        return data
    try:
        close_col = column_mapping['close_col']
        volume_col = column_mapping['volume_col']

        data['Price_Change'] = data[close_col].pct_change() * 100
        data = compute_buy_price(data, close_col)

        if volume_col in data.columns:
            data['Volume_MA20'] = data[volume_col].rolling(window=20).mean()
            if len(data) >= 20:
                data['Relative_Volume'] = data[volume_col] / data['Volume_MA20']
            else:
                data['Relative_Volume'] = data[volume_col] / data[volume_col].mean()
    except Exception as e:
        print(f"Metrics calc error: {e}")
        data['Price_Change'] = np.nan
        data['Relative_Volume'] = np.nan
    return data

def compute_buy_price(data, close_col):
    def multiplier(price): return 1.0008 if price < 10000 else 1.00008
    data['Multiplier'] = data[close_col].apply(multiplier)
    data['Buy_Price'] = data[close_col] * data['Multiplier']
    return data