import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Search01Icon,
  LockPasswordIcon,
  UserLove02Icon,
  // BookOpen02Icon,
  // Settings02Icon,
  Clock02Icon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";

export const metadata: Metadata = {
  title: "Our Services | CERRT",
  description:
    "Comprehensive cybersecurity services to protect Nigeria's digital infrastructure",
};

export default function ServicesPage() {
  const services = [
    {
      title: "24/7 Incident Response",
      timing: "< 1 Hour",
      frequency: "24/7/365",
      description:
        "Round-the-clock emergency response to cybersecurity incidents affecting Nigerian organizations.",
      features: [
        "Immediate incident triage",
        "Forensic analysis",
        "Containment strategies",
        "Recovery assistance",
      ],
      icon: Alert02Icon,
    },
    {
      title: "Threat Intelligence",
      timing: "Real-time",
      frequency: "Continuous",
      description:
        "Real-time threat analysis and intelligence sharing to help organizations stay ahead of cyber threats.",
      features: [
        "Threat landscape analysis",
        "IOC sharing",
        "Attack pattern recognition",
        "Predictive analytics",
      ],
      icon: Search01Icon,
    },
    {
      title: "Vulnerability Assessment",
      timing: "2-5 days",
      frequency: "On-demand",
      description:
        "Comprehensive security assessments to identify and remediate vulnerabilities in your systems.",
      features: [
        "Network scanning",
        "Web application testing",
        "Remediation guidance",
        "Infrastructure review",
      ],
      icon: LockPasswordIcon,
    },
    {
      title: "Security Awareness Training",
      timing: "1-2 weeks",
      frequency: "Scheduled",
      description:
        "Educational programs to improve cybersecurity awareness across Nigeria’s digital ecosystem.",
      features: [
        "Customized training modules",
        "Phishing simulations",
        "Security workshops",
      ],
      icon: UserLove02Icon,
    },
    // {
    //   title: "Capacity Building",
    //   timing: "2-4 weeks",
    //   frequency: "Quarterly",
    //   description:
    //     "Training and certification programs for cybersecurity professionals and security teams.",
    //   features: [
    //     "Technical training",
    //     "Leadership development",
    //     "Mentorship programs",
    //     "Best practices workshops",
    //   ],
    //   icon: BookOpen02Icon,
    // },
    // {
    //   title: "Advisory Services",
    //   timing: "3-7 days",
    //   frequency: "Business hours",
    //   description:
    //     "Expert consultation and guidance on cybersecurity policies and implementation strategies",
    //   features: [
    //     "Risk assessment",
    //     "Strategic planning",
    //     "Policy development",
    //     "Compliance guidance",
    //   ],
    //   icon: Settings02Icon,
    // },
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
                Cybersecurity Solutions
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-serif leading-tight">
              Our Services
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Comprehensive cybersecurity services designed to protect Nigeria’s
              digital infrastructure and support organizations in building
              resilient security postures.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-slide-in-up">
          <div className="grid md:grid-cols-2  gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative bg-white border-2 border-border rounded-2xl p-8 hover-lift card-interactive flex flex-col overflow-hidden"
              >
                {/* Accent corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>

                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <HugeiconsIcon
                      icon={service.icon}
                      size={32}
                      color="currentColor"
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <div className="flex items-center gap-6">
                      {/* Timing */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HugeiconsIcon
                          icon={Clock02Icon}
                          size={16}
                          color="currentColor"
                          className="text-primary font-semibold"
                        />
                        <span>{service.timing}</span>
                      </div>
                      {/* Frequency */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HugeiconsIcon
                          icon={RepeatIcon}
                          size={16}
                          color="currentColor"
                          className="text-primary font-semibold"
                        />
                        <span>{service.frequency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-base mb-6 flex-1 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    Key Features
                  </h4>
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-3 text-sm text-muted-foreground group/item"
                      >
                        <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-success/20 transition-colors">
                          <svg
                            className="w-3 h-3 text-success"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="group-hover/item:text-foreground transition-colors">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Link
                  href="/contact"
                  className="group/btn cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-light hover:shadow-lg transition-all duration-300"
                >
                  Learn More
                  <svg
                    className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 my-20 max-w-8xl mx-auto rounded-4xl bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10 pattern-dots"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-slide-in-up">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></div>
            <span className="text-primary-foreground/70 text-sm font-semibold uppercase tracking-wider">
              Get Started
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif leading-tight">
            Need Cybersecurity Support?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            Our team of experts is ready to help you protect your organization.
            Get in touch to discuss your specific security needs.
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
              href="/about"
              className="group cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              Learn About Us
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
