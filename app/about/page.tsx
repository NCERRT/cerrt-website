import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Target03Icon,
  Telescope01Icon,
  SecurityIcon,
  Agreement01Icon,
  ViewIcon,
  FlashIcon,
  Certificate01Icon,
  GlobalIcon,
  ComputerProtectionIcon,
  UserGroupIcon,
  BrickWallShieldIcon,
  Scroll01Icon,
  FileBadgeIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About CERRT | Computer Emergency Readiness & Response Team",
  description:
    "Learn about CERRT's mission, vision, and values in protecting Nigeria's digital infrastructure",
};

export default function AboutPage() {
  const values = [
    {
      title: "Security First",
      description:
        "We prioritize the protection of Nigeria's digital infrastructure above all else.",
      icon: SecurityIcon,
    },
    {
      title: "Collaboration",
      description:
        "We work closely with government, private sector, and international partners.",
      icon: Agreement01Icon,
    },
    {
      title: "Transparency",
      description:
        "We maintain open communication and share threat intelligence responsibly.",
      icon: ViewIcon,
    },
    {
      title: "Service",
      description:
        "We are dedicated to serving Nigeria and protecting our digital future.",
      icon: FlashIcon,
    },
  ];

  const partners = [
    { name: "Google", logo: "/partners/google.webp" },
    { name: "Microsoft", logo: "/partners/microsoft.png" },
    { name: "Cisco", logo: "/partners/cisco.png" },
    { name: "ONDI", logo: "/partners/ondi.png" },
  ];

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-secondary py-20 pattern-dots relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto animate-slide-in-up">
            <div className="inline-block mb-6">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Who We Are
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-serif leading-tight">
              About <span className="text-primary">NITDA CERRT</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              NITDA’s Computer Emergency Readiness and Response Team, dedicated
              to protecting the nation’s digital infrastructure and building a
              secure cyber ecosystem for all Nigerians.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-slide-in-up">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group bg-white border-2 border-border rounded-2xl p-8 hover-lift card-interactive relative overflow-hidden">
              {/* Accent corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

              <div className="mb-6 relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <HugeiconsIcon
                    icon={Target03Icon}
                    size={32}
                    color="currentColor"
                    className="text-primary group-hover:text-white transition-colors"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                Our Mission
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To safeguard Nigeria’s digital infrastructure by providing
                proactive and responsive cybersecurity services, fostering
                resilience, and enhancing the trust of stakeholders in digital
                systems and services.
              </p>
            </div>
            <div className="group bg-white border-2 border-border rounded-2xl p-8 hover-lift card-interactive relative overflow-hidden">
              {/* Accent corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

              <div className="mb-6 relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <HugeiconsIcon
                    icon={Telescope01Icon}
                    size={32}
                    color="currentColor"
                    className="text-primary group-hover:text-white transition-colors"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                Our Vision
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                A resilient and secure cyberspace for Nigeria’s digital economy,
                built on trust, innovation and collaboration.
              </p>
            </div>
            <div className="group bg-white border-2 border-border rounded-2xl p-8 hover-lift card-interactive relative overflow-hidden">
              {/* Accent corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

              <div className="mb-6 relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <HugeiconsIcon
                    icon={FileBadgeIcon}
                    size={32}
                    color="currentColor"
                    className="text-primary group-hover:text-white transition-colors"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                Notable Mentions
              </h2>
              <div className="text-[#737373]">
                <p className="flex items-center gap-2 text-lg mb-2">
                  <HugeiconsIcon
                    icon={Certificate01Icon}
                    size={28}
                    color="currentColor"
                    className="text-primary font-semibold"
                  />
                  ISO 27001 Certified
                </p>
                <p className="flex items-center gap-2 text-lg mb-2">
                  <HugeiconsIcon
                    icon={GlobalIcon}
                    size={28}
                    color="currentColor"
                    className="text-primary font-semibold"
                  />
                  Member of Global CERT Community
                </p>
                <p className="flex items-center gap-2 text-lg mb-2">
                  <HugeiconsIcon
                    icon={ComputerProtectionIcon}
                    size={28}
                    color="currentColor"
                    className="text-primary font-semibold"
                  />
                  Protected 500+ Organizations
                </p>
                <p className="flex items-center gap-2 text-lg mb-2">
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    size={28}
                    color="currentColor"
                    className="text-primary font-semibold"
                  />
                  Trained 2000+ Professionals
                </p>
              </div>
            </div>
            <div className="group bg-white border-2 border-border rounded-2xl p-8 hover-lift card-interactive relative overflow-hidden">
              {/* Accent corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

              <div className="mb-6 relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <HugeiconsIcon
                    icon={Scroll01Icon}
                    size={32}
                    color="currentColor"
                    className="text-primary group-hover:text-white transition-colors"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                NITDA SRAP Pillars We Abide By
              </h2>
              <div className="text-[#737373] ">
                <div className="gap-2 text-lg mb-2 flex items-center">
                  <HugeiconsIcon
                    icon={BrickWallShieldIcon}
                    size={28}
                    color="currentColor"
                    className="text-primary font-semibold"
                  />
                  <p>
                    <span className="font-semibold">Pillar 5</span> <br />
                    Strengthen Cybersecurity and Enhance Digital Trust.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-lg mb-2">
                  <HugeiconsIcon
                    icon={Agreement01Icon}
                    size={28}
                    color="currentColor"
                    className="text-primary font-semibold"
                  />
                  <p>
                    <span className="font-semibold">Pillar 7</span> <br /> Forge
                    Strategic Partnerships and Collaborations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="bg-secondary p-8 mt-10 max-w-xl mx-auto rounded-2xl border border-border group hover-lift card-interactive">
            <h3 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
              Notable Mentions
            </h3>
            <div className="text-[#737373]">
              <p className="flex items-center gap-2 text-lg mb-2">
                <HugeiconsIcon
                  icon={Certificate01Icon}
                  size={28}
                  color="currentColor"
                  className="text-primary font-semibold"
                />
                ISO 27001 Certified
              </p>
              <p className="flex items-center gap-2 text-lg mb-2">
                <HugeiconsIcon
                  icon={GlobalIcon}
                  size={28}
                  color="currentColor"
                  className="text-primary font-semibold"
                />
                Member of Global CERT Community
              </p>
              <p className="flex items-center gap-2 text-lg mb-2">
                <HugeiconsIcon
                  icon={ComputerProtectionIcon}
                  size={28}
                  color="currentColor"
                  className="text-primary font-semibold"
                />
                Protected 500+ Organizations
              </p>
              <p className="flex items-center gap-2 text-lg mb-2">
                <HugeiconsIcon
                  icon={UserGroupIcon}
                  size={28}
                  color="currentColor"
                  className="text-primary font-semibold"
                />
                Trained 2000+ Professionals
              </p>
            </div>
          </div> */}
        </div>
      </section>

      {/* Key Achievements */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10 pattern-dots"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative animate-slide-in-up">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary-foreground/70 font-semibold text-sm uppercase tracking-wider bg-white/10 px-4 py-2 rounded-full border border-white/20">
                Our Impact
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
              Key Achievements
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Milestones that demonstrate our commitment to securing
              Nigeria&apos;s digital landscape
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                value: "2018",
                label: "Established",
                subtitle: "Year CERRT was founded",
              },
              {
                value: "24/7",
                label: "Monitoring",
                subtitle: "Round-the-clock monitoring",
              },
              {
                value: "1500+",
                label: "Incidents Handled",
                subtitle: "Successfully resolved cases",
              },
              {
                value: "200+",
                label: "Partner Organizations",
                subtitle: "Trusted collaborators",
              },
            ].map((stat, index) => (
              <div key={index} className="group text-center cursor-pointer">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 group-hover:bg-white/20 group-hover:scale-101 transition-all duration-300">
                    <div className="text-5xl md:text-6xl font-bold mb-2 group-hover:scale-110 transition-transform">
                      {stat.value}
                    </div>
                  </div>
                </div>
                <div className="text-primary-foreground font-bold text-lg mb-1">
                  {stat.label}
                </div>
                <div className="text-primary-foreground/70 text-sm">
                  {stat.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-slide-in-up">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Our Principles
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our work and define our commitment to
              Nigeria’s cybersecurity.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-white border-2 border-border rounded-2xl p-8 text-center hover-lift card-interactive relative overflow-hidden"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                <div className="flex justify-center mb-6 relative z-10">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <HugeiconsIcon
                      icon={value.icon}
                      size={40}
                      color="currentColor"
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Partners */}
      <section className="py-20 bg-secondary/30 pattern-dots relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Collaborations
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Our Partners
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We collaborate with leading organizations to strengthen Nigeria’s
              cybersecurity posture.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="group bg-white border-2 border-border rounded-2xl p-10 flex flex-col items-center justify-center hover-lift card-interactive relative overflow-hidden"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                <Image
                  src={partner.logo}
                  width={100}
                  height={100}
                  alt={partner.name}
                  className="mb-4 group-hover:scale-110 transition-transform duration-300 h-20 object-contain"
                />
                <p className="sr-only text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 my-20 max-w-8xl rounded-4xl mx-auto bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10 pattern-dots"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></div>
            <span className="text-primary-foreground/70 text-sm font-semibold uppercase tracking-wider">
              Get In Touch
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif leading-tight">
            Join Us in Securing Nigeria&apos;s Digital Future
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 leading-relaxed">
            Whether you&apos;re reporting an incident or seeking cybersecurity
            guidance, we&apos;re here to help 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-white/90 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Contact Us
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
            </Link>
            <Link
              href="/services"
              className="group cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Our Services
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
