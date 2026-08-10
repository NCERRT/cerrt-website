import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Facebook01Icon,
  NewTwitterIcon,
  Linkedin01Icon,
  InstagramIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";
import SubscribeForm from "@/components/ui/SubscribeForm";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Twitter",
      icon: NewTwitterIcon,
      href: "https://twitter.com/nitda",
    },
    {
      name: "Facebook",
      icon: Facebook01Icon,
      href: "https://facebook.com/nitda",
    },
    {
      name: "LinkedIn",
      icon: Linkedin01Icon,
      href: "https://linkedin.com/company/nitda",
    },
    {
      name: "Instagram",
      icon: InstagramIcon,
      href: "https://instagram.com/nitda",
    },
    { name: "YouTube", icon: YoutubeIcon, href: "https://youtube.com/@nitda" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground mt-auto relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5 pattern-dots pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Stay Alert Section */}
      {/* <div className="border-b border-primary-foreground/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></div>
              <span className="text-primary-foreground/70 text-sm font-semibold uppercase tracking-wider">
                Security Updates
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
              Stay Alert
            </h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Subscribe to receive notifications about latest security
              advisories and threats
            </p>
          </div>
        </div>
      </div> */}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* CERRT Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Image
                  src={"/nitda-logo.png"}
                  alt="NITDA Logo"
                  width={50}
                  height={50}
                />
                <Image
                  src={"/cerrt-logo.png"}
                  alt="CERRT Logo"
                  width={120}
                  height={50}
                />
              </div>
              {/* <span className="text-xl font-bold">NITDA CERRT</span> */}
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              Nigeria&apos;s Computer Emergency Readiness and Response Team,
              dedicated to safeguarding the nation&apos;s digital
              infrastructure.
            </p>

            {/* Social Media Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground hover:text-primary transition-all duration-300 hover:scale-110"
                  aria-label={social.name}
                >
                  <HugeiconsIcon
                    icon={social.icon}
                    size={18}
                    color="currentColor"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-primary-foreground/80 cursor-pointer hover:text-primary-foreground text-sm transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-primary-foreground/80 cursor-pointer hover:text-primary-foreground text-sm transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-primary-foreground/80 cursor-pointer hover:text-primary-foreground text-sm transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/advisories"
                  className="text-primary-foreground/80 cursor-pointer hover:text-primary-foreground text-sm transition-colors"
                >
                  Advisories
                </Link>
              </li>
              <li>
                <Link
                  href="/kids-advisory"
                  className="text-primary-foreground/80 cursor-pointer hover:text-primary-foreground text-sm transition-colors"
                >
                  Kids Advisory
                </Link>
              </li>
              <li>
                <a
                  href="/documents/nitda-cerrt-pgp-public-key.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 cursor-pointer hover:text-primary-foreground text-sm transition-colors"
                >
                  PGP Public Key
                </a>
              </li>
              <li>
                <a
                  href="/documents/nitda-cerrt-rfc-2.0.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 cursor-pointer hover:text-primary-foreground text-sm transition-colors"
                >
                  RFC 2.0
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency Response */}
          <div>
            <h3 className="font-semibold mb-4">Emergency Response</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-primary-foreground/80">
                <span className="block font-medium text-primary-foreground">
                  Hotline
                </span>
                +234 (0) 817 877 4580
              </li>
              <li className="text-primary-foreground/80">
                <span className="block font-medium text-primary-foreground">
                  Email
                </span>
                cerrt@nitda.gov.ng
              </li>
              <li className="text-primary-foreground/80">
                <span className="block font-medium text-primary-foreground">
                  Working Hours
                </span>
                24/7 Monitoring, Abuja, Nigeria
              </li>
            </ul>
          </div>

          {/* Security Alerts */}
          <div>
            <h3 className="font-semibold mb-4">Security Alerts</h3>
            <p className="text-primary-foreground/80 text-sm mb-4">
              Get the latest security alerts delivered to your inbox
            </p>
            <SubscribeForm variant="footer" />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-foreground/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-primary-foreground/70 text-sm">
            © {currentYear} NITDA CERRT - Computer Emergency Readiness and
            Response Team. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
