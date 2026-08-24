"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building02Icon,
  LayoutGridIcon,
  Alert02Icon,
  Add01Icon,
  Settings02Icon,
  Logout01Icon,
  UserIcon,
  Menu01Icon,
  Cancel01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

import { useMdaSessionQuery, useMdaLogout } from "@/hooks/use-mda-session";

export default function MdaPortalWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user = null, isLoading } = useMdaSessionQuery();
  const logoutMutation = useMdaLogout();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/mda-portal/login");
    }
  }, [user, isLoading, router]);

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/mda-portal/login");
      },
    });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Authenticating MDA session...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: "/mda-portal", label: "Dashboard", icon: LayoutGridIcon },
    { href: "/mda-portal/cases", label: "Incidents", icon: Alert02Icon },
    { href: "/mda-portal/report", label: "Report Incident", icon: Add01Icon },
    { href: "/mda-portal/settings", label: "Account Settings", icon: Settings02Icon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row font-sans">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-200 flex-col justify-between shrink-0 h-screen sticky top-0 p-5">
        <div className="space-y-6">
          {/* Organization Brand Header */}
          <div className="border-b border-gray-100 pb-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={Building02Icon} size={22} />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-gray-900 text-sm truncate">
                  {user.organizationName}
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  {user.acronym && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold border border-primary/20">
                      {user.acronym}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">MDA Portal</span>
                </div>
              </div>
            </div>

            {/* Officer Info Card */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-xs space-y-1">
              <div className="font-bold text-gray-900 flex items-center space-x-1.5 truncate">
                <HugeiconsIcon icon={UserIcon} size={14} className="text-primary shrink-0" />
                <span className="truncate">{user.contactName}</span>
              </div>
              <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Navigation
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <HugeiconsIcon icon={Icon} size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Sign Out */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <button
            onClick={handleSignOut}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} />
            <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
          </button>

          <div className="text-center text-[10px] text-gray-400 flex items-center justify-center space-x-1">
            <HugeiconsIcon icon={Shield01Icon} size={12} className="text-primary" />
            <span>CERRT MDA Gateway</span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <HugeiconsIcon icon={Building02Icon} size={18} />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-xs truncate max-w-[180px]">
              {user.organizationName}
            </div>
            <span className="text-[10px] text-gray-400 block">MDA Portal</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <HugeiconsIcon icon={mobileMenuOpen ? Cancel01Icon : Menu01Icon} size={22} />
        </button>
      </div>

      {/* Mobile Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-3 pb-4 space-y-2">
          <div className="pb-3 mb-2 border-b border-gray-100">
            <div className="text-xs font-bold text-gray-900">{user.contactName}</div>
            <div className="text-[11px] text-gray-500">{user.email}</div>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive ? "bg-primary text-primary-foreground font-bold" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <HugeiconsIcon icon={Icon} size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleSignOut}
            disabled={logoutMutation.isPending}
            className="w-full mt-2 flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} />
            <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      )}

      {/* Main Workspace Content Area */}
      <main className="flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
