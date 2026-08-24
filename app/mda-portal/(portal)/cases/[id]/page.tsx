"use client";

import { useState, use } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Comment01Icon,
  SentIcon,
  Shield01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { useMdaIncidentDetailQuery, usePostMdaMessage } from "@/hooks/use-mda-incidents";

export default function MdaCaseDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const incidentId = params.id;

  const [messageInput, setMessageInput] = useState("");
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");

  const { data: incident, isLoading: loading, isError, error: queryError } = useMdaIncidentDetailQuery(incidentId);
  const postMessageMutation = usePostMdaMessage();

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setPostError("");
    setPostSuccess("");

    if (messageInput.trim().length < 2) {
      setPostError("Please enter a response message.");
      return;
    }

    postMessageMutation.mutate(
      {
        incidentId,
        messageBody: messageInput,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            setMessageInput("");
            setPostSuccess("Response posted successfully to CERRT SOC thread.");
          } else {
            setPostError(res.error);
          }
        },
        onError: (err) => {
          setPostError((err as Error).message || "Failed to post response.");
        },
      },
    );
  };

  const error = isError ? (queryError as Error)?.message : "";

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
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} className="mr-1" />
          Back to Cases List
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-sm font-medium">
          {error || "Incident report not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/mda-portal/cases"
          className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-xs transition-all"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} className="mr-1.5" />
          Back to Incident Cases
        </Link>

        <div className="flex items-center space-x-2">
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
        </div>
      </div>

      {/* Main Incident Summary Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 text-[10px] font-bold uppercase">
                {incident.type}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  incident.severity === "critical" || incident.severity === "high"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                Severity: {incident.severity}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
              {incident.title || incident.type}
            </h1>
          </div>

          <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-xs shrink-0 space-y-1">
            <div className="text-[10px] uppercase font-bold text-gray-400">SOC Ref ID</div>
            <div className="font-mono font-bold text-slate-900">
              {incident.thehiveCaseId ? (
                <span className="text-purple-700">{incident.thehiveCaseId}</span>
              ) : (
                <span className="text-gray-400 font-normal">Pending Sync</span>
              )}
            </div>
          </div>
        </div>

        {/* Description Body */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Incident Description
          </h2>
          <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
            {incident.description}
          </div>
        </div>

        {/* Reporter Contact Footer */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1.5">
            <HugeiconsIcon icon={UserIcon} size={14} className="text-gray-400" />
            <span>Reporter: <strong>{incident.contactName}</strong> ({incident.contactEmail})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <HugeiconsIcon icon={Clock01Icon} size={14} className="text-gray-400" />
            <span>Submitted: {new Date(incident.submittedAt).toLocaleString("en-GB")}</span>
          </div>
        </div>
      </div>

      {/* Two-Way Communication Thread */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <HugeiconsIcon icon={Comment01Icon} size={20} className="text-primary" />
            SOC Communication & Investigation Thread
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            {incident.caseCommunications?.length ?? 0} Messages
          </span>
        </div>

        {/* Message Thread List */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {!incident.caseCommunications || incident.caseCommunications.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-xs text-gray-500">
              No messages posted yet. Use the form below to communicate with CERRT SOC analysts.
            </div>
          ) : (
            incident.caseCommunications.map((comm) => {
              const isOfficer = comm.senderType === "mda_poc";

              return (
                <div
                  key={comm.id}
                  className={`flex flex-col ${isOfficer ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs shadow-2xs space-y-1.5 ${
                      isOfficer
                        ? "bg-primary text-primary-foreground rounded-br-xs"
                        : "bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 border-b border-white/20 pb-1 mb-1">
                      <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                        {isOfficer ? (
                          <>
                            <HugeiconsIcon icon={UserIcon} size={12} />
                            MDA Officer
                          </>
                        ) : (
                          <>
                            <HugeiconsIcon icon={Shield01Icon} size={12} />
                            CERRT SOC Analyst
                          </>
                        )}
                      </span>
                      <span>
                        {new Date(comm.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap leading-relaxed">{comm.messageBody}</p>

                    {comm.attachmentName && (
                      <div className="pt-1.5 text-[11px] font-mono underline opacity-90">
                        Attachment: {comm.attachmentName}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Response Posting Form */}
        <form onSubmit={handlePostMessage} className="border-t border-gray-100 pt-5 space-y-3">
          {postError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
              {postError}
            </div>
          )}

          {postSuccess && (
            <div className="bg-primary/10 border border-primary/20 text-primary text-xs p-3 rounded-xl flex items-center space-x-1.5">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
              <span>{postSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Post Response to CERRT SOC
            </label>
            <textarea
              rows={3}
              required
              placeholder="Type investigation updates, additional indicators, or questions for CERRT SOC..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 shadow-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={postMessageMutation.isPending || messageInput.trim().length < 2}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-light text-primary-foreground shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <HugeiconsIcon icon={SentIcon} size={16} className="mr-1.5" />
              {postMessageMutation.isPending ? "Sending..." : "Send Response"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
