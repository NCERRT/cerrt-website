"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Comment01Icon,
  SentIcon,
  Shield01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { getMdaIncidentByIdAction, postMdaCaseCommunicationAction } from "@/app/actions/mdaPortal";

interface CommunicationItem {
  id: string;
  senderType: string;
  messageBody: string;
  attachmentKey: string | null;
  attachmentName: string | null;
  createdAt: string | Date;
}

interface IncidentDetail {
  id: string;
  title: string | null;
  type: string;
  description: string;
  severity: string;
  status: string;
  submittedAt: string | Date;
  thehiveCaseId: string | null;
  hiveStatus: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  caseCommunications: CommunicationItem[];
}

export default function MdaCaseDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const incidentId = params.id;

  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");

  const loadData = useCallback(() => {
    setLoading(true);
    getMdaIncidentByIdAction(incidentId)
      .then((res) => {
        if (res.success && res.data) {
          setIncident(res.data as unknown as IncidentDetail);
        } else if (!res.success) {
          setError(res.error);
        }
      })
      .catch(() => setError("Failed to load incident case details."))
      .finally(() => setLoading(false));
  }, [incidentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError("");
    setPostSuccess("");

    if (messageInput.trim().length < 2) {
      setPostError("Please enter a response message.");
      return;
    }

    setSending(true);

    try {
      const res = await postMdaCaseCommunicationAction({
        incidentId,
        messageBody: messageInput,
      });

      if (res.success) {
        setMessageInput("");
        setPostSuccess("Response posted successfully to CERRT SOC thread.");
        loadData();
      } else {
        setPostError(res.error);
      }
    } catch {
      setPostError("Failed to post message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 text-xs">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading incident details...
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="space-y-4">
        <Link
          href="/mda-portal/cases"
          className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-gray-900"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1" />
          Back to All Cases
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-sm">
          {error || "Incident report not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Back Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <Link
            href="/mda-portal/cases"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} className="mr-1" />
            Back to Incidents List
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {incident.title || incident.type}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Submitted on{" "}
            {new Date(incident.submittedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
              incident.status === "new"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : incident.status === "reviewing"
                ? "bg-purple-50 text-purple-700 border border-purple-200"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}
          >
            Status: {incident.status}
          </span>

          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold capitalize">
            {incident.severity} Severity
          </span>
        </div>
      </div>

      {/* Grid: Incident Metadata Card + Communication Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Incident Details Sidebar Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-xs h-fit">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <HugeiconsIcon icon={Alert02Icon} size={18} className="text-primary" />
            Case Metadata
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-gray-500 block mb-1">SOC Reference ID (TheHive):</span>
              {incident.thehiveCaseId ? (
                <span className="font-mono text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200 inline-block">
                  {incident.thehiveCaseId}
                </span>
              ) : (
                <span className="text-gray-400 italic">Pending Ingestion</span>
              )}
            </div>

            <div>
              <span className="text-gray-500 block mb-1">Incident Category:</span>
              <span className="text-gray-900 font-bold">{incident.type}</span>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <span className="text-gray-500 block mb-1">Reporting Officer:</span>
              <div className="font-bold text-gray-900 flex items-center space-x-1.5">
                <HugeiconsIcon icon={UserIcon} size={14} className="text-gray-400" />
                <span>{incident.contactName}</span>
              </div>
              <span className="text-[11px] text-gray-500 block mt-0.5">{incident.contactEmail}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <span className="text-gray-500 block mb-2 font-semibold">Incident Overview:</span>
            <div className="bg-slate-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
              {incident.description}
            </div>
          </div>
        </div>

        {/* Right: Two-Way Communication Thread */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <HugeiconsIcon icon={Comment01Icon} size={18} className="text-primary" />
              SOC Communication Thread
            </h2>
            <span className="text-[11px] text-gray-500 font-mono font-semibold">
              {incident.caseCommunications.length} Message(s)
            </span>
          </div>

          {/* Message List */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {incident.caseCommunications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs border border-dashed border-gray-200 rounded-xl">
                <HugeiconsIcon icon={Comment01Icon} size={28} className="mx-auto mb-2 text-gray-400" />
                No messages in this thread yet. Post a message below to communicate directly with CERRT SOC analysts.
              </div>
            ) : (
              incident.caseCommunications.map((msg) => {
                const isFromMda = msg.senderType === "mda_poc";

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isFromMda ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-xl rounded-2xl p-4 text-xs shadow-xs space-y-1.5 ${
                        isFromMda
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-slate-100 text-slate-900 border border-slate-200/80 rounded-tl-none"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-1.5">
                        <span className="font-bold text-[11px] flex items-center gap-1">
                          {isFromMda ? (
                            <>
                              <HugeiconsIcon icon={UserIcon} size={12} />
                              <span>MDA Reporting Officer</span>
                            </>
                          ) : (
                            <>
                              <HugeiconsIcon icon={Shield01Icon} size={12} className="text-primary" />
                              <span className="text-primary font-bold">CERRT SOC Analyst</span>
                            </>
                          )}
                        </span>
                        <span className={`text-[10px] ${isFromMda ? "opacity-80" : "text-gray-500"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.messageBody}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form */}
          <form onSubmit={handlePostMessage} className="border-t border-gray-100 pt-4 space-y-3">
            {postError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs">
                {postError}
              </div>
            )}
            {postSuccess && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-primary text-xs">
                {postSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Send Update to CERRT SOC Analysts
              </label>
              <textarea
                rows={3}
                required
                placeholder="Type your reply, containment update, or technical details here..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-300 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending || !messageInput.trim()}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-light text-primary-foreground shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {sending ? (
                  <span>Posting...</span>
                ) : (
                  <>
                    <HugeiconsIcon icon={SentIcon} size={14} className="mr-1.5" />
                    <span>Post Response</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
