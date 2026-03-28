import React, { useMemo } from "react";

function Chart({ arrays, color }) {
  const array = arrays.map((item) => Number(item[4])).slice(0, 10);

  const maxValue = Math.max(...array);
  const minValue = Math.min(...array);
  const range = maxValue - minValue;

  const svgWidth = 100;
  const svgHeight = 50;
  const topPadding = 5;
  const bottomPadding = 5;
  const usableHeight = svgHeight - topPadding - bottomPadding;

  const scaleY = (value) => {
    if (range === 0) return svgHeight / 2;
    const normalized = (value - minValue) / range;
    return svgHeight - bottomPadding - normalized * usableHeight;
  };

  const stepX = array.length > 1 ? svgWidth / (array.length - 1) : 0;

  const points = useMemo(() => {
    return array
      .map((value, index) => `${index * stepX},${scaleY(value)}`)
      .join(" ");
  }, [array, stepX]);

  return (
    <div style={{ marginBottom: "15px" }}>
      <svg height={svgHeight} width={svgWidth} xmlns="http://www.w3.org/2000/svg">
        {array.length > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 200,
              strokeDashoffset: 200,
              animation: "drawLine 1.2s ease forwards",
            }}
          />
        )}

        <style>
          {`
            @keyframes drawLine {
              to {
                stroke-dashoffset: 0;
              }
            }
          `}
        </style>
      </svg>
    </div>
  );
}

export default Chart;