import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { Button } from "react-bootstrap";
import "./Portfoliogrowth.css";
import { getOHLCbyDays } from "../../API/api";

function Portfoliogrowth() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const animationIdRef = useRef(0);

  const [activeTimeframe, setActiveTimeframe] = useState("1d");
  const [selectedRangeOption, setSelectedRangeOption] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const showgraph = (timeframe) => {
    setActiveTimeframe(timeframe);
    setSelectedRangeOption(0);
  };

  const timeframeOptions = {
    "1d": [
      { range: "1", rangesub: "minute" },
      { range: "5", rangesub: "minute" },
      { range: "15", rangesub: "minute" },
      { range: "30", rangesub: "minute" },
      { range: "1", rangesub: "hour" },
    ],
    "5d": [
      { range: "30", rangesub: "minute" },
      { range: "1", rangesub: "hour" },
      { range: "2", rangesub: "hour" },
      { range: "4", rangesub: "hour" },
      { range: "1", rangesub: "day" },
    ],
    "1m": [
      { range: "1", rangesub: "hour" },
      { range: "2", rangesub: "hour" },
      { range: "4", rangesub: "hour" },
      { range: "1", rangesub: "day" },
      { range: "3", rangesub: "day" },
    ],
    "3m": [
      { range: "4", rangesub: "hour" },
      { range: "1", rangesub: "day" },
      { range: "3", rangesub: "day" },
      { range: "1", rangesub: "week" },
    ],
    "6m": [
      { range: "1", rangesub: "day" },
      { range: "3", rangesub: "day" },
      { range: "1", rangesub: "week" },
      { range: "2", rangesub: "week" },
    ],
    "ytd": [
      { range: "1", rangesub: "day" },
      { range: "3", rangesub: "day" },
      { range: "1", rangesub: "week" },
      { range: "2", rangesub: "week" },
    ],
    "1y": [
      { range: "1", rangesub: "day" },
      { range: "1", rangesub: "week" },
      { range: "2", rangesub: "week" },
      { range: "1", rangesub: "month" },
    ],
    "5y": [
      { range: "1", rangesub: "week" },
      { range: "2", rangesub: "week" },
      { range: "1", rangesub: "month" },
      { range: "3", rangesub: "month" },
    ],
    All: [
      { range: "1", rangesub: "month" },
      { range: "3", rangesub: "month" },
      { range: "6", rangesub: "month" },
      { range: "1", rangesub: "year" },
    ],
  };

  const timeframeDates = {
    "1d": { from: "2026-03-06", to: "2026-03-07" },
    "5d": { from: "2026-03-02", to: "2026-03-07" },
    "1m": { from: "2026-02-06", to: "2026-03-07" },
    "3m": { from: "2025-12-06", to: "2026-03-07" },
    "6m": { from: "2025-09-06", to: "2026-03-07" },
    "ytd": { from: "2026-01-01", to: "2026-03-07" },
    "1y": { from: "2025-03-07", to: "2026-03-07" },
    "5y": { from: "2021-03-07", to: "2026-03-07" },
    "All": { from: "2010-01-01", to: "2026-03-07" },
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const animateChartLeftToRight = async (data) => {
    if (!candleSeriesRef.current || !chartRef.current) return;

    const currentAnimationId = ++animationIdRef.current;

    candleSeriesRef.current.setData([]);

    const spacing =
      data.length > 400 ? 2 :
      data.length > 250 ? 4 :
      data.length > 120 ? 6 :
      data.length > 60 ? 9 : 12;

    chartRef.current.applyOptions({
      timeScale: {
        barSpacing: spacing,
        minBarSpacing: 2,
      },
    });

    if (data.length > 180) {
      candleSeriesRef.current.setData(data);
      chartRef.current.timeScale().fitContent();
      return;
    }

    for (let i = 0; i < data.length; i++) {
      if (currentAnimationId !== animationIdRef.current) return;

      candleSeriesRef.current.update(data[i]);

      if (i % 10 === 0 || i === data.length - 1) {
        chartRef.current.timeScale().fitContent();
      }

      await sleep(8);
    }

    chartRef.current.timeScale().fitContent();
  };

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 550,
      layout: {
        background: { color: "#000000" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#111" },
        horzLines: { color: "#111" },
      },
      rightPriceScale: {
        borderColor: "#333",
      },
      timeScale: {
        borderColor: "#333",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 10,
        minBarSpacing: 2,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#9be7df",
      downColor: "#f2a6ad",
      borderUpColor: "#9be7df",
      borderDownColor: "#f2a6ad",
      wickUpColor: "#9be7df",
      wickDownColor: "#f2a6ad",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (!chartContainerRef.current || !chartRef.current) return;

      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });

      chartRef.current.timeScale().fitContent();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      animationIdRef.current += 1;
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);

        const currentOption = timeframeOptions[activeTimeframe]?.[selectedRangeOption];
        const currentDates = timeframeDates[activeTimeframe];

        if (!currentOption || !currentDates) {
          setIsLoading(false);
          return;
        }

        const res = await getOHLCbyDays(
          currentOption.range,
          currentOption.rangesub,
          currentDates.from,
          currentDates.to
        );

        const formattedData = (res.data?.results || []).map((item) => ({
          time: Math.floor(item.t / 1000),
          open: item.o,
          high: item.h,
          low: item.l,
          close: item.c,
        }));

        await animateChartLeftToRight(formattedData);
      } catch (err) {
        console.error("API error:", err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [activeTimeframe, selectedRangeOption]);

  return (
    <div className="portfolio-growth">
      <div className={`chart-wrapper ${isLoading ? "chart-loading" : ""}`}>
        <div ref={chartContainerRef} style={{ width: "100%" }} />
      </div>

      <div className="time-buttons">
        {["1d", "5d", "1m", "3m", "6m", "ytd", "1y", "5y", "All"].map((tf) => (
          <Button
            key={tf}
            className={`button-time ${activeTimeframe === tf ? "active-time" : ""}`}
            onClick={() => showgraph(tf)}
          >
            {tf}
          </Button>
        ))}

        <span className="data-range">Data Range</span>

        <select
          className="select-timeframe"
          value={selectedRangeOption}
          onChange={(e) => setSelectedRangeOption(Number(e.target.value))}
        >
          {(timeframeOptions[activeTimeframe] || []).map((option, index) => (
            <option key={index} value={index} className="options">
              {option.range} {option.rangesub}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Portfoliogrowth;