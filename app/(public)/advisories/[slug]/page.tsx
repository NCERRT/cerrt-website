import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  IdentificationIcon,
  Download01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { getAdvisoryBySlugAction } from "@/app/actions/advisories";
import { getSeverityColor, formatDate } from "@/components/advisory-card";

export default async function AdvisoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const advisory = await getAdvisoryBySlugAction(resolvedParams.slug);

  if (!advisory) {
    notFound();
  }

  const isStandard = advisory.type === "standard";
  const isPoster = advisory.type === "poster";

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      {/* Header section with back button */}
      <div className="bg-secondary py-12 pattern-dots border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/advisories"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6 font-medium"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} className="mr-2" />
            Back to Advisories
          </Link>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${getSeverityColor(advisory.severity)}`}
            >
              {advisory.severity} Severity
            </span>
            <span className="px-4 py-1.5 bg-white text-muted-foreground rounded-full text-sm font-semibold border border-border capitalize">
              {advisory.category}
            </span>
            <span className="sm:ml-auto flex items-center gap-2 text-sm font-semibold text-primary">
              <HugeiconsIcon icon={IdentificationIcon} size={18} />
              {advisory.advisoryId}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-serif leading-tight">
            {advisory.title}
          </h1>

          <div className="flex max-sm:flex-col sm:items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <HugeiconsIcon icon={Calendar01Icon} size={18} />
              Published: {formatDate(advisory.date)}
            </span>
            {advisory.tags && advisory.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {advisory.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview Section */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-border mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-4">
              Overview
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="whitespace-pre-wrap leading-relaxed">
                {advisory.overview || advisory.description}
              </p>
            </div>
          </section>

          {isStandard && (
            <div className="space-y-8">
              {/* Impact */}
              {advisory.impact && (
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-4">
                    Impact
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {advisory.impact}
                  </p>
                </section>
              )}

              {/* Affected Products */}
              {advisory.affectedProducts &&
                advisory.affectedProducts.length > 0 && (
                  <section className="bg-white rounded-2xl p-8 shadow-sm border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-4">
                      Affected Products
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      {advisory.affectedProducts.map((product, i) => (
                        <li key={i}>{product}</li>
                      ))}
                    </ul>
                  </section>
                )}

              {/* Recommended Actions */}
              {advisory.recommendedActions &&
                advisory.recommendedActions.length > 0 && (
                  <section className="bg-white rounded-2xl p-8 shadow-sm border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-4">
                      Recommended Actions
                    </h2>
                    <ul className="space-y-3 list-disc pl-5 text-muted-foreground">
                      {advisory.recommendedActions.map((action, i) => (
                        <li key={i}>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

              {/* References */}
              {advisory.references && advisory.references.length > 0 && (
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-4">
                    References
                  </h2>
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    {advisory.references.map((ref, i) => {
                      const isUrl = ref.startsWith("http");
                      return (
                        <li key={i}>
                          {isUrl ? (
                            <a
                              href={ref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all"
                            >
                              {ref}
                            </a>
                          ) : (
                            <span className="break-all">{ref}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {/* Attached Image / Diagram */}
              {advisory.fileUrl && advisory.fileType === "image" && (
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">
                    Images
                  </h2>
                  <div className="relative w-full rounded-xl overflow-hidden border-2 border-border flex flex-col items-center">
                    <Image
                      src={advisory.fileUrl}
                      alt={advisory.fileName || advisory.title}
                      width={1000}
                      height={750}
                      className="object-contain w-full h-auto"
                      unoptimized
                    />
                    <div className="absolute top-4 right-4">
                      <a
                        href={advisory.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary-light hover:scale-105 shadow-lg backdrop-blur-sm transition-all flex items-center justify-center"
                        title="Download Image"
                      >
                        <HugeiconsIcon
                          icon={Download01Icon}
                          size={24}
                          color="currentColor"
                        />
                      </a>
                    </div>
                  </div>
                </section>
              )}

              {/* PDF Download */}
              {advisory.fileUrl && advisory.fileType === "pdf" && (
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-border text-center">
                  <h3 className="text-xl font-bold mb-4">
                    Detailed Advisory Document
                  </h3>
                  <a
                    href={advisory.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-light transition-colors gap-2"
                  >
                    <HugeiconsIcon icon={Download01Icon} size={20} />
                    Download PDF
                  </a>
                </section>
              )}
            </div>
          )}

          {isPoster &&
            advisory.posterItems &&
            advisory.posterItems.length > 0 && (
              <div className="space-y-8">
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                    Advisory Posters
                  </h2>
                  <div className="grid gap-8">
                    {advisory.posterItems
                      .sort((a, b) => a.order - b.order)
                      .map((poster) => (
                        <div
                          key={poster.id}
                          className="relative w-full rounded-xl overflow-hidden border-2 border-border flex flex-col items-center"
                        >
                          <Image
                            src={poster.fileUrl}
                            alt={`Poster ${poster.order + 1}`}
                            width={800}
                            height={1000}
                            className="object-contain w-full h-auto"
                            unoptimized
                          />
                          <div className="absolute top-4 right-4">
                            <a
                              href={poster.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary-light hover:scale-105 shadow-lg backdrop-blur-sm transition-all flex items-center justify-center"
                              title="Download Full Image"
                            >
                              <HugeiconsIcon
                                icon={Download01Icon}
                                size={24}
                                color="currentColor"
                              />
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              </div>
            )}
        </div>
      </div>
    </main>
  );
}
