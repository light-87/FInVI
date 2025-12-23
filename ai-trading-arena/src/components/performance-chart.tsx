"use client";

import { useEffect, useState } from "react";

interface ChartDataPoint {
  timestamp: string;
  value: number;
  returnPct: number;
  dailyReturn: number;
}

interface PerformanceChartProps {
  agentId: string;
  height?: number;
}

export function PerformanceChart({ agentId, height = 200 }: PerformanceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(`/api/agents/${agentId}/history?days=30`);
        const result = await response.json();

        if (result.success) {
          setData(result.data.snapshots);
        } else {
          setError(result.error?.message || "Failed to load history");
        }
      } catch {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse text-text-tertiary">Loading chart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-text-tertiary" style={{ height }}>
        {error}
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center text-text-tertiary" style={{ height }}>
        <div className="text-center">
          <p>Not enough data for chart</p>
          <p className="text-xs mt-1">Run more analyses to see performance</p>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const width = 600; // Will be responsive via viewBox
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Get min/max values
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values) * 0.98;
  const maxValue = Math.max(...values) * 1.02;
  const valueRange = maxValue - minValue || 1;

  // Scale functions
  const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartWidth;
  const yScale = (value: number) =>
    padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

  // Generate path
  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.value)}`)
    .join(" ");

  // Generate area path
  const areaPath = `${linePath} L ${xScale(data.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  // Calculate overall trend
  const startValue = data[0].value;
  const endValue = data[data.length - 1].value;
  const isPositive = endValue >= startValue;
  const strokeColor = isPositive ? "#00ff88" : "#ff4444";
  const fillColor = isPositive ? "rgba(0, 255, 136, 0.1)" : "rgba(255, 68, 68, 0.1)";

  // Y-axis labels
  const yLabels = [maxValue, (maxValue + minValue) / 2, minValue];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yLabels.map((value, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={yScale(value)}
              x2={width - padding.right}
              y2={yScale(value)}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="4,4"
            />
            <text
              x={padding.left - 8}
              y={yScale(value)}
              textAnchor="end"
              alignmentBaseline="middle"
              className="fill-text-tertiary text-xs"
              style={{ fontSize: "10px" }}
            >
              ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </text>
          </g>
        ))}

        {/* Area */}
        <path d={areaPath} fill={fillColor} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(point.value)}
            r={hoveredPoint === point ? 6 : 4}
            fill={strokeColor}
            className="cursor-pointer transition-all"
            onMouseEnter={() => setHoveredPoint(point)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}

        {/* X-axis labels */}
        <text
          x={padding.left}
          y={height - 8}
          className="fill-text-tertiary"
          style={{ fontSize: "10px" }}
        >
          {new Date(data[0].timestamp).toLocaleDateString()}
        </text>
        <text
          x={width - padding.right}
          y={height - 8}
          textAnchor="end"
          className="fill-text-tertiary"
          style={{ fontSize: "10px" }}
        >
          {new Date(data[data.length - 1].timestamp).toLocaleDateString()}
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div className="absolute top-2 right-2 bg-surface-elevated border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs text-text-tertiary">
            {new Date(hoveredPoint.timestamp).toLocaleString()}
          </p>
          <p className="text-lg font-mono font-bold text-text-primary">
            ${hoveredPoint.value.toLocaleString()}
          </p>
          <p
            className={`text-sm font-mono ${
              hoveredPoint.returnPct >= 0 ? "text-profit" : "text-loss"
            }`}
          >
            {hoveredPoint.returnPct >= 0 ? "+" : ""}
            {hoveredPoint.returnPct?.toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}
