"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileScriptIcon,
  Alert02Icon,
  ChartLineData01Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";

export default function AdminDashboard() {
  const incidentStats = useQuery(api.incidentReports.getStats, {});
  const advisories = useQuery(api.advisories.list, {});

  const stats = [
    {
      label: "Total Advisories",
      value: advisories?.length || 0,
      icon: FileScriptIcon,
      color: "bg-blue-500",
    },
    {
      label: "New Reports",
      value: incidentStats?.new || 0,
      icon: Alert02Icon,
      color: "bg-red-500",
    },
    {
      label: "Reviewing",
      value: incidentStats?.reviewing || 0,
      icon: ArrowUpRight01Icon,
      color: "bg-yellow-500",
    },
    {
      label: "Resolved",
      value: incidentStats?.resolved || 0,
      icon: ChartLineData01Icon,
      color: "bg-green-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-serif">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome to the CERRT admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}
              >
                <HugeiconsIcon
                  icon={stat.icon}
                  size={24}
                  color="white"
                />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/advisories"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-1">
              Manage Advisories
            </h3>
            <p className="text-sm text-gray-600">
              Create, edit, and publish security advisories
            </p>
          </a>
          <a
            href="/admin/statistics"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-1">
              Update Statistics
            </h3>
            <p className="text-sm text-gray-600">
              Add defacement incident data
            </p>
          </a>
          <a
            href="/admin/reports"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-1">
              Review Reports
            </h3>
            <p className="text-sm text-gray-600">
              Manage incident reports from users
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
