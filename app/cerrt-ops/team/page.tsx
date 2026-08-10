"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAdd01Icon,
  MailSend01Icon,
  UserGroupIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import {
  toggleTeamMemberActiveAction,
  getTeamMembersAction,
  inviteAdminAction,
  resendInviteAction,
  type TeamMember,
} from "@/app/actions/team";
import { useConfirm } from "@/components/ui/ConfirmDialog";

export default function TeamPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Superadmin-only page. Redirect regular admins away.
  useEffect(() => {
    if (!isLoading && user && user.role !== "superadmin") {
      router.push("/cerrt-ops");
    }
  }, [user, isLoading, router]);

  const loadData = useCallback(() => {
    getTeamMembersAction()
      .then(setMembers)
      .catch((err) => {
        setMembers([]);
        toast.error((err as Error).message || "Failed to load team");
      });
  }, []);

  useEffect(() => {
    if (user?.role === "superadmin") loadData();
  }, [user, loadData]);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));

  if (isLoading || !user || user.role !== "superadmin") {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Team</h1>
          <p className="text-gray-600 mt-2">
            Manage administrator access to the CERRT admin dashboard
          </p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <HugeiconsIcon
                icon={UserAdd01Icon}
                size={16}
                color="currentColor"
              />
              Invite Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <InviteForm
              onSuccess={() => {
                setIsInviteOpen(false);
                loadData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <HugeiconsIcon
              icon={UserGroupIcon}
              size={24}
              color="currentColor"
              className="text-primary"
            />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {members?.length ?? "—"}
            </div>
            <div className="text-sm text-gray-600">Total administrators</div>
          </div>
        </div>
      </div>

      {/* Members table */}
      <div className="bg-white rounded-xl border-2 border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                  User / Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                  Added
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members === null ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    Loading...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 text-sm"
                  >
                    No team members yet.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {m.isSelf && (
                          <span className="text-xs text-gray-500 font-normal">
                            (you)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-normal mt-0.5 select-all">
                        {m.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2 whitespace-nowrap">
                      {(m.status === "pending" || m.status === "expired") && (
                        <ResendButton userId={m.id} email={m.email} />
                      )}
                      {/* Self-deactivation is disabled check is in the button/action */}
                      {!m.isSelf && (
                        <ToggleActiveButton
                          id={m.id}
                          email={m.email}
                          status={m.status}
                          onUpdated={loadData}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TeamMember["status"] }) {
  const styles =
    status === "active"
      ? "bg-green-100 text-green-800"
      : status === "pending"
        ? "bg-amber-100 text-amber-800"
        : status === "deactivated"
          ? "bg-gray-100 text-gray-800"
          : "bg-red-100 text-red-800";
  const label =
    status === "active"
      ? "Active"
      : status === "pending"
        ? "Pending invite"
        : status === "deactivated"
          ? "Deactivated"
          : "Invite expired";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${styles}`}
    >
      {label}
    </span>
  );
}

function InviteForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await inviteAdminAction({ email, name });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(`Invite sent to ${email.trim().toLowerCase()}`);
      onSuccess();
    } catch (err) {
      toast.error((err as Error).message || "Failed to send invite");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Invite a new administrator</DialogTitle>
        <DialogDescription>
          They&apos;ll receive an email with a temporary password valid for
          72&nbsp;hours. They&apos;ll be required to set a new password on first
          login.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="invite-name">Full name</Label>
          <Input
            id="invite-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={254}
            placeholder="jane@cerrt.gov.ng"
            autoComplete="off"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Sending..." : "Send invite"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ResendButton({ userId, email }: { userId: string; email: string }) {
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await resendInviteAction(userId);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(`Invite resent to ${email}`);
    } catch (err) {
      toast.error((err as Error).message || "Failed to resend invite");
    } finally {
      setSending(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResend}
      disabled={sending}
      className="gap-2"
    >
      <HugeiconsIcon icon={MailSend01Icon} size={14} color="currentColor" />
      {sending ? "Sending..." : "Resend"}
    </Button>
  );
}

function ToggleActiveButton({
  id,
  email,
  status,
  onUpdated,
}: {
  id: string;
  email: string;
  status: TeamMember["status"];
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();

  const isDeactivated = status === "deactivated";

  const handleToggle = async () => {
    if (isDeactivated) {
      const ok = await confirm({
        title: "Reactivate CERRT admin?",
        description: `Reactivate ${email} and restore their dashboard access?`,
        confirmLabel: "Reactivate",
        destructive: false,
      });
      if (!ok) return;

      setLoading(true);
      try {
        const res = await toggleTeamMemberActiveAction(id);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        toast.success("Team member reactivated");
        onUpdated();
      } catch (err) {
        toast.error((err as Error).message || "Failed to reactivate team member");
      } finally {
        setLoading(false);
      }
    } else {
      const ok = await confirm({
        title: "Deactivate CERRT admin?",
        description: `Deactivate ${email}? Their active sessions will be terminated immediately.`,
        confirmLabel: "Deactivate",
        destructive: true,
      });
      if (!ok) return;

      setLoading(true);
      try {
        const res = await toggleTeamMemberActiveAction(id);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        toast.success("Team member deactivated");
        onUpdated();
      } catch (err) {
        toast.error((err as Error).message || "Failed to deactivate team member");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={
        isDeactivated
          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
          : "text-red-600 hover:text-red-700 hover:bg-red-50"
      }
      aria-label={isDeactivated ? `Reactivate ${email}` : `Deactivate ${email}`}
    >
      <HugeiconsIcon
        icon={isDeactivated ? CheckmarkCircle02Icon : Cancel01Icon}
        size={16}
        color="currentColor"
      />
    </Button>
  );
}
