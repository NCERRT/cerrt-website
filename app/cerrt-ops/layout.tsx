"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LayoutGridIcon,
  FileScriptIcon,
  ChartLineData01Icon,
  Alert02Icon,
  Logout01Icon,
  Menu01Icon,
  Cancel01Icon,
  MailAtSign02Icon,
  UserGroupIcon,
  Task01Icon,
  ChatUserIcon,
} from "@hugeicons/core-free-icons";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Don't redirect if on an auth page (login, change-password, forgot/reset)
  const isAuthPage =
    pathname === "/cerrt-ops/login" ||
    pathname === "/cerrt-ops/change-password" ||
    pathname === "/cerrt-ops/forgot-password" ||
    pathname === "/cerrt-ops/reset-password";

  // Redirect to login once we know there is no authenticated user
  useEffect(() => {
    if (!isAuthPage && !isLoading && !user) {
      router.push("/cerrt-ops/login");
    }
  }, [user, isLoading, router, isAuthPage]);

  // Force password change before accessing any admin page
  useEffect(() => {
    if (!isAuthPage && !isLoading && user?.mustChangePassword) {
      router.push("/cerrt-ops/change-password");
    }
  }, [user, isLoading, router, isAuthPage]);

  // Redirect authenticated users away from login/reset pages
  useEffect(() => {
    if (isAuthPage && !isLoading && user) {
      if (user.mustChangePassword && pathname !== "/cerrt-ops/change-password") {
        router.push("/cerrt-ops/change-password");
      } else if (!user.mustChangePassword) {
        if (
          pathname === "/cerrt-ops/login" ||
          pathname === "/cerrt-ops/forgot-password" ||
          pathname === "/cerrt-ops/reset-password"
        ) {
          router.push("/cerrt-ops");
        }
      }
    }
  }, [user, isLoading, router, isAuthPage, pathname]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not on an auth page and there is no user, we are redirecting to login. Show loading spinner instead of flashing layout.
  if (!isAuthPage && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not on an auth page and user must change password, we are redirecting to change-password. Show loading spinner instead of flashing the dashboard.
  if (!isAuthPage && user?.mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated user is on an auth page that they shouldn't be on (e.g. login page, but they are logged in), show loading spinner while redirecting.
  if (isAuthPage && user) {
    if (pathname === "/cerrt-ops/change-password" && user.mustChangePassword) {
      // Allow rendering the change-password page
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
  }

  // For login page, just render children without sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/cerrt-ops/login");
  };

  if (!user) {
    return null;
  }

  return (
    <AdminDashboard
      handleSignOut={handleSignOut}
      userName={user.name}
      userEmail={user.email}
      userRole={user.role}
    >
      {children}
    </AdminDashboard>
  );
}

function AdminDashboard({
  children,
  handleSignOut,
  userName,
  userEmail,
  userRole,
}: {
  children: React.ReactNode;
  handleSignOut: () => Promise<void>;
  userName: string;
  userEmail: string;
  userRole: string;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      href: "/cerrt-ops",
      label: "Dashboard",
      icon: LayoutGridIcon,
    },
    {
      href: "/cerrt-ops/advisories",
      label: "Advisories",
      icon: FileScriptIcon,
    },
    {
      href: "/cerrt-ops/statistics",
      label: "Statistics",
      icon: ChartLineData01Icon,
    },
    {
      href: "/cerrt-ops/reports",
      label: "Incident Reports",
      icon: Alert02Icon,
    },
    {
      href: "/cerrt-ops/contact",
      label: "Contact Submissions",
      icon: ChatUserIcon,
    },
    {
      href: "/cerrt-ops/subscribers",
      label: "Subscribers",
      icon: MailAtSign02Icon,
    },
    // Team management is superadmin-only
    ...(userRole === "superadmin"
      ? [
          {
            href: "/cerrt-ops/team",
            label: "Team",
            icon: UserGroupIcon,
          },
          {
            href: "/cerrt-ops/audit-logs",
            label: "Audit Logs",
            icon: Task01Icon,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/nitda-logo.png"
            alt="NITDA Logo"
            width={32}
            height={32}
          />
          <Image
            src="/cerrt-logo.png"
            alt="CERRT Logo"
            width={100}
            height={32}
          />
          <h1 className="text-lg font-bold text-primary font-serif">
            CERRT Admin
          </h1>
        </div>
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
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/nitda-logo.png"
                alt="NITDA Logo"
                width={40}
                height={40}
              />
              <Image
                src="/cerrt-logo.png"
                alt="CERRT Logo"
                width={100}
                height={40}
              />
            </div>
            <h1 className="text-xl font-bold text-primary font-serif">
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

          <div className="absolute bottom-4 left-0 right-0 px-3 space-y-2">
            <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {userName}
              </div>
              <div className="text-xs text-gray-500 truncate">{userEmail}</div>
            </div>
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
