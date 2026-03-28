import { useEffect, useMemo, useRef, useState } from "react"; // React hooks
import { createChart, CandlestickSeries } from "lightweight-charts"; // charting library
import { Form } from "react-bootstrap"; // bootstrap form/select components
import {
  FiPlus,
  FiShare2,
  FiSliders,
  FiEdit3,
  FiType,
  FiSmile,
  FiSearch,
  FiTrash2,
  FiEye,
  FiTarget,
} from "react-icons/fi";  // icon components
import "./Portfoliogrowth.css"; // component styles
import { getOHLCByRange,getPercents } from "../../API/api"; // API helper to fetch OHLC data

function formatDate(date) {
  return date.toISOString().split("T")[0]; // format as yyyy-mm-dd
}

function getDateRange(timeframe) {
  const to = new Date(); // end date (today)
  const from = new Date(to); // start date (will be adjusted)

  switch (timeframe) {
    case "1d":
      from.setDate(to.getDate() - 1); // 1 day ago
      break;
    case "5d":
      from.setDate(to.getDate() - 5); // 5 days ago
      break;
    case "1m":
      from.setMonth(to.getMonth() - 1); // 1 month ago
      break;
    case "3m":
      from.setMonth(to.getMonth() - 3); // 3 months ago
      break;
    case "6m":
      from.setMonth(to.getMonth() - 6); // 6 months ago
      break;
    case "ytd":
      from.setMonth(0, 1); // start of this year
      break;
    case "1y":
      from.setFullYear(to.getFullYear() - 1); // 1 year ago
      break;
    case "5y":
      from.setFullYear(to.getFullYear() - 5); // 5 years ago
      break;
    case "All":
      from.setFullYear(2010, 0, 1); // long history (arbitrary)
      break;
    default:
      from.setMonth(to.getMonth() - 1); // default to 1 month
  }

  return {
    from: formatDate(from), // return formatted start date
    to: formatDate(to), // return formatted end date
  };
}

const timeframeOptions = {
  "1d": [
    { multiplier: "1", timespan: "minute", label: "1 min" },
    { multiplier: "5", timespan: "minute", label: "5 min" },
    { multiplier: "15", timespan: "minute", label: "15 min" },
    { multiplier: "30", timespan: "minute", label: "30 min" },
    { multiplier: "1", timespan: "hour", label: "1 hour" },
  ],
  "5d": [
    { multiplier: "1", timespan: "hour", label: "1 hour" },
    { multiplier: "4", timespan: "hour", label: "4 hour" },
    { multiplier: "6", timespan: "hour", label: "6 hour" },
    { multiplier: "12", timespan: "hour", label: "12 hour" },
    { multiplier: "1", timespan: "day", label: "1 day" },
  ],
  "1m": [
    { multiplier: "4", timespan: "hour", label: "4 hour" },
    { multiplier: "6", timespan: "hour", label: "6 hour" },
    { multiplier: "12", timespan: "hour", label: "12 hour" },
    { multiplier: "1", timespan: "day", label: "1 day" },
    { multiplier: "1", timespan: "week", label: "1 week" },
  ],
  "3m": [
    { multiplier: "4", timespan: "hour", label: "4 hour" },
    { multiplier: "1", timespan: "day", label: "1 day" },
    { multiplier: "1", timespan: "week", label: "1 week" },
    { multiplier: "1", timespan: "month", label: "1 month" },
  ],
  "6m": [
    { multiplier: "4", timespan: "hour", label: "4 hour" },
    { multiplier: "1", timespan: "day", label: "1 day" },
    { multiplier: "1", timespan: "week", label: "1 week" },
    { multiplier: "1", timespan: "month", label: "1 month" },
  ],
  ytd: [
    { multiplier: "4", timespan: "hour", label: "4 hour" },
    { multiplier: "1", timespan: "day", label: "1 day" },
    { multiplier: "1", timespan: "week", label: "1 week" },
    { multiplier: "1", timespan: "month", label: "1 month" },
  ],
  "1y": [
    { multiplier: "4", timespan: "hour", label: "4 hour" },
    { multiplier: "1", timespan: "day", label: "1 day" },
    { multiplier: "1", timespan: "week", label: "1 week" },
    { multiplier: "1", timespan: "month", label: "1 month" },
  ],
  "5y": [
    { multiplier: "4", timespan: "hour", label: "4 hour" },
    { multiplier: "1", timespan: "day", label: "1 day" },
    { multiplier: "1", timespan: "week", label: "1 week" },
    { multiplier: "1", timespan: "month", label: "1 month" },
  ],
  All: [
    { multiplier: "4", timespan: "hour", label: "4 hour" },
    { multiplier: "1", timespan: "day", label: "1 day" },
    { multiplier: "1", timespan: "week", label: "1 week" },
    { multiplier: "1", timespan: "month", label: "1 month" },
  ],
}; // timeframe options for different ranges

