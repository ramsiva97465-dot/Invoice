import React, { useState } from 'react';

interface MonthlyData {
  month: string;
  amount: number;
}

interface DailyData {
  date: string;
  amount: number;
}

interface RevenueChartsProps {
  monthlyData: MonthlyData[];
  dailyData: DailyData[];
}

export const RevenueCharts: React.FC<RevenueChartsProps> = ({ monthlyData, dailyData }) => {
  const [hoveredMonthlyIndex, setHoveredMonthlyIndex] = useState<number | null>(null);
  const [hoveredDailyIndex, setHoveredDailyIndex] = useState<number | null>(null);

  // Configuration metrics
  const chartHeight = 200;
  const padding = 30;

  // Helpers for Monthly Bar Chart
  const monthlyMax = Math.max(...monthlyData.map((d) => d.amount), 1000);
  const monthlyBarWidth = 40;
  const monthlyBarGap = 35;
  const monthlyTotalWidth = (monthlyBarWidth + monthlyBarGap) * monthlyData.length + padding * 2;

  // Helpers for Daily Line Chart
  const dailyMax = Math.max(...dailyData.map((d) => d.amount), 500);
  const dailyPoints = dailyData.map((d, index) => {
    const x = padding + (index * (350 - padding * 2)) / Math.max(dailyData.length - 1, 1);
    // Invert y since SVG y increases downward
    const y = chartHeight - padding - (d.amount / dailyMax) * (chartHeight - padding * 2);
    return { x, y, ...d };
  });

  // Format date helper: "2026-06-15" -> "15 Jun"
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Monthly Revenue Chart */}
      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Collections</h4>
            <p className="text-xs text-slate-400 font-sans">Historical revenue comparison (Last 6 Months)</p>
          </div>
          {hoveredMonthlyIndex !== null && (
            <div className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans">
              {monthlyData[hoveredMonthlyIndex].month}: ₹{monthlyData[hoveredMonthlyIndex].amount.toLocaleString('en-IN')}
            </div>
          )}
        </div>

        {/* SVG Bar Chart */}
        <div className="relative w-full h-[220px]">
          <svg className="w-full h-full" viewBox={`0 0 ${monthlyTotalWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = padding + ratio * (chartHeight - padding * 2);
              return (
                <line
                  key={i}
                  x1={padding}
                  y1={y}
                  x2={monthlyTotalWidth - padding}
                  y2={y}
                  className="stroke-slate-100 dark:stroke-slate-700"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Bars */}
            {monthlyData.map((d, index) => {
              const x = padding + index * (monthlyBarWidth + monthlyBarGap) + monthlyBarGap / 2;
              const barHeight = (d.amount / monthlyMax) * (chartHeight - padding * 2);
              const y = chartHeight - padding - barHeight;

              return (
                <g key={index} onMouseEnter={() => setHoveredMonthlyIndex(index)} onMouseLeave={() => setHoveredMonthlyIndex(null)}>
                  {/* Glowing background on hover */}
                  {hoveredMonthlyIndex === index && (
                    <rect
                      x={x - 4}
                      y={padding}
                      width={monthlyBarWidth + 8}
                      height={chartHeight - padding * 2}
                      className="fill-slate-50 dark:fill-slate-700/20"
                      rx="8"
                    />
                  )}

                  {/* Actual Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={monthlyBarWidth}
                    height={Math.max(barHeight, 4)}
                    className="fill-emerald-500 hover:fill-emerald-600 dark:fill-emerald-600 dark:hover:fill-emerald-500 transition-colors cursor-pointer"
                    rx="6"
                  />

                  {/* Label (Month Name) */}
                  <text
                    x={x + monthlyBarWidth / 2}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[10px] font-semibold fill-slate-400 dark:fill-slate-500 font-sans"
                  >
                    {d.month}
                  </text>
                </g>
              );
            })}

            {/* Bottom Base Line */}
            <line
              x1={padding}
              y1={chartHeight - padding}
              x2={monthlyTotalWidth - padding}
              y2={chartHeight - padding}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Daily Revenue Trend</h4>
            <p className="text-xs text-slate-400 font-sans">Active daily collections cycle</p>
          </div>
          {hoveredDailyIndex !== null && dailyPoints[hoveredDailyIndex] && (
            <div className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-xs font-semibold text-blue-600 dark:text-blue-400 font-sans">
              {formatDateLabel(dailyPoints[hoveredDailyIndex].date)}: ₹{dailyPoints[hoveredDailyIndex].amount.toLocaleString('en-IN')}
            </div>
          )}
        </div>

        {/* SVG Line / Area Chart */}
        <div className="relative w-full h-[220px]">
          {dailyPoints.length > 0 ? (
            <svg className="w-full h-full" viewBox={`0 0 350 ${chartHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding + ratio * (chartHeight - padding * 2);
                return (
                  <line
                    key={i}
                    x1={padding}
                    y1={y}
                    x2={350 - padding}
                    y2={y}
                    className="stroke-slate-100 dark:stroke-slate-700"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Gradient Area under the line */}
              {dailyPoints.length > 1 && (
                <path
                  d={`
                    M ${dailyPoints[0].x} ${chartHeight - padding}
                    ${dailyPoints.map((p) => `L ${p.x} ${p.y}`).join(' ')}
                    L ${dailyPoints[dailyPoints.length - 1].x} ${chartHeight - padding}
                    Z
                  `}
                  fill="url(#chartGradient)"
                />
              )}

              {/* Line path */}
              {dailyPoints.length > 1 && (
                <path
                  d={dailyPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  className="stroke-blue-500"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              {/* Data points */}
              {dailyPoints.map((p, index) => (
                <g
                  key={index}
                  onMouseEnter={() => setHoveredDailyIndex(index)}
                  onMouseLeave={() => setHoveredDailyIndex(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredDailyIndex === index ? 6 : 4}
                    className="fill-white stroke-blue-500 hover:stroke-blue-600 transition-all"
                    strokeWidth={hoveredDailyIndex === index ? 3 : 2}
                  />

                  {/* Horizontal Guideline on Hover */}
                  {hoveredDailyIndex === index && (
                    <line
                      x1={p.x}
                      y1={p.y}
                      x2={p.x}
                      y2={chartHeight - padding}
                      className="stroke-blue-200 dark:stroke-blue-900/50"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}
                </g>
              ))}

              {/* Labels for Dates */}
              {dailyPoints.map((p, index) => {
                // Show alternate date labels if too many to avoid overlap
                if (dailyPoints.length > 5 && index % 2 !== 0) return null;
                return (
                  <text
                    key={index}
                    x={p.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[9px] font-semibold fill-slate-400 dark:fill-slate-500 font-sans"
                  >
                    {formatDateLabel(p.date)}
                  </text>
                );
              })}

              {/* Bottom Base Line */}
              <line
                x1={padding}
                y1={chartHeight - padding}
                x2={350 - padding}
                y2={chartHeight - padding}
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="1.5"
              />
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs font-sans">
              No revenue collected recently.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
