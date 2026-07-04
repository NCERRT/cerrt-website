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
    } catch (e) {
      // Fall back if the URL is invalid
    }
  }

  const hostname = process.env.MINIO_ENDPOINT ?? "localhost";
  const rawPort = process.env.MINIO_PORT ?? "9000";
  const protocol = process.env.MINIO_USE_SSL === "true" ? "https" : "http";
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
