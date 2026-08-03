"use client";

import React, { useState } from "react";

export default function Chart() {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const values = [1000, 1900, 1500, 2500, 2200, 3000, 3800, 3200, 4200, 4900, 4600, 5300];

  // SVG dimensions
  const width = 1000;
  const height = 300;
  const paddingLeft = 80;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxValue = 6000;

  // Calculate coordinates
  const points = values.map((val, i) => {
    const x = paddingLeft + (i / (values.length - 1)) * chartWidth;
    const y = height - paddingBottom - (val / maxValue) * chartHeight;
    return { x, y, value: val, month: months[i], index: i };
  });

  // Generate smooth path using cubic bezier curves
  const getBezierPath = (pts) => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      // Control points
      const cpX1 = p0.x + chartWidth / (values.length - 1) / 3;
      const cpY1 = p0.y;
      const cpX2 = p1.x - chartWidth / (values.length - 1) / 3;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = getBezierPath(points);
  
  // Path for gradient area underneath
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : "";

  // Grid values (0, 1000, 2000, 3000, 4000, 5000, 6000)
  const gridLines = [0, 1000, 2000, 3000, 4000, 5000, 6000];

  return (
    <div className="w-full bg-[#141419] rounded-2xl border border-[#26262f] p-6 glow-card transition-all duration-300 hover:border-[#ff3b70]/30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Penjualan Tiket Bulanan</h3>
          <p className="text-xs text-[#8b8b9a] mt-1">Laporan akumulasi penjualan tiket dari seluruh kategori event.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#09090b] p-1 rounded-xl border border-[#26262f] text-xs">
          <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#ff3b70] to-[#8b5cf6] text-white font-medium shadow-md shadow-[#ff3b70]/20 transition-all duration-200">
            Bulanan
          </button>
          <button className="px-3 py-1.5 rounded-lg text-[#8b8b9a] hover:text-white font-medium transition-colors">
            Harian
          </button>
          <button className="px-3 py-1.5 ml-2 border border-[#26262f] rounded-lg text-white hover:bg-[#181822] hover:border-white/20 transition-all flex items-center gap-1.5 font-medium">
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto select-none">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full min-w-[750px] h-auto overflow-visible"
        >
          <defs>
            {/* Gradient under the curve */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff3b70" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.00" />
            </linearGradient>
            {/* Curve stroke gradient */}
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff3b70" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#ff3b70" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Grid lines */}
          {gridLines.map((lineVal) => {
            const y = height - paddingBottom - (lineVal / maxValue) * chartHeight;
            return (
              <g key={lineVal}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#26262f"
                  strokeWidth="1"
                  strokeDasharray={lineVal === 0 ? "0" : "5, 5"}
                />
                <text
                  x={paddingLeft - 15}
                  y={y + 4}
                  fill="#8b8b9a"
                  fontSize="11"
                  className="font-mono text-right"
                  textAnchor="end"
                >
                  {lineVal.toLocaleString("id-ID")}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          {areaPath && (
            <path d={areaPath} fill="url(#areaGradient)" />
          )}

          {/* Smooth line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#glow)"
            />
          )}

          {/* Vertical indicator line on hover */}
          {hoveredPoint !== null && (
            <line
              x1={points[hoveredPoint].x}
              y1={paddingTop}
              x2={points[hoveredPoint].x}
              y2={height - paddingBottom}
              stroke="rgba(255, 59, 112, 0.3)"
              strokeWidth="1.5"
              strokeDasharray="4, 4"
            />
          )}

          {/* Key points (circles) */}
          {points.map((pt, index) => (
            <g key={index}>
              {/* Larger transparent hover target */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="18"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Outer stroke glow circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint === index ? "8" : "5"}
                fill="#ff3b70"
                stroke="#141419"
                strokeWidth="2"
                className="transition-all duration-150 pointer-events-none"
              />
              {/* Inner white core */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint === index ? "4" : "2"}
                fill="#ffffff"
                className="transition-all duration-150 pointer-events-none"
              />
            </g>
          ))}

          {/* Month labels */}
          {points.map((pt, index) => (
            <text
              key={index}
              x={pt.x}
              y={height - paddingBottom + 22}
              fill={hoveredPoint === index ? "#ffffff" : "#8b8b9a"}
              fontSize="11"
              fontWeight={hoveredPoint === index ? "600" : "500"}
              textAnchor="middle"
              className="transition-all duration-150"
            >
              {pt.month}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint !== null && (
          <div
            className="absolute bg-[#1c1c24] border border-[#ff3b70]/40 rounded-xl px-3 py-2 text-xs font-semibold shadow-xl shadow-[#ff3b70]/10 pointer-events-none transition-all duration-150 flex flex-col gap-0.5"
            style={{
              left: `${(points[hoveredPoint].x / width) * 100}%`,
              top: `${(points[hoveredPoint].y / height) * 100 - 15}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <span className="text-[#8b8b9a] font-normal">{points[hoveredPoint].month}</span>
            <span className="text-white font-mono text-sm">
              {points[hoveredPoint].value.toLocaleString("id-ID")} <span className="text-[10px] text-[#ff3b70] font-sans">Tiket</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
