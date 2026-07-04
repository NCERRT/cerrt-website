"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface DefacementStatisticsProps {
  /** Stats grouped by year, e.g. { 2026: [{ month: 1, incidents: 4 }, ...] } */
  statsByYear: Record<number, { month: number; incidents: number }[]>;
  /** Available years, sorted descending */
  years: number[];
}

export default function DefacementStatistics({
  statsByYear,
  years,
}: DefacementStatisticsProps) {
  const displayYears = years.length > 0 ? years : [new Date().getFullYear()];
  const [selectedYear, setSelectedYear] = useState(displayYears[0]);

  // Build a complete 12-month dataset for the selected year
  const getYearData = (year: number) => {
    const yearStats = statsByYear[year] || [];
    return MONTHS.map((month, index) => {
      const stat = yearStats.find((s) => s.month === index + 1);
      return {
        month,
        incidents: stat?.incidents || 0,
      };
    });
  };

  const currentData = getYearData(selectedYear);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 font-serif text-primary">
            Defacement Statistics
          </h2>

          {/* Year Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {displayYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-8 py-3 cursor-pointer font-bold rounded-lg transition-all duration-300 ${
                  selectedYear === year
                    ? "bg-primary text-white shadow-lg"
                    : "bg-secondary text-foreground hover:bg-primary/50"
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Chart Title */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {selectedYear}
            </h3>
            <div className="inline-flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-black"></div>
              <span className="font-semibold">{selectedYear}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white border-2 border-border rounded-2xl p-8">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={currentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                labelStyle={{ fontWeight: "bold", color: "#111827" }}
              />
              <Bar dataKey="incidents" fill="#000000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-secondary/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {currentData.reduce((sum, item) => sum + item.incidents, 0)}
            </div>
            <div className="text-sm text-muted-foreground font-semibold">
              Total Incidents
            </div>
          </div>
          <div className="bg-secondary/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {Math.max(...currentData.map((item) => item.incidents))}
            </div>
            <div className="text-sm text-muted-foreground font-semibold">
              Highest Month
            </div>
          </div>
          <div className="bg-secondary/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {(
                currentData.reduce((sum, item) => sum + item.incidents, 0) / 12
              ).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground font-semibold">
              Monthly Average
            </div>
          </div>
          <div className="bg-secondary/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {currentData.filter((item) => item.incidents > 0).length}
            </div>
            <div className="text-sm text-muted-foreground font-semibold">
              Active Months
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
