import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client for storage operations (bypasses RLS for uploads)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Storage bucket name
const STORAGE_BUCKET = "ojo-tours-storage";

/**
 * File type configurations
 */
export const FILE_TYPES = {
  IMAGES: {
    mimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ] as const,
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".svg"] as const,
    maxSize: 4 * 1024 * 1024, // 4MB
    folder: "images",
  },
  VIDEOS: {
    mimeTypes: [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ] as const,
    extensions: [".mp4", ".mov", ".avi", ".webm"] as const,
    maxSize: 6 * 1024 * 1024, // 6MB
    folder: "videos",
  },
  DOCUMENTS: {
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ] as const,
    extensions: [
      ".pdf",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".xls",
      ".xlsx",
    ] as const,
    maxSize: 4 * 1024 * 1024, // 4MB
    folder: "documents",
  },
};

export type FileType = keyof typeof FILE_TYPES;

/**
 * Generate a unique filename with timestamp and random string
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const extension = originalName.split(".").pop() || "";
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  fileType: FileType,
): { valid: boolean; error?: string } {
  const config = FILE_TYPES[fileType];

  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check MIME type
  const validMimeType = (config.mimeTypes as readonly string[]).includes(
    file.type,
  );
  if (!validMimeType) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${config.mimeTypes.join(", ")}`,
    };
  }

  // Check file extension
  const extension = "." + file.name.split(".").pop()?.toLowerCase();
  const validExtension = (config.extensions as readonly string[]).includes(
    extension,
  );
  if (!validExtension) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${config.extensions.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  fileType: FileType,
  subfolder: string = "",
): Promise<{ url: string; path: string }> {
  try {
    const config = FILE_TYPES[fileType];
    const fileName = generateFileName(file.name);

    // Construct storage path
    const path = subfolder
      ? `${config.folder}/${subfolder}/${fileName}`
      : `${config.folder}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    return {
      url: publicUrl,
      path,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * Get file info from a storage path
 */
export function getFileInfoFromPath(path: string): {
  folder: string;
  fileName: string;
  extension: string;
} {
  const parts = path.split("/");
  const fileName = parts[parts.length - 1];
  const folder = parts.slice(0, -1).join("/");
  const extension = fileName.split(".").pop() || "";

  return { folder, fileName, extension };
}

/**
 * Check if a URL is a Supabase Storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes(supabaseUrl) && url.includes("/storage/");
}

/**
 * Extract storage path from a Supabase Storage URL
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/storage/");
    if (pathParts.length > 1) {
      // Remove bucket name and get the path
      const storagePath = pathParts[1].split("/").slice(1).join("/");
      return storagePath;
    }
    return null;
  } catch {
    return null;
  }
}
