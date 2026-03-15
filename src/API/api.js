import axios from "axios";

const apiKey = process.env.REACT_APP_MARKET_API_KEY;

const api = axios.create({
  baseURL: "https://api.massive.com",
  timeout: 15000,
});

export const getOHLCByRange = async ({
  symbol,
  multiplier,
  timespan,
  from,
  to,
}) => {
  if (!apiKey) {
    throw new Error("Missing REACT_APP_MARKET_API_KEY in environment variables.");
  }

  if (!symbol) {
    throw new Error("Symbol is required.");
  }

  const response = await api.get(
    `/v2/aggs/ticker/${encodeURIComponent(symbol.toUpperCase())}/range/${multiplier}/${timespan}/${from}/${to}`,
    {
      params: {
        adjusted: true,
        sort: "asc",
        apiKey,
      },
    }
  );

  return response.data;
};