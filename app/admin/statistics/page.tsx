"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/ConfirmDialog";
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
import {
  getDefacementStatsAction,
  upsertStatAction,
  deleteStatAction,
} from "@/app/actions/defacementStats";

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

type StatsByYear = Record<
  number,
  { id: string; month: number; incidents: number }[]
>;

export default function StatisticsPage() {
  const [statsByYear, setStatsByYear] = useState<StatsByYear>({});
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadData = useCallback(() => {
    getDefacementStatsAction()
      .then(({ statsByYear, years }) => {
        setStatsByYear(statsByYear);
        setYears(years);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build a complete 12-month dataset for the selected year
  const yearStats = statsByYear[selectedYear] || [];
  const monthsData = MONTHS.map((month, index) => {
    const stat = yearStats.find((s) => s.month === index + 1);
    return {
      month: index + 1,
      monthName: month,
      incidents: stat?.incidents || 0,
      id: stat?.id,
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
            <StatForm
              onSuccess={() => {
                setIsAddOpen(false);
                loadData();
              }}
            />
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
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
            {/* Always show current year even if no data */}
            {!years.includes(new Date().getFullYear()) && (
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
              {data.id && (
                <DeleteStatButton statId={data.id} onDeleted={loadData} />
              )}
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

function StatForm({ onSuccess }: { onSuccess: () => void }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [incidents, setIncidents] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await upsertStatAction(year, month, incidents);
      toast.success("Statistic saved successfully");
      onSuccess();
    } catch (error) {
      toast.error((error as Error).message || "Failed to save statistic");
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
        <Select
          value={month.toString()}
          onValueChange={(v) => setMonth(parseInt(v))}
        >
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

function DeleteStatButton({
  statId,
  onDeleted,
}: {
  statId: string;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const confirm = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete statistic?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;

    setDeleting(true);
    try {
      await deleteStatAction(statId);
      toast.success("Statistic deleted");
      onDeleted();
    } catch (error) {
      toast.error((error as Error).message || "Failed to delete stat");
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
