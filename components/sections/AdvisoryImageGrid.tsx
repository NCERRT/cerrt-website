"use client";

import Image from "next/image";
import type { AdvisoryWithFileUrl } from "@/app/actions/advisories";

/**
 * Grid of image-type advisories (posters, infographics).
 * Renders nothing if there are none.
 */
export default function AdvisoryImageGrid({
  advisories,
}: {
  advisories: AdvisoryWithFileUrl[];
}) {
  if (advisories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {advisories.map((a) => (
        <ImageCard key={a.id} advisory={a} />
      ))}
    </div>
  );
}

function ImageCard({ advisory }: { advisory: AdvisoryWithFileUrl }) {
  if (!advisory.fileUrl) return null;
  return (
    <div className="group relative aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 hover-lift">
      <Image
        src={advisory.fileUrl}
        alt={advisory.title}
        fill
        unoptimized
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h4 className="text-white font-bold text-sm line-clamp-2">
            {advisory.title}
          </h4>
        </div>
      </div>
      <a
        href={advisory.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0"
        aria-label={`View ${advisory.title}`}
      />
    </div>
  );
}
