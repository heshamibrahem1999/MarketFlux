import React, { useEffect, useState } from "react";
import { getPercents } from "../../API/api";
import "./ShowTopPercent.css";

function ShowTopPercent() {
  const [percents, setPercents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPercents = async () => {
      try {
        setLoading(true);
        const data = await getPercents();
        const formattedData = data.result.list || [];

        const sorted = [...formattedData].sort((a, b) => {
          return Math.abs(Number(b.price24hPcnt)) - Math.abs(Number(a.price24hPcnt));
        });

        setPercents(sorted);
      } catch (error) {
        console.error("Error fetching percents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPercents();
  }, []);

  return (
    <div>
      <div className="ticker-wrap">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="ticker-track">
            {percents.concat(percents).map((percent, index) => {
              const pct = Number(percent.price24hPcnt) * 100;
              const isPositive = pct >= 0;

              return (
                <div key={`${percent.symbol}-${index}`} className="ticker-item">
                  <span
                    className="ticker-symbol"
                    style={{ color: "white" }}
                  >
                    {percent.symbol}
                  </span>

                  <span
                    className="ticker-price"
                    style={{ color: isPositive ? "green" : "red" }}>
                    ${percent.lastPrice}
                  </span>

                  <span
                    className="ticker-percent"
                    style={{ color: "gray" }}
                  >
                    {isPositive ? "+" : ""}
                    {pct.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowTopPercent;