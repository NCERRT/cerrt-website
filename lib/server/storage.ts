import "server-only";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { resolveStorageConfig } from "../storageEndpoint";

/**
 * S3-compatible object storage for advisory PDFs and images.
 *
 * Uses AWS SDK v3 (not the MinIO SDK) so the same code talks to:
 *   - Local MinIO (Docker, dev + org server)
 *   - Supabase Storage (Vercel preview)
 *   - AWS S3 / Cloudflare R2 (future)
 *
 * `forcePathStyle: true` is required for MinIO and Supabase Storage —
 * both address buckets as a path segment rather than a subdomain.
 */

const BUCKET =
  process.env.S3_BUCKET ?? process.env.MINIO_BUCKET ?? "cerrt-advisories";

const globalForS3 = globalThis as unknown as {
  s3: S3Client | undefined;
};

function createS3Client(): S3Client {
  return new S3Client({
    endpoint: resolveStorageConfig().endpoint,
    region: process.env.S3_REGION ?? "us-east-1",
    credentials: {
      accessKeyId:
        process.env.S3_ACCESS_KEY_ID ?? process.env.MINIO_ACCESS_KEY ?? "",
      secretAccessKey:
        process.env.S3_SECRET_ACCESS_KEY ?? process.env.MINIO_SECRET_KEY ?? "",
    },
    forcePathStyle: true,
  });
}

export const s3 = globalForS3.s3 ?? createS3Client();

if (process.env.NODE_ENV !== "production") {
  globalForS3.s3 = s3;
}

/**
 * Generate a unique, collision-resistant object key for an uploaded file.
 * The original extension is preserved; the filename itself is not used
 * (it is stored separately on the advisory record).
 */
export function generateFileKey(originalName: string): string {
  const dot = originalName.lastIndexOf(".");
  const ext =
    dot > -1
      ? originalName
          .slice(dot + 1)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
      : "";
  const id = randomUUID();
  return ext ? `advisories/${id}.${ext}` : `advisories/${id}`;
}

/**
 * Upload a file buffer to object storage.
 */
export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
}

/**
 * Generate a presigned URL for downloading/viewing a file.
 *
 * If `fileName` is provided, the URL includes a Content-Disposition override
 * so browsers use the original filename (instead of the random object key)
 * when the user saves the file. `inline` lets browsers still preview PDFs
 * and images in-tab; the filename only matters on save.
 *
 * Valid for one hour by default.
 */
export async function getDownloadUrl(
  key: string,
  fileName?: string | null,
  expirySeconds = 60 * 60,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ...(fileName
      ? {
          ResponseContentDisposition: `inline; filename="${fileName.replace(
            /[\r\n"]/g,
            "_",
          )}"`,
        }
      : {}),
  });
  return getSignedUrl(s3, command, { expiresIn: expirySeconds });
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
