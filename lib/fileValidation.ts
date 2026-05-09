/**
 * File validation utilities for secure file uploads
 */

// Magic numbers (file signatures) for supported file types
const FILE_SIGNATURES = {
  pdf: [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
  jpeg: [
    [0xff, 0xd8, 0xff, 0xe0], // JFIF
    [0xff, 0xd8, 0xff, 0xe1], // EXIF
    [0xff, 0xd8, 0xff, 0xe8], // SPIFF
    [0xff, 0xd8, 0xff, 0xdb], // JPEG raw
    [0xff, 0xd8, 0xff, 0xee], // Adobe JPEG
  ],
  png: [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  ],
  webp: [
    // RIFF....WEBP - check bytes 0-3 and 8-11
    [0x52, 0x49, 0x46, 0x46], // RIFF (bytes 0-3)
  ],
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
} as const;

// Dangerous file extensions that should never be allowed
const DANGEROUS_EXTENSIONS = [
  "exe", "dll", "bat", "cmd", "com", "scr", "msi", "vbs", "js", "jar",
  "sh", "bash", "ps1", "app", "deb", "rpm", "pkg", "dmg", "iso",
  "php", "asp", "aspx", "jsp", "py", "rb", "pl", "cgi",
  "htm", "html", "svg", "xml", // Can contain scripts
];

export type ValidatedFileType = "pdf" | "image";

export interface FileValidationResult {
  valid: boolean;
  fileType?: ValidatedFileType;
  error?: string;
  sanitizedFileName?: string;
}

/**
 * Check if bytes match a signature
 */
function matchesSignature(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((byte, i) => bytes[i] === byte);
}

/**
 * Detect file type from magic numbers
 */
export async function detectFileType(file: File): Promise<ValidatedFileType | null> {
  // Read first 12 bytes for signature checking
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check PDF
  if (FILE_SIGNATURES.pdf.some((sig) => matchesSignature(bytes, sig))) {
    return "pdf";
  }

  // Check JPEG
  if (FILE_SIGNATURES.jpeg.some((sig) => matchesSignature(bytes, sig))) {
    return "image";
  }

  // Check PNG
  if (FILE_SIGNATURES.png.some((sig) => matchesSignature(bytes, sig))) {
    return "image";
  }

  // Check WEBP (RIFF + WEBP marker)
  if (FILE_SIGNATURES.webp.some((sig) => matchesSignature(bytes, sig))) {
    // Verify it's actually WEBP by checking bytes 8-11
    if (
      bytes[8] === 0x57 && // W
      bytes[9] === 0x45 && // E
      bytes[10] === 0x42 && // B
      bytes[11] === 0x50    // P
    ) {
      return "image";
    }
  }

  // Check GIF
  if (FILE_SIGNATURES.gif.some((sig) => matchesSignature(bytes, sig))) {
    return "image";
  }

  return null;
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export function sanitizeFileName(fileName: string): string {
  // Remove any path components
  let sanitized = fileName.replace(/^.*[\\/]/, "");

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Replace dangerous characters with underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Remove leading dots (hidden files on Unix)
  sanitized = sanitized.replace(/^\.+/, "");

  // Limit to reasonable length
  if (sanitized.length > 200) {
    const extension = sanitized.match(/\.[^.]+$/)?.[0] || "";
    const nameWithoutExt = sanitized.slice(0, 200 - extension.length);
    sanitized = nameWithoutExt + extension;
  }

  // Fallback if somehow empty
  if (!sanitized || sanitized === "") {
    sanitized = `file_${Date.now()}`;
  }

  return sanitized;
}

/**
 * Check if file extension is dangerous
 */
export function hasDangerousExtension(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) return false;
  return DANGEROUS_EXTENSIONS.includes(extension);
}

/**
 * Comprehensive file validation with magic number verification
 */
export async function validateFile(file: File): Promise<FileValidationResult> {
  const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  // 1. Check filename for dangerous extensions
  if (hasDangerousExtension(file.name)) {
    return {
      valid: false,
      error: "File type not allowed for security reasons",
    };
  }

  // 2. Check MIME type (initial check)
  const mimeType = file.type.toLowerCase();
  const validMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (!validMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: "Invalid file type. Only PDF and images (JPEG, PNG, WebP, GIF) are allowed",
    };
  }

  // 3. Verify magic number matches MIME type
  const detectedType = await detectFileType(file);

  if (!detectedType) {
    return {
      valid: false,
      error: "File content does not match a valid PDF or image format",
    };
  }

  // 4. Verify MIME type matches actual file content (prevent spoofing)
  const expectedType = mimeType === "application/pdf" ? "pdf" : "image";
  if (detectedType !== expectedType) {
    return {
      valid: false,
      error: "File content does not match the claimed file type (possible spoofing attempt)",
    };
  }

  // 5. Check file size
  if (detectedType === "pdf" && file.size > MAX_PDF_SIZE) {
    return {
      valid: false,
      error: `PDF file too large. Maximum size is ${MAX_PDF_SIZE / 1024 / 1024}MB`,
    };
  }

  if (detectedType === "image" && file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image file too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }

  // 6. Check for empty files
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return {
    valid: true,
    fileType: detectedType,
    sanitizedFileName: sanitizeFileName(file.name),
  };
}
