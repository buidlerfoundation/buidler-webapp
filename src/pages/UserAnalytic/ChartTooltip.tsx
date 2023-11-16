import React, { memo } from "react";

const ChartTooltip = ({ active, payload, label }: any) => {
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
        <span>{label}</span>
        {payload.map((el: any, index: number) => (
          <span key={index}>
            {el.value} {el.name}
          </span>
        ))}
      </div>
    );
  }

  return null;
};

export default memo(ChartTooltip);