function normalizeAndSortData(results) {
  return (results || [])
    .map((item) => ({
      time: Number(Math.floor(item.t / 1000)),
      open: Number(item.o),
      high: Number(item.h),
      low: Number(item.l),
      close: Number(item.c),
    })) // convert to numbers and rename fields
    .filter(
      (item) =>
        Number.isFinite(item.time) &&
        Number.isFinite(item.open) &&
        Number.isFinite(item.high) &&
        Number.isFinite(item.low) &&
        Number.isFinite(item.close)
    ) // filter out invalid data points
    .sort((a, b) => a.time - b.time); // sort by time ascending (not need because API should return sorted, but just in case)
}

// animate candles by adding one by one with a delay
function animateCandles(series, chart, data, controlRef, speed = 12) {
  return new Promise((resolve) => {
    // if series or chart is not ready, just resolve immediately
    if (!series || !chart) {
      resolve(); // resolve immediately if we can't animate
      return; // this prevents hanging if user switches timeframe before chart is initialized
    }

    //  if no data, clear the series and resolve
    if (!data || data.length === 0) {
      series.setData([]); // clear chart if no data
      resolve(); // resolve immediately if there's no data to animate
      return; // this prevents hanging if user switches to a timeframe that has no data
    }

    // start animation
    let index = 1;

    // recursive function to add candles one by one
    function step() {
      // check if animation was cancelled (e.g. user switched timeframe), if so, resolve and stop
      if (controlRef.current.cancelled) {
        resolve(); // resolve the promise to indicate animation is done (even though it was cancelled)
        return; // stop the animation loop if cancelled
      }

      //  if we've added all candles, fit the chart to content and resolve
      if (index > data.length) {
        chart.timeScale().fitContent(); // fit chart to content after animation is done
        resolve(); // resolve the promise to indicate animation is complete
        return; // stop the animation loop if we're done
      }

      series.setData(data.slice(0, index)); // add next candle
      chart.timeScale().scrollToRealTime(); // keep the latest candle in view as we add new ones

      index += 1; // increment index to add next candle on next step
      setTimeout(step, speed); // schedule next step after a delay (speed controls how fast candles are added)
    }

    step(); // start the animation loop
  });
}

// helper function to format price values, returns "--" for null/undefined/NaN
function formatPrice(value) {
  return value === null || value === undefined || Number.isNaN(value)
    ? "--"
    : Number(value).toFixed(2);
}

