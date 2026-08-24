"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  Building02Icon,
  Cancel01Icon,
  Search01Icon,
  Alert02Icon,
  Mail01Icon,
  UserIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import {
  getMdaOrganizationsAction,
  toggleMdaOrganizationActiveAction,
} from "@/app/actions/mdaRegistration";

interface MdaAccountItem {
  id: string;
  email: string;
  contactName: string;
  jobTitle: string;
  phone: string | null;
  isActive: boolean;
}

interface MdaOrganizationRecord {
  id: string;
  name: string;
  acronym: string | null;
  sector: string | null;
  verifiedDomains: string[];
  isActive: boolean;
  createdAt: string | Date;
  account: MdaAccountItem | null;
  incidentReports: { id: string }[];
}

export default function MdaOrganizationsAdminPage() {
  const [organizations, setOrganizations] = useState<MdaOrganizationRecord[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // In-UI Confirmation Modal State (Zero browser alerts)
  const [confirmTarget, setConfirmTarget] = useState<{
    id: string;
    name: string;
    action: "activate" | "deactivate";
  } | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    getMdaOrganizationsAction()
      .then((res) => {
        if (res.success && res.data) {
          setOrganizations(res.data as unknown as MdaOrganizationRecord[]);
        } else if (!res.success) {
          setError(res.error);
        }
      })
      .catch(() => setError("Failed to load MDA organizations."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmToggleActive = async () => {
    if (!confirmTarget) return;

    setTogglingId(confirmTarget.id);
    setError("");
    setSuccessMsg("");

    try {
      const res = await toggleMdaOrganizationActiveAction(confirmTarget.id);
      if (res.success) {
        setSuccessMsg(
          `Organization ${confirmTarget.name} ${
            confirmTarget.action === "activate" ? "activated" : "deactivated"
          } successfully.`,
        );
        setConfirmTarget(null);
        loadData();
      } else {
        setError(res.error);
      }
    } catch {
      setError("Failed to update organization status.");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredOrgs = organizations?.filter((org) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const primaryAccount = org.account;
    return (
      org.name.toLowerCase().includes(q) ||
      (org.acronym && org.acronym.toLowerCase().includes(q)) ||
      (org.sector && org.sector.toLowerCase().includes(q)) ||
      org.verifiedDomains.some((d) => d.toLowerCase().includes(q)) ||
      (primaryAccount && primaryAccount.contactName.toLowerCase().includes(q)) ||
      (primaryAccount && primaryAccount.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={Building02Icon} size={24} className="text-primary" />
            MDA Organizations Directory
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage approved Ministries, Departments, & Agencies, domain linkages, and portal access accounts.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-primary text-sm font-medium flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-primary hover:opacity-75">
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by agency, domain, or officer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 shadow-xs"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading MDA organizations...
          </div>
        ) : !filteredOrgs || filteredOrgs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <HugeiconsIcon icon={Building01Icon} size={32} className="mx-auto mb-3 text-slate-400" />
            No MDA organizations found matching search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Verified Domains
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Primary Account Officer
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Linked Incidents
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredOrgs.map((org) => {
                  const primaryAccount = org.account;
                  const buttonLabel = togglingId === org.id ? "Updating..." : org.isActive ? "Deactivate" : "Activate";

                  return (
                    <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Organization Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {org.acronym ? org.acronym.slice(0, 3) : org.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-snug">
                              {org.name}
                              {org.acronym && (
                                <span className="ml-1.5 text-xs font-mono font-bold text-primary">
                                  ({org.acronym})
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {org.sector || "Public Sector"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Verified Domains */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {org.verifiedDomains.map((domain) => (
                            <span
                              key={domain}
                              className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                            >
                              @{domain}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Primary Account Officer */}
                      <td className="px-6 py-4">
                        {primaryAccount ? (
                          <div>
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <HugeiconsIcon icon={UserIcon} size={14} className="text-slate-400" />
                              <span>{primaryAccount.contactName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
                              <HugeiconsIcon icon={Mail01Icon} size={12} className="text-slate-400" />
                              <span>{primaryAccount.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No account linked</span>
                        )}
                      </td>

                      {/* Linked Incidents */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                          <HugeiconsIcon icon={Alert02Icon} size={14} className="text-primary" />
                          <span>{org.incidentReports.length} Cases</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        {org.isActive ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-bold">
                            Deactivated
                          </Badge>
                        )}
                      </td>

                      {/* Toggle Action */}
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant={org.isActive ? "outline" : "default"}
                          disabled={togglingId === org.id}
                          onClick={() =>
                            setConfirmTarget({
                              id: org.id,
                              name: org.name,
                              action: org.isActive ? "deactivate" : "activate",
                            })
                          }
                          className={`text-xs font-semibold h-8 rounded-lg ${
                            org.isActive
                              ? "bg-gray-100 hover:bg-red-50 hover:text-red-700 border-gray-200 text-gray-700"
                              : "bg-primary hover:bg-primary-light text-primary-foreground"
                          }`}
                        >
                          {buttonLabel}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal (Replaces browser confirm) */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              {confirmTarget.action === "deactivate" ? (
                <>
                  <HugeiconsIcon icon={Cancel01Icon} size={20} className="text-red-600" />
                  Deactivate MDA Organization
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="text-primary" />
                  Activate MDA Organization
                </>
              )}
            </h3>

            <p className="text-slate-600 text-xs leading-relaxed mb-6">
              {confirmTarget.action === "deactivate" ? (
                <>
                  Are you sure you want to deactivate <strong className="text-slate-900">{confirmTarget.name}</strong>? Designated contact officers will be blocked from accessing the MDA Portal.
                </>
              ) : (
                <>
                  Are you sure you want to activate <strong className="text-slate-900">{confirmTarget.name}</strong>? Designated contact officers will regain full access to the MDA Portal.
                </>
              )}
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmTarget(null)}
                disabled={togglingId === confirmTarget.id}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={togglingId === confirmTarget.id}
                onClick={handleConfirmToggleActive}
                className={`text-xs font-semibold rounded-xl ${
                  confirmTarget.action === "deactivate"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-primary hover:bg-primary-light text-primary-foreground"
                }`}
              >
                {togglingId === confirmTarget.id
                  ? "Updating..."
                  : confirmTarget.action === "deactivate"
                  ? "Confirm Deactivation"
                  : "Confirm Activation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
