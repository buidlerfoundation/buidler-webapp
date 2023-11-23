import { formatNumber } from "helpers/StringHelper";
import React, { memo } from "react";

const ChartTooltip = ({ active, payload, label, postFix }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          display: "flex",
          borderRadius: 10,
          padding: 10,
          flexDirection: "column",
          backgroundColor: "#00000099",
          color: "white",
          gap: 3,
          alignItems: "center",
        }}
      >
        <span>
          {label}
          {postFix || ""}
        </span>
        {payload.map((el: any, index: number) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              alignSelf: "flex-start",
            }}
            key={index}
          >
            <div style={{ backgroundColor: el.fill, width: 10, height: 10 }} />
            <span style={{ lineHeight: "20px" }}>
              {formatNumber(el.value) || 0} {el.name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default memo(ChartTooltip);