function Portfoliogrowth() { // main component
  const chartContainerRef = useRef(null); // ref for the chart container div
  const chartRef = useRef(null); // ref to store the created chart instance
  const candleSeriesRef = useRef(null); // ref to store the candlestick series instance
  const animationControlRef = useRef({ cancelled: false }); // ref to control animation state; mutating .cancelled doesn't trigger rerender
  const chartDataRef = useRef([]); // ref to hold the latest chart data for crosshair updates

  const [symbolInput, setSymbolInput] = useState("BTCUSD"); // controlled text input value
  const [symbol, setSymbol] = useState("BTCUSD"); // currently loaded symbol
  const [activeTimeframe, setActiveTimeframe] = useState("1d"); // selected timeframe tab
  const [selectedRangeOption, setSelectedRangeOption] = useState(2); // selected dropdown index for range options
  const [isLoading, setIsLoading] = useState(false); // loading indicator flag
  const [errorMessage, setErrorMessage] = useState(""); // error message shown in UI
  const [marketInfo, setMarketInfo] = useState({
    companyName: "BTCUSD",
    exchange: "BTCUSD",
    price: null,
    previousClose: null,
    open: null,
    high: null,
    low: null,
    close: null,
  }); // market info displayed above the chart (price, OHLC, etc.)

  // memoized value for the currently selected range option based on active timeframe and dropdown selection
  const currentRange = useMemo(() => {
    return timeframeOptions[activeTimeframe]?.[selectedRangeOption]; // pick the right multiplier/timespan for API calls
  }, [activeTimeframe, selectedRangeOption]); // recompute when timeframe or dropdown changes

  // initialize the chart when the component mounts, and set up event listeners for crosshair movement and window resize, also clean up on unmount
  useEffect(() => {
    if (!chartContainerRef.current) return; // chart container not yet mounted

    // create the chart with options for layout, grid, scales, crosshair, and interaction
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth, // responsive width
      height: 540, // fixed height
      layout: {
        background: { color: "#000000" },
        textColor: "#8f97a3",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.10)",
        scaleMargins: {
          top: 0.08,
          bottom: 0.10,
        },
      },
      leftPriceScale: {
        visible: false, // hide left price scale
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.10)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 10,
        minBarSpacing: 4,
      },
      crosshair: {
        mode: 1, // standard crosshair mode
        vertLine: {
          color: "rgba(255,255,255,0.18)",
          width: 1,
          style: 0,
          labelBackgroundColor: "#151515",
        },
        horzLine: {
          color: "rgba(255,255,255,0.18)",
          width: 1,
          style: 0,
          labelBackgroundColor: "#151515",
        },
      },
      handleScroll: true, // allow scrolling
      handleScale: true, // allow zooming
    });

    // add a candlestick series with custom styling
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#9CE8D8", // color for rising candles
      downColor: "#E8A0A8", // color for falling candles
      borderVisible: true,
      borderUpColor: "#9CE8D8",
      borderDownColor: "#E8A0A8",
      wickUpColor: "#9CE8D8",
      wickDownColor: "#E8A0A8",
      priceLineVisible: false, // hide the default price line
    });

    // update market info when the user moves the crosshair
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.seriesData || !candleSeriesRef.current) return; // guard against missing data

      const candle = param.seriesData.get(candleSeriesRef.current); // candle data at crosshair point

      // if the crosshair is over a candle, use its values; otherwise, fall back to the latest candle
      if (candle) {
        setMarketInfo((prev) => ({
          ...prev,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          price: candle.close,
        }));
      } else if (chartDataRef.current.length > 0) {
        const last = chartDataRef.current[chartDataRef.current.length - 1];
        setMarketInfo((prev) => ({
          ...prev,
          open: last.open,
          high: last.high,
          low: last.low,
          close: last.close,
          price: last.close,
        }));
      }
    });

    chartRef.current = chart; // keep chart instance available outside the effect
    candleSeriesRef.current = candleSeries; // keep series instance available outside the effect

    // add a window resize event listener to make the chart responsive, we update the chart's width to match the container's clientWidth and then call fitContent to adjust the time scale accordingly
    const handleResize = () => {
      if (!chartContainerRef.current || !chartRef.current) return; // protect against unmounted state
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth, // update width on resize
      });
      chartRef.current.timeScale().fitContent(); // ensure time scale fits new size
    };

    window.addEventListener("resize", handleResize); // keep chart responsive

    return () => {
      animationControlRef.current.cancelled = true; // cancel any running animation
      window.removeEventListener("resize", handleResize); // cleanup listener
      chart.remove(); // destroy chart instance
    };
  }, []); // run once on mount

  useEffect(() => {
    async function loadChart() {
      if (!currentRange || !candleSeriesRef.current || !chartRef.current) return; // wait until chart and range are ready

      animationControlRef.current.cancelled = true; // stop any in-flight animation
      animationControlRef.current = { cancelled: false }; // reset cancellation flag

      try {
        setIsLoading(true); // show loading state
        setErrorMessage(""); // clear prior errors
        const data = await getPercents();
        const formattedDataa = data.result.list || [];
        const sorted = [...formattedDataa].sort((a, b) => {
          return Math.abs(Number(b.price24hPcnt)) - Math.abs(Number(a.price24hPcnt));
        });
        setSymbol(sorted[0].symbol);
        setSymbolInput(sorted[0].symbol);
        console.log(sorted);
        const { from, to } = getDateRange(activeTimeframe); // compute date range for API
        var fromm = new Date(from).getTime();
        var too = new Date(to).getTime();
        const response = await getOHLCByRange({
          symbol: symbol, // requested symbol
          multiplier: currentRange.multiplier, // API multiplier (e.g. 1, 5)
          timespan: currentRange.timespan, // API timespan (minute/hour/day)
          fromm, // start date
          too, // end date
        });

        const formattedData = (response?.result?.list || [])
        .map((item) => ({
          time: Math.floor(Number(item[0]) / 1000), // lightweight-charts expects seconds
          open: Number(item[1]),
          high: Number(item[2]),
          low: Number(item[3]),
          close: Number(item[4]),
          volume: Number(item[5]),
        }))
        .filter(
          (item) =>
            Number.isFinite(item.time) &&
            Number.isFinite(item.open) &&
            Number.isFinite(item.high) &&
            Number.isFinite(item.low) &&
            Number.isFinite(item.close)
        )
        .sort((a, b) => a.time - b.time); 
        chartDataRef.current = formattedData; // store data for crosshair updates

        if (formattedData.length === 0) {
          candleSeriesRef.current.setData([]); // clear chart
          setErrorMessage("No data available for this symbol and timeframe."); // show error
          setMarketInfo((prev) => ({
            ...prev,
            companyName: symbol, // show symbol even if no data
            exchange: "MARKET",
            price: null,
            previousClose: null,
            open: null,
            high: null,
            low: null,
            close: null,
          }));
          return; // stop processing since no data
        }

        const last = formattedData[formattedData.length - 1]; // most recent candle
        const prev = formattedData[formattedData.length - 2] || last; // previous candle (fallback to last)

        setMarketInfo({
          companyName: symbol, // display symbol in header
          exchange: "NASDAQ",
          price: last.close, // latest close price
          previousClose: prev.close, // previous close to calculate change
          open: last.open,
          high: last.high,
          low: last.low,
          close: last.close,
        });

        const shouldAnimate = ["1d", "5d", "1m", "3m"].includes(activeTimeframe); // only animate for short ranges
        const dataForChart =
          formattedData.length > 220 ? formattedData.slice(-220) : formattedData; // limit to last 220 points for performance

        if (shouldAnimate) {
          await animateCandles(
            candleSeriesRef.current,
            chartRef.current,
            dataForChart,
            animationControlRef,
            10 // animation speed (ms per candle)
          );
        } else {
          candleSeriesRef.current.setData(dataForChart); // set full dataset
          chartRef.current.timeScale().fitContent(); // fit chart to data
        }
      } catch (error) {
        console.error(error); // debug log
        candleSeriesRef.current?.setData([]); // clear chart on error
        chartDataRef.current = [];
        setErrorMessage(
          error?.response?.data?.error ||
            error?.message ||
            "Failed to load market data."
        );
      } finally {
        if (!animationControlRef.current.cancelled) {
          setIsLoading(false); // hide loader unless animation was cancelled
        }
      }
    }

    loadChart(); // trigger data load

    return () => {
      animationControlRef.current.cancelled = true; // cancel any running animation on dependency change
    };
  }, [symbol, activeTimeframe, selectedRangeOption, currentRange]);

  const handleTimeframeChange = (timeframe) => {
    setActiveTimeframe(timeframe); // switch timeframe tab
    setSelectedRangeOption(0); // reset range dropdown
  };

  const handleSymbolSubmit = (e) => {
    e.preventDefault(); // prevent form refresh
    const cleaned = symbolInput.trim().toUpperCase(); // normalize input
    if (!cleaned) return; // ignore empty submissions
    setSymbol(cleaned); // trigger chart reload
  };

  const priceChange =
    marketInfo.price !== null && marketInfo.previousClose !== null
      ? marketInfo.price - marketInfo.previousClose // absolute change
      : null;

  const priceChangePercent =
    marketInfo.price !== null &&
    marketInfo.previousClose !== null &&
    marketInfo.previousClose !== 0
      ? (priceChange / marketInfo.previousClose) * 100 // percentage change
      : null;

  const isPositive = priceChange === null ? true : priceChange >= 0; // used for styling

  const toolIcons = [
    <FiPlus />, // add tool
    <FiTarget />, // target tool
    <FiShare2 />, // share tool
    <FiSliders />, // settings tool
    <FiEdit3 />, // edit tool
    <FiType />, // type tool
    <FiSmile />, // sentiment / mood tool
    <FiSearch />, // search tool
    <FiEye />, // view tool
    <FiTrash2 />, // delete tool
  ];

  return (
    <section className="tv-shell">
      <div className="tv-topbar">
        <div className="tv-topbar-left">
          <form className="tv-symbol-form" onSubmit={handleSymbolSubmit}>
            <input
              type="text" // ticker input
              value={symbolInput} // controlled value
              onChange={(e) => setSymbolInput(e.target.value)} // update input state
              placeholder="Ticker" // placeholder text
              className="tv-symbol-input"
            />
          </form>

          <div className="tv-instrument-line">
            <span className="tv-company-name">{marketInfo.companyName}</span> {/** company name */}
            <span className="tv-dot">•</span>
            <span>{activeTimeframe}</span> {/** currently selected timeframe */}
            <span className="tv-dot">•</span>
            <span>{marketInfo.exchange}</span> {/** exchange identifier */}
          </div>

          <div className="tv-price-line">
            <span className="tv-main-price">{formatPrice(marketInfo.price)}</span> {/** current price */}
            <span className="tv-currency">USD</span> {/** currency label */}

            <span
              className={`tv-price-change ${
                isPositive ? "positive" : "negative"
              }`} // color based on change direction
            >
              {priceChange !== null
                ? `${isPositive ? "+" : ""}${priceChange.toFixed(2)} (${
                    isPositive ? "+" : ""
                  }${priceChangePercent.toFixed(2)}%)` // formatted change
                : "--"}
            </span>

            <span className="tv-ohlc">O {formatPrice(marketInfo.open)}</span> {/** open price */}
            <span className="tv-ohlc">H {formatPrice(marketInfo.high)}</span> {/** high price */}
            <span className="tv-ohlc">L {formatPrice(marketInfo.low)}</span> {/** low price */}
            <span className="tv-ohlc">C {formatPrice(marketInfo.close)}</span> {/** close price */}
          </div>
        </div>

        <div className="tv-topbar-right">
          <button className="tv-icon-btn" type="button">
            <FiSearch />
          </button>
          <button className="tv-icon-btn" type="button">
            ×
          </button>
        </div>
      </div>

      <div className="tv-chart-layout">
        <div className="tv-toolbar">
          {toolIcons.map((icon, index) => (
            <button key={index} className="tv-tool-btn" type="button">
              {icon} {/** render each tool icon */}
            </button>
          ))}
        </div>

        <div className="tv-chart-main">
          {isLoading && <div className="tv-loading-badge">Loading chart...</div>} {/** show loading state */}
          {errorMessage && <div className="tv-error-badge">{errorMessage}</div>} {/** show any error message */}

          <div className="tv-chart-container" ref={chartContainerRef} /> {/** chart mount point */}

          <div className="tv-footer">
            <div className="tv-timeframes">
              {["1d", "5d", "1m", "3m", "6m", "ytd", "1y", "5y", "All"].map(
                (tf) => (
                  <button
                    key={tf}
                    type="button"
                    className={`tv-timeframe-btn ${
                      activeTimeframe === tf ? "active" : ""
                    }`}
                    onClick={() => handleTimeframeChange(tf)}
                  >
                    {tf}
                  </button>
                )
              )}
            </div>

            <div className="tv-footer-right">
              <span className="tv-date-range">Date range</span> {/** label for dropdown */}

              <Form.Select
                className="tv-range-select"
                value={selectedRangeOption}
                onChange={(e) => setSelectedRangeOption(Number(e.target.value))}
              >
                {(timeframeOptions[activeTimeframe] || []).map(
                  (option, index) => (
                    <option
                      key={`${option.multiplier}-${option.timespan}`}
                      value={index}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </Form.Select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Portfoliogrowth;