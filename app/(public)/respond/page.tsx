"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Clock01Icon,
  Shield01Icon,
  FileUploadIcon,
  File02Icon,
  InformationCircleIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import {
  validateTokenAction,
  submitMdaResponseAction,
} from "@/app/actions/respond";
import { compressEvidenceImage } from "@/lib/client/imageCompression";

function RespondFormContent() {
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [tokenState, setTokenState] = useState<
    | {
        status: "valid";
        caseTitle: string;
        caseType: string;
        submittedAt: Date;
        analystRequest?: string | null;
      }
    | { status: "error"; reason: "not_found" | "already_used" | "expired" | "missing_token" }
  >({ status: "error", reason: "missing_token" });

  const [messageBody, setMessageBody] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string>("");

  const checkToken = useCallback(async () => {
    if (!rawToken.trim()) {
      setTokenState({ status: "error", reason: "missing_token" });
      setLoading(false);
      return;
    }

    try {
      const res = await validateTokenAction(rawToken.trim());
      if (!res.valid) {
        setTokenState({
          status: "error",
          reason: res.reason,
        });
      } else {
        const report = res.tokenData.incidentReport;
        setTokenState({
          status: "valid",
          caseTitle: report.title || `Incident Report`,
          caseType: report.type,
          submittedAt: report.submittedAt,
          analystRequest: res.tokenData.analystRequest,
        });
      }
    } catch {
      setTokenState({ status: "error", reason: "not_found" });
    } finally {
      setLoading(false);
    }
  }, [rawToken]);

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    const validNewFiles: File[] = [];

    for (const file of newFiles) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setFileError(`"${file.name}" is not supported. Only PNG, JPG, and JPEG images are allowed.`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds the 5MB per-file size limit.`);
        return;
      }

      validNewFiles.push(file);
    }

    if (selectedFiles.length + validNewFiles.length > 3) {
      setFileError("You can attach a maximum of 3 evidence images.");
      return;
    }

    const totalPayloadBytes = [...selectedFiles, ...validNewFiles].reduce(
      (sum, f) => sum + f.size,
      0
    );
    if (totalPayloadBytes > 14 * 1024 * 1024) {
      setFileError("Total upload size exceeds 14MB. Please attach smaller image files.");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validNewFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!messageBody.trim()) {
      setFormError("Please provide a response message.");
      return;
    }

    const totalPayloadBytes = selectedFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalPayloadBytes > 14 * 1024 * 1024) {
      setFormError("Total attachment size exceeds 14MB limit. Please reduce image sizes before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Compress evidence images in browser before network transmission
      const optimizedFiles = await Promise.all(
        selectedFiles.map((file) => compressEvidenceImage(file))
      );

      const formData = new FormData();
      formData.append("token", rawToken.trim());
      formData.append("messageBody", messageBody.trim());
      for (const file of optimizedFiles) {
        formData.append("files", file);
      }

      await submitMdaResponseAction(formData);
      setSubmitSuccess(true);
    } catch (err) {
      const errorMsg = (err as Error).message || "";
      if (errorMsg.includes("Body exceeded") || errorMsg.includes("413") || errorMsg.includes("limit")) {
        setFormError("The uploaded files exceed the server limit. Please attach smaller images and try again.");
      } else {
        setFormError(errorMsg || "Failed to submit response. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error States
  if (tokenState.status === "error") {
    const errorDetails = {
      missing_token: {
        title: "Link Required",
        message: "No token was provided in the link. Please access this page using the link sent in your email request.",
        icon: Shield01Icon,
      },
      not_found: {
        title: "Invalid Secure Link",
        message: "This secure link could not be found. Please verify the link in your email or contact CERRT.",
        icon: CancelCircleIcon,
      },
      already_used: {
        title: "Link Already Used",
        message: "This one-time link has already been used to submit a response. Each request link can only be used once for security.",
        icon: CheckmarkCircle02Icon,
      },
      expired: {
        title: "Link Expired",
        message: "This secure link has expired (links remain valid for 72 hours). Please contact the CERRT analyst to request a new link.",
        icon: Clock01Icon,
      },
    }[tokenState.reason];

    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-md text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <HugeiconsIcon icon={errorDetails.icon} size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 font-serif">
            {errorDetails.title}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            {errorDetails.message}
          </p>
        </div>
      </div>
    );
  }

  // Success State
  if (submitSuccess) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-md text-center space-y-5">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={36} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">
              Response Submitted Successfully
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Thank you for providing the requested information. The CERRT Incident Response Team has received your submission and it has been securely attached to the case file.
            </p>
          </div>
          <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
            This one-time link is now consumed and deactivated.
          </div>
        </div>
      </div>
    );
  }

  // Valid Token — Render Form
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-6 md:p-8 border-b border-gray-200">
          <div className="flex items-center gap-3 text-primary mb-2">
            <HugeiconsIcon icon={Shield01Icon} size={24} />
            <span className="text-xs uppercase font-bold tracking-wider">
              CERRT Secure Analyst Communication
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif mb-2">
            Respond to Information Request
          </h1>
          <p className="text-sm text-gray-600">
            Case Subject: <strong className="text-gray-900">{tokenState.caseTitle}</strong> ({tokenState.caseType})
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-2.5 p-4 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
            <HugeiconsIcon icon={InformationCircleIcon} size={18} className="text-blue-700 shrink-0 mt-0.5" />
            <span>
              You are submitting official information in response to an analyst request. This submission is transmitted securely via encryption and linked directly to your case record.
            </span>
          </div>

          {tokenState.analystRequest && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <HugeiconsIcon icon={Shield01Icon} size={16} className="text-amber-700" />
                <span>Request Details From CERRT Analyst</span>
              </div>
              <p className="text-sm text-amber-950 whitespace-pre-wrap leading-relaxed">
                {tokenState.analystRequest}
              </p>
            </div>
          )}

          {/* Response Text Area */}
          <div className="space-y-2">
            <label htmlFor="messageBody" className="block text-sm font-semibold text-gray-900">
              Information / Clarification Requested *
            </label>
            <textarea
              id="messageBody"
              rows={6}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              required
              maxLength={10000}
              placeholder="Provide detailed information, clarification, or incident responses as requested by the CERRT analyst..."
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-y"
            />
            <div className="text-xs text-gray-500 text-right">
              {messageBody.length}/10000 characters
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-900">
                Evidence Image Attachments (Optional)
              </label>
              <span className="text-xs text-gray-500 font-medium">
                {selectedFiles.length}/3 images selected
              </span>
            </div>

            <div className="border-2 border-dashed border-gray-200 hover:border-primary rounded-xl p-6 text-center transition-colors">
              <input
                type="file"
                id="evidence-file"
                accept=".png,.jpg,.jpeg"
                multiple
                disabled={selectedFiles.length >= 3}
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="evidence-file"
                className={`inline-flex flex-col items-center gap-2 ${
                  selectedFiles.length >= 3 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <HugeiconsIcon icon={FileUploadIcon} size={20} />
                </div>
                <span className="text-sm font-semibold text-primary">
                  {selectedFiles.length >= 3
                    ? "Maximum 3 evidence images reached"
                    : "Click to select screenshot or evidence images"}
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, or JPEG • Max 5MB per file • Up to 3 images
                </span>
              </label>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2 text-left">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-xs text-gray-800 border border-gray-200"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <HugeiconsIcon
                          icon={File02Icon}
                          size={16}
                          className="text-primary shrink-0"
                        />
                        <span className="font-medium truncate">{file.name}</span>
                        <span className="text-gray-500 shrink-0">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-red-600 hover:underline font-semibold ml-2 shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {fileError && <p className="text-xs text-red-600 font-medium">{fileError}</p>}
          </div>

          {formError && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 font-medium">
              <HugeiconsIcon icon={Alert02Icon} size={18} className="text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSubmitting ? "Submitting Response..." : "Submit Response"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RespondPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <RespondFormContent />
    </Suspense>
  );
}
