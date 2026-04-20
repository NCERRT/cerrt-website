"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LayoutGridIcon,
  FileScriptIcon,
  ChartLineData01Icon,
  Alert02Icon,
  Logout01Icon,
  Menu01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasSessionCookie, setHasSessionCookie] = useState<boolean | null>(null);

  // Don't redirect if on login or signup pages
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/signup";

  // Check if session cookie exists
  useEffect(() => {
    if (!isAuthPage) {
      fetch("/api/auth/session")
        .then((res) => res.json())
        .then((data) => {
          setHasSessionCookie(!!data.sessionId);
        })
        .catch(() => setHasSessionCookie(false));
    }
  }, [isAuthPage]);

  // Redirect to login only if we're sure there's no session
  useEffect(() => {
    if (!isAuthPage && !isLoading && !user && hasSessionCookie === false) {
      router.push("/admin/login");
    }
  }, [user, isLoading, router, isAuthPage, hasSessionCookie]);

  // For auth pages (login/signup), just render children without sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  return <AdminDashboard handleSignOut={handleSignOut}>{children}</AdminDashboard>;
}

function AdminDashboard({
  children,
  handleSignOut,
}: {
  children: React.ReactNode;
  handleSignOut: () => Promise<void>;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutGridIcon,
    },
    {
      href: "/admin/advisories",
      label: "Advisories",
      icon: FileScriptIcon,
    },
    {
      href: "/admin/statistics",
      label: "Statistics",
      icon: ChartLineData01Icon,
    },
    {
      href: "/admin/reports",
      label: "Incident Reports",
      icon: Alert02Icon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary font-serif">
          CERRT Admin
        </h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <HugeiconsIcon
            icon={isMobileMenuOpen ? Cancel01Icon : Menu01Icon}
            size={24}
            color="currentColor"
          />
        </button>
      </div>

      {/* Mobile backdrop overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen bg-white border-r border-gray-200 transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="mb-8 px-3">
            <h1 className="text-2xl font-bold text-primary font-serif">
              CERRT Admin
            </h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    size={20}
                    color="currentColor"
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-0 right-0 px-3">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <HugeiconsIcon
                icon={Logout01Icon}
                size={20}
                color="currentColor"
              />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        <div className="pt-20 lg:pt-8 p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
