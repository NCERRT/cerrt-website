"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileScriptIcon,
  Alert02Icon,
  ChartLineData01Icon,
  ArrowUpRight01Icon,
  MailAtSign02Icon,
  UserGroupIcon,
  Task01Icon,
  ChatUserIcon,
} from "@hugeicons/core-free-icons";
import { getAdvisoriesAction } from "@/app/actions/advisories";
import { getIncidentStatsAction } from "@/app/actions/incidentReports";
import { useAuth } from "@/lib/useAuth";

interface IncidentStats {
  total: number;
  new: number;
  reviewing: number;
  resolved: number;
  closed: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [advisoryCount, setAdvisoryCount] = useState(0);
  const [incidentStats, setIncidentStats] = useState<IncidentStats | null>(
    null,
  );

  useEffect(() => {
    getAdvisoriesAction()
      .then((a) => setAdvisoryCount(a.length))
      .catch(() => {});
    getIncidentStatsAction()
      .then(setIncidentStats)
      .catch(() => {});
  }, []);

  const stats = [
    {
      label: "Total Advisories",
      value: advisoryCount,
      icon: FileScriptIcon,
      bgClass: "bg-blue-50 text-blue-600 border border-blue-100",
      hoverBgClass: "group-hover:bg-blue-600 group-hover:text-white",
    },
    {
      label: "New Reports",
      value: incidentStats?.new || 0,
      icon: Alert02Icon,
      bgClass: "bg-red-50 text-red-600 border border-red-100",
      hoverBgClass: "group-hover:bg-red-600 group-hover:text-white",
    },
    {
      label: "Reviewing",
      value: incidentStats?.reviewing || 0,
      icon: ArrowUpRight01Icon,
      bgClass: "bg-amber-50 text-amber-600 border border-amber-100",
      hoverBgClass: "group-hover:bg-amber-600 group-hover:text-white",
    },
    {
      label: "Resolved",
      value: incidentStats?.resolved || 0,
      icon: ChartLineData01Icon,
      bgClass: "bg-green-50 text-green-600 border border-green-100",
      hoverBgClass: "group-hover:bg-green-600 group-hover:text-white",
    },
  ];

  // Dynamic quick actions list based on user role
  const quickActions = [
    {
      href: "/cerrt-ops/advisories",
      label: "Manage Advisories",
      description:
        "Create, edit, and publish security advisories for the public",
      icon: FileScriptIcon,
    },
    {
      href: "/cerrt-ops/reports",
      label: "Review Reports",
      description: "Analyze, assign severity, and resolve reported incidents",
      icon: Alert02Icon,
    },
    {
      href: "/cerrt-ops/contact",
      label: "Contact Submissions",
      description: "Review and manage inquiries from the public contact form",
      icon: ChatUserIcon,
    },
    {
      href: "/cerrt-ops/statistics",
      label: "Update Statistics",
      description: "Add defaced website stats for internal tracking charts",
      icon: ChartLineData01Icon,
    },
    {
      href: "/cerrt-ops/subscribers",
      label: "Mailing Subscribers",
      description: "List email notification subscribers and export CSV reports",
      icon: MailAtSign02Icon,
    },
    ...(user?.role === "superadmin"
      ? [
          {
            href: "/cerrt-ops/team",
            label: "Manage Team",
            description:
              "Invite new admin members and suspend or restore access",
            icon: UserGroupIcon,
          },
          {
            href: "/cerrt-ops/audit-logs",
            label: "Security Audit Logs",
            description:
              "Track system authentication activity and administrative logs",
            icon: Task01Icon,
          },
        ]
      : []),
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
            className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg hover:border-primary hover:-translate-y-1 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`${stat.bgClass} ${stat.hoverBgClass} w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200`}
              >
                <HugeiconsIcon
                  icon={stat.icon}
                  size={24}
                  color="currentColor"
                />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors duration-200">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-serif">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                  <HugeiconsIcon
                    icon={action.icon}
                    size={20}
                    color="currentColor"
                  />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 group-hover:text-primary transition-colors duration-200">
                  {action.label}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
