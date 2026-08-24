"use client";

import { useState } from "react";
import { contactFormSchema, formatZodError } from "@/lib/schemas";
import { useSubmitContact } from "@/hooks/use-public";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Call02Icon,
  MailAtSign02Icon,
  Location01Icon,
  Clock01Icon,
  Alert02Icon,
  Message01Icon,
  FileScriptIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

type InquiryType =
  | "general"
  | "incident"
  | "advisory"
  | "training"
  | "partnership";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    subject: "",
    message: "",
    incidentType: "general" as InquiryType,
  });

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const submitContactMutation = useSubmitContact();
  const isSubmitting = submitContactMutation.isPending;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitStatus("idle");

    // Client-side Zod validation (immediate feedback)
    const parseResult = contactFormSchema.safeParse({
      inquiryType: formData.incidentType,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      organization: formData.organization || undefined,
      subject: formData.subject,
      message: formData.message,
    });

    if (!parseResult.success) {
      setErrorMessage(formatZodError(parseResult.error));
      setSubmitStatus("error");
      return;
    }

    submitContactMutation.mutate(
      {
        inquiryType: parseResult.data.inquiryType,
        name: parseResult.data.name,
        email: parseResult.data.email,
        phone: parseResult.data.phone || undefined,
        organization: parseResult.data.organization || undefined,
        subject: parseResult.data.subject,
        message: parseResult.data.message,
      },
      {
        onSuccess: () => {
          setSubmitStatus("success");
          setFormData({
            name: "",
            email: "",
            phone: "",
            organization: "",
            subject: "",
            message: "",
            incidentType: "general",
          });
        },
        onError: (error) => {
          const err = error as Error;
          setErrorMessage(err.message || "Failed to send message");
          setSubmitStatus("error");
        },
      },
    );
  };

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-secondary py-20 pattern-dots relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto animate-slide-in-up">
            <div className="inline-block mb-6">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Get In Touch
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-serif leading-tight">
              Contact <span className="text-primary">NITDA CERRT</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Get in touch with NITDA Computer Emergency Readiness and Response
              Team. We’re here to help protect your organization and respond to
              security incidents.
            </p>
          </div>
        </div>
      </section>

      {/* How Can We Help Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              How Can We Help?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Choose the appropriate contact method based on your needs and
              urgency level.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Emergency Incident Reporting */}
            <div className="group bg-white border-2 border-destructive/30 rounded-2xl p-8 hover-lift relative overflow-hidden animate-slide-in-up">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-destructive group-hover:scale-105 transition-all duration-300">
                  <HugeiconsIcon
                    icon={Alert02Icon}
                    size={28}
                    color="currentColor"
                    className="text-destructive group-hover:text-white transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-destructive transition-colors">
                    Emergency Incident Reporting
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    For immediate or active cybersecurity incidents requiring
                    urgent response
                  </p>
                </div>
              </div>
            </div>

            {/* General Inquiries */}
            <div
              className="group bg-white border-2 border-blue-500/30 rounded-2xl p-8 hover-lift relative overflow-hidden animate-slide-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:scale-105 transition-all duration-300">
                  <HugeiconsIcon
                    icon={Message01Icon}
                    size={28}
                    color="currentColor"
                    className="text-blue-600 group-hover:text-white transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
                    General Inquiries
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions about our services, partnerships, or general
                    information
                  </p>
                </div>
              </div>
            </div>

            {/* Advisory & Consultation */}
            <div
              className="group bg-white border-2 border-green-500/30 rounded-2xl p-8 hover-lift relative overflow-hidden animate-slide-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-500 group-hover:scale-105 transition-all duration-300">
                  <HugeiconsIcon
                    icon={FileScriptIcon}
                    size={28}
                    color="currentColor"
                    className="text-green-600 group-hover:text-white transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-green-600 transition-colors">
                    Advisory & Consultation
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    For cybersecurity advisory services and expert consultation
                  </p>
                </div>
              </div>
            </div>

            {/* Training & Capacity Building */}
            <div
              className="group bg-white border-2 border-purple-500/30 rounded-2xl p-8 hover-lift relative overflow-hidden animate-slide-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-purple-500 group-hover:scale-105 transition-all duration-300">
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    size={28}
                    color="currentColor"
                    className="text-purple-600 group-hover:text-white transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-purple-600 transition-colors">
                    Training & Capacity Building
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    For training programs, workshops, and capacity building
                    initiatives
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-20 bg-secondary/30 pattern-dots relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold text-foreground mb-8 font-serif">
                Contact Details
              </h2>

              <div className="space-y-4">
                <div className="group bg-white border-2 border-border rounded-2xl p-6 hover-lift relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                      <HugeiconsIcon
                        icon={Call02Icon}
                        size={24}
                        color="currentColor"
                        className="text-primary group-hover:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        Emergency Hotline
                      </h3>
                      <p className="text-muted-foreground font-semibold">
                        +234 (0) 817 877 4580
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Available 24/7
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white border-2 border-border rounded-2xl p-6 hover-lift relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                      <HugeiconsIcon
                        icon={MailAtSign02Icon}
                        size={24}
                        color="currentColor"
                        className="text-primary group-hover:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        Email
                      </h3>
                      <p className="text-muted-foreground">
                        cerrt@nitda.gov.ng
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white border-2 border-border rounded-2xl p-6 hover-lift relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                      <HugeiconsIcon
                        icon={Location01Icon}
                        size={24}
                        color="currentColor"
                        className="text-primary group-hover:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        Office Location
                      </h3>
                      <p className="text-muted-foreground">
                        28, Port Harcourt Crescent, Off Gimbiya Street
                        <br />
                        P.M.B 564, Area 11, Garki
                        <br /> Abuja, Nigeria.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white border-2 border-border rounded-2xl p-6 hover-lift relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                      <HugeiconsIcon
                        icon={Clock01Icon}
                        size={24}
                        color="currentColor"
                        className="text-primary group-hover:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        Working Hours
                      </h3>
                      <p className="text-muted-foreground">
                        24/7 Incident Response
                        <br />
                        Office: Mon - Fri, 8:30 AM - 4:30 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-destructive/10 border-2 border-destructive/30 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-destructive"></div>
                <h3 className="font-bold text-destructive mb-2 flex items-center gap-2 text-lg">
                  <HugeiconsIcon
                    icon={Alert02Icon}
                    size={24}
                    color="currentColor"
                  />
                  Emergency Alert
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  If you&apos;re experiencing an active cybersecurity incident,
                  call our emergency hotline immediately for rapid response.
                </p>
                <a
                  href="tel:+2348178774580"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-destructive text-white font-bold rounded-lg hover:bg-destructive/90 hover:shadow-lg transition-all duration-300"
                >
                  Call Emergency Line
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white border-2 border-border rounded-2xl p-8 md:p-10 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <h2 className="text-3xl font-bold text-foreground mb-8 font-serif">
                  Send Us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Incident Type */}
                  <div>
                    <label
                      htmlFor="incidentType"
                      className="block text-sm font-bold text-foreground mb-2"
                    >
                      Inquiry Type *
                    </label>
                    <select
                      id="incidentType"
                      name="incidentType"
                      value={formData.incidentType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="incident">Report Incident</option>
                      <option value="advisory">Advisory Request</option>
                      <option value="training">Training Request</option>
                      <option value="partnership">Partnership Inquiry</option>
                    </select>
                  </div>

                  {/* Name & Email */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-bold text-foreground mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-bold text-foreground mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        maxLength={254}
                        className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone & Organization */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-bold text-foreground mb-2"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={30}
                        className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="+234 XXX XXX XXXX"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="organization"
                        className="block text-sm font-bold text-foreground mb-2"
                      >
                        Organization
                      </label>
                      <input
                        type="text"
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        maxLength={200}
                        className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Your company name"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-bold text-foreground mb-2"
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      maxLength={200}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold text-foreground mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      maxLength={5000}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-all"
                      placeholder="Provide detailed information about your inquiry..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.message.length}/5000 characters
                    </p>
                  </div>

                  {/* Submit Status */}
                  {submitStatus === "success" && (
                    <div className="p-5 bg-success/10 border-2 border-success/30 rounded-xl text-success font-semibold flex items-center gap-3 animate-slide-in-up">
                      <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center shrink-0">
                        ✓
                      </div>
                      <span>
                        Message sent successfully! We&apos;ll get back to you
                        soon.
                      </span>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="p-5 bg-destructive/10 border-2 border-destructive/30 rounded-xl text-destructive font-semibold flex items-center gap-3 animate-slide-in-up">
                      <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center shrink-0">
                        ✗
                      </div>
                      <span>
                        {errorMessage ||
                          "Failed to send message. Please try again or call our hotline."}
                      </span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group cursor-pointer w-full px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-light hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? "Sending Message..." : "Send Message"}
                      {!isSubmitting && (
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
                      )}
                    </span>
                    {!isSubmitting && (
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    )}
                  </button>

                  <p className="text-sm text-muted-foreground text-center font-medium">
                    * Required fields
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
