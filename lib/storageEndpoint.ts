/**
 * Resolves the object-storage configuration for use in:
 * - next.config.ts (images.remotePatterns and CSP headers)
 * - lib/server/storage.ts (AWS S3Client endpoint initialization)
 *
 * This file MUST NOT import node-only APIs, server-only, or third-party SDKs
 * so it remains safe to import in next.config.ts during compile time.
 */

export interface StorageConfig {
  protocol: "http" | "https";
  hostname: string;
  port: string;
  origin: string;
  endpoint: string;
}

export function resolveStorageConfig(): StorageConfig {
  const s3Endpoint = process.env.S3_ENDPOINT;
  if (s3Endpoint) {
    try {
      const url = new URL(s3Endpoint);
      const protocol = url.protocol === "https:" ? "https" : "http";
      const port = url.port;
      const origin = `${protocol}://${url.hostname}${port ? `:${port}` : ""}`;
      return {
        protocol,
        hostname: url.hostname,
        port,
        origin,
        endpoint: s3Endpoint,
      };
    } catch {
      // Log loudly - a runtime throw would surface as a Next.js server digest error
      //  to end users). This shows up in Vercel logs so misconfig is diagnosable.
      console.error(
        `[storageEndpoint] S3_ENDPOINT is set but is not a valid URL: ${JSON.stringify(
          s3Endpoint,
        )}. Falling back to MINIO_* env vars — storage operations will likely fail until this is fixed.`,
      );
    }
  }

  const hostname = process.env.MINIO_ENDPOINT ?? "localhost";
  const rawPort = process.env.MINIO_PORT ?? "9000";
  const protocol =
    (process.env.MINIO_USE_SSL ?? "").toLowerCase() === "true"
      ? "https"
      : "http";
  const port = rawPort === "80" || rawPort === "443" ? "" : rawPort;
  const origin = `${protocol}://${hostname}${port ? `:${port}` : ""}`;
  const endpoint = `${protocol}://${hostname}:${rawPort}`;

  return {
    protocol,
    hostname,
    port,
    origin,
    endpoint,
  };
}
