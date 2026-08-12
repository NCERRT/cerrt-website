import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateApiKey } from "@/lib/server/apiAuth";
import { getEvidenceFileObject } from "@/lib/server/storage";
import { checkRateLimit } from "@/lib/server/rateLimit";
import type { Readable } from "node:stream";

export async function GET(request: NextRequest) {
  // 1. Validate API Key first (before rate limiting, so unauthenticated
  //    requests can't burn the rate limit bucket for legitimate callers)
  const auth = await validateApiKey(request);
  if (!auth.valid) {
    return NextResponse.json(
      { error: "Unauthorized. Valid Bearer API key required." },
      { status: 401 },
    );
  }

  // 2. Rate limiting by authenticated key ID (20 requests per minute)
  const rateLimitId = auth.apiKey.id;
  try {
    await checkRateLimit(rateLimitId, "api_evidence_download");
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Rate limit exceeded." },
      { status: 429 },
    );
  }

  // 3. Extract & Validate `key` parameter
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key || !key.trim()) {
    return NextResponse.json(
      { error: "Missing required 'key' query parameter." },
      { status: 400 },
    );
  }

  const normalizedKey = key.trim();

  // Security guardrails: path traversal & bucket scoping
  if (!normalizedKey.startsWith("evidence/") || normalizedKey.includes("..")) {
    return NextResponse.json(
      { error: "Invalid file key. Key must start with 'evidence/'." },
      { status: 400 },
    );
  }

  // 4. Fetch binary file object from storage
  try {
    const storageObject = await getEvidenceFileObject(normalizedKey);

    if (!storageObject.Body) {
      return NextResponse.json(
        { error: "File content is empty or unreadable." },
        { status: 404 },
      );
    }

    const contentType = storageObject.ContentType || "application/octet-stream";
    const filename = normalizedKey.split("/").pop() || "evidence-file";

    // Convert S3 Body stream to Web ReadableStream for Next.js NextResponse
    const nodeStream = storageObject.Body as Readable;
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: Buffer) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err: Error) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename.replace(/[\r\n"]/g, "_")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Evidence file not found in storage." },
      { status: 404 },
    );
  }
}
