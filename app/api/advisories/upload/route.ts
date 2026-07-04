import { NextRequest, NextResponse } from "next/server";
import type { FileType } from "@prisma/client";
import { requireAuth } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { validateFile } from "@/lib/fileValidation";
import { generateFileKey, uploadFile } from "@/lib/server/storage";

/**
 * Advisory file upload endpoint (admin only).
 *
 * Accepts multipart/form-data with a `file` field, validates it server-side
 * (magic-number check, size, type), stores it in MinIO, and returns the
 * metadata to attach to an advisory record.
 */
export async function POST(request: NextRequest) {
  // 1. Authentication
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit
  try {
    await checkRateLimit(user.id, "file_upload");
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 429 },
    );
  }

  // 3. Extract the file
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // 4. Server-side validation (magic numbers, size, MIME type)
  const validation = await validateFile(file);
  if (!validation.valid || !validation.fileType) {
    return NextResponse.json(
      { error: validation.error || "Invalid file" },
      { status: 400 },
    );
  }

  // 5. Store in MinIO
  const fileName = validation.sanitizedFileName || file.name;
  const fileKey = generateFileKey(fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadFile(fileKey, buffer, file.type);

  return NextResponse.json({
    fileKey,
    fileType: validation.fileType as FileType,
    fileName,
    fileSize: file.size,
  });
}
