import React, { useEffect, useState } from "react";
import { getOHLCByRange, getPercents } from "../../API/api";
import { Container,Row,Col } from "react-bootstrap";
import Chart from "../Chart/Chart";
import "./Trends.css";

function Trends() {
  const [percents, setPercents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topFive, setTopFive] = useState([]);
  const [topFiveOHLC, setTopFiveOHLC] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  useEffect(() => {
    const fetchPercents = async () => {
      try {
        setLoading(true);

        const data = await getPercents();
        const formattedData = data.result.list || [];

        const sorted = [...formattedData].sort((a, b) => {
          return Math.abs(Number(b.price24hPcnt)) - Math.abs(Number(a.price24hPcnt));
        });

        const top5 = sorted.slice(0, 5);

        setPercents(sorted);
        setTopFive(top5);
        console.log("Top 5:", top5);
      } catch (error) {
        console.error("Error fetching percents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPercents();
  }, []);

  useEffect(() => {
    const fetchOHLCForTopFive = async () => {
      try {
        setLoadingData(true);
        var from = Math.floor(Date.now()) - (24 * 60 * 60*1000); // 24 hours ago
        var to = Math.floor(Date.now()); // now
        console.log("Fetching OHLC data for top five with from:", from, "to:", to);
        console.log(to-from);
        const ohlcData = await Promise.all(
          topFive.map((item) => getOHLCByRange(
            {symbol: item.symbol, 
            multiplier: "1", 
            timespan: "hour", 
            from, 
            to}
          ))
        );
        setTopFiveOHLC(ohlcData);
        console.log("OHLC Data for Top 5:", ohlcData);
        setLoadingData(false);
      }
        catch (error) {
          console.error("Error fetching OHLC data for top five:", error);
        }
    };

    if (topFive.length > 0) {
      fetchOHLCForTopFive();
    }
  }, [topFive]);
    return (
        <Container className="vh-100 p-vh-20">
            {loading ? (
                <p>Loading...</p>
            ) : (
                [...Array(5)].map((_, index) => (
                <Row key={index} className="hover-row">
                    <Col className="pt-4">
                        <span style={{borderRadius: "100%", backgroundColor: "white", padding: "5px 10px", color: "black"}}>{index + 1}</span>
                    </Col>
                    <Col className="pt-4">
                        {percents[index]?.symbol}
                    </Col>
                    <Col style={{ color: percents[index]?.price24hPcnt >= 0 ? "green" : "red", height: "100px"}} className="pt-4">
                        {loadingData ? "Loading..." : <Chart arrays={topFiveOHLC[index].result.list} color={percents[index]?.price24hPcnt >= 0 ? "green" : "red"}/>}
                    </Col>
                    <Col className="pt-4">
                        ${Number(percents[index]?.lastPrice).toFixed(2)}
                    </Col>
                    <Col style={{ color: percents[index]?.price24hPcnt >= 0 ? "green" : "red" }} className="pt-4">
                        ${(Number(percents[index]?.price24hPcnt)*Number(percents[index]?.lastPrice)).toFixed(2)}
                    </Col>
                    <Col style={{ color: percents[index]?.price24hPcnt >= 0 ? "green" : "red" }} className="pt-4">
                        {(Number(percents[index]?.price24hPcnt) * 100).toFixed(2)}%
                    </Col>
                </Row>
                ))
            )}
        </Container>
    );
}

export default Trends;