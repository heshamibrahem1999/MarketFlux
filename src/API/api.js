import axios from "axios";


const api = axios.create({
  baseURL: "https://api.bybit.com",
  timeout: 15000,
});

export const getOHLCByRange = async ({
  symbol,
  multiplier,
  timespan,
  from,
  to,
}) => {
  var interval = 0;
  if (timespan === "minute") {
    interval = multiplier;
  }else if (timespan === "hour") {
    interval = multiplier * 60;
  } else if (timespan === "day") {
    interval = "D";
  } else if (timespan === "week") {
    interval = "W";
  } else if (timespan === "month") {
    interval = "M";
  }
  if (!symbol) {
    throw new Error("Symbol is required.");
  }

  const response = await api.get(
    "/v5/market/kline",
    {
      params: {
        category: "inverse",
        symbol: symbol,
        interval: interval,
        start: from,
        end: to,
      },
    }
  );

  return response.data;
};

export const getPercents = async () => {
  const response = await api.get("/v5/market/tickers?category=inverse", {
    params: {
      category: "inverse",
    },
  });

  return response.data;
};