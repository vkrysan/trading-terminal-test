// src/api.js
import axios from 'axios';

const API_BASE_URL = 'https://api.bybit.com/v2/public';

export const fetchFuturesSymbols = async () => {
  const response = await axios.get(`${API_BASE_URL}/symbols`);
  return response.data.result.filter(symbol => symbol.quote_currency === 'USDT' && symbol.status === 'Trading');
};

export const fetchOrderBook = async (symbol) => {
  const response = await axios.get(`${API_BASE_URL}/orderBook/L2?symbol=${symbol}`);
  return response.data.result;
};
