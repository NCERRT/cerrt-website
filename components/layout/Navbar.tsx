"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ReportIncidentModal from "@/components/ui/ReportIncidentModal";
import Image from "next/image";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [advisoriesDropdownOpen, setAdvisoriesDropdownOpen] = useState(false);
  const [mobileAdvisoriesOpen, setMobileAdvisoriesOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  const advisoryLinks = [
    { href: "/advisories", label: "General Advisories", description: "Security updates for all" },
    { href: "/advisories/individuals", label: "For Individuals", description: "Personal security guidance" },
    { href: "/advisories/organizations", label: "For Organizations", description: "Enterprise security" },
    { href: "/advisories/kids", label: "For Kids", description: "Child-friendly safety tips" },
  ];

  const isAdvisoriesActive = pathname.startsWith("/advisories") || pathname === "/kids-advisory";

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <Link
              href="/"
              className="flex cursor-pointer items-center gap-3 group py-3"
            >
              <div className="relative flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Image
                  src={"/nitda-logo.png"}
                  alt="NITDA Logo"
                  width={50}
                  height={50}
                  className="relative z-10"
                />
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-2xl font-bold text-primary group-hover:text-primary-light transition-colors">
                NITDA CERRT
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative cursor-pointer px-4 py-2 text-sm font-bold transition-colors group ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 origin-left ${
                        isActive
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    ></span>
                  </Link>
                );
              })}

              {/* Advisories Dropdown */}
              <div
                className="relative group/dropdown"
                onMouseEnter={() => setAdvisoriesDropdownOpen(true)}
                onMouseLeave={() => setAdvisoriesDropdownOpen(false)}
              >
                <button
                  className={`relative cursor-pointer px-4 py-2 text-sm font-bold transition-colors group flex items-center gap-1 ${
                    isAdvisoriesActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  Advisories
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      advisoriesDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 origin-left ${
                      isAdvisoriesActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </button>

                {/* Dropdown Menu */}
                {advisoriesDropdownOpen && (
                  <div className="absolute top-full left-0 pt-2 w-72 z-50">
                    <div className="bg-white border-2 border-border rounded-xl shadow-2xl overflow-hidden animate-slide-in-up">
                      {advisoryLinks.map((advisory) => (
                        <Link
                          key={advisory.href}
                          href={advisory.href}
                          className={`block px-6 py-4 hover:bg-primary/5 transition-all border-l-4 ${
                            pathname === advisory.href
                              ? "border-primary bg-primary/5"
                              : "border-transparent hover:border-primary/30"
                          }`}
                        >
                          <div className="font-bold text-foreground mb-1">
                            {advisory.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {advisory.description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="group cursor-pointer relative inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary-light hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">REPORT INCIDENT</span>
                <svg
                  className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden cursor-pointer inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-md">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block cursor-pointer px-4 py-3 text-base font-bold rounded-lg transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-4 border-transparent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Advisories Dropdown */}
              <div className="space-y-1">
                <button
                  onClick={() => setMobileAdvisoriesOpen(!mobileAdvisoriesOpen)}
                  className={`w-full flex items-center justify-between cursor-pointer px-4 py-3 text-base font-bold rounded-lg transition-all ${
                    isAdvisoriesActive
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-4 border-transparent"
                  }`}
                >
                  <span>Advisories</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${
                      mobileAdvisoriesOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Mobile Dropdown Items */}
                {mobileAdvisoriesOpen && (
                  <div className="pl-4 space-y-1">
                    {advisoryLinks.map((advisory) => (
                      <Link
                        key={advisory.href}
                        href={advisory.href}
                        className={`block cursor-pointer px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                          pathname === advisory.href
                            ? "bg-primary/10 text-primary border-l-4 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-4 border-transparent"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="font-bold">{advisory.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {advisory.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsReportModalOpen(true);
                }}
                className="group cursor-pointer block w-full mt-4 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg text-center hover:bg-primary-light hover:shadow-lg transition-all relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  REPORT INCIDENT
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Report Incident Modal */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
}
