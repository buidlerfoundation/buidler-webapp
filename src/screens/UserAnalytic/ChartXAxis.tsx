import React, { memo } from "react";

const ChartXAxis = ({ x, y, payload }: any) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="middle"
        fill="var(--color-mute-text)"
        fontSize={12}
      >
        {payload.value}
      </text>
    </g>
  );
};

export default memo(ChartXAxis);
