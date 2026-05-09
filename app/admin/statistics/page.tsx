"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import type { Id } from "@/convex/_generated/dataModel";

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

export default function StatisticsPage() {
  const { user, sessionId } = useAuth();
  const statsData = useQuery(api.defacementStats.list, {});
  const years = useQuery(api.defacementStats.getYears, {});
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Get stats for selected year
  const yearStats =
    typeof statsData === "object" && !Array.isArray(statsData)
      ? ((statsData as Record<number, Array<{
          _id: Id<"defacementStats">;
          _creationTime: number;
          month: number;
          incidents: number;
          year: number;
          createdBy: Id<"users">;
          createdAt: number;
          updatedAt: number;
        }>>)[selectedYear] || [])
      : [];

  // Create a complete 12-month array
  const monthsData = MONTHS.map((month, index) => {
    const stat = yearStats.find((s) => s.month === index + 1);
    return {
      month: index + 1,
      monthName: month,
      incidents: stat?.incidents || 0,
      id: stat?._id,
    };
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            Defacement Statistics
          </h1>
          <p className="text-gray-600 mt-2">
            Manage monthly defacement incident data
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <HugeiconsIcon icon={Add01Icon} size={16} color="currentColor" />
              Add/Update Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add/Update Monthly Data</DialogTitle>
            </DialogHeader>
            {user && sessionId && (
              <StatForm
                onSuccess={() => setIsAddOpen(false)}
                sessionId={sessionId}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Year Selector */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <Label htmlFor="year-select" className="mb-2 block">
          Select Year
        </Label>
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(parseInt(value))}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years?.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
            {/* Always show current year even if no data */}
            {!years?.includes(new Date().getFullYear()) && (
              <SelectItem value={new Date().getFullYear().toString()}>
                {new Date().getFullYear()}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Monthly Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {monthsData.map((data) => (
          <div
            key={data.month}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-900">{data.monthName}</h3>
              {data.id && <DeleteStatButton statId={data.id} />}
            </div>
            <div className="text-4xl font-bold text-primary mb-2">
              {data.incidents}
            </div>
            <div className="text-sm text-gray-600">incidents</div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {selectedYear} Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Incidents</div>
            <div className="text-3xl font-bold text-gray-900">
              {monthsData.reduce((sum, m) => sum + m.incidents, 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Average per Month</div>
            <div className="text-3xl font-bold text-gray-900">
              {(
                monthsData.reduce((sum, m) => sum + m.incidents, 0) / 12
              ).toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Highest Month</div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.max(...monthsData.map((m) => m.incidents))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatForm({
  onSuccess,
  sessionId,
}: {
  onSuccess: () => void;
  sessionId: Id<"sessions">;
}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [incidents, setIncidents] = useState(0);
  const [saving, setSaving] = useState(false);

  const upsertStat = useMutation(api.defacementStats.upsert);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await upsertStat({
        year,
        month,
        incidents,
        sessionId,
      });
      onSuccess();
    } catch (error) {
      console.error("Error saving statistic:", error);
      alert("Failed to save statistic");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="year">Year</Label>
        <Input
          id="year"
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          min={2020}
          max={2030}
          required
        />
      </div>

      <div>
        <Label htmlFor="month">Month</Label>
        <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="incidents">Number of Incidents</Label>
        <Input
          id="incidents"
          type="number"
          value={incidents}
          onChange={(e) => setIncidents(parseInt(e.target.value))}
          min={0}
          required
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}

function DeleteStatButton({ statId }: { statId: Id<"defacementStats"> }) {
  const { sessionId } = useAuth();
  const deleteStat = useMutation(api.defacementStats.remove);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this data?")) return;
    if (!sessionId) {
      alert("Session expired. Please log in again.");
      return;
    }

    setDeleting(true);
    try {
      await deleteStat({ id: statId, sessionId });
    } catch (error) {
      console.error("Error deleting stat:", error);
      alert("Failed to delete stat");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
    >
      <HugeiconsIcon icon={Delete01Icon} size={12} color="currentColor" />
    </Button>
  );
}
