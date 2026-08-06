import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  IdentificationIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import type { AdvisoryDetailWithUrls } from "@/app/actions/advisories";

export function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-destructive text-white";
    case "high":
      return "bg-warning text-white";
    case "medium":
      return "bg-accent text-white";
    case "low":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function AdvisoryCard({
  advisory,
  index = 0,
}: {
  advisory: AdvisoryDetailWithUrls;
  index?: number;
}) {
  const detailUrl = `/advisories/${advisory.slug || advisory.id}`;
  const posterPreviewUrl =
    advisory.type === "poster" && advisory.posterItems?.length > 0
      ? advisory.posterItems[0].fileUrl
      : null;

  return (
    <article
      className="group bg-white border-2 border-border rounded-2xl p-6 hover-lift relative overflow-hidden animate-slide-in-up flex flex-col h-full"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Accent bar based on severity */}
      {/* <div
        className={`absolute top-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${
          advisory.severity === "critical"
            ? "bg-destructive"
            : advisory.severity === "high"
              ? "bg-warning"
              : advisory.severity === "medium"
                ? "bg-accent"
                : "bg-muted-foreground"
        }`}
      ></div> */}

      {/* Severity & Category Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityColor(
            advisory.severity,
          )}`}
        >
          {advisory.severity}
        </span>
        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold capitalize">
          {advisory.category}
        </span>
        <span className="ml-auto px-2 py-1 flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 rounded capitalize border border-border">
          {advisory.type}
        </span>
      </div>

      {/* Advisory ID */}
      <div className="flex items-center gap-2 mb-3">
        <HugeiconsIcon
          icon={IdentificationIcon}
          size={16}
          color="currentColor"
          className="text-primary"
        />
        <span className="text-sm font-bold text-primary">
          {advisory.advisoryId}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
        <Link href={detailUrl} className="after:absolute after:inset-0">
          {advisory.title}
        </Link>
      </h2>

      {/* Description / Overview */}
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3 flex-1">
        {advisory.overview || advisory.description}
      </p>

      {/* Poster Preview */}
      {posterPreviewUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border mb-4">
          <Image
            src={posterPreviewUrl}
            alt={advisory.title}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Date and View Details Link */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HugeiconsIcon icon={Calendar01Icon} size={16} color="currentColor" />
          <span className="font-medium">{formatDate(advisory.date)}</span>
        </div>

        <div className="flex items-center text-primary text-sm font-bold group-hover:translate-x-1 transition-transform relative z-10">
          View Details
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
        </div>
      </div>
    </article>
  );
}
