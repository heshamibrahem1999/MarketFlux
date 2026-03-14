import axios from "axios";

const api = axios.create({
  baseURL: "https://api.massive.com",
  headers: {
  },
});

export const getOHLCbyDays = (range,rangesub,start,end) =>
  api.get(`/v2/aggs/ticker/A/range/${range}/${rangesub}/${start}/${end}`, {
    params: {
      "adjusted": true,
      "sort": "asc",
      "apiKey": "F3pp_p5yvgN6qapNanz4BmnqhMGKxHQT",
    },
  });



