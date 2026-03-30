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

export default function DefacementStatistics() {
  const [selectedYear, setSelectedYear] = useState(2026);

  const years = [2026, 2025, 2024, 2023, 2022, 2021];

  // Sample data - replace with actual data from your backend/CMS
  const statisticsData = {
    2026: [
      { month: "January", incidents: 9 },
      { month: "February", incidents: 4 },
      { month: "March", incidents: 0 },
      { month: "April", incidents: 0 },
      { month: "May", incidents: 0 },
      { month: "June", incidents: 0 },
      { month: "July", incidents: 0 },
      { month: "August", incidents: 0 },
      { month: "September", incidents: 0 },
      { month: "October", incidents: 0 },
      { month: "November", incidents: 0 },
      { month: "December", incidents: 0 },
    ],
    2025: [
      { month: "January", incidents: 12 },
      { month: "February", incidents: 8 },
      { month: "March", incidents: 15 },
      { month: "April", incidents: 6 },
      { month: "May", incidents: 10 },
      { month: "June", incidents: 7 },
      { month: "July", incidents: 9 },
      { month: "August", incidents: 11 },
      { month: "September", incidents: 5 },
      { month: "October", incidents: 8 },
      { month: "November", incidents: 14 },
      { month: "December", incidents: 6 },
    ],
    2024: [
      { month: "January", incidents: 10 },
      { month: "February", incidents: 12 },
      { month: "March", incidents: 8 },
      { month: "April", incidents: 15 },
      { month: "May", incidents: 7 },
      { month: "June", incidents: 11 },
      { month: "July", incidents: 9 },
      { month: "August", incidents: 13 },
      { month: "September", incidents: 6 },
      { month: "October", incidents: 10 },
      { month: "November", incidents: 8 },
      { month: "December", incidents: 5 },
    ],
    2023: [
      { month: "January", incidents: 14 },
      { month: "February", incidents: 10 },
      { month: "March", incidents: 12 },
      { month: "April", incidents: 9 },
      { month: "May", incidents: 11 },
      { month: "June", incidents: 8 },
      { month: "July", incidents: 13 },
      { month: "August", incidents: 7 },
      { month: "September", incidents: 10 },
      { month: "October", incidents: 12 },
      { month: "November", incidents: 9 },
      { month: "December", incidents: 11 },
    ],
    2022: [
      { month: "January", incidents: 16 },
      { month: "February", incidents: 13 },
      { month: "March", incidents: 11 },
      { month: "April", incidents: 14 },
      { month: "May", incidents: 9 },
      { month: "June", incidents: 12 },
      { month: "July", incidents: 10 },
      { month: "August", incidents: 15 },
      { month: "September", incidents: 8 },
      { month: "October", incidents: 11 },
      { month: "November", incidents: 13 },
      { month: "December", incidents: 7 },
    ],
    2021: [
      { month: "January", incidents: 18 },
      { month: "February", incidents: 15 },
      { month: "March", incidents: 13 },
      { month: "April", incidents: 16 },
      { month: "May", incidents: 12 },
      { month: "June", incidents: 14 },
      { month: "July", incidents: 11 },
      { month: "August", incidents: 17 },
      { month: "September", incidents: 10 },
      { month: "October", incidents: 13 },
      { month: "November", incidents: 15 },
      { month: "December", incidents: 9 },
    ],
  };

  const currentData =
    statisticsData[selectedYear as keyof typeof statisticsData];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 font-serif text-primary">
            Defacement Statistics
          </h2>

          {/* Year Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {years.map((year) => (
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
