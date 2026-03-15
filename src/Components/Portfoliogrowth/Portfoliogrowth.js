import { useEffect, useMemo, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { Button, Form, Spinner, Alert, Row, Col } from "react-bootstrap";
import "./Portfoliogrowth.css";
import { getOHLCByRange } from "../../API/api";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function getDateRange(timeframe) {
  const to = new Date();
  const from = new Date(to);

  switch (timeframe) {
    case "1d":
      from.setDate(to.getDate() - 1);
      break;
    case "5d":
      from.setDate(to.getDate() - 5);
      break;
    case "1m":
      from.setMonth(to.getMonth() - 1);
      break;
    case "3m":
      from.setMonth(to.getMonth() - 3);
      break;
    case "6m":
      from.setMonth(to.getMonth() - 6);
      break;
    case "ytd":
      from.setMonth(0, 1);
      break;
    case "1y":
      from.setFullYear(to.getFullYear() - 1);
      break;
    case "5y":
      from.setFullYear(to.getFullYear() - 5);
      break;
    case "All":
      from.setFullYear(2010, 0, 1);
      break;
    default:
      from.setMonth(to.getMonth() - 1);
  }

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
}

const timeframeOptions = {
  "1d": [
    { multiplier: "1", timespan: "minute" },
    { multiplier: "5", timespan: "minute" },
    { multiplier: "15", timespan: "minute" },
    { multiplier: "30", timespan: "minute" },
    { multiplier: "1", timespan: "hour" },
  ],
  "5d": [
    { multiplier: "30", timespan: "minute" },
    { multiplier: "1", timespan: "hour" },
    { multiplier: "2", timespan: "hour" },
    { multiplier: "4", timespan: "hour" },
    { multiplier: "1", timespan: "day" },
  ],
  "1m": [
    { multiplier: "1", timespan: "hour" },
    { multiplier: "2", timespan: "hour" },
    { multiplier: "4", timespan: "hour" },
    { multiplier: "1", timespan: "day" },
    { multiplier: "3", timespan: "day" },
  ],
  "3m": [
    { multiplier: "4", timespan: "hour" },
    { multiplier: "1", timespan: "day" },
    { multiplier: "3", timespan: "day" },
    { multiplier: "1", timespan: "week" },
  ],
  "6m": [
    { multiplier: "1", timespan: "day" },
    { multiplier: "3", timespan: "day" },
    { multiplier: "1", timespan: "week" },
    { multiplier: "2", timespan: "week" },
  ],
  ytd: [
    { multiplier: "1", timespan: "day" },
    { multiplier: "3", timespan: "day" },
    { multiplier: "1", timespan: "week" },
    { multiplier: "2", timespan: "week" },
  ],
  "1y": [
    { multiplier: "1", timespan: "day" },
    { multiplier: "1", timespan: "week" },
    { multiplier: "2", timespan: "week" },
    { multiplier: "1", timespan: "month" },
  ],
  "5y": [
    { multiplier: "1", timespan: "week" },
    { multiplier: "2", timespan: "week" },
    { multiplier: "1", timespan: "month" },
    { multiplier: "3", timespan: "month" },
  ],
  All: [
    { multiplier: "1", timespan: "month" },
    { multiplier: "3", timespan: "month" },
    { multiplier: "6", timespan: "month" },
    { multiplier: "1", timespan: "year" },
  ],
};

function Portfoliogrowth() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  const [symbolInput, setSymbolInput] = useState("AAPL");
  const [symbol, setSymbol] = useState("AAPL");
  const [activeTimeframe, setActiveTimeframe] = useState("1m");
  const [selectedRangeOption, setSelectedRangeOption] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [meta, setMeta] = useState({
    bars: 0,
    lastClose: null,
    high: null,
    low: null,
  });

  const currentRange = useMemo(() => {
    return timeframeOptions[activeTimeframe]?.[selectedRangeOption];
  }, [activeTimeframe, selectedRangeOption]);

  useEffect(() => {
    console.log(process.env.REACT_APP_MARKET_API_KEY);
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 520,
      layout: {
        background: { color: "#000000" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#111111" },
        horzLines: { color: "#111111" },
      },
      rightPriceScale: {
        borderColor: "#333333",
      },
      timeScale: {
        borderColor: "#333333",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 8,
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
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    async function loadChart() {
      if (!currentRange || !candleSeriesRef.current || !chartRef.current) return;

      try {
        setIsLoading(true);
        setErrorMessage("");

        const { from, to } = getDateRange(activeTimeframe);

        const data = await getOHLCByRange({
          symbol,
          multiplier: currentRange.multiplier,
          timespan: currentRange.timespan,
          from,
          to,
        });

        const formattedData = (data.results || []).map((item) => ({
          time: Math.floor(item.t / 1000),
          open: item.o,
          high: item.h,
          low: item.l,
          close: item.c,
        }));

        candleSeriesRef.current.setData(formattedData);
        chartRef.current.timeScale().fitContent();

        if (formattedData.length > 0) {
          const closes = formattedData.map((item) => item.close);
          const highs = formattedData.map((item) => item.high);
          const lows = formattedData.map((item) => item.low);

          setMeta({
            bars: formattedData.length,
            lastClose: closes[closes.length - 1],
            high: Math.max(...highs),
            low: Math.min(...lows),
          });
        } else {
          setMeta({
            bars: 0,
            lastClose: null,
            high: null,
            low: null,
          });
          setErrorMessage("No data available for this symbol and timeframe.");
        }
      } catch (error) {
        console.error(error);
        setMeta({
          bars: 0,
          lastClose: null,
          high: null,
          low: null,
        });
        setErrorMessage(
          error?.response?.data?.error ||
            error.message ||
            "Failed to load market data."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadChart();
  }, [symbol, activeTimeframe, selectedRangeOption, currentRange]);

  const handleTimeframeChange = (timeframe) => {
    setActiveTimeframe(timeframe);
    setSelectedRangeOption(0);
  };

  const handleSymbolSubmit = (e) => {
    e.preventDefault();
    const cleaned = symbolInput.trim().toUpperCase();
    if (!cleaned) return;
    setSymbol(cleaned);
  };

  return (
    <section className="portfolio-growth-section py-4">
      <Row className="align-items-end g-3 mb-3">
        <Col md={6}>
          <div>
            <h2 className="mb-1 text-light">Portfolio Growth</h2>
            <p className="mb-0 text-secondary">
              Live OHLC chart with dynamic symbol and timeframe controls.
            </p>
          </div>
        </Col>

        <Col md={6}>
          <Form onSubmit={handleSymbolSubmit}>
            <Row className="g-2">
              <Col xs={8}>
                <Form.Control
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value)}
                  placeholder="Enter ticker, e.g. AAPL"
                />
              </Col>
              <Col xs={4}>
                <Button type="submit" className="w-100">
                  Load
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {["1d", "5d", "1m", "3m", "6m", "ytd", "1y", "5y", "All"].map((tf) => (
          <Button
            key={tf}
            variant={activeTimeframe === tf ? "light" : "outline-light"}
            onClick={() => handleTimeframeChange(tf)}
          >
            {tf}
          </Button>
        ))}
      </div>

      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <div className="text-light">
          <strong>Symbol:</strong> {symbol}
        </div>

        <div>
          <Form.Select
            value={selectedRangeOption}
            onChange={(e) => setSelectedRangeOption(Number(e.target.value))}
          >
            {(timeframeOptions[activeTimeframe] || []).map((option, index) => (
              <option key={`${option.multiplier}-${option.timespan}`} value={index}>
                {option.multiplier} {option.timespan}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      <Row className="g-3 mb-3">
        <Col md={3}>
          <div className="p-3 rounded bg-dark text-light border border-secondary">
            <div className="text-secondary small">Bars</div>
            <div className="fs-4">{meta.bars}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="p-3 rounded bg-dark text-light border border-secondary">
            <div className="text-secondary small">Last Close</div>
            <div className="fs-4">
              {meta.lastClose !== null ? meta.lastClose.toFixed(3) : "--"}
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="p-3 rounded bg-dark text-light border border-secondary">
            <div className="text-secondary small">High</div>
            <div className="fs-4">
              {meta.high !== null ? meta.high.toFixed(3) : "--"}
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="p-3 rounded bg-dark text-light border border-secondary">
            <div className="text-secondary small">Low</div>
            <div className="fs-4">
              {meta.low !== null ? meta.low.toFixed(3) : "--"}
            </div>
          </div>
        </Col>
      </Row>

      {isLoading && (
        <div className="mb-3">
          <Spinner animation="border" size="sm" className="me-2" />
          <span className="text-light">Loading chart data...</span>
        </div>
      )}

      {errorMessage && (
        <Alert variant="danger" className="mb-3">
          {errorMessage}
        </Alert>
      )}

      <div
        ref={chartContainerRef}
        style={{
          width: "100%",
          minHeight: "520px",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      />
    </section>
  );
}

export default Portfoliogrowth;